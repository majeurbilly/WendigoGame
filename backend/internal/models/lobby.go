package models

import (
	"maps"
	"slices"
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

type Lobby struct {
	Code                 string            `json:"code"`
	Mode                 GameMode          `json:"mode"`
	Players              []Player          `json:"players"`
	CreatedAt            time.Time         `json:"created_at"`
	Phase                GamePhase         `json:"phase"`
	WinnerTeam           string            `json:"winner_team,omitempty"`
	TimeRemaining        int               `json:"time_remaining"`
	SocialPhaseTotalTime int               `json:"social_phase_total_time,omitempty"`
	ChairPromptTriggered bool              `json:"chair_prompt_triggered,omitempty"`
	CouncilAccusations   map[string]string `json:"council_accusations,omitempty"`
	PleadingsQueue       []string          `json:"pleadings_queue,omitempty"`
	CurrentSpeakerID     string            `json:"current_speaker_id,omitempty"`
	PleadingTimerStarted bool              `json:"pleading_timer_started"`
	Votes                map[string]string `json:"votes,omitempty"`
	NightActions         map[string]string `json:"night_actions,omitempty"`
	WendigoIntentions    map[string]string `json:"wendigo_intentions,omitempty"`
	DefendantID          string            `json:"defendant_id,omitempty"`
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

// SafeForFullLobbySync is true when broadcasting the raw Lobby JSON to every client is safe
// (pregame lobby with no secret roles assigned yet).
func (lobby *Lobby) SafeForFullLobbySync() bool {
	if lobby.Phase != GamePhaseLobby {
		return false
	}
	for i := range lobby.Players {
		if strings.TrimSpace(lobby.Players[i].Role) != "" {
			return false
		}
	}
	return true
}

func shouldRevealRoleToEveryone(lobby *Lobby) bool {
	if lobby.Phase == PhaseGameOver {
		return true
	}
	if lobby.Phase == GamePhaseLobby {
		for i := range lobby.Players {
			if strings.TrimSpace(lobby.Players[i].Role) != "" {
				return false
			}
		}
		return true
	}
	return false
}

func (lobby *Lobby) ToGameStateDTO(forPlayerID string) GameStateDTO {
	gameStateDTO := GameStateDTO{
		Code:                 lobby.Code,
		Mode:                 lobby.Mode,
		Phase:                lobby.Phase,
		WinnerTeam:           lobby.WinnerTeam,
		TimeRemaining:        lobby.TimeRemaining,
		SocialPhaseTotalTime: lobby.SocialPhaseTotalTime,
		ChairPromptTriggered: lobby.ChairPromptTriggered,
		Players:              make([]PlayerDTO, 0, len(lobby.Players)),
		DefendantID:          lobby.DefendantID,
		VoteCounts:           voteCountsByTarget(lobby),
		MyVote:               "",
		NightInstruction:     nightInstructionForPlayer(lobby, forPlayerID),
	}
	if len(lobby.CouncilAccusations) > 0 {
		gameStateDTO.CouncilAccusations = maps.Clone(lobby.CouncilAccusations)
	}
	if len(lobby.PleadingsQueue) > 0 {
		gameStateDTO.PleadingsQueue = slices.Clone(lobby.PleadingsQueue)
	}
	gameStateDTO.CurrentSpeakerID = lobby.CurrentSpeakerID
	gameStateDTO.PleadingTimerStarted = lobby.PleadingTimerStarted

	viewerWendigo := false
	for i := range lobby.Players {
		p := lobby.Players[i]
		if p.ID.String() == forPlayerID && p.IsAlive && isWendigoRole(p.Role) {
			viewerWendigo = true
			break
		}
	}
	if viewerWendigo && len(lobby.WendigoIntentions) > 0 {
		gameStateDTO.WendigoIntentions = maps.Clone(lobby.WendigoIntentions)
	}

	if lobby.Votes != nil {
		if targetID, ok := lobby.Votes[forPlayerID]; ok {
			gameStateDTO.MyVote = targetID
		}
	}

	for _, player := range lobby.Players {
		playerDTO := PlayerDTO{
			ID:                    player.ID.String(),
			Name:                  player.Name,
			IsHost:                player.IsHost,
			IsAlive:               player.IsAlive,
			ChairID:               player.ChairID,
			Role:                  "",
			IsExcludedFromCouncil: player.IsExcludedFromCouncil,
		}

		if player.ID.String() == forPlayerID || shouldRevealRoleToEveryone(lobby) {
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
			out[lobby.Players[i].ID.String()] = true
		}
	}
	return out
}

func nightInstructionForPlayer(lobby *Lobby, playerID string) string {
	if lobby.Phase != GamePhaseNight {
		return ""
	}

	for i := range lobby.Players {
		player := lobby.Players[i]
		if player.ID.String() != playerID {
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
