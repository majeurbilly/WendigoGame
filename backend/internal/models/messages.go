package models

const (
	MessageTypeLobbySync = "LOBBY_SYNC"
	MessageTypeGameTick  = "GAME_TICK"
	// MessageTypeVoteDay is the inbound WebSocket message type for daytime voting.
	MessageTypeVoteDay = "VOTE_DAY"
)

// WSMessage is the JSON format sent over WebSockets.
type WSMessage struct {
	Type    string `json:"type"`
	Payload any    `json:"payload"`
}
