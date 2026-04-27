package api

import (
	"encoding/json"
	"net/http"
)

// healthResponse is the minimal payload for GET /health probes (load balancer, k8s, etc.).
type healthResponse struct {
	Status string `json:"status"`
}

// NewRouter registers HTTP routes on a standard ServeMux (Go 1.22+: method + path).
func NewRouter(serverConfig Config) *http.ServeMux {
	httpServeMux := http.NewServeMux()
	httpServeMux.HandleFunc("/health", healthHandler)
	httpServeMux.HandleFunc("POST /lobbies", serverConfig.handleCreateLobby)
	httpServeMux.HandleFunc("POST /lobbies/{code}/start", serverConfig.handleStartGame)
	httpServeMux.HandleFunc("GET /ws", serverConfig.handleWebSocket)
	return httpServeMux
}

// healthHandler returns a 200 JSON response without touching the store (light process check).
func healthHandler(responseWriter http.ResponseWriter, _ *http.Request) {
	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(http.StatusOK)

	_ = json.NewEncoder(responseWriter).Encode(healthResponse{Status: "ok"})
}
