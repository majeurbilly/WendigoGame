package models

type GamePhase string

// ChairSelectionPhaseSeconds is the lobby timer for CHAIR_SELECTION (from LOBBY) and refill when not everyone is seated.
const ChairSelectionPhaseSeconds = 10

// DayPhaseSeconds is the default duration of the DAY phase after the initial chair round.
const DayPhaseSeconds = 600

// PostChairCouncilAccusationSeconds is the ACCUSATION phase length after the "musical chairs" recall before council.
const PostChairCouncilAccusationSeconds = 30

// PleadingSpeechSeconds is the speaking window after the current speaker sends START_PLEADING.
const PleadingSpeechSeconds = 45

// CouncilVotePhaseSeconds is the final chaotic council ballot after pleadings.
const CouncilVotePhaseSeconds = 45

const (
	GamePhaseLobby          GamePhase = "LOBBY"
	GamePhaseChairSelection GamePhase = "CHAIR_SELECTION"
	GamePhaseDay            GamePhase = "DAY"
	GamePhaseAccusation     GamePhase = "ACCUSATION"
	GamePhasePleadings      GamePhase = "PLEADINGS"
	GamePhaseCouncilVote    GamePhase = "COUNCIL_VOTE"
	GamePhaseNight          GamePhase = "NIGHT"
	PhaseGameOver           GamePhase = "GAME_OVER"
)

// GetNextPhaseAndTime returns the next phase and its initial duration in seconds.
func GetNextPhaseAndTime(currentPhase GamePhase) (GamePhase, int) {
	switch currentPhase {
	case GamePhaseLobby:
		return GamePhaseChairSelection, ChairSelectionPhaseSeconds
	case GamePhaseChairSelection:
		return GamePhaseDay, DayPhaseSeconds
	case GamePhaseDay:
		return GamePhaseAccusation, 120
	case GamePhaseAccusation:
		return GamePhaseNight, 60
	case GamePhasePleadings:
		return GamePhaseCouncilVote, CouncilVotePhaseSeconds
	case GamePhaseCouncilVote:
		return GamePhaseNight, 60
	case GamePhaseNight:
		return GamePhaseDay, 15
	case PhaseGameOver:
		return PhaseGameOver, 0
	default:
		return GamePhaseLobby, 0
	}
}
