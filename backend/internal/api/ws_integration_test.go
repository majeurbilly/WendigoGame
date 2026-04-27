package api_test

import (
	"context"
	"encoding/json"
	"errors"
	"net/http/httptest"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/gorilla/websocket"
	"github.com/majeurbilly/wendigogame/internal/api"
	"github.com/majeurbilly/wendigogame/internal/models"
	"github.com/majeurbilly/wendigogame/internal/store"
	"github.com/redis/go-redis/v9"
)

func TestWSAddsPlayerThenDisconnectKeepsHostInValkey(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })
	lobbyStore := store.NewForTesting(redisClient)
	connectionHub := api.NewHub(lobbyStore)
	mux := api.NewRouter(api.Config{Store: lobbyStore, Hub: connectionHub})

	ctx := context.Background()
	lobby, err := lobbyStore.CreateLobby(ctx, models.GameModeLocal, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	key := "lobby:" + lobby.Code

	httpServer := httptest.NewServer(mux)
	t.Cleanup(func() {
		httpServer.Close()
		time.Sleep(150 * time.Millisecond)
	})

	wsURL := strings.Replace(httpServer.URL, "http", "ws", 1) + "/ws?code=" + lobby.Code + "&name=Gaston"
	wsConn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Dial WebSocket: %v", err)
	}

	deadline := time.Now().Add(2 * time.Second)
	var withGuest *models.Lobby
	for time.Now().Before(deadline) {
		withGuest, err = lobbyStore.GetLobby(ctx, lobby.Code)
		if err != nil {
			t.Fatalf("GetLobby: %v", err)
		}
		if len(withGuest.Players) == 2 {
			break
		}
		time.Sleep(5 * time.Millisecond)
	}
	if len(withGuest.Players) != 2 {
		t.Fatalf("after WS connection: expected 2 players, got %d (%+v)", len(withGuest.Players), withGuest.Players)
	}
	var hostSeen, gastonSeen bool
	for _, player := range withGuest.Players {
		switch {
		case player.IsHost && player.Name == "Host":
			hostSeen = true
		case !player.IsHost && player.Name == "Gaston":
			gastonSeen = true
		}
	}
	if !hostSeen || !gastonSeen {
		t.Fatalf("unexpected players: %+v", withGuest.Players)
	}

	if err := wsConn.Close(); err != nil {
		t.Fatalf("Close client: %v", err)
	}

	deadline2 := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline2) {
		keyExistsCount, err := redisClient.Exists(ctx, key).Result()
		if err != nil {
			t.Fatalf("EXISTS: %v", err)
		}
		if keyExistsCount == 0 {
			t.Fatalf("key %q should not be deleted: host must remain persisted", key)
		}
		alone, err := lobbyStore.GetLobby(ctx, lobby.Code)
		if err != nil {
			t.Fatalf("GetLobby after disconnect: %v", err)
		}
		if len(alone.Players) == 1 {
			if !alone.Players[0].IsHost || alone.Players[0].Name != "Host" {
				t.Fatalf("expected host alone: %+v", alone.Players)
			}
			return
		}
		time.Sleep(5 * time.Millisecond)
	}
	t.Fatalf("timeout: lobby should contain only one player (host) after WS disconnect")
}

