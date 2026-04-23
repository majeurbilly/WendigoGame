package api

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/majeurbilly/wendigogame/internal/store"
)

const headerPlayerID = "X-Player-ID"

func (serverConfig Config) handleStartGame(responseWriter http.ResponseWriter, request *http.Request) {
	if serverConfig.Store == nil {
		http.Error(responseWriter, "configuration serveur invalide", http.StatusInternalServerError)
		return
	}

	code := strings.ToUpper(strings.TrimSpace(request.PathValue("code")))
	if len(code) != 4 {
		http.Error(responseWriter, "code lobby invalide", http.StatusBadRequest)
		return
	}

	hostID := strings.TrimSpace(request.Header.Get(headerPlayerID))
	if hostID == "" {
		http.Error(responseWriter, "en-tête X-Player-ID requis", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(request.Context(), 10*time.Second)
	defer cancel()

	err := serverConfig.Store.StartGame(ctx, code, hostID)
	if errors.Is(err, store.ErrLobbyNotFound) {
		http.Error(responseWriter, "lobby introuvable", http.StatusNotFound)
		return
	}
	if errors.Is(err, store.ErrUnauthorized) {
		http.Error(responseWriter, "accès refusé", http.StatusForbidden)
		return
	}
	if errors.Is(err, store.ErrGameAlreadyStarted) {
		http.Error(responseWriter, "partie déjà démarrée", http.StatusConflict)
		return
	}
	if err != nil {
		http.Error(responseWriter, "impossible de démarrer la partie", http.StatusInternalServerError)
		return
	}

	StartGameLoop(context.Background(), serverConfig.Store, serverConfig.Hub, code)
	responseWriter.WriteHeader(http.StatusOK)
}
