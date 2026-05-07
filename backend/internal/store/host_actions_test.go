package store_test

import (
	"context"
	"errors"
	"testing"

	"github.com/alicebob/miniredis/v2"
	"github.com/google/uuid"
	"github.com/majeurbilly/wendigogame/internal/models"
	"github.com/majeurbilly/wendigogame/internal/store"
	"github.com/redis/go-redis/v9"
)

func newHostActionStore(t *testing.T) (*store.Store, context.Context) {
	t.Helper()
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })
	return store.NewForTesting(redisClient), context.Background()
}

func TestTogglePause_HostOnlyAndTickDoesNotAdvance(t *testing.T) {
	st, ctx := newHostActionStore(t)

	lobby, err := st.CreateLobby(ctx, models.GameModeLocal, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	guest := models.Player{ID: uuid.New(), Name: "Guest", IsHost: false, IsAlive: true, ChairID: 1}
	if _, err := st.AppendPlayer(ctx, lobby.Code, guest); err != nil {
		t.Fatalf("AppendPlayer: %v", err)
	}
	lobby, err = st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}
	lobby.Phase = models.GamePhaseDay
	lobby.TimeRemaining = 10
	lobby.PhaseTotalSeconds = 10
	if err := st.SaveLobby(ctx, lobby); err != nil {
		t.Fatalf("SaveLobby: %v", err)
	}

	if err := st.TogglePause(ctx, lobby.Code, guest.ID.String()); !errors.Is(err, store.ErrUnauthorized) {
		t.Fatalf("guest TogglePause error: got %v want ErrUnauthorized", err)
	}
	hostID := lobby.Players[0].ID.String()
	if err := st.TogglePause(ctx, lobby.Code, hostID); err != nil {
		t.Fatalf("host TogglePause: %v", err)
	}
	if _, err := st.ProcessGameTick(ctx, lobby.Code); err != nil {
		t.Fatalf("ProcessGameTick: %v", err)
	}
	got, err := st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby after pause tick: %v", err)
	}
	if !got.IsPaused {
		t.Fatal("expected lobby paused")
	}
	if got.TimeRemaining != 10 {
		t.Fatalf("time remaining: got %d want 10", got.TimeRemaining)
	}
}

func TestForceEndGame_UsesLivingWendigoWinner(t *testing.T) {
	st, ctx := newHostActionStore(t)

	lobby, err := st.CreateLobby(ctx, models.GameModeLocal, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	lobby.Phase = models.GamePhaseDay
	lobby.Players[0].Role = "WENDIGO"
	if err := st.SaveLobby(ctx, lobby); err != nil {
		t.Fatalf("SaveLobby: %v", err)
	}

	hostID := lobby.Players[0].ID.String()
	if err := st.ForceEndGame(ctx, lobby.Code, hostID); err != nil {
		t.Fatalf("ForceEndGame: %v", err)
	}
	got, err := st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}
	if got.Phase != models.PhaseGameOver {
		t.Fatalf("phase: got %q want GAME_OVER", got.Phase)
	}
	if got.WinnerTeam != store.VictoryTeamWendigos {
		t.Fatalf("winner: got %q want %q", got.WinnerTeam, store.VictoryTeamWendigos)
	}
}

func TestSurrenderVote_ApprovalEndsAtNightResolution(t *testing.T) {
	st, ctx := newHostActionStore(t)

	lobby, err := st.CreateLobby(ctx, models.GameModeLocal, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	guestA := models.Player{ID: uuid.New(), Name: "A", IsHost: false, IsAlive: true, ChairID: 1}
	guestB := models.Player{ID: uuid.New(), Name: "B", IsHost: false, IsAlive: true, ChairID: 2}
	if _, err := st.AppendPlayer(ctx, lobby.Code, guestA); err != nil {
		t.Fatalf("AppendPlayer A: %v", err)
	}
	if _, err := st.AppendPlayer(ctx, lobby.Code, guestB); err != nil {
		t.Fatalf("AppendPlayer B: %v", err)
	}
	lobby, err = st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}
	lobby.Phase = models.GamePhaseDay
	lobby.Players[0].Role = "WENDIGO"
	lobby.Players[1].Role = "VILLAGER"
	lobby.Players[2].Role = "VILLAGER"
	if err := st.SaveLobby(ctx, lobby); err != nil {
		t.Fatalf("SaveLobby: %v", err)
	}

	hostID := lobby.Players[0].ID.String()
	guestAID := lobby.Players[1].ID.String()
	if err := st.StartSurrenderVote(ctx, lobby.Code, hostID); err != nil {
		t.Fatalf("StartSurrenderVote: %v", err)
	}
	if err := st.SubmitSurrenderVote(ctx, lobby.Code, hostID, true); err != nil {
		t.Fatalf("SubmitSurrenderVote host: %v", err)
	}
	if err := st.SubmitSurrenderVote(ctx, lobby.Code, guestAID, true); err != nil {
		t.Fatalf("SubmitSurrenderVote guest: %v", err)
	}

	got, err := st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby approved: %v", err)
	}
	if !got.SurrenderApproved || got.SurrenderVoteActive {
		t.Fatalf("surrender state: approved=%v active=%v", got.SurrenderApproved, got.SurrenderVoteActive)
	}
	got.Phase = models.GamePhaseNight
	got.TimeRemaining = 0
	if err := st.SaveLobby(ctx, got); err != nil {
		t.Fatalf("SaveLobby night: %v", err)
	}

	if _, err := st.ProcessGameTick(ctx, lobby.Code); err != nil {
		t.Fatalf("ProcessGameTick: %v", err)
	}
	got, err = st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby game over: %v", err)
	}
	if got.Phase != models.PhaseGameOver {
		t.Fatalf("phase: got %q want GAME_OVER", got.Phase)
	}
	if got.WinnerTeam != store.VictoryTeamWendigos {
		t.Fatalf("winner: got %q want %q", got.WinnerTeam, store.VictoryTeamWendigos)
	}
	if got.SurrenderApproved || len(got.SurrenderVotes) != 0 {
		t.Fatalf("surrender cleanup: approved=%v votes=%v", got.SurrenderApproved, got.SurrenderVotes)
	}
}
