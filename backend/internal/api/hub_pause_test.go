package api

import (
	"testing"

	"github.com/majeurbilly/wendigogame/internal/models"
)

func TestIsGameplayActionBlockedByPause(t *testing.T) {
	blocked := []string{
		models.MessageTypeClaimSeat,
		"CHOOSE_CHAIR",
		models.MessageTypeAccuse,
		"COUNCIL_ACCUSATION",
		models.MessageTypeStartPleading,
		"START_SPEAKING",
		"STOP_SPEAKING",
		models.MessageTypeVoteDay,
		"COUNCIL_VOTE",
		models.MessageTypeWendigoIntent,
		models.MessageTypeSubmitNightAction,
		models.MessageTypeSubmitPrayer,
	}
	for _, messageType := range blocked {
		if !isGameplayActionBlockedByPause(messageType) {
			t.Fatalf("%s should be blocked by pause", messageType)
		}
	}

	allowed := []string{
		models.MessageTypeTogglePause,
		models.MessageTypeForceEndGame,
		models.MessageTypeStartSurrenderVote,
		models.MessageTypeSubmitSurrenderVote,
		models.MessageTypeLeaveLobby,
	}
	for _, messageType := range allowed {
		if isGameplayActionBlockedByPause(messageType) {
			t.Fatalf("%s should remain available during pause", messageType)
		}
	}
}
