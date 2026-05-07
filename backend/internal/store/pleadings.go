package store

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"strings"

	"github.com/redis/go-redis/v9"

	"github.com/majeurbilly/wendigogame/internal/models"
)

func clearPleadingsState(lobby *models.Lobby) {
	if lobby == nil {
		return
	}
	lobby.PleadingsQueue = nil
	lobby.CurrentSpeakerID = ""
	lobby.PleadingTimerStarted = false
}

// buildPleadingsQueueFromCouncil returns a deterministic order: for each accuser ID sorted lexicographically,
// append the accuser, then the target only if the target is not excluded from council (no speech for unseated accused).
func buildPleadingsQueueFromCouncil(acc map[string]string, players []models.Player) []string {
	if len(acc) == 0 {
		return nil
	}
	accusers := make([]string, 0, len(acc))
	for accuserID := range acc {
		accusers = append(accusers, accuserID)
	}
	sort.Strings(accusers)
	out := make([]string, 0, len(accusers)*2)
	for _, accuserID := range accusers {
		out = append(out, accuserID)
		targetID := acc[accuserID]
		if !isPlayerExcludedFromCouncil(players, targetID) {
			out = append(out, targetID)
		}
	}
	return out
}

func isPlayerExcludedFromCouncil(players []models.Player, playerID string) bool {
	for i := range players {
		if players[i].ID.String() == playerID {
			return players[i].IsExcludedFromCouncil
		}
	}
	return false
}

// startPleadingsFromAccusation moves the lobby from ACCUSATION into PLEADINGS with the first speaker ready (timer not started).
func startPleadingsFromAccusation(lobby *models.Lobby) {
	q := buildPleadingsQueueFromCouncil(lobby.CouncilAccusations, lobby.Players)
	lobby.PleadingsQueue = q
	lobby.Phase = models.GamePhasePleadings
	lobby.PleadingTimerStarted = false
	lobby.PleadingsCompleted = false
	if len(lobby.PleadingsQueue) == 0 {
		lobby.CurrentSpeakerID = ""
		models.SetPhaseCountdown(lobby, 0)
		return
	}
	lobby.CurrentSpeakerID = lobby.PleadingsQueue[0]
	lobby.PleadingsQueue = lobby.PleadingsQueue[1:]
	models.SetPhaseCountdown(lobby, 15)
}

// StartPleading arms the speaking timer for the current speaker (START_PLEADING WebSocket).
func (s *Store) StartPleading(ctx context.Context, code, playerID string) error {
	code = strings.ToUpper(strings.TrimSpace(code))
	if len(code) != 4 {
		return ErrLobbyNotFound
	}
	playerID = strings.TrimSpace(playerID)
	if playerID == "" {
		return ErrUnauthorized
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

			if lobby.Phase != models.GamePhasePleadings {
				return ErrWrongPhase
			}
			if lobby.PleadingTimerStarted {
				return ErrWrongPhase
			}
			if lobby.CurrentSpeakerID == "" {
				return ErrWrongPhase
			}
			if lobby.CurrentSpeakerID != playerID {
				return ErrUnauthorized
			}

			lobby.PleadingTimerStarted = true
			models.SetPhaseCountdown(&lobby, models.EffectivePhaseSettings(&lobby).PleadingSpeechSeconds)

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
		if errors.Is(err, ErrLobbyNotFound) || errors.Is(err, ErrWrongPhase) || errors.Is(err, ErrUnauthorized) {
			return err
		}
		if err == redis.TxFailedErr {
			continue
		}
		return err
	}
	return fmt.Errorf("start pleading: excessive contention on lobby %s", code)
}
