package store

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"

	"github.com/majeurbilly/wendigogame/internal/models"
)

const (
	lobbyKeyPrefix    = "lobby:"
	lobbyTTL          = 24 * time.Hour
	maxCodeAttempts   = 100
	maxLobbyTxRetries = 64
)

var ErrCodeGeneration = errors.New("store: impossible de générer un code lobby unique")

var ErrLobbyNotFound = errors.New("store: lobby introuvable")

var ErrUnauthorized = errors.New("store: action non autorisée pour ce joueur")

var ErrGameAlreadyStarted = errors.New("store: la partie a déjà été démarrée")

func lobbyKey(code string) string {
	return lobbyKeyPrefix + code
}

func randomUpperCode(length int) (string, error) {
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	out := make([]byte, length)
	for i := range out {
		v, err := rand.Int(rand.Reader, big.NewInt(int64(len(letters))))
		if err != nil {
			return "", err
		}
		out[i] = letters[v.Int64()]
	}
	return string(out), nil
}

func (s *Store) CreateLobby(ctx context.Context, mode models.GameMode, hostName string) (*models.Lobby, error) {
	for range maxCodeAttempts {
		code, err := randomUpperCode(4)
		if err != nil {
			return nil, err
		}

		host := models.Player{
			ID:     uuid.NewString(),
			Name:   hostName,
			IsHost: true,
		}

		lobby := &models.Lobby{
			Code:           code,
			Mode:           mode,
			Players:        []models.Player{host},
			CreatedAt:      time.Now().UTC(),
			Phase:          models.GamePhaseLobby,
			TimeRemaining:  0,
		}

		payload, err := json.Marshal(lobby)
		if err != nil {
			return nil, fmt.Errorf("marshal lobby: %w", err)
		}

		status, err := s.redisClient.SetArgs(ctx, lobbyKey(code), payload, redis.SetArgs{
			TTL:  lobbyTTL,
			Mode: string(redis.NX),
		}).Result()
		if err != nil {
			if errors.Is(err, redis.Nil) {
				continue
			}
			return nil, err
		}
		if status == "OK" {
			return lobby, nil
		}
	}
	return nil, ErrCodeGeneration
}

func (s *Store) SaveLobby(ctx context.Context, lobby *models.Lobby) error {
	if lobby == nil {
		return fmt.Errorf("lobby nil")
	}
	code := strings.ToUpper(strings.TrimSpace(lobby.Code))
	if len(code) != 4 {
		return fmt.Errorf("code lobby invalide")
	}
	lobby.Code = code
	payload, err := json.Marshal(lobby)
	if err != nil {
		return fmt.Errorf("marshal lobby: %w", err)
	}
	return s.redisClient.Set(ctx, lobbyKey(code), payload, lobbyTTL).Err()
}

func (s *Store) AppendPlayer(ctx context.Context, code string, player models.Player) (*models.Lobby, error) {
	code = strings.ToUpper(strings.TrimSpace(code))
	if len(code) != 4 {
		return nil, ErrLobbyNotFound
	}
	key := lobbyKey(code)
	for range maxLobbyTxRetries {
		var updated *models.Lobby
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
			lobby.Players = append(lobby.Players, player)
			payload, err := json.Marshal(&lobby)
			if err != nil {
				return fmt.Errorf("marshal lobby: %w", err)
			}
			updated = &lobby
			_, err = tx.TxPipelined(ctx, func(pipe redis.Pipeliner) error {
				pipe.Set(ctx, key, payload, lobbyTTL)
				return nil
			})
			return err
		}, key)
		if err == nil {
			return updated, nil
		}
		if errors.Is(err, ErrLobbyNotFound) {
			return nil, err
		}
		if err == redis.TxFailedErr {
			continue
		}
		return nil, err
	}
	return nil, fmt.Errorf("append player: concurrence excessive sur le lobby %s", code)
}

func (s *Store) RemovePlayerByID(ctx context.Context, code, playerID string) error {
	code = strings.ToUpper(strings.TrimSpace(code))
	if len(code) != 4 {
		return nil
	}
	key := lobbyKey(code)
	for range maxLobbyTxRetries {
		err := s.redisClient.Watch(ctx, func(tx *redis.Tx) error {
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
			remainingPlayers := make([]models.Player, 0, len(lobby.Players))
			for _, pl := range lobby.Players {
				if pl.ID != playerID {
					remainingPlayers = append(remainingPlayers, pl)
				}
			}
			if len(remainingPlayers) == 0 {
				_, err = tx.TxPipelined(ctx, func(pipe redis.Pipeliner) error {
					pipe.Del(ctx, key)
					return nil
				})
				return err
			}
			lobby.Players = remainingPlayers
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
		if err == redis.TxFailedErr {
			continue
		}
		return err
	}
	return fmt.Errorf("remove player: concurrence excessive sur le lobby %s", code)
}

// StartGame passe le lobby de LOBBY à la première phase de jeu (CHAIR_SELECTION) avec le timer initial.
// Seul le joueur hôte (IsHost) identifié par hostID peut démarrer.
func (s *Store) StartGame(ctx context.Context, code, hostID string) error {
	code = strings.ToUpper(strings.TrimSpace(code))
	if len(code) != 4 {
		return ErrLobbyNotFound
	}
	hostID = strings.TrimSpace(hostID)
	if hostID == "" {
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
			creatorID := ""
			for _, p := range lobby.Players {
				if p.IsHost {
					creatorID = p.ID
					break
				}
			}
			if creatorID == "" || creatorID != hostID {
				return ErrUnauthorized
			}
			phase := lobby.Phase
			if phase == "" {
				phase = models.GamePhaseLobby
			}
			if phase != models.GamePhaseLobby {
				return ErrGameAlreadyStarted
			}
			nextPhase, seconds := models.GetNextPhaseAndTime(models.GamePhaseLobby)
			lobby.Phase = nextPhase
			lobby.TimeRemaining = seconds
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
		if errors.Is(err, ErrLobbyNotFound) || errors.Is(err, ErrUnauthorized) || errors.Is(err, ErrGameAlreadyStarted) {
			return err
		}
		if err == redis.TxFailedErr {
			continue
		}
		return err
	}
	return fmt.Errorf("start game: concurrence excessive sur le lobby %s", code)
}

func (s *Store) GetLobby(ctx context.Context, code string) (*models.Lobby, error) {
	code = strings.ToUpper(strings.TrimSpace(code))
	if len(code) != 4 {
		return nil, ErrLobbyNotFound
	}
	raw, err := s.redisClient.Get(ctx, lobbyKey(code)).Result()
	if err == redis.Nil {
		return nil, ErrLobbyNotFound
	}
	if err != nil {
		return nil, err
	}
	var lobby models.Lobby
	if err := json.Unmarshal([]byte(raw), &lobby); err != nil {
		return nil, fmt.Errorf("unmarshal lobby: %w", err)
	}
	return &lobby, nil
}

func (s *Store) DeleteLobby(ctx context.Context, code string) error {
	code = strings.ToUpper(strings.TrimSpace(code))
	if len(code) != 4 {
		return nil
	}
	return s.redisClient.Del(ctx, lobbyKey(code)).Err()
}
