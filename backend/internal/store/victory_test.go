package store_test

import (
	"testing"

	"github.com/google/uuid"
	"github.com/majeurbilly/wendigogame/internal/models"
	"github.com/majeurbilly/wendigogame/internal/store"
)

func TestCheckVictoryConditions_LastWendigoDies_VillagersWin(t *testing.T) {
	lobby := &models.Lobby{
		Players: []models.Player{
			{ID: uuid.New(), Role: "WENDIGO", IsAlive: false},
			{ID: uuid.New(), Role: "VILLAGER", IsAlive: true},
			{ID: uuid.New(), Role: "SEER", IsAlive: true},
		},
	}

	victory, winner := store.CheckVictoryConditions(lobby)
	if !victory {
		t.Fatal("expected a victory condition")
	}
	if winner != store.VictoryTeamVillagers {
		t.Fatalf("winner: got %q, want %q", winner, store.VictoryTeamVillagers)
	}
}
