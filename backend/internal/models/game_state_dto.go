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
	Phase         GamePhase   `json:"phase"`
	TimeRemaining int         `json:"time_remaining"`
	Players       []PlayerDTO `json:"players"`
}
