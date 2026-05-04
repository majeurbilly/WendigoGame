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

// SubmitCouncilAccusation records one accusation during ACCUSATION (council): at most one target per accuser
// and each target may be accused by at most one accuser this phase.
func (s *Store) SubmitCouncilAccusation(ctx context.Context, code, accuserID, targetID string) error {
	code = strings.ToUpper(strings.TrimSpace(code))
	if len(code) != 4 {
		return ErrLobbyNotFound
	}
	accuserID = strings.TrimSpace(accuserID)
	targetID = strings.TrimSpace(targetID)
	if accuserID == "" || targetID == "" {
		return ErrVoteInvalid
	}
	if accuserID == targetID {
		return ErrVoteInvalid
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

			if lobby.Phase != models.GamePhaseAccusation {
				return ErrWrongPhase
			}

			accuserOK := false
			targetOK := false
			for i := range lobby.Players {
				pid := lobby.Players[i].ID.String()
				if pid == accuserID {
					if lobby.Players[i].IsAlive && !lobby.Players[i].IsExcludedFromCouncil {
						accuserOK = true
					}
				}
				if pid == targetID && lobby.Players[i].IsAlive {
					targetOK = true
				}
			}
			if !accuserOK || !targetOK {
				return ErrVoteInvalid
			}

			if _, exists := lobby.CouncilAccusations[accuserID]; exists {
				return ErrAlreadyAccused
			}
			for _, accusedID := range lobby.CouncilAccusations {
				if accusedID == targetID {
					return ErrTargetAlreadyAccused
				}
			}

			lobby.CouncilAccusations[accuserID] = targetID

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
		if errors.Is(err, ErrLobbyNotFound) || errors.Is(err, ErrWrongPhase) ||
			errors.Is(err, ErrVoteInvalid) || errors.Is(err, ErrAlreadyAccused) ||
			errors.Is(err, ErrTargetAlreadyAccused) {
			return err
		}
		if err == redis.TxFailedErr {
			continue
		}
		return err
	}
	return fmt.Errorf("submit council accusation: excessive contention on lobby %s", code)
}
