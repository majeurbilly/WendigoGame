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

// SubmitDayVote records or updates a daytime vote. If a strict majority is reached for one target,
// the lobby transitions immediately to ACCUSATION with that player as defendant.
func (s *Store) SubmitDayVote(ctx context.Context, code, voterID, targetID string) error {
	code = strings.ToUpper(strings.TrimSpace(code))
	if len(code) != 4 {
		return ErrLobbyNotFound
	}
	voterID = strings.TrimSpace(voterID)
	targetID = strings.TrimSpace(targetID)
	if voterID == "" || targetID == "" {
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

			if lobby.Phase != models.GamePhaseDay {
				return ErrWrongPhase
			}

			voterAlive := false
			targetAlive := false
			for i := range lobby.Players {
				if lobby.Players[i].ID.String() == voterID && lobby.Players[i].IsAlive {
					voterAlive = true
				}
				if lobby.Players[i].ID.String() == targetID && lobby.Players[i].IsAlive {
					targetAlive = true
				}
			}
			if !voterAlive || !targetAlive {
				return ErrVoteInvalid
			}

			lobby.Votes[voterID] = targetID

			aliveCount := countAlivePlayers(&lobby)
			if aliveCount == 0 {
				return ErrVoteInvalid
			}

			tally := tallyEffectiveVotes(&lobby)
			majorityTargetID := ""
			majorityVotes := -1
			for candidateID, voteCount := range tally {
				if voteCount*2 <= aliveCount {
					continue
				}
				if voteCount > majorityVotes || (voteCount == majorityVotes && (majorityTargetID == "" || candidateID < majorityTargetID)) {
					majorityVotes = voteCount
					majorityTargetID = candidateID
				}
			}
			if majorityTargetID != "" {
				lobby.DefendantID = majorityTargetID
				nextPhase, seconds := models.GetNextPhaseAndTime(models.GamePhaseDay)
				lobby.Phase = nextPhase
				lobby.TimeRemaining = seconds
				lobby.Votes = make(map[string]string)
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
		if errors.Is(err, ErrLobbyNotFound) || errors.Is(err, ErrWrongPhase) || errors.Is(err, ErrVoteInvalid) {
			return err
		}
		if err == redis.TxFailedErr {
			continue
		}
		return err
	}
	return fmt.Errorf("submit day vote: excessive contention on lobby %s", code)
}

func countAlivePlayers(lobby *models.Lobby) int {
	n := 0
	for i := range lobby.Players {
		if lobby.Players[i].IsAlive {
			n++
		}
	}
	return n
}

func tallyEffectiveVotes(lobby *models.Lobby) map[string]int {
	alive := make(map[string]bool)
	for i := range lobby.Players {
		if lobby.Players[i].IsAlive {
			alive[lobby.Players[i].ID.String()] = true
		}
	}
	tally := make(map[string]int)
	for voterID, targetID := range lobby.Votes {
		if !alive[voterID] || !alive[targetID] {
			continue
		}
		tally[targetID]++
	}
	return tally
}

// pickDefendantAtEndOfDay returns the player ID with the most effective votes; ties break by lexicographic ID order.
func pickDefendantAtEndOfDay(lobby *models.Lobby) string {
	tally := tallyEffectiveVotes(lobby)
	bestID := ""
	bestCount := -1
	for targetID, c := range tally {
		if c > bestCount || (c == bestCount && targetID < bestID) {
			bestCount = c
			bestID = targetID
		}
	}
	return bestID
}
