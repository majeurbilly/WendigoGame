package api

import (
	"context"
	"errors"
	"log"
	"time"

	"github.com/majeurbilly/wendigogame/internal/models"
	"github.com/majeurbilly/wendigogame/internal/store"
)

// StartGameLoop launches a goroutine that decrements the lobby timer every second
// and applies phase transitions. The loop stops if the context is canceled,
// if the lobby disappears, or if the phase returns to LOBBY.
// If h is not nil, each successful tick triggers a GAME_TICK broadcast with the lobby state.
func StartGameLoop(ctx context.Context, st *store.Store, h *Hub, lobby models.LobbyManager) {
	if st == nil || lobby == nil || lobby.GetCode() == "" {
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
				cont, err := st.ProcessGameTick(ctx, code)
				if err != nil {
					return
				}
				if !cont {
					return
				}
				if h == nil {
					continue
				}
				tickCtx, cancelTick := context.WithTimeout(context.Background(), 5*time.Second)
				updated, gerr := st.GetLobby(tickCtx, code)
				cancelTick()
				if gerr != nil {
					if errors.Is(gerr, store.ErrLobbyNotFound) {
						return
					}
					continue
				}
				if berr := h.Broadcast(code, models.MessageTypeGameTick, updated); berr != nil {
					log.Printf("game loop: broadcast GAME_TICK (%s): %v", code, berr)
				}
			}
		}
	}()
}
