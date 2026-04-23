package api_test

import (
	"context"
	"net/http/httptest"
	"strings"
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