func TestWS_FiveSimultaneousConnections(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })
	lobbyStore := store.NewForTesting(redisClient)
	connectionHub := api.NewHub(lobbyStore)
	mux := api.NewRouter(api.Config{Store: lobbyStore, Hub: connectionHub})

	ctx := context.Background()
	lobby, err := lobbyStore.CreateLobby(ctx, models.GameModeLocal, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}

	httpServer := httptest.NewServer(mux)
	t.Cleanup(func() {
		httpServer.Close()
		time.Sleep(150 * time.Millisecond)
	})
	baseWS := strings.Replace(httpServer.URL, "http", "ws", 1) + "/ws?code=" + lobby.Code

	var dialWait sync.WaitGroup
	dialWait.Add(5)
	dialErrs := make(chan error, 5)
	conns := make([]*websocket.Conn, 5)
	for i := range 5 {
		go func(idx int) {
			defer dialWait.Done()
			wsURL := baseWS + "&name=Guest" + strconv.Itoa(idx+1)
			c, _, e := websocket.DefaultDialer.Dial(wsURL, nil)
			if e != nil {
				dialErrs <- e
				return
			}
			conns[idx] = c
		}(i)
	}
	dialWait.Wait()
	close(dialErrs)
	for e := range dialErrs {
		if e != nil {
			t.Fatalf("Dial WebSocket: %v", e)
		}
	}

	deadline := time.Now().Add(5 * time.Second)
	var full *models.Lobby
	for time.Now().Before(deadline) {
		full, err = lobbyStore.GetLobby(ctx, lobby.Code)
		if err != nil {
			t.Fatalf("GetLobby: %v", err)
		}
		if len(full.Players) == 6 {
			break
		}
		time.Sleep(5 * time.Millisecond)
	}
	if len(full.Players) != 6 {
		t.Fatalf("expected 6 players (host + 5 guests), got %d (%+v)", len(full.Players), full.Players)
	}

	hostCount, guestCount := 0, 0
	for _, p := range full.Players {
		if p.IsHost {
			hostCount++
		} else {
			guestCount++
		}
	}
	if hostCount != 1 || guestCount != 5 {
		t.Fatalf("host/guest split: hostCount=%d guestCount=%d (%+v)", hostCount, guestCount, full.Players)
	}

	// Give the hub time to finish in-flight LOBBY_SYNC broadcasts (CI / load).
	time.Sleep(50 * time.Millisecond)

	for _, c := range conns {
		if c == nil {
			t.Fatal("nil WebSocket connection")
		}
		if err := c.Close(); err != nil {
			t.Fatalf("Close client: %v", err)
		}
	}

	// Wait for the 5 server goroutines to finish RemovePlayerByID
	// before ending the test (avoids Unregister after Redis client close).
	deadlineHost := time.Now().Add(5 * time.Second)
	for time.Now().Before(deadlineHost) {
		alone, err := lobbyStore.GetLobby(ctx, lobby.Code)
		if err != nil {
			t.Fatalf("GetLobby after closes: %v", err)
		}
		if len(alone.Players) == 1 {
			break
		}
		time.Sleep(5 * time.Millisecond)
	}
	afterClose, err := lobbyStore.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby after closes: %v", err)
	}
	if len(afterClose.Players) != 1 || !afterClose.Players[0].IsHost {
		t.Fatalf("after closing the 5 WS connections: expected host alone, got %+v", afterClose.Players)
	}
}

func TestWS_LobbyDestroyedWhenEmpty(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })
	lobbyStore := store.NewForTesting(redisClient)
	connectionHub := api.NewHub(lobbyStore)
	mux := api.NewRouter(api.Config{Store: lobbyStore, Hub: connectionHub})

	ctx := context.Background()
	lobby, err := lobbyStore.CreateLobby(ctx, models.GameModeLocal, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	if len(lobby.Players) != 1 || !lobby.Players[0].IsHost {
		t.Fatalf("initial lobby: %+v", lobby.Players)
	}
	hostID := lobby.Players[0].ID
	key := "lobby:" + lobby.Code

	httpServer := httptest.NewServer(mux)
	t.Cleanup(func() {
		httpServer.Close()
		time.Sleep(150 * time.Millisecond)
	})

	wsURL := strings.Replace(httpServer.URL, "http", "ws", 1) +
		"/ws?code=" + lobby.Code + "&name=Host&player_id=" + hostID
	wsConn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Dial host WebSocket: %v", err)
	}

	time.Sleep(200 * time.Millisecond)
	afterHostWS, err := lobbyStore.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}
	if len(afterHostWS.Players) != 1 || afterHostWS.Players[0].ID != hostID || !afterHostWS.Players[0].IsHost {
		t.Fatalf("host binding: expected a single player (no duplicate), got %+v", afterHostWS.Players)
	}

	if err := wsConn.Close(); err != nil {
		t.Fatalf("Close client: %v", err)
	}

	deadline2 := time.Now().Add(3 * time.Second)
	for time.Now().Before(deadline2) {
		n, err := redisClient.Exists(ctx, key).Result()
		if err != nil {
			t.Fatalf("EXISTS: %v", err)
		}
		if n == 0 {
			_, err := lobbyStore.GetLobby(ctx, lobby.Code)
			if !errors.Is(err, store.ErrLobbyNotFound) {
				t.Fatalf("GetLobby after deletion: %v", err)
			}
			return
		}
		time.Sleep(10 * time.Millisecond)
	}
	t.Fatalf("timeout: Redis key %q should have been deleted (0 player)", key)
}

