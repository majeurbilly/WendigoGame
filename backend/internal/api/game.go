package api

import (
	"context"
	"errors"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/majeurbilly/wendigogame/internal/store"
)

const headerPlayerID = "X-Player-ID"

func (serverConfig Config) handleStartGame(responseWriter http.ResponseWriter, request *http.Request) {
	if serverConfig.Store == nil {
		http.Error(responseWriter, "invalid server configuration", http.StatusInternalServerError)
		return
	}

	code := strings.ToUpper(strings.TrimSpace(request.PathValue("code")))
	if len(code) != 4 {
		http.Error(responseWriter, "invalid lobby code", http.StatusBadRequest)
		return
	}

	hostID := strings.TrimSpace(request.Header.Get(headerPlayerID))
	if hostID == "" {
		http.Error(responseWriter, "missing X-Player-ID header", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(request.Context(), 10*time.Second)
	defer cancel()

	err := serverConfig.Store.StartGame(ctx, code, hostID)
	if errors.Is(err, store.ErrLobbyNotFound) {
		http.Error(responseWriter, "lobby not found", http.StatusNotFound)
		return
	}
	if errors.Is(err, store.ErrUnauthorized) {
		http.Error(responseWriter, "access denied", http.StatusForbidden)
		return
	}
	if errors.Is(err, store.ErrGameAlreadyStarted) {
		http.Error(responseWriter, "game already started", http.StatusConflict)
		return
	}
	if err != nil {
		http.Error(responseWriter, "unable to start game", http.StatusInternalServerError)
		return
	}

	lobby, getErr := serverConfig.Store.GetLobbyManager(ctx, code)
	if getErr == nil {
		StartGameLoop(context.Background(), serverConfig.Store, serverConfig.Hub, lobby)
	}
	if serverConfig.Hub != nil {
		syncCtx, cancelSync := context.WithTimeout(context.Background(), 5*time.Second)
		if syncErr := serverConfig.Hub.SyncLobbyConnections(syncCtx, serverConfig.Store, code); syncErr != nil {
			log.Printf("handleStartGame: SyncLobbyConnections(%s): %v", code, syncErr)
		}
		cancelSync()
	}
	responseWriter.WriteHeader(http.StatusOK)
}
