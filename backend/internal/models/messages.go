package models

const (
	MessageTypeLobbySync = "LOBBY_SYNC"
	MessageTypeGameTick  = "GAME_TICK"
)

// WSMessage is the JSON format sent over WebSockets.
type WSMessage struct {
	Type    string `json:"type"`
	Payload any    `json:"payload"`
}
