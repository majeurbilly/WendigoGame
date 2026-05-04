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
	// MessageTypeClaimSeat is the inbound WebSocket message type for CHAIR_SELECTION seat claims.
	MessageTypeClaimSeat = "CLAIM_SEAT"
	// MessageTypeLeaveLobby is the inbound WebSocket message type for explicitly leaving the lobby (removes player from Redis).
	MessageTypeLeaveLobby = "LEAVE_LOBBY"
	// MessageTypeAccuse is the inbound WebSocket message type for council accusations during ACCUSATION.
	MessageTypeAccuse = "ACCUSE"
	// MessageTypeStartPleading is sent by the current speaker to begin their pleading timer in PLEADINGS.
	MessageTypeStartPleading = "START_PLEADING"
	// MessageTypeWendigoIntent updates soft night intent visible only to Wendigos.
	MessageTypeWendigoIntent = "WENDIGO_INTENT"
)

// WSMessage is the JSON format sent over WebSockets.
type WSMessage struct {
	Type    string `json:"type"`
	Payload any    `json:"payload"`
}
