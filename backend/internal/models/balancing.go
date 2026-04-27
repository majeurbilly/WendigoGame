package models

import "fmt"

// GetRequiredRoles returns a balanced role list sized to playerCount.
func GetRequiredRoles(playerCount int) []Role {
	if playerCount <= 0 {
		return []Role{}
	}

	requiredWerewolves := (playerCount + 3) / 4
	if requiredWerewolves < 1 {
		requiredWerewolves = 1
	}
	if requiredWerewolves > playerCount {
		requiredWerewolves = playerCount
	}
	requiredVillagers := playerCount - requiredWerewolves

	werewolfTemplates := make([]Role, 0)
	villagerTemplates := make([]Role, 0)
	for _, role := range RoleTemplates {
		if role.Team == RoleTeamWerewolf {
			werewolfTemplates = append(werewolfTemplates, role)
			continue
		}
		villagerTemplates = append(villagerTemplates, role)
	}

	roles := make([]Role, 0, playerCount)
	for index := 0; index < requiredWerewolves; index++ {
		roles = append(roles, getRoleByIndex(werewolfTemplates, index, "Werewolf"))
	}
	for index := 0; index < requiredVillagers; index++ {
		roles = append(roles, getRoleByIndex(villagerTemplates, index, "Villager"))
	}

	return roles
}

func getRoleByIndex(templates []Role, index int, fallbackPrefix string) Role {
	if index < len(templates) {
		return templates[index]
	}

	name := fmt.Sprintf("%s %d", fallbackPrefix, index+1)
	team := RoleTeamVillager
	if fallbackPrefix == "Werewolf" {
		team = RoleTeamWerewolf
	}

	return Role{
		Name:        name,
		Team:        team,
		Description: "Generated fallback role.",
	}
}
