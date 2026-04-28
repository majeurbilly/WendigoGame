package database

import (
	"context"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// InitDB initialise un pool PostgreSQL depuis la variable d'environnement DATABASE_URL
// si connString est vide.
func InitDB(connString string) (*pgxpool.Pool, error) {
	if connString == "" {
		connString = os.Getenv("DATABASE_URL")
	}

	if connString == "" {
		return nil, errors.New("database url is required (DATABASE_URL)")
	}

	pool, err := pgxpool.New(context.Background(), connString)
	if err != nil {
		return nil, fmt.Errorf("create pgx pool: %w", err)
	}

	pingCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := pool.Ping(pingCtx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping postgres: %w", err)
	}

	return pool, nil
}
