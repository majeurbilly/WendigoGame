package api

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/majeurbilly/wendigogame/internal/database"
)

func (serverConfig Config) handleMe(responseWriter http.ResponseWriter, request *http.Request) {
	if serverConfig.UserStore == nil {
		http.Error(responseWriter, "invalid server configuration", http.StatusInternalServerError)
		return
	}

	userID, ok := userIDFromContext(request.Context())
	if !ok {
		http.Error(responseWriter, "unauthorized", http.StatusUnauthorized)
		return
	}

	ctx, cancel := context.WithTimeout(request.Context(), 10*time.Second)
	defer cancel()

	user, err := serverConfig.UserStore.GetUserByID(ctx, userID)
	if errors.Is(err, database.ErrUserNotFound) {
		http.Error(responseWriter, "user not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(responseWriter, "unable to fetch user profile", http.StatusInternalServerError)
		return
	}

	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(responseWriter).Encode(user)
}
