package store

import (
	"testing"

	"github.com/google/uuid"
	"github.com/majeurbilly/wendigogame/internal/models"
)

func TestCouncilVoteVictimID_uniqueLeader(t *testing.T) {
	a := uuid.New().String()
	b := uuid.New().String()
	lobby := &models.Lobby{
		Players: []models.Player{
			{ID: uuid.MustParse(a), Name: "A", IsAlive: true},
			{ID: uuid.MustParse(b), Name: "B", IsAlive: true},
		},
		Votes: map[string]string{
			a: b,
			b: b,
		},
	}
	if got := councilVoteVictimID(lobby); got != b {
		t.Fatalf("victim: got %q want %q", got, b)
	}
}

func TestCouncilVoteVictimID_tieNoKill(t *testing.T) {
	a := uuid.New().String()
	b := uuid.New().String()
	c := uuid.New().String()
	lobby := &models.Lobby{
		Players: []models.Player{
			{ID: uuid.MustParse(a), Name: "A", IsAlive: true},
			{ID: uuid.MustParse(b), Name: "B", IsAlive: true},
			{ID: uuid.MustParse(c), Name: "C", IsAlive: true},
		},
		Votes: map[string]string{
			a: b,
			c: a,
		},
	}
	if got := councilVoteVictimID(lobby); got != "" {
		t.Fatalf("expected no victim on tie, got %q", got)
	}
}

func TestCouncilVoteVictimID_zeroVotes(t *testing.T) {
	a := uuid.New().String()
	lobby := &models.Lobby{
		Players: []models.Player{
			{ID: uuid.MustParse(a), Name: "A", IsAlive: true},
		},
		Votes: map[string]string{},
	}
	if got := councilVoteVictimID(lobby); got != "" {
		t.Fatalf("expected empty, got %q", got)
	}
}
