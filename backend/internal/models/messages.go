package models

const (
	MessageTypeLobbySync = "LOBBY_SYNC"
	MessageTypeGameTick  = "GAME_TICK"
)

// WSMessage est le format JSON envoyé sur les WebSockets.
type WSMessage struct {
	Type    string `json:"type"`
	Payload any    `json:"payload"`
}
