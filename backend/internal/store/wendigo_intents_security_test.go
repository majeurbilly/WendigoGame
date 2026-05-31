package store_test

import (
	"testing"

	"github.com/google/uuid"
	"github.com/majeurbilly/wendigogame/internal/models"
)

func TestToGameStateDTO_WendigoIntentsVisibleOnlyToWendigos(t *testing.T) {
	wendigoID := uuid.New()
	villagerID := uuid.New()
	targetID := uuid.New()

	lobby := &models.Lobby{
		Players: []models.Player{
			{ID: wendigoID, Name: "W", Role: "WENDIGO", IsAlive: true},
			{ID: villagerID, Name: "V", Role: "VILLAGER", IsAlive: true},
			{ID: targetID, Name: "T", Role: "VILLAGER", IsAlive: true},
		},
		WendigoIntents: map[string]string{
			wendigoID.String(): targetID.String(),
		},
	}

	dtoW := lobby.ToGameStateDTO(wendigoID.String())
	if len(dtoW.WendigoIntents) != 1 {
		t.Fatalf("wendigo view: expected intents, got %v", dtoW.WendigoIntents)
	}

	dtoV := lobby.ToGameStateDTO(villagerID.String())
	if len(dtoV.WendigoIntents) != 0 {
		t.Fatalf("villager view: expected no intents, got %v", dtoV.WendigoIntents)
	}
}

