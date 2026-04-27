package models

import (
	"strings"
	"time"
)

// UnseatedChair is the ChairID value for a player who has not chosen a seat yet (seats are 0–15).
const UnseatedChair = -1

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
	Code          string            `json:"code"`
	Mode          GameMode          `json:"mode"`
	Players       []Player          `json:"players"`
	CreatedAt     time.Time         `json:"created_at"`
	Phase         GamePhase         `json:"phase"`
	TimeRemaining int               `json:"time_remaining"`
	Votes         map[string]string `json:"votes,omitempty"`
	NightActions  map[string]string `json:"night_actions,omitempty"`
	DefendantID   string            `json:"defendant_id,omitempty"`
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
		DefendantID:   lobby.DefendantID,
		VoteCounts:    voteCountsByTarget(lobby),
		MyVote:        "",
		NightInstruction: nightInstructionForPlayer(lobby, forPlayerID),
	}

	if lobby.Votes != nil {
		if targetID, ok := lobby.Votes[forPlayerID]; ok {
			gameStateDTO.MyVote = targetID
		}
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

func voteCountsByTarget(lobby *Lobby) map[string]int {
	counts := make(map[string]int)
	if lobby.Votes == nil {
		return counts
	}
	alive := alivePlayerIDs(lobby)
	for voterID, targetID := range lobby.Votes {
		if !alive[voterID] || !alive[targetID] {
			continue
		}
		counts[targetID]++
	}
	return counts
}

func alivePlayerIDs(lobby *Lobby) map[string]bool {
	out := make(map[string]bool)
	for i := range lobby.Players {
		if lobby.Players[i].IsAlive {
			out[lobby.Players[i].ID] = true
		}
	}
	return out
}

func isRoleVisibleForAllPlayers(phase GamePhase) bool {
	return phase == GamePhaseLobby
}

func nightInstructionForPlayer(lobby *Lobby, playerID string) string {
	if lobby.Phase != GamePhaseNight {
		return ""
	}

	for i := range lobby.Players {
		player := lobby.Players[i]
		if player.ID != playerID {
			continue
		}
		if isWendigoRole(player.Role) {
			return "CHOOSE YOUR PREY"
		}
		return "CHOOSE SOMEONE TO PRAY FOR"
	}
	return ""
}

func isWendigoRole(roleName string) bool {
	normalized := strings.ToUpper(strings.TrimSpace(roleName))
	return strings.Contains(normalized, "WEREWOLF") || strings.Contains(normalized, "WENDIGO")
}
