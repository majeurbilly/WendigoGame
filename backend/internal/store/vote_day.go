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

// councilVoteVictimID returns the unique player ID with the most votes, or "" if nobody leads or there is a tie (or zero votes).
func councilVoteVictimID(lobby *models.Lobby) string {
	tally := tallyEffectiveVotes(lobby)
	maxVotes := -1
	for _, c := range tally {
		if c > maxVotes {
			maxVotes = c
		}
	}
	if maxVotes <= 0 {
		return ""
	}
	var leaders []string
	for id, c := range tally {
		if c == maxVotes {
			leaders = append(leaders, id)
		}
	}
	sort.Strings(leaders)
	if len(leaders) != 1 {
		return ""
	}
	return leaders[0]
}

// applyCouncilVoteElimination kills the unique council vote leader if any; no-op on ties or empty tally.
func applyCouncilVoteElimination(lobby *models.Lobby) {
	victimID := councilVoteVictimID(lobby)
	if victimID == "" {
		return
	}
	for i := range lobby.Players {
		if lobby.Players[i].ID.String() == victimID {
			lobby.Players[i].IsAlive = false
			return
		}
	}
}

// SubmitDayVote records or updates a vote during COUNCIL_VOTE only (daytime lynch votes happen in that phase).
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

			if lobby.Phase != models.GamePhaseCouncilVote {
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
