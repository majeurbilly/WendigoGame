package store

import (
	"fmt"
	"strings"

	"github.com/majeurbilly/wendigogame/internal/models"
)

// ResolveNight computes prayer protection and the Wendigo target outcome.
func ResolveNight(lobby *models.Lobby) ([]string, string) {
	if lobby == nil {
		return []string{}, "night resolver: lobby is nil"
	}

	alivePlayers := make(map[string]models.Player)
	for i := range lobby.Players {
		player := lobby.Players[i]
		if player.IsAlive {
			alivePlayers[player.ID.String()] = player
		}
	}

	prayerCounts := make(map[string]int)
	for sourceID, targetID := range lobby.NightActions {
		sourcePlayer, sourceAlive := alivePlayers[sourceID]
		_, targetAlive := alivePlayers[targetID]
		if !sourceAlive || !targetAlive {
			continue
		}
		if isWendigoRoleName(sourcePlayer.Role) {
			continue
		}
		prayerCounts[targetID]++
	}

	protectedTargetID := ""
	aliveCount := len(alivePlayers)
	for targetID, count := range prayerCounts {
		if count > aliveCount/2 {
			protectedTargetID = targetID
			break
		}
	}

	wendigoTargetID := ""
	for sourceID, targetID := range lobby.NightActions {
		sourcePlayer, sourceAlive := alivePlayers[sourceID]
		_, targetAlive := alivePlayers[targetID]
		if !sourceAlive || !targetAlive {
			continue
		}
		if isWendigoRoleName(sourcePlayer.Role) {
			wendigoTargetID = targetID
			break
		}
	}

	deceasedIDs := make([]string, 0, 1)
	if wendigoTargetID != "" && wendigoTargetID != protectedTargetID {
		deceasedIDs = append(deceasedIDs, wendigoTargetID)
	}

	summary := fmt.Sprintf(
		"night resolved: alive=%d prayers=%d protected=%s wendigo_target=%s deceased=%v",
		aliveCount,
		len(prayerCounts),
		protectedTargetID,
		wendigoTargetID,
		deceasedIDs,
	)
	return deceasedIDs, summary
}

func isWendigoRoleName(roleName string) bool {
	normalized := strings.ToUpper(strings.TrimSpace(roleName))
	return strings.Contains(normalized, "WENDIGO") || strings.Contains(normalized, "WEREWOLF")
}
