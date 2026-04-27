package models

import "time"

type GameMode string

const (
	GameModeLocal  GameMode = "local"
	GameModeOnline GameMode = "online"
)

type Player struct {
	ID      string `json:"id"`
	Name    string `json:"name,omitempty"`
	IsHost  bool   `json:"is_host"`
	IsAlive bool   `json:"is_alive"`
	ChairID int    `json:"chair_id"`
	Role    string `json:"role,omitempty"`
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
	ToGameStateDTO(forPlayerID string) GameStateDTO
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

func (lobby *Lobby) ToGameStateDTO(forPlayerID string) GameStateDTO {
	gameStateDTO := GameStateDTO{
		Phase:         lobby.Phase,
		TimeRemaining: lobby.TimeRemaining,
		Players:       make([]PlayerDTO, 0, len(lobby.Players)),
	}

	for _, player := range lobby.Players {
		playerDTO := PlayerDTO{
			ID:      player.ID,
			Name:    player.Name,
			IsHost:  player.IsHost,
			IsAlive: player.IsAlive,
			ChairID: player.ChairID,
			Role:    "",
		}

		if player.ID == forPlayerID || isRoleVisibleForAllPlayers(lobby.Phase) {
			playerDTO.Role = player.Role
		}

		gameStateDTO.Players = append(gameStateDTO.Players, playerDTO)
	}

	return gameStateDTO
}

func isRoleVisibleForAllPlayers(phase GamePhase) bool {
	return phase == GamePhaseLobby
}
