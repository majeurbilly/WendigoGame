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

func TestProcessGameTick_CouncilVoteTransitionsToStakeAndStoresVictim(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })

	st := store.NewForTesting(redisClient)
	ctx := context.Background()

	lobby, err := st.CreateLobby(ctx, models.GameModeLocal, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	guest1 := models.Player{ID: uuid.New(), Name: "Guest1", IsHost: false, IsAlive: true, ChairID: 1, Role: "VILLAGER"}
	guest2 := models.Player{ID: uuid.New(), Name: "Guest2", IsHost: false, IsAlive: true, ChairID: 2, Role: "VILLAGER"}
	guest3 := models.Player{ID: uuid.New(), Name: "Guest3", IsHost: false, IsAlive: true, ChairID: 3, Role: "VILLAGER"}
	if _, err := st.AppendPlayer(ctx, lobby.Code, guest1); err != nil {
		t.Fatalf("AppendPlayer guest1: %v", err)
	}
	if _, err := st.AppendPlayer(ctx, lobby.Code, guest2); err != nil {
		t.Fatalf("AppendPlayer guest2: %v", err)
	}
	if _, err := st.AppendPlayer(ctx, lobby.Code, guest3); err != nil {
		t.Fatalf("AppendPlayer guest3: %v", err)
	}
	lobby, err = st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}

	lobby.Players[0].Role = "WENDIGO"
	hostID := lobby.Players[0].ID.String()
	victimID := lobby.Players[1].ID.String()
	guest2ID := lobby.Players[2].ID.String()
	guest3ID := lobby.Players[3].ID.String()
	lobby.Phase = models.GamePhaseCouncilVote
	lobby.TimeRemaining = 0
	lobby.Votes = map[string]string{
		hostID:   victimID,
		victimID: victimID,
		guest2ID: victimID,
		guest3ID: victimID,
	}
	if err := st.SaveLobby(ctx, lobby); err != nil {
		t.Fatalf("SaveLobby: %v", err)
	}

	if _, err := st.ProcessGameTick(ctx, lobby.Code); err != nil {
		t.Fatalf("ProcessGameTick: %v", err)
	}

	got, err := st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby after tick: %v", err)
	}
	if got.Phase != models.GamePhaseStake {
		t.Fatalf("phase: got %q, want %q", got.Phase, models.GamePhaseStake)
	}
	wantStake := models.DefaultPhaseSettings().StakeSeconds
	if got.TimeRemaining != wantStake {
		t.Fatalf("stake timer: got %d, want %d", got.TimeRemaining, wantStake)
	}
	if got.LastLynchVictimID != victimID {
		t.Fatalf("LastLynchVictimID: got %q, want %q", got.LastLynchVictimID, victimID)
	}
	if got.Players[1].IsAlive {
		t.Fatal("expected guest eliminated by council vote")
	}
	if len(got.Votes) == 0 {
		t.Fatal("expected Votes preserved into STAKE")
	}
}

