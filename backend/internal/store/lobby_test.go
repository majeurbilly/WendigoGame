package store_test

import (
	"context"
	"encoding/json"
	"sync"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/google/uuid"
	"github.com/majeurbilly/wendigogame/internal/models"
	"github.com/majeurbilly/wendigogame/internal/store"
	"github.com/redis/go-redis/v9"
)

func TestCreateLobbyPersistsInValkeyWithTTL(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })

	lobbyStore := store.NewForTesting(redisClient)
	ctx := context.Background()

	lobby, err := lobbyStore.CreateLobby(ctx, models.GameModeLocal, "Alice")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	if len(lobby.Code) != 4 {
		t.Fatalf("code length: %d", len(lobby.Code))
	}
	for _, character := range lobby.Code {
		if character < 'A' || character > 'Z' {
			t.Fatalf("code not A-Z: %q", lobby.Code)
		}
	}
	if lobby.Mode != models.GameModeLocal {
		t.Fatalf("mode: got %q", lobby.Mode)
	}
	if len(lobby.Players) != 1 || !lobby.Players[0].IsHost || lobby.Players[0].Name != "Alice" || lobby.Players[0].ID == "" {
		t.Fatalf("host: %+v", lobby.Players)
	}

	raw, err := redisClient.Get(ctx, "lobby:"+lobby.Code).Result()
	if err != nil {
		t.Fatalf("GET lobby:%s: %v", lobby.Code, err)
	}

	var got models.Lobby
	if err := json.Unmarshal([]byte(raw), &got); err != nil {
		t.Fatalf("json: %v", err)
	}
	if got.Code != lobby.Code || got.Mode != lobby.Mode {
		t.Fatalf("stored value: %+v, expected close to %+v", got, lobby)
	}
	if len(got.Players) != 1 || got.Players[0].ID != lobby.Players[0].ID ||
		got.Players[0].Name != "Alice" || !got.Players[0].IsHost {
		t.Fatalf("persisted players: %+v", got.Players)
	}

	ttl := redisClient.TTL(ctx, "lobby:"+lobby.Code).Val()
	if ttl <= 0 || ttl > 24*time.Hour {
		t.Fatalf("unexpected TTL: %v", ttl)
	}
}

func TestAppendPlayerConcurrentNoLostPlayers(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })

	lobbyStore := store.NewForTesting(redisClient)
	ctx := context.Background()

	lobby, err := lobbyStore.CreateLobby(ctx, models.GameModeLocal, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	code := lobby.Code
	const playerCount = 32
	var waitGroup sync.WaitGroup
	errCh := make(chan error, playerCount)
	waitGroup.Add(playerCount)
	for i := 0; i < playerCount; i++ {
		go func() {
			defer waitGroup.Done()
			player := models.Player{
				ID:     uuid.NewString(),
				Name:   "Player",
				IsHost: false,
			}
			_, err := lobbyStore.AppendPlayer(ctx, code, player)
			errCh <- err
		}()
	}
	waitGroup.Wait()
	close(errCh)
	for err := range errCh {
		if err != nil {
			t.Fatalf("AppendPlayer: %v", err)
		}
	}

	final, err := lobbyStore.GetLobby(ctx, code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}
	if len(final.Players) != 1+playerCount {
		t.Fatalf("expected %d players, got %d (%+v)", 1+playerCount, len(final.Players), final.Players)
	}
}
