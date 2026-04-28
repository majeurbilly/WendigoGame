package api

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/golang-jwt/jwt/v5"
	"github.com/majeurbilly/wendigogame/internal/auth"
)

type contextKey string

const userIDContextKey contextKey = "auth_user_id"

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
		authHeader := strings.TrimSpace(request.Header.Get("Authorization"))
		if authHeader == "" {
			http.Error(responseWriter, "missing authorization header", http.StatusUnauthorized)
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			http.Error(responseWriter, "invalid authorization header format", http.StatusUnauthorized)
			return
		}

		userID, err := auth.ValidateToken(strings.TrimSpace(parts[1]))
		if err != nil {
			if errors.Is(err, jwt.ErrTokenExpired) || errors.Is(err, jwt.ErrTokenMalformed) || errors.Is(err, jwt.ErrTokenSignatureInvalid) || errors.Is(err, jwt.ErrTokenNotValidYet) {
				http.Error(responseWriter, "invalid or expired token", http.StatusUnauthorized)
				return
			}
			http.Error(responseWriter, "unauthorized", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(request.Context(), userIDContextKey, userID)
		next.ServeHTTP(responseWriter, request.WithContext(ctx))
	})
}

func userIDFromContext(ctx context.Context) (uuid.UUID, bool) {
	userID, ok := ctx.Value(userIDContextKey).(uuid.UUID)
	return userID, ok
}
