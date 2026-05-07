package store

import (
	"context"
	"strings"

	"github.com/majeurbilly/wendigogame/internal/models"
)

// RestartGame resets a finished game back to LOBBY (same lobby code / players).
// Host-only.
func (s *Store) RestartGame(ctx context.Context, code, playerID string) error {
	playerID = strings.TrimSpace(playerID)
	if playerID == "" {
		return ErrUnauthorized
	}
	return s.updateLobbyForAdminAction(ctx, code, func(lobby *models.Lobby) error {
		if !isLobbyHost(lobby, playerID) {
			return ErrUnauthorized
		}

		lobby.Phase = models.GamePhaseLobby
		lobby.WinnerTeam = ""
		lobby.IsPaused = false
		lobby.SurrenderVoteActive = false
		lobby.SurrenderApproved = false
		lobby.SurrenderVotes = make(map[string]bool)

		lobby.DefendantID = ""
		lobby.LastLynchVictimID = ""
		lobby.LastNightVictimID = ""
		lobby.LastNightSavedByPrayer = false
		lobby.SocialPhaseTotalTime = 0
		lobby.ChairPromptTriggered = false

		lobby.CouncilAccusations = make(map[string]string)
		lobby.Votes = make(map[string]string)
		lobby.NightActions = make(map[string]string)
		lobby.Prayers = make(map[string]string)
		lobby.WendigoIntentions = make(map[string]string)
		lobby.WendigoIntents = make(map[string]string)
		clearPleadingsState(lobby)

		for i := range lobby.Players {
			lobby.Players[i].IsAlive = true
			lobby.Players[i].Role = ""
			lobby.Players[i].ChairID = models.UnseatedChair
			lobby.Players[i].IsExcludedFromCouncil = false
		}

		models.SetPhaseCountdown(lobby, 0)
		return nil
	})
}

