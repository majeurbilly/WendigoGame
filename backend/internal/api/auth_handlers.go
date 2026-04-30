package api

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/majeurbilly/wendigogame/internal/auth"
	"github.com/majeurbilly/wendigogame/internal/database"
)

type registerRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginResponse struct {
	Token string       `json:"token"`
	User  authUserView `json:"user"`
}

type authUserView struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
}

func (serverConfig Config) handleRegister(responseWriter http.ResponseWriter, request *http.Request) {
	if serverConfig.UserStore == nil {
		err := errors.New("user store is nil")
		log.Printf("Erreur Register: %v", err)
		http.Error(responseWriter, "invalid server configuration", http.StatusInternalServerError)
		return
	}

	var body registerRequest
	if err := json.NewDecoder(request.Body).Decode(&body); err != nil {
		log.Printf("Erreur Register: %v", err)
		http.Error(responseWriter, "invalid JSON body", http.StatusBadRequest)
		return
	}

	body.Username = strings.TrimSpace(body.Username)
	body.Email = strings.TrimSpace(strings.ToLower(body.Email))
	if body.Username == "" || body.Email == "" || strings.TrimSpace(body.Password) == "" {
		err := errors.New("missing username, email or password")
		log.Printf("Erreur Register: %v", err)
		http.Error(responseWriter, "username, email and password are required", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(request.Context(), 10*time.Second)
	defer cancel()

	user, err := serverConfig.UserStore.CreateUser(ctx, body.Username, body.Email, body.Password)
	if errors.Is(err, database.ErrEmailAlreadyExists) {
		log.Printf("Erreur Register: %v", err)
		http.Error(responseWriter, "email already exists", http.StatusConflict)
		return
	}
	if errors.Is(err, database.ErrUsernameExists) {
		log.Printf("Erreur Register: %v", err)
		http.Error(responseWriter, "username already exists", http.StatusConflict)
		return
	}
	if err != nil {
		log.Printf("Erreur Register: %v", err)
		http.Error(responseWriter, "unable to create user", http.StatusInternalServerError)
		return
	}

	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(responseWriter).Encode(user)
}

func (serverConfig Config) handleLogin(responseWriter http.ResponseWriter, request *http.Request) {
	if serverConfig.UserStore == nil {
		http.Error(responseWriter, "invalid server configuration", http.StatusInternalServerError)
		return
	}

	var body loginRequest
	if err := json.NewDecoder(request.Body).Decode(&body); err != nil {
		http.Error(responseWriter, "invalid JSON body", http.StatusBadRequest)
		return
	}

	body.Email = strings.TrimSpace(strings.ToLower(body.Email))
	body.Password = strings.TrimSpace(body.Password)
	if body.Email == "" || body.Password == "" {
		http.Error(responseWriter, "email and password are required", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(request.Context(), 10*time.Second)
	defer cancel()

	user, err := serverConfig.UserStore.GetUserByEmail(ctx, body.Email)
	if errors.Is(err, database.ErrUserNotFound) {
		http.Error(responseWriter, "invalid credentials", http.StatusUnauthorized)
		return
	}
	if err != nil {
		http.Error(responseWriter, "unable to login", http.StatusInternalServerError)
		return
	}

	if !auth.VerifyPassword(user.PasswordHash, body.Password) {
		http.Error(responseWriter, "invalid credentials", http.StatusUnauthorized)
		return
	}

	token, err := auth.GenerateToken(user.ID)
	if err != nil {
		log.Printf("Erreur génération token: %v", err)
		http.Error(responseWriter, "unable to generate token", http.StatusInternalServerError)
		return
	}

	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(responseWriter).Encode(loginResponse{
		Token: token,
		User: authUserView{
			ID:       user.ID.String(),
			Username: user.Username,
			Email:    user.Email,
		},
	})
}

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
