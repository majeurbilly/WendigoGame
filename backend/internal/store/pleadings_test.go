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

func TestBuildPleadingsQueueFromCouncil_DeterministicOrder(t *testing.T) {
	// Not exported — exercise via startPleadingsFromAccusation + GetLobby after manual lobby state.
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })

	st := store.NewForTesting(redisClient)
	ctx := context.Background()

	lobby, err := st.CreateLobby(ctx, models.GameModeLocal, "Z")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	a := models.Player{ID: uuid.New(), Name: "A", IsHost: false, IsAlive: true, ChairID: 1}
	m := models.Player{ID: uuid.New(), Name: "M", IsHost: false, IsAlive: true, ChairID: 2}
	if _, err := st.AppendPlayer(ctx, lobby.Code, a); err != nil {
		t.Fatalf("AppendPlayer: %v", err)
	}
	if _, err := st.AppendPlayer(ctx, lobby.Code, m); err != nil {
		t.Fatalf("AppendPlayer: %v", err)
	}
	lobby, err = st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}
	// accuser IDs deliberately unsorted in map iteration order; order in queue must be lexicographic accusers then pairs.
	zID := lobby.Players[0].ID.String()
	aID := lobby.Players[1].ID.String()
	mID := lobby.Players[2].ID.String()
	lobby.Phase = models.GamePhaseAccusation
	lobby.CouncilAccusations = map[string]string{
		mID: zID,
		aID: zID,
	}
	lobby.TimeRemaining = 0
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
	if got.Phase != models.GamePhasePleadings {
		t.Fatalf("phase: got %q, want PLEADINGS", got.Phase)
	}
	wantFirst := aID
	if mID < aID {
		wantFirst = mID
	}
	if got.CurrentSpeakerID != wantFirst {
		t.Fatalf("first speaker: got %q, want %q (queue=%v)", got.CurrentSpeakerID, wantFirst, got.PleadingsQueue)
	}
	// Queue holds remaining: second accuser, then z, then first accuser's target if first was a, etc.
	if len(got.PleadingsQueue) != 3 {
		t.Fatalf("queue len: got %d, want 3: %v", len(got.PleadingsQueue), got.PleadingsQueue)
	}
}

func TestStartPleading_OK(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })

	st := store.NewForTesting(redisClient)
	ctx := context.Background()

	lobby, err := st.CreateLobby(ctx, models.GameModeLocal, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	lobby, err = st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}
	speaker := lobby.Players[0].ID.String()
	lobby.Phase = models.GamePhasePleadings
	lobby.CurrentSpeakerID = speaker
	lobby.PleadingTimerStarted = false
	lobby.TimeRemaining = 0
	if err := st.SaveLobby(ctx, lobby); err != nil {
		t.Fatalf("SaveLobby: %v", err)
	}

	if err := st.StartPleading(ctx, lobby.Code, speaker); err != nil {
		t.Fatalf("StartPleading: %v", err)
	}
	got, err := st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}
	if !got.PleadingTimerStarted {
		t.Fatal("expected PleadingTimerStarted")
	}
	if got.TimeRemaining != models.PleadingSpeechSeconds {
		t.Fatalf("time: got %d", got.TimeRemaining)
	}
}
