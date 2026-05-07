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

// SubmitWendigoIntent sets or clears a Wendigo's soft kill intent during NIGHT (visible only to Wendigos in DTO).
func (s *Store) SubmitWendigoIntent(ctx context.Context, code, wendigoID, targetID string) error {
	code = strings.ToUpper(strings.TrimSpace(code))
	if len(code) != 4 {
		return ErrLobbyNotFound
	}
	wendigoID = strings.TrimSpace(wendigoID)
	targetID = strings.TrimSpace(targetID)
	if wendigoID == "" {
		return ErrNightActionInvalid
	}

	key := lobbyKey(code)
	for range maxLobbyTxRetries {
		err := s.redisClient.Watch(ctx, func(tx *redis.Tx) error {
			raw, err := tx.Get(ctx, key).Result()
			if err == redis.Nil {
				return ErrLobbyNotFound
			}
			if err != nil {
				return err
			}
			var lobby models.Lobby
			if err := json.Unmarshal([]byte(raw), &lobby); err != nil {
				return fmt.Errorf("unmarshal lobby: %w", err)
			}
			ensureLobbyVotes(&lobby)

			if lobby.Phase != models.GamePhaseNight {
				return ErrWrongPhase
			}

			var wendigoPlayer *models.Player
			for i := range lobby.Players {
				if lobby.Players[i].ID.String() == wendigoID {
					wendigoPlayer = &lobby.Players[i]
					break
				}
			}
			if wendigoPlayer == nil || !wendigoPlayer.IsAlive || !isWendigoRoleName(wendigoPlayer.Role) {
				return ErrNightActionInvalid
			}

			if targetID == "" {
				delete(lobby.WendigoIntentions, wendigoID)
				delete(lobby.WendigoIntents, wendigoID)
			} else {
				var targetPlayer *models.Player
				for i := range lobby.Players {
					if lobby.Players[i].ID.String() == targetID {
						targetPlayer = &lobby.Players[i]
						break
					}
				}
				if targetPlayer == nil || !targetPlayer.IsAlive || isWendigoRoleName(targetPlayer.Role) {
					return ErrNightActionInvalid
				}
				if targetID == wendigoID {
					return ErrNightActionInvalid
				}
				lobby.WendigoIntentions[wendigoID] = targetID
				lobby.WendigoIntents[wendigoID] = targetID
			}

			payload, err := json.Marshal(&lobby)
			if err != nil {
				return fmt.Errorf("marshal lobby: %w", err)
			}
			_, err = tx.TxPipelined(ctx, func(pipe redis.Pipeliner) error {
				pipe.Set(ctx, key, payload, lobbyTTL)
				return nil
			})
			return err
		}, key)
		if err == nil {
			return nil
		}
		if errors.Is(err, ErrLobbyNotFound) || errors.Is(err, ErrWrongPhase) || errors.Is(err, ErrNightActionInvalid) {
			return err
		}
		if err == redis.TxFailedErr {
			continue
		}
		return err
	}
	return fmt.Errorf("submit wendigo intent: excessive contention on lobby %s", code)
}
