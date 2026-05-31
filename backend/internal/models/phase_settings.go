package models

// PhaseSettings holds per-lobby phase durations (seconds). Persisted on the lobby JSON.
type PhaseSettings struct {
	ChairSelectionSeconds             int `json:"chair_selection_seconds"`
	DaySocialSeconds                  int `json:"day_social_seconds"`
	MorningSeconds                    int `json:"morning_seconds"`
	NoCouncilSeconds                  int `json:"no_council_seconds"`
	CouncilStartSeconds               int `json:"council_start_seconds"`
	CouncilAccusationPostChairSeconds int `json:"council_accusation_post_chair_seconds"`
	CouncilAccusationAfterDaySeconds  int `json:"council_accusation_after_day_seconds"`
	CouncilSummarySeconds             int `json:"council_summary_seconds"`
	PleadingSpeechSeconds             int `json:"pleading_speech_seconds"`
	CouncilVoteSeconds                int `json:"council_vote_seconds"`
	StakeSeconds                      int `json:"stake_seconds"`
	NightSeconds                      int `json:"night_seconds"`
	PostNightDaySeconds               int `json:"post_night_day_seconds"`
}

// DefaultPhaseSettings matches the original hard-coded pacing.
func DefaultPhaseSettings() PhaseSettings {
	return PhaseSettings{
		ChairSelectionSeconds:             10,
		DaySocialSeconds:                  600,
		MorningSeconds:                    10,
		NoCouncilSeconds:                  10,
		CouncilStartSeconds:               10,
		CouncilAccusationPostChairSeconds: 30,
		CouncilAccusationAfterDaySeconds:  120,
		CouncilSummarySeconds:             10,
		PleadingSpeechSeconds:             45,
		CouncilVoteSeconds:                45,
		StakeSeconds:                      10,
		NightSeconds:                      60,
		PostNightDaySeconds:               15,
	}
}

// WithDefaults fills zero or negative fields from DefaultPhaseSettings (for older Redis payloads).
func (s PhaseSettings) WithDefaults() PhaseSettings {
	d := DefaultPhaseSettings()
	if s.ChairSelectionSeconds <= 0 {
		s.ChairSelectionSeconds = d.ChairSelectionSeconds
	}
	if s.DaySocialSeconds <= 0 {
		s.DaySocialSeconds = d.DaySocialSeconds
	}
	if s.MorningSeconds <= 0 {
		s.MorningSeconds = d.MorningSeconds
	}
	if s.NoCouncilSeconds <= 0 {
		s.NoCouncilSeconds = d.NoCouncilSeconds
	}
	if s.CouncilStartSeconds <= 0 {
		s.CouncilStartSeconds = d.CouncilStartSeconds
	}
	if s.CouncilAccusationPostChairSeconds <= 0 {
		s.CouncilAccusationPostChairSeconds = d.CouncilAccusationPostChairSeconds
	}
	if s.CouncilAccusationAfterDaySeconds <= 0 {
		s.CouncilAccusationAfterDaySeconds = d.CouncilAccusationAfterDaySeconds
	}
	if s.CouncilSummarySeconds <= 0 {
		s.CouncilSummarySeconds = d.CouncilSummarySeconds
	}
	if s.PleadingSpeechSeconds <= 0 {
		s.PleadingSpeechSeconds = d.PleadingSpeechSeconds
	}
	if s.CouncilVoteSeconds <= 0 {
		s.CouncilVoteSeconds = d.CouncilVoteSeconds
	}
	if s.StakeSeconds <= 0 {
		s.StakeSeconds = d.StakeSeconds
	}
	if s.NightSeconds <= 0 {
		s.NightSeconds = d.NightSeconds
	}
	if s.PostNightDaySeconds <= 0 {
		s.PostNightDaySeconds = d.PostNightDaySeconds
	}
	return s
}

func clampInt(v, lo, hi int) int {
	if v < lo {
		return lo
	}
	if v > hi {
		return hi
	}
	return v
}

// Clamped returns a copy bounded to safe ranges for public updates.
func (s PhaseSettings) Clamped() PhaseSettings {
	s = s.WithDefaults()
	s.ChairSelectionSeconds = clampInt(s.ChairSelectionSeconds, 5, 300)
	s.DaySocialSeconds = clampInt(s.DaySocialSeconds, 30, 7200)
	s.MorningSeconds = clampInt(s.MorningSeconds, 5, 60)
	s.NoCouncilSeconds = clampInt(s.NoCouncilSeconds, 5, 60)
	s.CouncilStartSeconds = clampInt(s.CouncilStartSeconds, 3, 120)
	s.CouncilAccusationPostChairSeconds = clampInt(s.CouncilAccusationPostChairSeconds, 10, 900)
	s.CouncilAccusationAfterDaySeconds = clampInt(s.CouncilAccusationAfterDaySeconds, 10, 900)
	s.CouncilSummarySeconds = clampInt(s.CouncilSummarySeconds, 5, 120)
	s.PleadingSpeechSeconds = clampInt(s.PleadingSpeechSeconds, 10, 600)
	s.CouncilVoteSeconds = clampInt(s.CouncilVoteSeconds, 15, 900)
	s.StakeSeconds = clampInt(s.StakeSeconds, 5, 60)
	s.NightSeconds = clampInt(s.NightSeconds, 15, 1200)
	s.PostNightDaySeconds = clampInt(s.PostNightDaySeconds, 5, 600)
	return s
}

// EffectivePhaseSettings returns lobby-specific timings with defaults for missing values.
func EffectivePhaseSettings(lobby *Lobby) PhaseSettings {
	if lobby == nil {
		return DefaultPhaseSettings()
	}
	return lobby.PhaseSettings.WithDefaults()
}
