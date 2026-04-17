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
)

func newServer(addr string) *http.Server {
	return &http.Server{
		Addr:    addr,
		Handler: api.NewRouter(),
	}
}

func main() {
	server := newServer(":8080")

	go func() {
		log.Printf("server listening on %s", server.Addr)

		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server failed: %v", err)
		}
	}()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	log.Println("shutdown signal received")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Printf("graceful shutdown failed: %v", err)
		if closeErr := server.Close(); closeErr != nil {
			log.Printf("forced close failed: %v", closeErr)
		}
	}

	log.Println("server stopped")
}
