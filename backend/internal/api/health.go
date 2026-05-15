package api

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/majeurbilly/wendigogame/internal/auth"
)

// healthResponse is the minimal payload for GET /health probes (load balancer, k8s, etc.).
type healthResponse struct {
	Status string `json:"status"`
}

// NewRouter registers HTTP routes on a standard ServeMux (Go 1.22+: method + path).
func NewRouter(serverConfig Config) *http.ServeMux {
	cfg := serverConfig
	if cfg.AccessTokenParser == nil {
		parser, err := auth.NewTokenParser(context.Background())
		if err != nil {
			panic(fmt.Sprintf("api.NewRouter: auth.NewTokenParser: %v", err))
		}
		cfg.AccessTokenParser = parser
	}

	httpServeMux := http.NewServeMux()
	httpServeMux.HandleFunc("/health", healthHandler)
	httpServeMux.Handle("GET /auth/me", cfg.AuthMiddleware(http.HandlerFunc(cfg.handleMe)))
	httpServeMux.Handle("POST /lobbies", cfg.AuthMiddleware(http.HandlerFunc(cfg.handleCreateLobby)))
	httpServeMux.HandleFunc("POST /lobbies/{code}/start", cfg.handleStartGame)
	httpServeMux.HandleFunc("POST /lobbies/{code}/seat", cfg.handleSelectSeat)
	httpServeMux.HandleFunc("GET /ws", cfg.handleWebSocket)
	log.Printf("api: router — ordre global: CORSMiddleware (main) puis ServeMux ; AuthMiddleware sur GET /auth/me et POST /lobbies ; GET /health sans auth")
	return httpServeMux
}

// healthHandler returns a 200 JSON response without touching the store (light process check).
func healthHandler(responseWriter http.ResponseWriter, _ *http.Request) {
	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(http.StatusOK)

	_ = json.NewEncoder(responseWriter).Encode(healthResponse{Status: "ok"})
}
