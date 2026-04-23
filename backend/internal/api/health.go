package api

import (
	"encoding/json"
	"net/http"
)

// healthResponse est le corps minimal de GET /health pour les sondes (load balancer, k8s, etc.).
type healthResponse struct {
	Status string `json:"status"`
}

// NewRouter enregistre les routes HTTP sur un ServeMux standard (Go 1.22+ : méthode + chemin).
func NewRouter(serverConfig Config) *http.ServeMux {
	httpServeMux := http.NewServeMux()
	httpServeMux.HandleFunc("/health", healthHandler)
	httpServeMux.HandleFunc("POST /lobbies", serverConfig.handleCreateLobby)
	httpServeMux.HandleFunc("GET /ws", serverConfig.handleWebSocket)
	return httpServeMux
}

// healthHandler répond 200 JSON sans toucher au store (vérification légère du processus).
func healthHandler(responseWriter http.ResponseWriter, _ *http.Request) {
	responseWriter.Header().Set("Content-Type", "application/json")
	responseWriter.WriteHeader(http.StatusOK)

	_ = json.NewEncoder(responseWriter).Encode(healthResponse{Status: "ok"})
}
