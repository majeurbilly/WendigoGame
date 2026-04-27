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
			t.Fatal("connexion WebSocket nil")
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
