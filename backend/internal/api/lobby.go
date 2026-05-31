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
	"github.com/majeurbilly/wendigogame/internal/models"
	"github.com/majeurbilly/wendigogame/internal/store"
)

type Config struct {
	Store             *store.Store
	UserStore         *database.UserStore
	Hub               *Hub
	AccessTokenParser *auth.TokenParser // nil: NewRouter crée un parser par défaut (JWKS ou mode test)
}

type createLobbyBody struct {
	Mode     string `json:"mode"`
	HostName string `json:"host_name,omitempty"`
}

// handleCreateLobby persists the lobby synchronously: HTTP 201 is sent only after Redis SET ... NX
// returns success (see store.createLobbyWithHost). No detached goroutine writes the lobby.
func (serverConfig Config) handleCreateLobby(responseWriter http.ResponseWriter, request *http.Request) {
	if serverConfig.Store == nil {
		http.Error(responseWriter, "invalid server configuration", http.StatusInternalServerError)
		return
	}

	var body createLobbyBody
	if err := json.NewDecoder(request.Body).Decode(&body); err != nil {
		if errors.Is(err, io.EOF) {
			body = createLobbyBody{Mode: string(models.GameModeLocal)}
		} else {
			http.Error(responseWriter, "invalid JSON body", http.StatusBadRequest)
			return
		}
	}

	if strings.TrimSpace(body.Mode) == "" {
		body.Mode = string(models.GameModeLocal)
	}

	var mode models.GameMode
	switch strings.TrimSpace(body.Mode) {
	case string(models.GameModeLocal):
		mode = models.GameModeLocal
	case string(models.GameModeOnline):
		mode = models.GameModeOnline
	default:
		http.Error(responseWriter, `invalid mode: use "local" or "online"`, http.StatusBadRequest)
		return
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

	lobby, err := serverConfig.Store.CreateLobbyForHost(ctx, mode, authUserID, hostName)
	if err != nil {
		http.Error(responseWriter, "unable to create lobby", http.StatusInternalServerError)
		return
	}

	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(responseWriter).Encode(lobby)
}