func TestWS_ReceivesBroadcastOnJoin(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })
	lobbyStore := store.NewForTesting(redisClient)
	connectionHub := api.NewHub(lobbyStore)
	mux := api.NewRouter(api.Config{Store: lobbyStore, Hub: connectionHub})

	ctx := context.Background()
	lobby, err := lobbyStore.CreateLobby(ctx, models.GameModeLocal, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	hostID := lobby.Players[0].ID

	httpServer := httptest.NewServer(mux)
	t.Cleanup(func() {
		httpServer.Close()
		time.Sleep(150 * time.Millisecond)
	})
	baseWS := strings.Replace(httpServer.URL, "http", "ws", 1)

	hostURL := baseWS + "/ws?code=" + lobby.Code + "&name=Host&player_id=" + hostID
	hostConn, _, err := websocket.DefaultDialer.Dial(hostURL, nil)
	if err != nil {
		t.Fatalf("Dial host: %v", err)
	}
	defer func() { _ = hostConn.Close() }()

	_ = hostConn.SetReadDeadline(time.Now().Add(3 * time.Second))
	var first models.WSMessage
	if err := hostConn.ReadJSON(&first); err != nil {
		t.Fatalf("first host message: %v", err)
	}
	if first.Type != models.MessageTypeLobbySync {
		t.Fatalf("first type: got %q, want %q", first.Type, models.MessageTypeLobbySync)
	}

	guestURL := baseWS + "/ws?code=" + lobby.Code + "&name=Guest"
	guestConn, _, err := websocket.DefaultDialer.Dial(guestURL, nil)
	if err != nil {
		t.Fatalf("Dial guest: %v", err)
	}
	defer func() { _ = guestConn.Close() }()

	_ = hostConn.SetReadDeadline(time.Now().Add(3 * time.Second))
	var second models.WSMessage
	if err := hostConn.ReadJSON(&second); err != nil {
		t.Fatalf("host message after guest join: %v", err)
	}
	if second.Type != models.MessageTypeLobbySync {
		t.Fatalf("second type: got %q, want %q", second.Type, models.MessageTypeLobbySync)
	}
	raw, err := json.Marshal(second.Payload)
	if err != nil {
		t.Fatalf("payload: %v", err)
	}
	var synced models.Lobby
	if err := json.Unmarshal(raw, &synced); err != nil {
		t.Fatalf("lobby in payload: %v", err)
	}
	if len(synced.Players) != 2 {
		t.Fatalf("players in LOBBY_SYNC: got %d, want 2 (%+v)", len(synced.Players), synced.Players)
	}
}

