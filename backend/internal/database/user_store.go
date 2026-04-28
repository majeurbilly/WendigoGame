package database

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/majeurbilly/wendigogame/internal/auth"
	"github.com/majeurbilly/wendigogame/internal/models"
)

var (
	ErrUserNotFound       = errors.New("user not found")
	ErrEmailAlreadyExists = errors.New("email already exists")
	ErrUsernameExists     = errors.New("username already exists")
)

type UserStore struct {
	pool *pgxpool.Pool
}

func NewUserStore(pool *pgxpool.Pool) *UserStore {
	return &UserStore{pool: pool}
}

func (userStore *UserStore) CreateUser(ctx context.Context, username, email, password string) (*models.User, error) {
	if userStore == nil || userStore.pool == nil {
		return nil, errors.New("user store is not initialized")
	}

	hashedPassword, err := auth.HashPassword(password)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}

	query := `
		INSERT INTO users (username, email, password_hash)
		VALUES ($1, $2, $3)
		RETURNING id, username, email, password_hash, games_played, games_won, games_lost, wins_as_wendigo, wins_as_villager, created_at, updated_at
	`

	var user models.User
	err = userStore.pool.QueryRow(ctx, query, username, email, hashedPassword).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.GamesPlayed,
		&user.GamesWon,
		&user.GamesLost,
		&user.WinsAsWendigo,
		&user.WinsAsVillager,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		if isUniqueConstraintError(err, "users_email_key") {
			return nil, ErrEmailAlreadyExists
		}
		if isUniqueConstraintError(err, "users_username_key") {
			return nil, ErrUsernameExists
		}
		return nil, fmt.Errorf("insert user: %w", err)
	}

	return &user, nil
}

func (userStore *UserStore) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	if userStore == nil || userStore.pool == nil {
		return nil, errors.New("user store is not initialized")
	}

	query := `
		SELECT id, username, email, password_hash, games_played, games_won, games_lost, wins_as_wendigo, wins_as_villager, created_at, updated_at
		FROM users
		WHERE email = $1
	`

	var user models.User
	err := userStore.pool.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.GamesPlayed,
		&user.GamesWon,
		&user.GamesLost,
		&user.WinsAsWendigo,
		&user.WinsAsVillager,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("select user by email: %w", err)
	}

	return &user, nil
}

func (userStore *UserStore) GetUserByID(ctx context.Context, userID uuid.UUID) (*models.User, error) {
	if userStore == nil || userStore.pool == nil {
		return nil, errors.New("user store is not initialized")
	}

	query := `
		SELECT id, username, email, password_hash, games_played, games_won, games_lost, wins_as_wendigo, wins_as_villager, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	var user models.User
	err := userStore.pool.QueryRow(ctx, query, userID).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.PasswordHash,
		&user.GamesPlayed,
		&user.GamesWon,
		&user.GamesLost,
		&user.WinsAsWendigo,
		&user.WinsAsVillager,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("select user by id: %w", err)
	}

	return &user, nil
}

func (userStore *UserStore) UpdateUserStats(ctx context.Context, userID uuid.UUID, won bool, role string) error {
	if userStore == nil || userStore.pool == nil {
		return errors.New("user store is not initialized")
	}

	isWendigo := isWendigoRole(role)

	query := `
		UPDATE users
		SET games_played = games_played + 1,
		    games_won = games_won + CASE WHEN $2 THEN 1 ELSE 0 END,
		    games_lost = games_lost + CASE WHEN $2 THEN 0 ELSE 1 END,
		    wins_as_wendigo = wins_as_wendigo + CASE WHEN $2 AND $3 THEN 1 ELSE 0 END,
		    wins_as_villager = wins_as_villager + CASE WHEN $2 AND NOT $3 THEN 1 ELSE 0 END,
		    updated_at = NOW()
		WHERE id = $1
	`

	commandTag, err := userStore.pool.Exec(ctx, query, userID, won, isWendigo)
	if err != nil {
		return fmt.Errorf("update user stats: %w", err)
	}
	if commandTag.RowsAffected() == 0 {
		return ErrUserNotFound
	}
	return nil
}

func (userStore *UserStore) RecordGameResult(ctx context.Context, lobbyID string, winnerTeam string, players []models.Player) error {
	if userStore == nil || userStore.pool == nil {
		return errors.New("user store is not initialized")
	}
	if len(players) == 0 {
		return nil
	}

	tx, err := userStore.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin game result tx: %w", err)
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	var gameID uuid.UUID
	startedAt := time.Now().UTC()
	endedAt := startedAt
	err = tx.QueryRow(ctx, `
		INSERT INTO game_history (lobby_id, started_at, ended_at, winner_team)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`, lobbyID, startedAt, endedAt, winnerTeam).Scan(&gameID)
	if err != nil {
		return fmt.Errorf("insert game_history: %w", err)
	}

	for _, player := range players {
		isWinner := playerWonMatch(player.Role, winnerTeam)
		if _, err := tx.Exec(ctx, `
			UPDATE users
			SET games_played = games_played + 1,
			    games_won = games_won + CASE WHEN $2 THEN 1 ELSE 0 END,
			    games_lost = games_lost + CASE WHEN $2 THEN 0 ELSE 1 END,
			    wins_as_wendigo = wins_as_wendigo + CASE WHEN $2 AND $3 THEN 1 ELSE 0 END,
			    wins_as_villager = wins_as_villager + CASE WHEN $2 AND NOT $3 THEN 1 ELSE 0 END,
			    updated_at = NOW()
			WHERE id = $1
		`, player.ID, isWinner, isWendigoRole(player.Role)); err != nil {
			return fmt.Errorf("update user stats in tx: %w", err)
		}

		if _, err := tx.Exec(ctx, `
			INSERT INTO game_participants (game_id, user_id, role, is_winner)
			VALUES ($1, $2, $3, $4)
		`, gameID, player.ID, player.Role, isWinner); err != nil {
			return fmt.Errorf("insert game_participants: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit game result tx: %w", err)
	}
	return nil
}

func isUniqueConstraintError(err error, expectedConstraint string) bool {
	var pgErr *pgconn.PgError
	if !errors.As(err, &pgErr) {
		return false
	}
	return pgErr.Code == "23505" && pgErr.ConstraintName == expectedConstraint
}

func isWendigoRole(role string) bool {
	normalizedRole := strings.ToLower(strings.TrimSpace(role))
	return strings.Contains(normalizedRole, "wendigo") || strings.Contains(normalizedRole, "wolf")
}

func playerWonMatch(role string, winnerTeam string) bool {
	isWendigoWinner := strings.EqualFold(strings.TrimSpace(winnerTeam), "WENDIGOS")
	if isWendigoRole(role) {
		return isWendigoWinner
	}
	return !isWendigoWinner
}
