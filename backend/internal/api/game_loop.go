package api

import (
	"context"
	"log"
	"time"

	"github.com/majeurbilly/wendigogame/internal/models"
)

type GameTickProvider interface {
	ProcessGameTick(ctx context.Context, code string) (continueLoop bool, err error)
	GetLobby(ctx context.Context, code string) (*models.Lobby, error)
}

// StartGameLoop launches a goroutine that decrements the lobby timer every second
// and applies phase transitions. The loop stops if the context is canceled,
// if the lobby disappears, or if the phase returns to LOBBY.
// If h is not nil, each successful tick triggers a GAME_TICK broadcast with the lobby state.
func StartGameLoop(ctx context.Context, gameTickProvider GameTickProvider, h *Hub, lobby models.LobbyManager) {
	if gameTickProvider == nil || lobby == nil || lobby.GetCode() == "" {
		return
	}
	code := lobby.GetCode()
	go func() {
		ticker := time.NewTicker(1 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				if ctx.Err() != nil {
					return
				}
				cont, err := gameTickProvider.ProcessGameTick(ctx, code)
				if err != nil {
					return
				}
				if !cont {
					log.Printf("Stopping game loop for lobby %s", code)
					return
				}
				if h == nil {
					continue
				}
				tickCtx, cancelTick := context.WithTimeout(context.Background(), 5*time.Second)
				updated, gerr := gameTickProvider.GetLobby(tickCtx, code)
				cancelTick()
				if gerr != nil {
					continue
				}
				if berr := h.Broadcast(code, models.MessageTypeGameTick, updated); berr != nil {
					log.Printf("game loop: broadcast GAME_TICK (%s): %v", code, berr)
				}
			}
		}
	}()
}
