package store

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/redis/go-redis/v9"

	"github.com/majeurbilly/wendigogame/internal/models"
)

// ProcessGameTick applique une seconde de jeu au lobby (lecture / écriture sous WATCH).
// Renvoie continueLoop=false si le lobby n’existe plus, si la phase est LOBBY (ou vide), ou en cas d’erreur Redis.
// Renvoie continueLoop=true après une écriture réussie (phase autre que LOBBY).
func (s *Store) ProcessGameTick(ctx context.Context, code string) (continueLoop bool, err error) {
	code = strings.ToUpper(strings.TrimSpace(code))
	if len(code) != 4 {
		return false, nil
	}
	key := lobbyKey(code)
	for range maxLobbyTxRetries {
		var keepGoing bool
		watchErr := s.redisClient.Watch(ctx, func(tx *redis.Tx) error {
			keepGoing = false
			raw, err := tx.Get(ctx, key).Result()
			if err == redis.Nil {
				return nil
			}
			if err != nil {
				return err
			}
			var lobby models.Lobby
			if err := json.Unmarshal([]byte(raw), &lobby); err != nil {
				return fmt.Errorf("unmarshal lobby: %w", err)
			}
			if lobby.Phase == "" {
				lobby.Phase = models.GamePhaseLobby
			}
			if lobby.Phase == models.GamePhaseLobby {
				return nil
			}

			lobby.TimeRemaining--
			if lobby.TimeRemaining <= 0 {
				next, seconds := models.GetNextPhaseAndTime(lobby.Phase)
				lobby.Phase = next
				lobby.TimeRemaining = seconds
			}

			payload, err := json.Marshal(&lobby)
			if err != nil {
				return fmt.Errorf("marshal lobby: %w", err)
			}
			_, err = tx.TxPipelined(ctx, func(pipe redis.Pipeliner) error {
				pipe.Set(ctx, key, payload, lobbyTTL)
				return nil
			})
			if err != nil {
				return err
			}
			keepGoing = true
			return nil
		}, key)
		if watchErr == nil {
			return keepGoing, nil
		}
		if errors.Is(watchErr, redis.TxFailedErr) {
			continue
		}
		return false, watchErr
	}
	return false, fmt.Errorf("process game tick: concurrence excessive sur le lobby %s", code)
}
