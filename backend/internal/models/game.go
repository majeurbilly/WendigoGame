package models

type GamePhase string

const (
	GamePhaseLobby          GamePhase = "LOBBY"
	GamePhaseChairSelection GamePhase = "CHAIR_SELECTION"
	GamePhaseDay            GamePhase = "DAY"
	GamePhaseMorning        GamePhase = "MORNING"
	GamePhaseNoCouncil      GamePhase = "NO_COUNCIL"
	GamePhaseCouncilStart   GamePhase = "COUNCIL_START"
	GamePhaseAccusation     GamePhase = "ACCUSATION"
	GamePhaseCouncilSummary GamePhase = "COUNCIL_SUMMARY"
	GamePhasePleadings      GamePhase = "PLEADINGS"
	GamePhaseCouncilVote    GamePhase = "COUNCIL_VOTE"
	GamePhaseStake          GamePhase = "STAKE"
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
		return GamePhaseCouncilSummary, s.CouncilSummarySeconds
	case GamePhaseCouncilSummary:
		return GamePhaseCouncilVote, s.CouncilVoteSeconds
	case GamePhasePleadings:
		return GamePhaseCouncilSummary, s.CouncilSummarySeconds
	case GamePhaseCouncilVote:
		return GamePhaseStake, s.StakeSeconds
	case GamePhaseStake:
		return GamePhaseNight, s.NightSeconds
	case GamePhaseNoCouncil:
		return GamePhaseNight, s.NightSeconds
	case GamePhaseNight:
		return GamePhaseMorning, s.MorningSeconds
	case GamePhaseMorning:
		return GamePhaseDay, s.DaySocialSeconds
	case PhaseGameOver:
		return PhaseGameOver, 0
	default:
		return GamePhaseLobby, 0
	}
}
