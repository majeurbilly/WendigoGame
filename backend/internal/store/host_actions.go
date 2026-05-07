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

func isLobbyHost(lobby *models.Lobby, playerID string) bool {
	for i := range lobby.Players {
		if lobby.Players[i].ID.String() == playerID && lobby.Players[i].IsHost {
			return true
		}
	}
	return false
}

func winnerTeamFromLivingWendigo(lobby *models.Lobby) string {
	for i := range lobby.Players {
		player := lobby.Players[i]
		if player.IsAlive && isWendigoRoleName(player.Role) {
			return VictoryTeamWendigos
		}
	}
	return VictoryTeamVillagers
}

func applyImmediateGameOver(lobby *models.Lobby) {
	lobby.Phase = models.PhaseGameOver
	lobby.WinnerTeam = winnerTeamFromLivingWendigo(lobby)
	lobby.IsPaused = false
	models.SetPhaseCountdown(lobby, 0)
}

func (s *Store) updateLobbyForAdminAction(ctx context.Context, code string, fn func(*models.Lobby) error) error {
	code = strings.ToUpper(strings.TrimSpace(code))
	if len(code) != 4 {
		return ErrLobbyNotFound
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
			if err := fn(&lobby); err != nil {
				return err
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
		if errors.Is(err, ErrLobbyNotFound) || errors.Is(err, ErrUnauthorized) || errors.Is(err, ErrWrongPhase) || errors.Is(err, ErrPlayerNotInLobby) {
			return err
		}
		if err == redis.TxFailedErr {
			continue
		}
		return err
	}
	return fmt.Errorf("admin action: excessive contention on lobby %s", code)
}

func (s *Store) TogglePause(ctx context.Context, code, playerID string) error {
	playerID = strings.TrimSpace(playerID)
	if playerID == "" {
		return ErrUnauthorized
	}
	return s.updateLobbyForAdminAction(ctx, code, func(lobby *models.Lobby) error {
		if !isLobbyHost(lobby, playerID) {
			return ErrUnauthorized
		}
		if lobby.Phase == models.GamePhaseLobby || lobby.Phase == models.PhaseGameOver {
			return ErrWrongPhase
		}
		lobby.IsPaused = !lobby.IsPaused
		return nil
	})
}

func (s *Store) ForceEndGame(ctx context.Context, code, playerID string) error {
	playerID = strings.TrimSpace(playerID)
	if playerID == "" {
		return ErrUnauthorized
	}
	return s.updateLobbyForAdminAction(ctx, code, func(lobby *models.Lobby) error {
		if !isLobbyHost(lobby, playerID) {
			return ErrUnauthorized
		}
		applyImmediateGameOver(lobby)
		lobby.SurrenderVoteActive = false
		lobby.SurrenderApproved = false
		lobby.SurrenderVotes = make(map[string]bool)
		return nil
	})
}

func (s *Store) StartSurrenderVote(ctx context.Context, code, playerID string) error {
	playerID = strings.TrimSpace(playerID)
	if playerID == "" {
		return ErrUnauthorized
	}
	return s.updateLobbyForAdminAction(ctx, code, func(lobby *models.Lobby) error {
		if !isLobbyHost(lobby, playerID) {
			return ErrUnauthorized
		}
		if lobby.Phase == models.GamePhaseLobby || lobby.Phase == models.PhaseGameOver {
			return ErrWrongPhase
		}
		lobby.SurrenderVoteActive = true
		lobby.SurrenderApproved = false
		lobby.SurrenderVotes = make(map[string]bool)
		return nil
	})
}

func (s *Store) SubmitSurrenderVote(ctx context.Context, code, playerID string, voteYes bool) error {
	playerID = strings.TrimSpace(playerID)
	if playerID == "" {
		return ErrUnauthorized
	}
	return s.updateLobbyForAdminAction(ctx, code, func(lobby *models.Lobby) error {
		if !lobby.SurrenderVoteActive || lobby.SurrenderApproved {
			return ErrWrongPhase
		}

		alivePlayers := 0
		playerAlive := false
		for i := range lobby.Players {
			if !lobby.Players[i].IsAlive {
				continue
			}
			alivePlayers++
			if lobby.Players[i].ID.String() == playerID {
				playerAlive = true
			}
		}
		if !playerAlive {
			return ErrUnauthorized
		}

		lobby.SurrenderVotes[playerID] = voteYes
		yesVotes := 0
		for _, yes := range lobby.SurrenderVotes {
			if yes {
				yesVotes++
			}
		}
		if yesVotes > alivePlayers/2 {
			lobby.SurrenderApproved = true
			lobby.SurrenderVoteActive = false
			return nil
		}
		if len(lobby.SurrenderVotes) >= alivePlayers {
			lobby.SurrenderVoteActive = false
		}
		return nil
	})
}