func TestWS_RoleFiltering(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })
	lobbyStore := store.NewForTesting(redisClient)
	connectionHub := api.NewHub(lobbyStore)
	mux := api.NewRouter(api.Config{Store: lobbyStore, Hub: connectionHub})

	ctx := context.Background()
	lobby, err := lobbyStore.CreateLobby(ctx, models.GameModeLocal, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	hostID := lobby.Players[0].ID

	httpServer := httptest.NewServer(mux)
	t.Cleanup(func() {
		httpServer.Close()
		time.Sleep(150 * time.Millisecond)
	})
	baseWS := strings.Replace(httpServer.URL, "http", "ws", 1)

	hostURL := baseWS + "/ws?code=" + lobby.Code + "&name=Host&player_id=" + hostID
	hostConn, _, err := websocket.DefaultDialer.Dial(hostURL, nil)
	if err != nil {
		t.Fatalf("Dial host: %v", err)
	}
	defer func() { _ = hostConn.Close() }()

	guestURL := baseWS + "/ws?code=" + lobby.Code + "&name=Guest"
	guestConn, _, err := websocket.DefaultDialer.Dial(guestURL, nil)
	if err != nil {
		t.Fatalf("Dial guest: %v", err)
	}
	defer func() { _ = guestConn.Close() }()

	_ = hostConn.SetReadDeadline(time.Now().Add(3 * time.Second))
	_ = guestConn.SetReadDeadline(time.Now().Add(3 * time.Second))
	var hostLobbySync models.WSMessage
	var guestLobbySync models.WSMessage
	if err := hostConn.ReadJSON(&hostLobbySync); err != nil {
		t.Fatalf("host initial message: %v", err)
	}
	if err := guestConn.ReadJSON(&guestLobbySync); err != nil {
		t.Fatalf("guest initial message: %v", err)
	}

	deadline := time.Now().Add(2 * time.Second)
	var lobbyWithGuest *models.Lobby
	for time.Now().Before(deadline) {
		lobbyWithGuest, err = lobbyStore.GetLobby(ctx, lobby.Code)
		if err != nil {
			t.Fatalf("GetLobby: %v", err)
		}
		if len(lobbyWithGuest.Players) == 2 {
			break
		}
		time.Sleep(5 * time.Millisecond)
	}
	if len(lobbyWithGuest.Players) != 2 {
		t.Fatalf("expected 2 players in lobby, got %d", len(lobbyWithGuest.Players))
	}

	guestID := ""
	for _, player := range lobbyWithGuest.Players {
		if !player.IsHost {
			guestID = player.ID
		}
	}
	if guestID == "" {
		t.Fatal("guest player ID not found")
	}

	for index := range lobbyWithGuest.Players {
		if lobbyWithGuest.Players[index].ID == hostID {
			lobbyWithGuest.Players[index].Role = "werewolf"
		}
		if lobbyWithGuest.Players[index].ID == guestID {
			lobbyWithGuest.Players[index].Role = "villager"
		}
	}
	lobbyWithGuest.Phase = models.GamePhaseDay
	lobbyWithGuest.TimeRemaining = 5
	if err := lobbyStore.SaveLobby(ctx, lobbyWithGuest); err != nil {
		t.Fatalf("SaveLobby: %v", err)
	}

	loopCtx, cancelLoop := context.WithCancel(context.Background())
	defer cancelLoop()
	lobbyManager, err := lobbyStore.GetLobbyManager(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobbyManager: %v", err)
	}
	api.StartGameLoop(loopCtx, lobbyStore, connectionHub, lobbyManager)

	readUntilType := func(conn *websocket.Conn, wantedType string) (models.WSMessage, error) {
		_ = conn.SetReadDeadline(time.Now().Add(4 * time.Second))
		for range 6 {
			var message models.WSMessage
			readErr := conn.ReadJSON(&message)
			if readErr != nil {
				return models.WSMessage{}, readErr
			}
			if message.Type == wantedType {
				return message, nil
			}
		}
		return models.WSMessage{}, errors.New("wanted message type not received before timeout")
	}

	hostTick, hostTickErr := readUntilType(hostConn, models.MessageTypeGameTick)
	if hostTickErr != nil {
		t.Fatalf("host tick message: %v", hostTickErr)
	}
	guestTick, guestTickErr := readUntilType(guestConn, models.MessageTypeGameTick)
	if guestTickErr != nil {
		t.Fatalf("guest tick message: %v", guestTickErr)
	}

	hostPayloadRaw, err := json.Marshal(hostTick.Payload)
	if err != nil {
		t.Fatalf("marshal host payload: %v", err)
	}
	guestPayloadRaw, err := json.Marshal(guestTick.Payload)
	if err != nil {
		t.Fatalf("marshal guest payload: %v", err)
	}

	var hostState models.GameStateDTO
	var guestState models.GameStateDTO
	if err := json.Unmarshal(hostPayloadRaw, &hostState); err != nil {
		t.Fatalf("unmarshal host state: %v", err)
	}
	if err := json.Unmarshal(guestPayloadRaw, &guestState); err != nil {
		t.Fatalf("unmarshal guest state: %v", err)
	}

	hostSeesGuestRole := ""
	guestSeesHostRole := ""
	for _, player := range hostState.Players {
		if player.ID == guestID {
			hostSeesGuestRole = player.Role
		}
	}
	for _, player := range guestState.Players {
		if player.ID == hostID {
			guestSeesHostRole = player.Role
		}
	}

	if hostSeesGuestRole != "" {
		t.Fatalf("host should not see guest role, got %q", hostSeesGuestRole)
	}
	if guestSeesHostRole != "" {
		t.Fatalf("guest should not see host role, got %q", guestSeesHostRole)
	}
}

