package store

import "github.com/majeurbilly/wendigogame/internal/models"

const (
	VictoryTeamWendigos  = "WENDIGO"
	VictoryTeamVillagers = "VILLAGER"
)

// CheckVictoryConditions returns whether the game is over and the winning team.
func CheckVictoryConditions(lobby *models.Lobby) (bool, string) {
	if lobby == nil {
		return false, ""
	}

	wendigosAlive := 0
	villagersAlive := 0

	for i := range lobby.Players {
		player := lobby.Players[i]
		if !player.IsAlive {
			continue
		}
		if isWendigoRoleName(player.Role) {
			wendigosAlive++
			continue
		}
		villagersAlive++
	}

	if villagersAlive == 0 {
		return true, VictoryTeamWendigos
	}
	if wendigosAlive == 0 {
		return true, VictoryTeamVillagers
	}
	return false, ""
}
