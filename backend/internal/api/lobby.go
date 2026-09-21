package api

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/majeurbilly/wendigogame/internal/auth"
	"github.com/majeurbilly/wendigogame/internal/database"
	"github.com/majeurbilly/wendigogame/internal/store"
)

type Config struct {
	Store             *store.Store
	UserStore         *database.UserStore
	Hub               *Hub
	AccessTokenParser *auth.TokenParser // nil: NewRouter crée un parser par défaut (JWKS ou mode test)
}

type createLobbyBody struct {
	HostName string `json:"host_name,omitempty"`
}

// handleCreateLobby persists the lobby synchronously: HTTP 201 is sent only after Redis SET ... NX
// returns success (see store.createLobbyWithHost). No detached goroutine writes the lobby.
// Lobbies are always presentiel (local); any remote/online mode has been removed.
func (serverConfig Config) handleCreateLobby(responseWriter http.ResponseWriter, request *http.Request) {
	if serverConfig.Store == nil {
		http.Error(responseWriter, "invalid server configuration", http.StatusInternalServerError)
		return
	}

	var body createLobbyBody
	if err := json.NewDecoder(request.Body).Decode(&body); err != nil {
		if !errors.Is(err, io.EOF) {
			http.Error(responseWriter, "invalid JSON body", http.StatusBadRequest)
			return
		}
	}

	ctx, cancel := context.WithTimeout(request.Context(), 10*time.Second)
	defer cancel()

	authUserID, ok := userIDFromContext(request.Context())
	if !ok {
		http.Error(responseWriter, "unauthorized", http.StatusUnauthorized)
		return
	}

	hostName := strings.TrimSpace(body.HostName)
	if hostName == "" && serverConfig.UserStore != nil {
		if u, userErr := serverConfig.UserStore.GetUserByID(ctx, authUserID); userErr == nil && u != nil {
			hostName = strings.TrimSpace(u.Username)
		}
	}

	lobby, err := serverConfig.Store.CreateLobbyForHost(ctx, authUserID, hostName)
	if err != nil {
		http.Error(responseWriter, "unable to create lobby", http.StatusInternalServerError)
		return
	}

	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(responseWriter).Encode(lobby)
}
