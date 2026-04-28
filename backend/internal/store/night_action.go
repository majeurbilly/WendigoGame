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

// SubmitNightAction records or updates a night action during NIGHT with role-aware validation.
func (s *Store) SubmitNightAction(ctx context.Context, code, sourcePlayerID, targetPlayerID, actionType string) error {
	code = strings.ToUpper(strings.TrimSpace(code))
	if len(code) != 4 {
		return ErrLobbyNotFound
	}
	sourcePlayerID = strings.TrimSpace(sourcePlayerID)
	targetPlayerID = strings.TrimSpace(targetPlayerID)
	actionType = strings.ToUpper(strings.TrimSpace(actionType))
	if sourcePlayerID == "" || actionType == "" {
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

			sourceAlive := false
			sourceRole := ""
			targetAlive := false
			for i := range lobby.Players {
				if lobby.Players[i].ID.String() == sourcePlayerID && lobby.Players[i].IsAlive {
					sourceAlive = true
					sourceRole = strings.ToUpper(strings.TrimSpace(lobby.Players[i].Role))
				}
				if targetPlayerID != "" && lobby.Players[i].ID.String() == targetPlayerID && lobby.Players[i].IsAlive {
					targetAlive = true
				}
			}
			if !sourceAlive || sourceRole == "" {
				return ErrNightActionInvalid
			}

			switch {
			case strings.Contains(sourceRole, "WENDIGO") || strings.Contains(sourceRole, "WEREWOLF"):
				if actionType != "KILL" || !targetAlive {
					return ErrNightActionInvalid
				}
			case strings.Contains(sourceRole, "SEER"):
				if actionType != "INSPECT" || !targetAlive {
					return ErrNightActionInvalid
				}
			default:
				if actionType != "PRAY" {
					return ErrNightActionInvalid
				}
			}

			lobby.NightActions[sourcePlayerID] = targetPlayerID

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
	return fmt.Errorf("submit night action: excessive contention on lobby %s", code)
}
