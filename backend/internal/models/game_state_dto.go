package models

type PlayerDTO struct {
	ID                    string `json:"id"`
	Name                  string `json:"name,omitempty"`
	IsHost                bool   `json:"is_host"`
	IsAlive               bool   `json:"is_alive"`
	ChairID               int    `json:"chair_id"`
	Role                  string `json:"role,omitempty"`
	IsExcludedFromCouncil bool   `json:"is_excluded_from_council"`
}

type GameStateDTO struct {
	Code                 string            `json:"code"`
	Mode                 GameMode          `json:"mode,omitempty"`
	Phase                GamePhase         `json:"phase"`
	WinnerTeam           string            `json:"winner_team,omitempty"`
	TimeRemaining        int               `json:"time_remaining"`
	PhaseTotalSeconds    int               `json:"phase_total_seconds,omitempty"`
	PhaseSettings        PhaseSettings     `json:"phase_settings"`
	IsPaused             bool              `json:"is_paused"`
	SurrenderVoteActive  bool              `json:"surrender_vote_active"`
	SurrenderVotes       map[string]bool   `json:"surrender_votes,omitempty"`
	SurrenderApproved    bool              `json:"surrender_approved"`
	SocialPhaseTotalTime int               `json:"social_phase_total_time,omitempty"`
	ChairPromptTriggered bool              `json:"chair_prompt_triggered,omitempty"`
	CouncilAccusations   map[string]string `json:"council_accusations,omitempty"`
	PleadingsQueue       []string          `json:"pleadings_queue,omitempty"`
	CurrentSpeakerID     string            `json:"current_speaker_id,omitempty"`
	PleadingTimerStarted bool              `json:"pleading_timer_started"`
	WendigoIntentions    map[string]string `json:"wendigo_intentions,omitempty"`
	WendigoIntents       map[string]string `json:"wendigo_intents,omitempty"`
	Players              []PlayerDTO       `json:"players"`
	DefendantID          string            `json:"defendant_id,omitempty"`
	LastLynchVictimID    string            `json:"last_lynch_victim_id,omitempty"`
	LastNightVictimID    string            `json:"last_night_victim_id,omitempty"`
	LastNightSavedByPrayer bool           `json:"last_night_saved_by_prayer,omitempty"`
	Votes                map[string]string `json:"votes,omitempty"`
	VoteCounts           map[string]int    `json:"vote_counts,omitempty"`
	MyVote               string            `json:"my_vote,omitempty"`
	NightInstruction     string            `json:"night_instruction,omitempty"`
}
