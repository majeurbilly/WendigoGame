package models

type GamePhase string

const (
	GamePhaseLobby          GamePhase = "LOBBY"
	GamePhaseChairSelection GamePhase = "CHAIR_SELECTION"
	GamePhaseDay            GamePhase = "DAY"
	GamePhaseAccusation     GamePhase = "ACCUSATION"
	GamePhaseNight          GamePhase = "NIGHT"
	PhaseGameOver           GamePhase = "GAME_OVER"
)

// GetNextPhaseAndTime returns the next phase and its initial duration in seconds.
func GetNextPhaseAndTime(currentPhase GamePhase) (GamePhase, int) {
	switch currentPhase {
	case GamePhaseLobby:
		return GamePhaseChairSelection, 10
	case GamePhaseChairSelection:
		return GamePhaseDay, 600
	case GamePhaseDay:
		return GamePhaseAccusation, 120
	case GamePhaseAccusation:
		return GamePhaseNight, 60
	case GamePhaseNight:
		return GamePhaseDay, 15
	case PhaseGameOver:
		return PhaseGameOver, 0
	default:
		return GamePhaseLobby, 0
	}
}
