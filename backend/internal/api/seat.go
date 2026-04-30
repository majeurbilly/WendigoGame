package api

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/majeurbilly/wendigogame/internal/store"
)

type selectSeatBody struct {
	ChairID int `json:"chair_id"`
}

func (serverConfig Config) handleSelectSeat(responseWriter http.ResponseWriter, request *http.Request) {
	if serverConfig.Store == nil {
		http.Error(responseWriter, "invalid server configuration", http.StatusInternalServerError)
		return
	}

	code := strings.ToUpper(strings.TrimSpace(request.PathValue("code")))
	if len(code) != 4 {
		http.Error(responseWriter, "invalid lobby code", http.StatusBadRequest)
		return
	}

	playerID := strings.TrimSpace(request.Header.Get(headerPlayerID))
	if playerID == "" {
		http.Error(responseWriter, "missing X-Player-ID header", http.StatusBadRequest)
		return
	}

	var body selectSeatBody
	if err := json.NewDecoder(request.Body).Decode(&body); err != nil {
		http.Error(responseWriter, "invalid JSON body", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(request.Context(), 10*time.Second)
	defer cancel()

	err := serverConfig.Store.SelectSeat(ctx, code, playerID, body.ChairID)
	if errors.Is(err, store.ErrLobbyNotFound) {
		http.Error(responseWriter, "lobby not found", http.StatusNotFound)
		return
	}
	if errors.Is(err, store.ErrWrongPhase) {
		http.Error(responseWriter, "seat selection is not allowed in this phase", http.StatusConflict)
		return
	}
	if errors.Is(err, store.ErrInvalidChair) {
		http.Error(responseWriter, "chair_id must be between 0 and 15", http.StatusBadRequest)
		return
	}
	if errors.Is(err, store.ErrSeatOccupied) {
		http.Error(responseWriter, "seat is already occupied", http.StatusConflict)
		return
	}
	if errors.Is(err, store.ErrAlreadySeated) {
		http.Error(responseWriter, "player already has a seat", http.StatusConflict)
		return
	}
	if errors.Is(err, store.ErrPlayerNotInLobby) {
		http.Error(responseWriter, "player not in lobby", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(responseWriter, "unable to select seat", http.StatusInternalServerError)
		return
	}

	if serverConfig.Hub != nil {
		syncCtx, cancelSync := context.WithTimeout(context.Background(), 5*time.Second)
		if syncErr := serverConfig.Hub.SyncLobbyConnections(syncCtx, serverConfig.Store, code); syncErr != nil {
			log.Printf("handleSelectSeat: SyncLobbyConnections(%s): %v", code, syncErr)
		}
		cancelSync()
	}

	responseWriter.WriteHeader(http.StatusNoContent)
}
