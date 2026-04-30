package models

const (
	MessageTypeLobbySync = "LOBBY_SYNC"
	MessageTypeGameTick  = "GAME_TICK"
	MessageTypeError     = "ERROR"
	// MessageTypeVoteDay is the inbound WebSocket message type for daytime voting.
	MessageTypeVoteDay = "VOTE_DAY"
	// MessageTypeSubmitNightAction is the inbound WebSocket message type for night actions.
	MessageTypeSubmitNightAction = "SUBMIT_NIGHT_ACTION"
	// MessageTypeStartGame is the inbound WebSocket message type for the host to start the match.
	MessageTypeStartGame = "START_GAME"
)

// WSMessage is the JSON format sent over WebSockets.
type WSMessage struct {
	Type    string `json:"type"`
	Payload any    `json:"payload"`
}
