package api

import (
	"context"
	"time"

	"github.com/majeurbilly/wendigogame/internal/models"
	"github.com/majeurbilly/wendigogame/internal/store"
)

// StartGameLoop lance une goroutine qui décrémente le timer du lobby chaque seconde
// et applique les transitions de phase. La boucle s’arrête si le contexte est annulé,
// si le lobby disparaît, ou si la phase redevient LOBBY.
// Si h est non nil, chaque tick réussi déclenche un broadcast GAME_TICK avec l’état du lobby.
func StartGameLoop(ctx context.Context, st *store.Store, h *Hub, code string) {
	if st == nil || code == "" {
		return
	}
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
					continue
				}
				h.Broadcast(code, models.MessageTypeGameTick, updated)
			}
		}
	}()
}
