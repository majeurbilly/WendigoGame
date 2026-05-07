package store

import (
	"fmt"
	"strings"

	"github.com/majeurbilly/wendigogame/internal/models"
)

// chairSelectionPhaseComplete is true when every alive player has a seat (dead players are ignored).
func chairSelectionPhaseComplete(lobby *models.Lobby) bool {
	if lobby == nil || len(lobby.Players) == 0 {
		return false
	}
	alive := 0
	for i := range lobby.Players {
		if !lobby.Players[i].IsAlive {
			continue
		}
		alive++
		if lobby.Players[i].ChairID == models.UnseatedChair {
			return false
		}
	}
	return alive > 0
}

// enterDaySocialSnapshot arms the 1/3 chair recall and resets council state for a new day segment.
// Caller must set lobby.TimeRemaining to the day length before calling.
func enterDaySocialSnapshot(lobby *models.Lobby) {
	lobby.SocialPhaseTotalTime = lobby.TimeRemaining
	lobby.PhaseTotalSeconds = lobby.TimeRemaining
	lobby.ChairPromptTriggered = false
	lobby.CouncilAccusations = make(map[string]string)
	lobby.Prayers = make(map[string]string)
	lobby.WendigoIntentions = make(map[string]string)
	lobby.PleadingsCompleted = false
	clearPleadingsState(lobby)
	for i := range lobby.Players {
		lobby.Players[i].IsExcludedFromCouncil = false
	}
}

func applyCouncilChairSanctions(lobby *models.Lobby) {
	for i := range lobby.Players {
		if lobby.Players[i].ChairID == models.UnseatedChair {
			lobby.Players[i].IsExcludedFromCouncil = true
		} else {
			lobby.Players[i].IsExcludedFromCouncil = false
		}
	}
}

func ensureRolesAfterInitialChairComplete(lobby *models.Lobby) error {
	allHaveRoles := true
	for playerIndex := range lobby.Players {
		if strings.TrimSpace(lobby.Players[playerIndex].Role) == "" {
			allHaveRoles = false
			break
		}
	}
	if allHaveRoles {
		return nil
	}
	requiredRoles := models.GetRequiredRoles(len(lobby.Players))
	if len(requiredRoles) != len(lobby.Players) {
		return fmt.Errorf("role distribution mismatch: roles=%d players=%d", len(requiredRoles), len(lobby.Players))
	}
	if err := shuffleRoles(requiredRoles); err != nil {
		return fmt.Errorf("shuffle roles: %w", err)
	}
	for playerIndex := range lobby.Players {
		lobby.Players[playerIndex].Role = requiredRoles[playerIndex].Name
	}
	return nil
}

// advanceFromChairSelection ends CHAIR_SELECTION: first round → DAY with snapshot, recall round → COUNCIL_START with sanctions.
func advanceFromChairSelection(lobby *models.Lobby) error {
	ps := models.EffectivePhaseSettings(lobby)
	if lobby.ChairPromptTriggered {
		lobby.ChairPromptTriggered = false
		applyCouncilChairSanctions(lobby)

		councilParticipants := 0
		for i := range lobby.Players {
			if !lobby.Players[i].IsAlive {
				continue
			}
			if lobby.Players[i].IsExcludedFromCouncil {
				continue
			}
			councilParticipants++
		}

		if councilParticipants > 0 {
			lobby.Phase = models.GamePhaseCouncilStart
			models.SetPhaseCountdown(lobby, ps.CouncilStartSeconds)
		} else {
			lobby.Phase = models.GamePhaseNoCouncil
			models.SetPhaseCountdown(lobby, ps.NoCouncilSeconds)
			lobby.Votes = make(map[string]string)
			lobby.CouncilAccusations = make(map[string]string)
		}
		return nil
	}
	lobby.Phase = models.GamePhaseDay
	models.SetPhaseCountdown(lobby, ps.DaySocialSeconds)
	enterDaySocialSnapshot(lobby)
	return ensureRolesAfterInitialChairComplete(lobby)
}
