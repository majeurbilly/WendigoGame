package api

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/majeurbilly/wendigogame/internal/models"
	"github.com/majeurbilly/wendigogame/internal/store"
)

type Config struct {
	Store *store.Store
	Hub   *Hub
}

type createLobbyBody struct {
	Mode     string `json:"mode"`
	HostName string `json:"host_name,omitempty"`
}

func (serverConfig Config) handleCreateLobby(responseWriter http.ResponseWriter, request *http.Request) {
	if serverConfig.Store == nil {
		http.Error(responseWriter, "configuration serveur invalide", http.StatusInternalServerError)
		return
	}

	var body createLobbyBody
	if err := json.NewDecoder(request.Body).Decode(&body); err != nil {
		http.Error(responseWriter, "corps JSON invalide", http.StatusBadRequest)
		return
	}

	var mode models.GameMode
	switch strings.TrimSpace(body.Mode) {
	case string(models.GameModePresentiel):
		mode = models.GameModePresentiel
	case string(models.GameModeEnLigne):
		mode = models.GameModeEnLigne
	default:
		http.Error(responseWriter, `mode invalide : utiliser "presentiel" ou "en_ligne"`, http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(request.Context(), 10*time.Second)
	defer cancel()

	lobby, err := serverConfig.Store.CreateLobby(ctx, mode, strings.TrimSpace(body.HostName))
	if err != nil {
		http.Error(responseWriter, "impossible de créer le lobby", http.StatusInternalServerError)
		return
	}

	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(responseWriter).Encode(lobby)
}
