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

var ErrUserNotFound = errors.New("user not found")

// oidcPasswordPlaceholder satisfies users.password_hash NOT NULL for comptes exclusivement OIDC.
const oidcPasswordPlaceholder = "!oidc-no-local-password"

func isUniqueViolation(err error, constraintName string) bool {
	var pgErr *pgconn.PgError
	if !errors.As(err, &pgErr) || pgErr.Code != "23505" {
		return false
	}
	if constraintName == "" {
		return true
	}
	return pgErr.ConstraintName == constraintName
}

func clipUsername(s string) string {
	s = strings.TrimSpace(s)
	if len(s) > 128 {
		return s[:128]
	}
	return s
}

// UpsertOIDCUser crée ou met à jour une ligne users pour l’UUID interne dérivée du claim sub.
// Les jetons de test (sub seul) ne remplacent pas le username d’un compte déjà présent.
func (userStore *UserStore) UpsertOIDCUser(ctx context.Context, tok *auth.AccessTokenAuth) error {
	if userStore == nil || userStore.pool == nil {
		return errors.New("user store is not initialized")
	}
	if tok == nil {
		return errors.New("nil access token auth")
	}

	existing, getErr := userStore.GetUserByID(ctx, tok.InternalUserID)
	hasExisting := getErr == nil && existing != nil
	if getErr != nil && !errors.Is(getErr, ErrUserNotFound) {
		return fmt.Errorf("upsert oidc user: load: %w", getErr)
	}

	finalEmail := strings.TrimSpace(tok.EmailHint)
	if finalEmail == "" && hasExisting {
		finalEmail = existing.Email
	}
	if finalEmail == "" {
		finalEmail = fmt.Sprintf("%s@oidc.placeholder.wendigo", strings.ReplaceAll(tok.InternalUserID.String(), "-", ""))
	}

	voluntary := tok.VoluntaryDisplayName && strings.TrimSpace(tok.DisplayNameHint) != ""
	baseUsername := strings.TrimSpace(tok.DisplayNameHint)
	if !voluntary {
		if hasExisting {
			baseUsername = existing.Username
		} else {
			baseUsername = strings.TrimSpace(tok.Sub)
			if len(baseUsername) > 96 {
				baseUsername = baseUsername[:96]
			}
			if baseUsername == "" {
				baseUsername = "player"
			}
		}
	}
	baseUsername = clipUsername(baseUsername)
	if baseUsername == "" {
		baseUsername = "player"
	}

	shortID := strings.ReplaceAll(tok.InternalUserID.String(), "-", "")
	if len(shortID) > 8 {
		shortID = shortID[:8]
	}

	candidates := make([]string, 0, 16)
	candidates = append(candidates, baseUsername)
	for i := 1; i < 15; i++ {
		candidates = append(candidates, clipUsername(fmt.Sprintf("%s_%s_%d", baseUsername, shortID, i)))
	}

	em := finalEmail
	for emailTry := 0; emailTry < 4; emailTry++ {
		if emailTry > 0 {
			em = fmt.Sprintf("u%s%d@oidc.placeholder.wendigo", shortID, emailTry)
		}
		for _, tryName := range candidates {
			err := userStore.execOIDCUpsert(ctx, tok.InternalUserID, tryName, em, voluntary)
			if err == nil {
				return nil
			}
			if isUniqueViolation(err, "users_email_key") {
				break
			}
			if isUniqueViolation(err, "users_username_key") {
				continue
			}
			return fmt.Errorf("upsert oidc user: %w", err)
		}
	}
	return fmt.Errorf("upsert oidc user: exhausted username/email candidates")
}

func (userStore *UserStore) execOIDCUpsert(ctx context.Context, id uuid.UUID, username, email string, voluntaryUsername bool) error {
	_, err := userStore.pool.Exec(ctx, `
		INSERT INTO users (id, username, email, password_hash, games_played, games_won, games_lost, wins_as_wendigo, wins_as_villager, created_at, updated_at)
		VALUES ($1, $2, $3, $4, 0, 0, 0, 0, 0, NOW(), NOW())
		ON CONFLICT (id) DO UPDATE SET
			username = CASE WHEN $5::boolean THEN $2 ELSE users.username END,
			email = $6,
			updated_at = NOW()
	`, id, username, email, oidcPasswordPlaceholder, voluntaryUsername, email)
	return err
}

type UserStore struct {
	pool *pgxpool.Pool
}

func NewUserStore(pool *pgxpool.Pool) *UserStore {
	return &UserStore{pool: pool}
}

func (userStore *UserStore) GetUserByID(ctx context.Context, userID uuid.UUID) (*models.User, error) {
	if userStore == nil || userStore.pool == nil {
		return nil, errors.New("user store is not initialized")
	}

	query := `
		SELECT id, username, email, games_played, games_won, games_lost, wins_as_wendigo, wins_as_villager, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	var user models.User
	err := userStore.pool.QueryRow(ctx, query, userID).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
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

func isWendigoRole(role string) bool {
	normalizedRole := strings.ToLower(strings.TrimSpace(role))
	return strings.Contains(normalizedRole, "wendigo") || strings.Contains(normalizedRole, "wolf")
}

func playerWonMatch(role string, winnerTeam string) bool {
	isWendigoWinner := strings.EqualFold(strings.TrimSpace(winnerTeam), "WENDIGO")
	if isWendigoRole(role) {
		return isWendigoWinner
	}
	return !isWendigoWinner
}