func TestWS_NightResolutionWithPrayerShield(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })
	lobbyStore := store.NewForTesting(redisClient)
	connectionHub := api.NewHub(lobbyStore)
	mux := api.NewRouter(api.Config{Store: lobbyStore, Hub: connectionHub})

	ctx := context.Background()
	lobby, err := lobbyStore.CreateLobby(ctx, models.GameModeLocal, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	hostID := lobby.Players[0].ID

	httpServer := httptest.NewServer(mux)
	t.Cleanup(func() {
		httpServer.Close()
		time.Sleep(150 * time.Millisecond)
	})
	baseWS := strings.Replace(httpServer.URL, "http", "ws", 1)

	hostURL := baseWS + "/ws?code=" + lobby.Code + "&name=Host&player_id=" + hostID
	hostConn, _, err := websocket.DefaultDialer.Dial(hostURL, nil)
	if err != nil {
		t.Fatalf("Dial host: %v", err)
	}
	defer func() { _ = hostConn.Close() }()

	guest1URL := baseWS + "/ws?code=" + lobby.Code + "&name=Guest1"
	guest1Conn, _, err := websocket.DefaultDialer.Dial(guest1URL, nil)
	if err != nil {
		t.Fatalf("Dial guest1: %v", err)
	}
	defer func() { _ = guest1Conn.Close() }()

	guest2URL := baseWS + "/ws?code=" + lobby.Code + "&name=Guest2"
	guest2Conn, _, err := websocket.DefaultDialer.Dial(guest2URL, nil)
	if err != nil {
		t.Fatalf("Dial guest2: %v", err)
	}
	defer func() { _ = guest2Conn.Close() }()

	time.Sleep(250 * time.Millisecond)
	lobbyWithGuests, err := lobbyStore.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}
	if len(lobbyWithGuests.Players) != 3 {
		t.Fatalf("players: got %d, want 3", len(lobbyWithGuests.Players))
	}

	guestIDs := make([]string, 0, 2)
	for i := range lobbyWithGuests.Players {
		if lobbyWithGuests.Players[i].ID != hostID {
			guestIDs = append(guestIDs, lobbyWithGuests.Players[i].ID)
		}
	}
	if len(guestIDs) != 2 {
		t.Fatalf("guest IDs: got %d, want 2", len(guestIDs))
	}
	guest1ID := guestIDs[0]
	guest2ID := guestIDs[1]

	sendNightAction := func(conn *websocket.Conn, targetID string) {
		message := models.WSMessage{
			Type: models.MessageTypeSubmitNightAction,
			Payload: map[string]string{
				"target_id": targetID,
			},
		}
		if err := conn.WriteJSON(message); err != nil {
			t.Fatalf("WriteJSON SUBMIT_NIGHT_ACTION: %v", err)
		}
	}

	prepareNight := func() {
		currentLobby, getErr := lobbyStore.GetLobby(ctx, lobby.Code)
		if getErr != nil {
			t.Fatalf("GetLobby prepareNight: %v", getErr)
		}

		currentLobby.Phase = models.GamePhaseNight
		currentLobby.TimeRemaining = 1
		currentLobby.DefendantID = ""
		currentLobby.Votes = make(map[string]string)
		currentLobby.NightActions = make(map[string]string)

		for i := range currentLobby.Players {
			currentLobby.Players[i].IsAlive = true
			if currentLobby.Players[i].ID == hostID {
				currentLobby.Players[i].Role = "Wendigo"
			} else {
				currentLobby.Players[i].Role = "Villager"
			}
		}

		if saveErr := lobbyStore.SaveLobby(ctx, currentLobby); saveErr != nil {
			t.Fatalf("SaveLobby prepareNight: %v", saveErr)
		}
	}

	waitForDay := func() *models.Lobby {
		deadline := time.Now().Add(4 * time.Second)
		for time.Now().Before(deadline) {
			currentLobby, getErr := lobbyStore.GetLobby(ctx, lobby.Code)
			if getErr != nil {
				t.Fatalf("GetLobby waitForDay: %v", getErr)
			}
			if currentLobby.Phase == models.GamePhaseDay {
				return currentLobby
			}
			time.Sleep(20 * time.Millisecond)
		}
		t.Fatal("timeout waiting for DAY phase")
		return nil
	}

	loopCtx, cancelLoop := context.WithCancel(context.Background())
	defer cancelLoop()
	lobbyManager, err := lobbyStore.GetLobbyManager(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobbyManager: %v", err)
	}
	api.StartGameLoop(loopCtx, lobbyStore, connectionHub, lobbyManager)

	t.Run("CaseA_ShieldBlocksKill", func(t *testing.T) {
		prepareNight()

		sendNightAction(guest1Conn, guest1ID)
		sendNightAction(guest2Conn, guest1ID)
		sendNightAction(hostConn, guest1ID)

		dayLobby := waitForDay()
		for i := range dayLobby.Players {
			if !dayLobby.Players[i].IsAlive {
				t.Fatalf("expected all players alive in shield case, got dead player %s", dayLobby.Players[i].ID)
			}
		}
	})

	t.Run("CaseB_NoMajorityKillSucceeds", func(t *testing.T) {
		prepareNight()

		sendNightAction(guest1Conn, guest1ID)
		sendNightAction(guest2Conn, guest2ID)
		sendNightAction(hostConn, guest1ID)

		dayLobby := waitForDay()
		aliveByID := make(map[string]bool)
		for i := range dayLobby.Players {
			aliveByID[dayLobby.Players[i].ID] = dayLobby.Players[i].IsAlive
		}

		if aliveByID[guest1ID] {
			t.Fatalf("expected Wendigo victim %s to be dead", guest1ID)
		}
		if !aliveByID[guest2ID] || !aliveByID[hostID] {
			t.Fatalf("unexpected extra death: host=%v guest2=%v", aliveByID[hostID], aliveByID[guest2ID])
		}
	})
}
