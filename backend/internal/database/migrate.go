package database

import (
	"context"
	_ "embed"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed schema.sql
var embeddedSchema string

// MigrateSchema applies the embedded DDL on startup (idempotent: IF NOT EXISTS).
func MigrateSchema(ctx context.Context, pool *pgxpool.Pool) error {
	if pool == nil {
		return fmt.Errorf("migrate: pool is nil")
	}

	// Split on statement terminators; schema has no semicolons inside literals.
	parts := strings.Split(embeddedSchema, ";")
	for _, raw := range parts {
		stmt := strings.TrimSpace(raw)
		if stmt == "" {
			continue
		}
		if _, err := pool.Exec(ctx, stmt+";"); err != nil {
			return fmt.Errorf("migrate exec: %w\nstatement: %s", err, stmt)
		}
	}
	return nil
}
