package store

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/redis/go-redis/v9"
)

type Store struct {
	redisClient *redis.Client
}

func NewFromEnv() (*Store, error) {
	raw := os.Getenv("REDIS_URL")
	var opts *redis.Options
	var err error

	if raw == "" {
		opts = &redis.Options{Addr: "localhost:6379"}
	} else if strings.HasPrefix(raw, "redis://") || strings.HasPrefix(raw, "rediss://") {
		opts, err = redis.ParseURL(raw)
		if err != nil {
			return nil, fmt.Errorf("parse REDIS_URL: %w", err)
		}
	} else {
		opts = &redis.Options{Addr: raw}
	}

	redisClient := redis.NewClient(opts)
	if err := redisClient.Ping(context.Background()).Err(); err != nil {
		_ = redisClient.Close()
		return nil, fmt.Errorf("valkey/redis ping: %w", err)
	}
	return &Store{redisClient: redisClient}, nil
}

func NewForTesting(redisClient *redis.Client) *Store {
	return &Store{redisClient: redisClient}
}

func (s *Store) Close() error {
	if s == nil || s.redisClient == nil {
		return nil
	}
	return s.redisClient.Close()
}
