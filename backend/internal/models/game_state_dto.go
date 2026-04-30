package models

type PlayerDTO struct {
	ID      string `json:"id"`
	Name    string `json:"name,omitempty"`
	IsHost  bool   `json:"is_host"`
	IsAlive bool   `json:"is_alive"`
	ChairID int    `json:"chair_id"`
	Role    string `json:"role,omitempty"`
}

type GameStateDTO struct {
	Code          string         `json:"code"`
	Mode          GameMode       `json:"mode,omitempty"`
	Phase         GamePhase      `json:"phase"`
	WinnerTeam    string         `json:"winner_team,omitempty"`
	TimeRemaining int            `json:"time_remaining"`
	Players       []PlayerDTO    `json:"players"`
	DefendantID   string         `json:"defendant_id,omitempty"`
	VoteCounts    map[string]int `json:"vote_counts,omitempty"`
	MyVote        string         `json:"my_vote,omitempty"`
	NightInstruction string      `json:"night_instruction,omitempty"`
	LiveKitToken     string      `json:"livekit_token,omitempty"`
}
