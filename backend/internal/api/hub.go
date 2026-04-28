package api

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/majeurbilly/wendigogame/internal/auth"
	"github.com/majeurbilly/wendigogame/internal/models"
	"github.com/majeurbilly/wendigogame/internal/services"
	"github.com/majeurbilly/wendigogame/internal/store"
)

type websocketSession struct {
	lobbyCode string
	playerID  string
}

type Hub struct {
	hubMutex               sync.RWMutex
	broadcastMu            sync.Mutex // Serializes WriteJSON (gorilla/websocket is not concurrent-safe for writes).
	connectionsByLobbyCode map[string]map[*websocket.Conn]struct{}
	sessionByConnection    map[*websocket.Conn]websocketSession
	lobbyStore             *store.Store
	liveKitService         *services.LiveKitService
}

func NewHub(lobbyStore *store.Store, optionalLiveKitService ...*services.LiveKitService) *Hub {
	var liveKitService *services.LiveKitService
	if len(optionalLiveKitService) > 0 {
		liveKitService = optionalLiveKitService[0]
	}
	return &Hub{
		connectionsByLobbyCode: make(map[string]map[*websocket.Conn]struct{}),
		sessionByConnection:    make(map[*websocket.Conn]websocketSession),
		lobbyStore:             lobbyStore,
		liveKitService:         liveKitService,
	}
}

func isWebSocketWriteClosed(err error) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, net.ErrClosed) {
		return true
	}
	if websocket.IsCloseError(err,
		websocket.CloseNormalClosure, websocket.CloseGoingAway, websocket.CloseAbnormalClosure,
		websocket.CloseNoStatusReceived) {
		return true
	}
	s := strings.ToLower(err.Error())
	return strings.Contains(s, "use of closed network connection") ||
		strings.Contains(s, "broken pipe") ||
		strings.Contains(s, "connection reset by peer") ||
		strings.Contains(s, "websocket: close sent") ||
		strings.Contains(s, "forcibly closed") ||
		(strings.Contains(s, "write tcp") && strings.Contains(s, "closed"))
}

// Broadcast sends a JSON message to all WebSocket connections in a lobby (connection snapshot under read lock).
// On write to an already-closed connection, it cleans the hub via Unregister (without logging).
// It returns the first non-close write error so producers (for example, the game loop) can log it.
func (h *Hub) Broadcast(code string, messageType string, payload any) error {
	if h == nil {
		return nil
	}
	msg := models.WSMessage{Type: messageType, Payload: payload}

	h.broadcastMu.Lock()
	h.hubMutex.RLock()
	connSet, ok := h.connectionsByLobbyCode[code]
	if !ok || len(connSet) == 0 {
		h.hubMutex.RUnlock()
		h.broadcastMu.Unlock()
		return nil
	}
	conns := make([]*websocket.Conn, 0, len(connSet))
	for c := range connSet {
		conns = append(conns, c)
	}
	h.hubMutex.RUnlock()

	var firstErr error
	var dead []*websocket.Conn
	for _, c := range conns {
		if err := c.WriteJSON(msg); err != nil {
			if isWebSocketWriteClosed(err) {
				dead = append(dead, c)
				continue
			}
			log.Printf("hub: WriteJSON(%s): %v", messageType, err)
			if firstErr == nil {
				firstErr = err
			}
		}
	}
	h.broadcastMu.Unlock()

	for _, c := range dead {
		h.Unregister(c)
	}
	return firstErr
}

func (h *Hub) Register(lobbyCode string, websocketConn *websocket.Conn, playerID string) {
	h.hubMutex.Lock()
	defer h.hubMutex.Unlock()
	if h.connectionsByLobbyCode[lobbyCode] == nil {
		h.connectionsByLobbyCode[lobbyCode] = make(map[*websocket.Conn]struct{})
	}
	h.connectionsByLobbyCode[lobbyCode][websocketConn] = struct{}{}
	h.sessionByConnection[websocketConn] = websocketSession{lobbyCode: lobbyCode, playerID: playerID}
}

func (h *Hub) Unregister(websocketConn *websocket.Conn) {
	h.hubMutex.Lock()
	session, foundSession := h.sessionByConnection[websocketConn]
	if !foundSession {
		h.hubMutex.Unlock()
		return
	}
	delete(h.sessionByConnection, websocketConn)

	connections, foundLobby := h.connectionsByLobbyCode[session.lobbyCode]
	if foundLobby {
		delete(connections, websocketConn)
		if len(connections) == 0 {
			delete(h.connectionsByLobbyCode, session.lobbyCode)
		}
	}
	h.hubMutex.Unlock()

	if h.lobbyStore == nil {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := h.lobbyStore.RemovePlayerByID(ctx, session.lobbyCode, session.playerID); err != nil {
		log.Printf("hub: RemovePlayerByID(%s, %s): %v", session.lobbyCode, session.playerID, err)
	}
	lobby, err := h.lobbyStore.GetLobby(ctx, session.lobbyCode)
	if err != nil {
		return
	}
	if len(lobby.Players) > 0 {
		_ = h.Broadcast(session.lobbyCode, models.MessageTypeLobbySync, lobby)
	}
}

var websocketUpgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(*http.Request) bool {
		return true
	},
}

