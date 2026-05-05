package store

import (
	"context"
	"errors"
	"testing"

	"github.com/alicebob/miniredis/v2"
	"github.com/google/uuid"
	"github.com/majeurbilly/wendigogame/internal/models"
	"github.com/redis/go-redis/v9"
)

func TestSubmitDayVote_RejectsExcludedVoter(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })

	st := NewForTesting(redisClient)
	ctx := context.Background()

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
	hostID := lobby.Players[0].ID.String()
	guestID := lobby.Players[1].ID.String()
	lobby.Phase = models.GamePhaseCouncilVote
	lobby.Players[0].IsExcludedFromCouncil = true
	lobby.Players[1].IsExcludedFromCouncil = false
	if err := st.SaveLobby(ctx, lobby); err != nil {
		t.Fatalf("SaveLobby: %v", err)
	}

	err = st.SubmitDayVote(ctx, lobby.Code, hostID, guestID)
	if err == nil {
		t.Fatal("expected error for excluded voter")
	}
	if !errors.Is(err, ErrExcludedFromCouncil) {
		t.Fatalf("error: got %v, want ErrExcludedFromCouncil", err)
	}
}

func TestTallyEffectiveVotes_IgnoresVotesFromExcludedVoters(t *testing.T) {
	a := uuid.New()
	b := uuid.New()
	c := uuid.New()
	lobby := &models.Lobby{
		Players: []models.Player{
			{ID: a, Name: "A", IsAlive: true, IsExcludedFromCouncil: true},
			{ID: b, Name: "B", IsAlive: true, IsExcludedFromCouncil: false},
			{ID: c, Name: "C", IsAlive: true, IsExcludedFromCouncil: false},
		},
		Votes: map[string]string{
			a.String(): c.String(),
			b.String(): c.String(),
		},
	}

	tally := tallyEffectiveVotes(lobby)
	if tally[c.String()] != 1 {
		t.Fatalf("tally for C: got %v, want 1 vote (excluded voter ignored)", tally)
	}
}
