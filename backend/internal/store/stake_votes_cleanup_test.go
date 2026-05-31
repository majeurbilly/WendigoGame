package store_test

import (
	"context"
	"testing"

	"github.com/alicebob/miniredis/v2"
	"github.com/google/uuid"
	"github.com/majeurbilly/wendigogame/internal/models"
	"github.com/majeurbilly/wendigogame/internal/store"
	"github.com/redis/go-redis/v9"
)

func TestProcessGameTick_StakeToNight_ClearsVotes(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })

	st := store.NewForTesting(redisClient)
	ctx := context.Background()

	lobby, err := st.CreateLobby(ctx, models.GameModeLocal, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	lobby.Phase = models.GamePhaseStake
	lobby.TimeRemaining = 0
	lobby.Votes = map[string]string{uuid.New().String(): uuid.New().String()}
	lobby.CouncilAccusations = map[string]string{"a": "b"}
	if err := st.SaveLobby(ctx, lobby); err != nil {
		t.Fatalf("SaveLobby: %v", err)
	}

	if _, err := st.ProcessGameTick(ctx, lobby.Code); err != nil {
		t.Fatalf("ProcessGameTick: %v", err)
	}

	got, err := st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}
	if got.Phase != models.GamePhaseNight {
		t.Fatalf("phase: got %q, want %q", got.Phase, models.GamePhaseNight)
	}
	if len(got.Votes) != 0 {
		t.Fatalf("expected Votes cleared at STAKE->NIGHT, got=%v", got.Votes)
	}
	if len(got.CouncilAccusations) != 0 {
		t.Fatalf("expected CouncilAccusations cleared at STAKE->NIGHT, got=%v", got.CouncilAccusations)
	}
}

