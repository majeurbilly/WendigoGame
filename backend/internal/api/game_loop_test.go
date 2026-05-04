package api_test

import (
	"context"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/majeurbilly/wendigogame/internal/api"
	"github.com/majeurbilly/wendigogame/internal/models"
	"github.com/majeurbilly/wendigogame/internal/store"
	"github.com/redis/go-redis/v9"
)

func TestGameLoop_TicksDownAndTransitions(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })

	st := store.NewForTesting(redisClient)
	ctx := context.Background()

	lobby, err := st.CreateLobby(ctx, models.GameModeLocal, "Alice")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	code := lobby.Code

	lobby.Phase = models.GamePhaseChairSelection
	for i := range lobby.Players {
		lobby.Players[i].ChairID = i
	}
	lobby.TimeRemaining = 2
	if err := st.SaveLobby(ctx, lobby); err != nil {
		t.Fatalf("SaveLobby: %v", err)
	}

	loopCtx, cancel := context.WithCancel(context.Background())
	defer cancel()

	api.StartGameLoop(loopCtx, st, nil, lobby)

	time.Sleep(3 * time.Second)

	got, err := st.GetLobby(ctx, code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}
	if got.Phase != models.GamePhaseDay {
		t.Fatalf("phase: got %q, want %q (time_remaining=%d)", got.Phase, models.GamePhaseDay, got.TimeRemaining)
	}
}
