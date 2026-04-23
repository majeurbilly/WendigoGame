package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/alicebob/miniredis/v2"
	"github.com/majeurbilly/wendigogame/internal/api"
	"github.com/majeurbilly/wendigogame/internal/store"
	"github.com/redis/go-redis/v9"
)

// testRouter construit un handler HTTP complet avec Valkey simulé (miniredis) pour les tests d’intégration légers.
func testRouter(t *testing.T) http.Handler {
	t.Helper()
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })
	lobbyStore := store.NewForTesting(redisClient)
	connectionHub := api.NewHub(lobbyStore)
	return api.NewRouter(api.Config{Store: lobbyStore, Hub: connectionHub})
}

func TestHealthEndpoint(t *testing.T) {
	server := newServer(":0", testRouter(t))

	request := httptest.NewRequest(http.MethodGet, "/health", nil)
	responseRecorder := httptest.NewRecorder()

	server.Handler.ServeHTTP(responseRecorder, request)

	if responseRecorder.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, responseRecorder.Code)
	}

	contentType := responseRecorder.Header().Get("Content-Type")
	if !strings.Contains(contentType, "application/json") {
		t.Fatalf("expected Content-Type application/json, got %s", contentType)
	}

	var payload map[string]string
	if err := json.Unmarshal(responseRecorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("expected valid JSON response, got error: %v", err)
	}

	if payload["status"] != "ok" {
		t.Fatalf("expected status field to be ok, got %q", payload["status"])
	}
}
