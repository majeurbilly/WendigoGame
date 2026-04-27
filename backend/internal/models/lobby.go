package models

import "time"

type GameMode string

const (
	GameModeLocal  GameMode = "local"
	GameModeOnline GameMode = "online"
)

type Player struct {
	ID     string `json:"id"`
	Name   string `json:"name,omitempty"`
	IsHost bool   `json:"is_host"`
}

type Lobby struct {
	Code           string    `json:"code"`
	Mode           GameMode  `json:"mode"`
	Players        []Player  `json:"players"`
	CreatedAt      time.Time `json:"created_at"`
	Phase          GamePhase `json:"phase"`
	TimeRemaining  int       `json:"time_remaining"`
}

// LobbyManager defines the contract required by the game engine.
type LobbyManager interface {
	GetCode() string
	GetPlayers() []Player
	GetPhase() GamePhase
	GetTimeRemaining() int
	GetNextPhase() (GamePhase, int)
}

func (lobby *Lobby) GetCode() string {
	return lobby.Code
}

func (lobby *Lobby) GetPlayers() []Player {
	return lobby.Players
}

func (lobby *Lobby) GetPhase() GamePhase {
	return lobby.Phase
}

func (lobby *Lobby) GetTimeRemaining() int {
	return lobby.TimeRemaining
}

func (lobby *Lobby) GetNextPhase() (GamePhase, int) {
	return GetNextPhaseAndTime(lobby.Phase)
}
