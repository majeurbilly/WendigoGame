package models

import "time"

type GameMode string

const (
	GameModePresentiel GameMode = "presentiel"
	GameModeEnLigne    GameMode = "en_ligne"
)

type Player struct {
	ID     string `json:"id"`
	Name   string `json:"name,omitempty"`
	IsHost bool   `json:"is_host"`
}

type Lobby struct {
	Code      string    `json:"code"`
	Mode      GameMode  `json:"mode"`
	Players   []Player  `json:"players"`
	CreatedAt time.Time `json:"created_at"`
}
