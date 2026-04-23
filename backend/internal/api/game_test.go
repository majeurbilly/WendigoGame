package api_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/alicebob/miniredis/v2"
	"github.com/majeurbilly/wendigogame/internal/api"
	"github.com/majeurbilly/wendigogame/internal/models"
	"github.com/majeurbilly/wendigogame/internal/store"
	"github.com/redis/go-redis/v9"
)

func newGameTestRouter(t *testing.T) (*store.Store, http.Handler) {
	t.Helper()
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })
	lobbyStore := store.NewForTesting(redisClient)
	connectionHub := api.NewHub(lobbyStore)
	return lobbyStore, api.NewRouter(api.Config{Store: lobbyStore, Hub: connectionHub})
}

func TestStartGame_OKUpdatesPhaseInValkey(t *testing.T) {
	st, handler := newGameTestRouter(t)
	ctx := context.Background()

	createBody := `{"mode":"presentiel","host_name":"Alice"}`
	createReq := httptest.NewRequest(http.MethodPost, "/lobbies", strings.NewReader(createBody))
	createReq.Header.Set("Content-Type", "application/json")
	createRec := httptest.NewRecorder()
	handler.ServeHTTP(createRec, createReq)
	if createRec.Code != http.StatusCreated {
		t.Fatalf("CreateLobby HTTP: statut %d, corps %q", createRec.Code, createRec.Body.String())
	}
	var created models.Lobby
	if err := json.Unmarshal(createRec.Body.Bytes(), &created); err != nil {
		t.Fatalf("JSON lobby: %v", err)
	}
	if len(created.Players) != 1 {
		t.Fatalf("joueurs: %+v", created.Players)
	}
	hostID := created.Players[0].ID
	code := created.Code

	startReq := httptest.NewRequest(http.MethodPost, "/lobbies/"+code+"/start", nil)
	startReq.Header.Set("X-Player-ID", hostID)
	startRec := httptest.NewRecorder()
	handler.ServeHTTP(startRec, startReq)
	if startRec.Code != http.StatusOK {
		t.Fatalf("StartGame HTTP: statut %d, corps %q", startRec.Code, startRec.Body.String())
	}

	got, err := st.GetLobby(ctx, code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}
	if got.Phase != models.GamePhaseChairSelection {
		t.Fatalf("phase Valkey: got %q, veut %q", got.Phase, models.GamePhaseChairSelection)
	}
	if got.TimeRemaining != 10 {
		t.Fatalf("time_remaining: got %d, veut 10", got.TimeRemaining)
	}
}

func TestStartGame_WrongHostForbidden(t *testing.T) {
	_, handler := newGameTestRouter(t)

	createBody := `{"mode":"presentiel","host_name":"Bob"}`
	createReq := httptest.NewRequest(http.MethodPost, "/lobbies", strings.NewReader(createBody))
	createReq.Header.Set("Content-Type", "application/json")
	createRec := httptest.NewRecorder()
	handler.ServeHTTP(createRec, createReq)
	if createRec.Code != http.StatusCreated {
		t.Fatalf("CreateLobby: %d", createRec.Code)
	}
	var created models.Lobby
	if err := json.Unmarshal(createRec.Body.Bytes(), &created); err != nil {
		t.Fatalf("JSON: %v", err)
	}
	code := created.Code

	startReq := httptest.NewRequest(http.MethodPost, "/lobbies/"+code+"/start", nil)
	startReq.Header.Set("X-Player-ID", "not-the-host-id")
	startRec := httptest.NewRecorder()
	handler.ServeHTTP(startRec, startReq)
	if startRec.Code != http.StatusForbidden {
		t.Fatalf("mauvais hôte: statut %d, corps %q", startRec.Code, startRec.Body.String())
	}
}
