package store

import (
	"fmt"
	"sort"
	"strings"

	"github.com/majeurbilly/wendigogame/internal/models"
)

// wendigoKillVictimFromTally returns the unique kill leader among Wendigo confirmations, or "" on tie / no votes.
func wendigoKillVictimFromTally(tally map[string]int) string {
	if len(tally) == 0 {
		return ""
	}
	maxVotes := -1
	for _, c := range tally {
		if c > maxVotes {
			maxVotes = c
		}
	}
	if maxVotes <= 0 {
		return ""
	}
	var leaders []string
	for id, c := range tally {
		if c == maxVotes {
			leaders = append(leaders, id)
		}
	}
	sort.Strings(leaders)
	if len(leaders) != 1 {
		return ""
	}
	return leaders[0]
}

// ResolveNight computes prayer protection and the Wendigo kill outcome from confirmed NightActions only.
// Multiple Wendigos: kill votes are tallied; a unique strict maximum wins; ties mean no kill from the pack.
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

	totalPrayers := 0
	prayerCounts := make(map[string]int)
	for sourceID, targetID := range lobby.Prayers {
		_, sourceAlive := alivePlayers[sourceID]
		_, targetAlive := alivePlayers[targetID]
		if !sourceAlive || !targetAlive {
			continue
		}
		totalPrayers++
		prayerCounts[targetID]++
	}
	// Backward compatibility: if clients still send PRAY as SUBMIT_NIGHT_ACTION,
	// infer prayers from non-Wendigo night actions.
	if totalPrayers == 0 {
		for sourceID, targetID := range lobby.NightActions {
			sourcePlayer, sourceAlive := alivePlayers[sourceID]
			_, targetAlive := alivePlayers[targetID]
			if !sourceAlive || !targetAlive || isWendigoRoleName(sourcePlayer.Role) {
				continue
			}
			totalPrayers++
			prayerCounts[targetID]++
		}
	}
	protectedTargetID := protectedPrayerTargetID(prayerCounts, totalPrayers)

	killTally := make(map[string]int)
	for sourceID, targetID := range lobby.NightActions {
		sourcePlayer, sourceOk := alivePlayers[sourceID]
		if !sourceOk || !isWendigoRoleName(sourcePlayer.Role) {
			continue
		}
		if strings.TrimSpace(targetID) == "" {
			continue
		}
		if _, targetOk := alivePlayers[targetID]; !targetOk {
			continue
		}
		killTally[targetID]++
	}
	wendigoTargetID := wendigoKillVictimFromTally(killTally)

	deceasedIDs := make([]string, 0, 1)
	if wendigoTargetID != "" && wendigoTargetID != protectedTargetID {
		deceasedIDs = append(deceasedIDs, wendigoTargetID)
	}

	summary := fmt.Sprintf(
		"night resolved: alive=%d prayers=%d protected=%s wendigo_kill_tally=%v victim=%s deceased=%v",
		len(alivePlayers),
		totalPrayers,
		protectedTargetID,
		killTally,
		wendigoTargetID,
		deceasedIDs,
	)
	return deceasedIDs, summary
}

func protectedPrayerTargetID(prayerCounts map[string]int, totalPrayers int) string {
	if totalPrayers <= 0 || len(prayerCounts) == 0 {
		return ""
	}
	leaders := make([]string, 0, len(prayerCounts))
	maxVotes := 0
	for targetID, count := range prayerCounts {
		if count > maxVotes {
			maxVotes = count
			leaders = leaders[:0]
			leaders = append(leaders, targetID)
		} else if count == maxVotes {
			leaders = append(leaders, targetID)
		}
	}
	if maxVotes*2 < totalPrayers || len(leaders) != 1 {
		return ""
	}
	return leaders[0]
}

func isWendigoRoleName(roleName string) bool {
	normalized := strings.ToUpper(strings.TrimSpace(roleName))
	return strings.Contains(normalized, "WENDIGO") || strings.Contains(normalized, "WEREWOLF")
}
