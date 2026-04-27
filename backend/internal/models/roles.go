package models

type RoleTeam string

const (
	RoleTeamVillager RoleTeam = "VILLAGER"
	RoleTeamWerewolf RoleTeam = "WEREWOLF"
)

type Role struct {
	Name        string   `json:"name"`
	Team        RoleTeam `json:"team"`
	Description string   `json:"description"`
}

var RoleTemplates = []Role{
	{Name: "Villager", Team: RoleTeamVillager, Description: "No special power. Works with the village."},
	{Name: "Seer", Team: RoleTeamVillager, Description: "Can inspect a player's alignment."},
	{Name: "Witch", Team: RoleTeamVillager, Description: "Has one heal and one poison action."},
	{Name: "Hunter", Team: RoleTeamVillager, Description: "Can eliminate a player when eliminated."},
	{Name: "Bodyguard", Team: RoleTeamVillager, Description: "Protects one player each night."},
	{Name: "Cupid", Team: RoleTeamVillager, Description: "Links two players together."},
	{Name: "Little Girl", Team: RoleTeamVillager, Description: "Can gather hints during night activity."},
	{Name: "Elder", Team: RoleTeamVillager, Description: "Needs extra pressure to be removed."},
	{Name: "Priest", Team: RoleTeamVillager, Description: "Supports village control effects."},
	{Name: "Mayor", Team: RoleTeamVillager, Description: "Has stronger day influence."},
	{Name: "Guard Captain", Team: RoleTeamVillager, Description: "Coordinates village defense."},
	{Name: "Tracker", Team: RoleTeamVillager, Description: "Can track player movements."},
	{Name: "Raven", Team: RoleTeamVillager, Description: "Can mark players with suspicion."},
	{Name: "Oracle", Team: RoleTeamVillager, Description: "Gets strategic information over time."},
	{Name: "Judge", Team: RoleTeamVillager, Description: "Can alter voting pressure."},
	{Name: "Blacksmith", Team: RoleTeamVillager, Description: "Crafts defensive advantages."},
	{Name: "Alchemist", Team: RoleTeamVillager, Description: "Uses one-time utility effects."},
	{Name: "Bard", Team: RoleTeamVillager, Description: "Influences social outcomes."},
	{Name: "Sentinel", Team: RoleTeamVillager, Description: "Monitors dangerous targets."},
	{Name: "Scholar", Team: RoleTeamVillager, Description: "Analyzes previous events."},
	{Name: "Healer", Team: RoleTeamVillager, Description: "Provides recovery support."},
	{Name: "Werewolf", Team: RoleTeamWerewolf, Description: "Main antagonist. Eliminates villagers at night."},
	{Name: "Alpha Werewolf", Team: RoleTeamWerewolf, Description: "Leads the werewolf team."},
	{Name: "Mystic Wolf", Team: RoleTeamWerewolf, Description: "Has enhanced detection ability."},
	{Name: "Shadow Wolf", Team: RoleTeamWerewolf, Description: "Can hide traces of werewolf actions."},
	{Name: "Frenzied Wolf", Team: RoleTeamWerewolf, Description: "Aggressive werewolf profile."},
	{Name: "Nightmare Wolf", Team: RoleTeamWerewolf, Description: "Applies pressure and fear effects."},
	{Name: "Silent Wolf", Team: RoleTeamWerewolf, Description: "Specializes in stealth and misdirection."},
	{Name: "Moon Wolf", Team: RoleTeamWerewolf, Description: "Adaptive werewolf role."},
}
