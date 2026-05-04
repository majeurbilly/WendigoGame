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

func TestProcessGameTick_DayChairRecallAtOneThirdRemaining(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })

	st := store.NewForTesting(redisClient)
	ctx := context.Background()

	lobby, err := st.CreateLobby(ctx, models.GameModeLocal, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	guest := models.Player{
		ID:      uuid.New(),
		Name:    "Guest",
		IsHost:  false,
		IsAlive: true,
		ChairID: models.UnseatedChair,
	}
	if _, err := st.AppendPlayer(ctx, lobby.Code, guest); err != nil {
		t.Fatalf("AppendPlayer: %v", err)
	}

	lobby, err = st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}
	lobby.Phase = models.GamePhaseDay
	lobby.SocialPhaseTotalTime = 9
	lobby.TimeRemaining = 4
	lobby.ChairPromptTriggered = false
	for i := range lobby.Players {
		lobby.Players[i].ChairID = i
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
	if got.Phase != models.GamePhaseChairSelection {
		t.Fatalf("phase: got %q, want %q", got.Phase, models.GamePhaseChairSelection)
	}
	if !got.ChairPromptTriggered {
		t.Fatal("expected ChairPromptTriggered true after recall")
	}
	if got.TimeRemaining != models.ChairSelectionPhaseSeconds {
		t.Fatalf("time_remaining: got %d, want %d", got.TimeRemaining, models.ChairSelectionPhaseSeconds)
	}
	for i := range got.Players {
		if !got.Players[i].IsAlive {
			continue
		}
		if got.Players[i].ChairID != models.UnseatedChair {
			t.Fatalf("player %s should be unseated, chair_id=%d", got.Players[i].ID, got.Players[i].ChairID)
		}
	}
}

func TestAdvanceFromChairSelection_CouncilPathSanctionsUnseated(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })

	st := store.NewForTesting(redisClient)
	ctx := context.Background()

	lobby, err := st.CreateLobby(ctx, models.GameModeLocal, "A")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	b := models.Player{ID: uuid.New(), Name: "B", IsHost: false, IsAlive: true, ChairID: models.UnseatedChair}
	if _, err := st.AppendPlayer(ctx, lobby.Code, b); err != nil {
		t.Fatalf("AppendPlayer: %v", err)
	}

	lobby, err = st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}
	lobby.Phase = models.GamePhaseChairSelection
	lobby.ChairPromptTriggered = true
	lobby.Players[0].ChairID = 0
	lobby.Players[1].ChairID = models.UnseatedChair
	lobby.TimeRemaining = 0
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
	if got.Phase != models.GamePhaseAccusation {
		t.Fatalf("phase: got %q, want %q", got.Phase, models.GamePhaseAccusation)
	}
	if got.TimeRemaining != models.PostChairCouncilAccusationSeconds {
		t.Fatalf("accusation timer: got %d, want %d", got.TimeRemaining, models.PostChairCouncilAccusationSeconds)
	}
	if !got.Players[1].IsExcludedFromCouncil {
		t.Fatal("expected guest excluded from council (unseated)")
	}
	if got.Players[0].IsExcludedFromCouncil {
		t.Fatal("expected host not excluded (seated)")
	}
}
