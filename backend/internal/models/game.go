package models

type GamePhase string

const (
	GamePhaseLobby          GamePhase = "LOBBY"
	GamePhaseChairSelection GamePhase = "CHAIR_SELECTION"
	GamePhaseDay            GamePhase = "DAY"
	GamePhaseCouncilStart   GamePhase = "COUNCIL_START"
	GamePhaseAccusation     GamePhase = "ACCUSATION"
	GamePhasePleadings      GamePhase = "PLEADINGS"
	GamePhaseCouncilVote    GamePhase = "COUNCIL_VOTE"
	GamePhaseNight          GamePhase = "NIGHT"
	PhaseGameOver           GamePhase = "GAME_OVER"
)

// GetNextPhaseAndTime returns the next phase and its initial duration in seconds for the given settings.
func GetNextPhaseAndTime(currentPhase GamePhase, settings PhaseSettings) (GamePhase, int) {
	s := settings.WithDefaults()
	switch currentPhase {
	case GamePhaseLobby:
		return GamePhaseChairSelection, s.ChairSelectionSeconds
	case GamePhaseChairSelection:
		return GamePhaseDay, s.DaySocialSeconds
	case GamePhaseDay:
		return GamePhaseCouncilStart, s.CouncilStartSeconds
	case GamePhaseCouncilStart:
		return GamePhaseAccusation, s.CouncilAccusationPostChairSeconds
	case GamePhaseAccusation:
		return GamePhaseNight, s.NightSeconds
	case GamePhasePleadings:
		return GamePhaseCouncilVote, s.CouncilVoteSeconds
	case GamePhaseCouncilVote:
		return GamePhaseNight, s.NightSeconds
	case GamePhaseNight:
		return GamePhaseDay, s.PostNightDaySeconds
	case PhaseGameOver:
		return PhaseGameOver, 0
	default:
		return GamePhaseLobby, 0
	}
}
