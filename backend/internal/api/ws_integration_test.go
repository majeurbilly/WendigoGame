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
	lobby, err := lobbyStore.CreateLobby(ctx, models.GameModePresentiel, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	key := "lobby:" + lobby.Code

	httpServer := httptest.NewServer(mux)
	defer httpServer.Close()

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
		t.Fatalf("après connexion WS: attendu 2 joueurs, got %d (%+v)", len(withGuest.Players), withGuest.Players)
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
		t.Fatalf("joueurs inattendus: %+v", withGuest.Players)
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
			t.Fatalf("la clé %q ne devrait pas être supprimée : l’hôte reste en base", key)
		}
		alone, err := lobbyStore.GetLobby(ctx, lobby.Code)
		if err != nil {
			t.Fatalf("GetLobby après déconnexion: %v", err)
		}
		if len(alone.Players) == 1 {
			if !alone.Players[0].IsHost || alone.Players[0].Name != "Host" {
				t.Fatalf("hôte seul attendu: %+v", alone.Players)
			}
			return
		}
		time.Sleep(5 * time.Millisecond)
	}
	t.Fatalf("timeout: lobby devrait n’avoir qu’un joueur (hôte) après déconnexion WS")
}

func TestWS_FiveSimultaneousConnections(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })
	lobbyStore := store.NewForTesting(redisClient)
	connectionHub := api.NewHub(lobbyStore)
	mux := api.NewRouter(api.Config{Store: lobbyStore, Hub: connectionHub})

	ctx := context.Background()
	lobby, err := lobbyStore.CreateLobby(ctx, models.GameModePresentiel, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}

	httpServer := httptest.NewServer(mux)
	defer httpServer.Close()
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
		t.Fatalf("attendu 6 joueurs (hôte + 5 invités), obtenu %d (%+v)", len(full.Players), full.Players)
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
		t.Fatalf("répartition hôte/invités: hostCount=%d guestCount=%d (%+v)", hostCount, guestCount, full.Players)
	}

	// Laisse le temps au hub de terminer les broadcasts LOBBY_SYNC en cours (CI / charge).
	time.Sleep(50 * time.Millisecond)

	for _, c := range conns {
		if c == nil {
			t.Fatal("connexion WebSocket nil")
		}
		if err := c.Close(); err != nil {
			t.Fatalf("Close client: %v", err)
		}
	}

	// Attendre que les 5 goroutines serveur aient terminé RemovePlayerByID
	// avant la fin du test (évite des Unregister après fermeture du client Redis).
	deadlineHost := time.Now().Add(5 * time.Second)
	for time.Now().Before(deadlineHost) {
		alone, err := lobbyStore.GetLobby(ctx, lobby.Code)
		if err != nil {
			t.Fatalf("GetLobby après fermetures: %v", err)
		}
		if len(alone.Players) == 1 {
			break
		}
		time.Sleep(5 * time.Millisecond)
	}
	afterClose, err := lobbyStore.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby après fermetures: %v", err)
	}
	if len(afterClose.Players) != 1 || !afterClose.Players[0].IsHost {
		t.Fatalf("après fermeture des 5 WS: attendu hôte seul, obtenu %+v", afterClose.Players)
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
	lobby, err := lobbyStore.CreateLobby(ctx, models.GameModePresentiel, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	if len(lobby.Players) != 1 || !lobby.Players[0].IsHost {
		t.Fatalf("lobby initial: %+v", lobby.Players)
	}
	hostID := lobby.Players[0].ID
	key := "lobby:" + lobby.Code

	httpServer := httptest.NewServer(mux)
	defer httpServer.Close()

	wsURL := strings.Replace(httpServer.URL, "http", "ws", 1) +
		"/ws?code=" + lobby.Code + "&name=Host&player_id=" + hostID
	wsConn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Dial WebSocket hôte: %v", err)
	}

	time.Sleep(200 * time.Millisecond)
	afterHostWS, err := lobbyStore.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}
	if len(afterHostWS.Players) != 1 || afterHostWS.Players[0].ID != hostID || !afterHostWS.Players[0].IsHost {
		t.Fatalf("liaison hôte: 1 seul joueur attendu (pas de doublon), obtenu %+v", afterHostWS.Players)
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
				t.Fatalf("GetLobby après suppression: %v", err)
			}
			return
		}
		time.Sleep(10 * time.Millisecond)
	}
	t.Fatalf("timeout: la clé Redis %q aurait dû être supprimée (0 joueur)", key)
}

func TestWS_ReceivesBroadcastOnJoin(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })
	lobbyStore := store.NewForTesting(redisClient)
	connectionHub := api.NewHub(lobbyStore)
	mux := api.NewRouter(api.Config{Store: lobbyStore, Hub: connectionHub})

	ctx := context.Background()
	lobby, err := lobbyStore.CreateLobby(ctx, models.GameModePresentiel, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	hostID := lobby.Players[0].ID

	httpServer := httptest.NewServer(mux)
	defer httpServer.Close()
	baseWS := strings.Replace(httpServer.URL, "http", "ws", 1)

	hostURL := baseWS + "/ws?code=" + lobby.Code + "&name=Host&player_id=" + hostID
	hostConn, _, err := websocket.DefaultDialer.Dial(hostURL, nil)
	if err != nil {
		t.Fatalf("Dial hôte: %v", err)
	}
	defer func() { _ = hostConn.Close() }()

	_ = hostConn.SetReadDeadline(time.Now().Add(3 * time.Second))
	var first models.WSMessage
	if err := hostConn.ReadJSON(&first); err != nil {
		t.Fatalf("premier message hôte: %v", err)
	}
	if first.Type != models.MessageTypeLobbySync {
		t.Fatalf("premier type: got %q, veut %q", first.Type, models.MessageTypeLobbySync)
	}

	guestURL := baseWS + "/ws?code=" + lobby.Code + "&name=Invité"
	guestConn, _, err := websocket.DefaultDialer.Dial(guestURL, nil)
	if err != nil {
		t.Fatalf("Dial invité: %v", err)
	}
	defer func() { _ = guestConn.Close() }()

	_ = hostConn.SetReadDeadline(time.Now().Add(3 * time.Second))
	var second models.WSMessage
	if err := hostConn.ReadJSON(&second); err != nil {
		t.Fatalf("message hôte après arrivée invité: %v", err)
	}
	if second.Type != models.MessageTypeLobbySync {
		t.Fatalf("deuxième type: got %q, veut %q", second.Type, models.MessageTypeLobbySync)
	}
	raw, err := json.Marshal(second.Payload)
	if err != nil {
		t.Fatalf("payload: %v", err)
	}
	var synced models.Lobby
	if err := json.Unmarshal(raw, &synced); err != nil {
		t.Fatalf("lobby dans payload: %v", err)
	}
	if len(synced.Players) != 2 {
		t.Fatalf("joueurs dans LOBBY_SYNC: got %d, veut 2 (%+v)", len(synced.Players), synced.Players)
	}
}
