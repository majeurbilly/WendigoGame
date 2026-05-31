package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/majeurbilly/wendigogame/internal/api"
	"github.com/majeurbilly/wendigogame/internal/auth"
	"github.com/majeurbilly/wendigogame/internal/database"
	"github.com/majeurbilly/wendigogame/internal/services"
	"github.com/majeurbilly/wendigogame/internal/store"
)

// newServer encapsule la configuration minimale du serveur HTTP (adresse + handler racine).
func newServer(addr string, handler http.Handler) *http.Server {
	return &http.Server{
		Addr:    addr,
		Handler: handler,
	}
}

func main() {
	dbPool, err := database.InitDB(os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalf("postgres: %v", err)
	}
	defer dbPool.Close()

	if err := database.MigrateSchema(context.Background(), dbPool); err != nil {
		log.Fatalf("postgres migrate: %v", err)
	}
	log.Println("postgres schema migrated (users, game_history, game_participants)")

	userStore := database.NewUserStore(dbPool)

	lobbyStore, err := store.NewFromEnv()
	if err != nil {
		log.Fatalf("valkey: %v", err)
	}
	lobbyStore.SetUserStore(userStore)
	defer func() {
		if closeErr := lobbyStore.Close(); closeErr != nil {
			log.Printf("valkey close: %v", closeErr)
		}
	}()

	liveKitService, err := services.NewLiveKitServiceFromEnv()
	if err != nil {
		log.Fatalf("livekit: %v", err)
	}

	connectionHub := api.NewHub(lobbyStore, liveKitService)

	tokenParser, err := auth.NewTokenParser(context.Background())
	if err != nil {
		log.Fatalf("auth jwks: %v", err)
	}
	defer tokenParser.Close()

	router := api.NewRouter(api.Config{
		Store:             lobbyStore,
		UserStore:         userStore,
		Hub:               connectionHub,
		AccessTokenParser: tokenParser,
	})
	// CORS wraps the entire router: this handler is the one passed to http.Server (ListenAndServe).
	// Ordre d'exécution : CORSMiddleware d'abord (OPTIONS, en-têtes), puis le mux ; AuthMiddleware n'est appelé que sur les routes qui l'enveloppent (voir NewRouter).
	handler := api.CORSMiddleware(router)
	log.Printf("api: main — handler racine = CORSMiddleware(router), routes auth dans internal/api/health.go (NewRouter)")
	server := newServer(":8080", handler)

	go func() {
		log.Printf("server listening on %s", server.Addr)

		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server failed: %v", err)
		}
	}()

	signalChannel := make(chan os.Signal, 1)
	signal.Notify(signalChannel, syscall.SIGINT, syscall.SIGTERM)
	<-signalChannel

	log.Println("shutdown signal received")

	shutdownCtx, cancelShutdown := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancelShutdown()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("graceful shutdown failed: %v", err)
		if closeErr := server.Close(); closeErr != nil {
			log.Printf("forced close failed: %v", closeErr)
		}
	}

	log.Println("server stopped")
}
