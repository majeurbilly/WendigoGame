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

// SelectSeat assigns an empty chair (0–15) to a player during CHAIR_SELECTION under WATCH.
func (s *Store) SelectSeat(ctx context.Context, code, playerID string, chairID int) error {
	code = strings.ToUpper(strings.TrimSpace(code))
	if len(code) != 4 {
		return ErrLobbyNotFound
	}
	playerID = strings.TrimSpace(playerID)
	if playerID == "" {
		return ErrPlayerNotInLobby
	}
	if chairID < 0 || chairID > 15 {
		return ErrInvalidChair
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

			if lobby.Phase != models.GamePhaseChairSelection {
				return ErrWrongPhase
			}

			playerIndex := -1
			for i := range lobby.Players {
				if lobby.Players[i].ID.String() == playerID {
					playerIndex = i
					break
				}
			}
			if playerIndex < 0 {
				return ErrPlayerNotInLobby
			}
			if lobby.Players[playerIndex].ChairID != models.UnseatedChair {
				return ErrAlreadySeated
			}
			if !lobby.Players[playerIndex].IsAlive {
				return ErrWrongPhase
			}

			for i := range lobby.Players {
				if i != playerIndex && lobby.Players[i].ChairID == chairID {
					return ErrSeatOccupied
				}
			}

			lobby.Players[playerIndex].ChairID = chairID

			if chairSelectionPhaseComplete(&lobby) {
				if err := advanceFromChairSelection(&lobby); err != nil {
					return err
				}
				lobby.Votes = make(map[string]string)
				lobby.NightActions = make(map[string]string)
				lobby.Prayers = make(map[string]string)
				lobby.WendigoIntentions = make(map[string]string)
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
		if errors.Is(err, ErrLobbyNotFound) || errors.Is(err, ErrWrongPhase) ||
			errors.Is(err, ErrInvalidChair) || errors.Is(err, ErrSeatOccupied) ||
			errors.Is(err, ErrAlreadySeated) || errors.Is(err, ErrPlayerNotInLobby) {
			return err
		}
		if err == redis.TxFailedErr {
			continue
		}
		return err
	}
	return fmt.Errorf("select seat: excessive contention on lobby %s", code)
}