func normalizeLobbyCode(raw string) (normalizedLobbyCode string, isValid bool) {
	raw = strings.ToUpper(strings.TrimSpace(raw))
	if len(raw) != 4 {
		return "", false
	}
	for _, r := range raw {
		if r < 'A' || r > 'Z' {
			return "", false
		}
	}
	return raw, true
}

func (serverConfig Config) handleWebSocket(responseWriter http.ResponseWriter, request *http.Request) {
	if serverConfig.Hub == nil || serverConfig.Store == nil {
		http.Error(responseWriter, "invalid server configuration", http.StatusServiceUnavailable)
		return
	}
	if request.Method != http.MethodGet {
		http.Error(responseWriter, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	codeRaw := request.URL.Query().Get("code")
	playerName := strings.TrimSpace(request.URL.Query().Get("name"))
	lobbyCode, isValidCode := normalizeLobbyCode(codeRaw)
	if !isValidCode {
		http.Error(responseWriter, "invalid code parameter (4 letters A-Z)", http.StatusBadRequest)
		return
	}
	if playerName == "" {
		http.Error(responseWriter, "missing required name parameter", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancel()
	existingLobby, err := serverConfig.Store.GetLobby(ctx, lobbyCode)
	if err != nil {
		if err == store.ErrLobbyNotFound {
			http.Error(responseWriter, "lobby not found", http.StatusNotFound)
			return
		}
		http.Error(responseWriter, "lobby read error", http.StatusInternalServerError)
		return
	}

	token := strings.TrimSpace(request.URL.Query().Get("token"))
	var (
		authUserID    uuid.UUID
		useJWTAuth    bool
		playerIDClaim string
	)
	if token != "" {
		useJWTAuth = true
		authUserID, err = auth.ValidateToken(token)
		if err != nil {
			http.Error(responseWriter, "invalid or expired token", http.StatusUnauthorized)
			return
		}
	} else {
		playerIDClaim = strings.TrimSpace(request.URL.Query().Get("player_id"))
		if playerIDClaim != "" {
			authUserID, err = uuid.Parse(playerIDClaim)
			if err != nil {
				http.Error(responseWriter, "invalid player_id", http.StatusBadRequest)
				return
			}
		}
	}

	websocketConn, err := websocketUpgrader.Upgrade(responseWriter, request, nil)
	if err != nil {
		log.Printf("websocket upgrade: %v", err)
		var handshakeErr websocket.HandshakeError
		if errors.As(err, &handshakeErr) {
			return
		}
		http.Error(responseWriter, "websocket handshake failed: "+err.Error(), http.StatusBadRequest)
		return
	}

	playerID := ""
	isAlreadyInLobby := false
	if useJWTAuth || authUserID != uuid.Nil {
		playerID = authUserID.String()
		for i := range existingLobby.Players {
			if existingLobby.Players[i].ID == authUserID {
				isAlreadyInLobby = true
				break
			}
		}
	}
	if !isAlreadyInLobby {
		hostClaimed := false
		for i := range existingLobby.Players {
			if existingLobby.Players[i].IsHost && strings.EqualFold(strings.TrimSpace(existingLobby.Players[i].Name), playerName) {
				replaceCtx, cancelReplace := context.WithTimeout(context.Background(), 5*time.Second)
				err = serverConfig.Store.ReplacePlayerID(replaceCtx, lobbyCode, existingLobby.Players[i].ID.String(), authUserID.String())
				cancelReplace()
				if err == nil {
					hostClaimed = true
				}
				break
			}
		}

		if !hostClaimed {
			if authUserID == uuid.Nil {
				authUserID = uuid.New()
				playerID = authUserID.String()
			}
			player := models.Player{
				ID:      authUserID,
				Name:    playerName,
				IsHost:  false,
				IsAlive: true,
				ChairID: models.UnseatedChair,
			}
			appendCtx, cancelAppend := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancelAppend()
			if _, err := serverConfig.Store.AppendPlayer(appendCtx, lobbyCode, player); err != nil {
				log.Printf("append player: %v", err)
				_ = websocketConn.Close()
				return
			}
		}
	}
	if playerID == "" {
		playerID = authUserID.String()
	}

	serverConfig.Hub.Register(lobbyCode, websocketConn, playerID)
	syncCtx, cancelSync := context.WithTimeout(context.Background(), 5*time.Second)
	if lobbyAfterJoin, syncErr := serverConfig.Store.GetLobby(syncCtx, lobbyCode); syncErr == nil {
		_ = serverConfig.Hub.Broadcast(lobbyCode, models.MessageTypeLobbySync, lobbyAfterJoin)
	} else {
		log.Printf("hub: GetLobby after WS connect (%s): %v", lobbyCode, syncErr)
	}
	cancelSync()

	defer func() {
		serverConfig.Hub.Unregister(websocketConn)
		_ = websocketConn.Close()
	}()

	const pongWait = 60 * time.Second
	_ = websocketConn.SetReadDeadline(time.Now().Add(pongWait))
	websocketConn.SetPongHandler(func(string) error {
		_ = websocketConn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, payloadBytes, err := websocketConn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("websocket read: %v", err)
			}
			break
		}
		if len(payloadBytes) == 0 {
			continue
		}

		var inbound struct {
			Type    string          `json:"type"`
			Payload json.RawMessage `json:"payload"`
		}
		if err := json.Unmarshal(payloadBytes, &inbound); err != nil {
			log.Printf("websocket: invalid JSON from player %s: %v", playerID, err)
			continue
		}

		var voteBody struct {
			TargetID string `json:"target_id"`
			Action   string `json:"action"`
		}
		switch inbound.Type {
		case models.MessageTypeVoteDay:
			if err := json.Unmarshal(inbound.Payload, &voteBody); err != nil {
				log.Printf("websocket: invalid VOTE_DAY payload: %v", err)
				continue
			}
			voteCtx, voteCancel := context.WithTimeout(context.Background(), 5*time.Second)
			voteErr := serverConfig.Store.SubmitDayVote(voteCtx, lobbyCode, playerID, voteBody.TargetID)
			voteCancel()
			if voteErr != nil {
				log.Printf("websocket: SubmitDayVote(%s, %s): %v", lobbyCode, playerID, voteErr)
				continue
			}
		case models.MessageTypeSubmitNightAction:
			if err := json.Unmarshal(inbound.Payload, &voteBody); err != nil {
				log.Printf("websocket: invalid SUBMIT_NIGHT_ACTION payload: %v", err)
				continue
			}
			nightCtx, nightCancel := context.WithTimeout(context.Background(), 5*time.Second)
			nightErr := serverConfig.Store.SubmitNightAction(nightCtx, lobbyCode, playerID, voteBody.TargetID, voteBody.Action)
			nightCancel()
			if nightErr != nil {
				log.Printf("websocket: SubmitNightAction(%s, %s): %v", lobbyCode, playerID, nightErr)
				continue
			}
		default:
			continue
		}

		if serverConfig.Hub != nil {
			stateCtx, stateCancel := context.WithTimeout(context.Background(), 5*time.Second)
			if broadcastErr := serverConfig.Hub.BroadcastState(stateCtx, serverConfig.Store, lobbyCode); broadcastErr != nil {
				log.Printf("websocket: BroadcastState after action (%s): %v", lobbyCode, broadcastErr)
			}
			stateCancel()
		}
	}
}

// BroadcastState sends a personalized game state to each connection in a lobby.
func (h *Hub) BroadcastState(ctx context.Context, gameTickProvider GameTickProvider, code string) error {
	if h == nil || gameTickProvider == nil {
		return nil
	}

	lobby, err := gameTickProvider.GetLobby(ctx, code)
	if err != nil {
		return err
	}

	h.broadcastMu.Lock()
	h.hubMutex.RLock()
	connSet, ok := h.connectionsByLobbyCode[code]
	if !ok || len(connSet) == 0 {
		h.hubMutex.RUnlock()
		h.broadcastMu.Unlock()
		return nil
	}

	connections := make([]*websocket.Conn, 0, len(connSet))
	sessionByConn := make(map[*websocket.Conn]websocketSession, len(connSet))
	for connection := range connSet {
		connections = append(connections, connection)
		sessionByConn[connection] = h.sessionByConnection[connection]
	}
	h.hubMutex.RUnlock()

	var firstErr error
	var deadConnections []*websocket.Conn
	for _, connection := range connections {
		session := sessionByConn[connection]
		gameStateDTO := lobby.ToGameStateDTO(session.playerID)
		gameStateDTO.LiveKitToken = h.generateLiveKitToken(lobby, session.playerID)
		message := models.WSMessage{
			Type:    models.MessageTypeGameTick,
			Payload: gameStateDTO,
		}

		writeErr := connection.WriteJSON(message)
		if writeErr != nil {
			if isWebSocketWriteClosed(writeErr) {
				deadConnections = append(deadConnections, connection)
				continue
			}
			log.Printf("hub: BroadcastState WriteJSON(%s): %v", code, writeErr)
			if firstErr == nil {
				firstErr = writeErr
			}
		}
	}
	h.broadcastMu.Unlock()

	for _, deadConnection := range deadConnections {
		h.Unregister(deadConnection)
	}

	return firstErr
}

func (h *Hub) generateLiveKitToken(lobby *models.Lobby, playerID string) string {
	if h == nil || h.liveKitService == nil || lobby == nil {
		return ""
	}

	token, err := h.liveKitService.GenerateToken(lobby, playerID)
	if err != nil {
		log.Printf("hub: LiveKit token generation failed for lobby %s player %s: %v", lobby.Code, playerID, err)
		return ""
	}
	return token
}
