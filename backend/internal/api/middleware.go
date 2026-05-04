package api

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/google/uuid"
	"github.com/golang-jwt/jwt/v5"
	"github.com/majeurbilly/wendigogame/internal/auth"
)

type contextKey string

const userIDContextKey contextKey = "auth_user_id"

var defaultCORSOrigins = []string{
	"http://localhost:5173",
	"http://127.0.0.1:5173",
	"http://127.0.0.1:5174",
}

// allowedCORSOrigins returns origins from ALLOWED_ORIGINS (comma-separated) or defaults.
// Empty or whitespace-only entries are skipped; if nothing remains, defaults are used.
func allowedCORSOrigins() []string {
	raw := strings.TrimSpace(os.Getenv("ALLOWED_ORIGINS"))
	if raw == "" {
		return defaultCORSOrigins
	}
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	if len(out) == 0 {
		return defaultCORSOrigins
	}
	return out
}

func allowedOriginSet() map[string]struct{} {
	allowed := make(map[string]struct{})
	for _, origin := range allowedCORSOrigins() {
		allowed[origin] = struct{}{}
	}
	return allowed
}

func isAllowedOrigin(origin string) bool {
	origin = strings.TrimSpace(origin)
	if origin == "" {
		return false
	}
	_, ok := allowedOriginSet()[origin]
	return ok
}

// CORSMiddleware is the single authority for CORS. It must not branch on path or route.
// The four response headers are applied to every request before any other logic.
// Preflight OPTIONS requests are answered here only (204); they never reach inner handlers.
// With credentials, Allow-Origin must echo the request Origin when it is in the allowlist.
func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Requête reçue : %s %s", r.Method, r.URL.Path)

		if origin := strings.TrimSpace(r.Header.Get("Origin")); origin != "" {
			if isAllowedOrigin(origin) {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Add("Vary", "Origin")
			}
		}
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

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
