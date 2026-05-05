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

// liveKitCachedToken avoids regenerating JWTs on every GAME_TICK (each mint has a new iat),
// which forced clients to reconnect LiveKit every second.
type liveKitCachedToken struct {
	token   string
	phase   models.GamePhase
	isAlive bool
}

type Hub struct {
	hubMutex               sync.RWMutex
	broadcastMu            sync.Mutex // Serializes WriteJSON (gorilla/websocket is not concurrent-safe for writes).
	liveKitCacheMu         sync.Mutex // liveKitCache only; never take hubMutex while holding broadcastMu (see Unregister vs BroadcastState).
	connectionsByLobbyCode map[string]map[*websocket.Conn]struct{}
	sessionByConnection    map[*websocket.Conn]websocketSession
	liveKitCache           map[string]liveKitCachedToken // key: lobbyCode|playerID
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
		liveKitCache:           make(map[string]liveKitCachedToken),
		lobbyStore:             lobbyStore,
		liveKitService:         liveKitService,
	}
}

func liveKitCacheKey(lobbyCode, playerID string) string {
	return strings.ToUpper(strings.TrimSpace(lobbyCode)) + "|" + strings.TrimSpace(playerID)
}

func (h *Hub) evictLiveKitCache(lobbyCode, playerID string) {
	if h == nil {
		return
	}
	k := liveKitCacheKey(lobbyCode, playerID)
	h.liveKitCacheMu.Lock()
	delete(h.liveKitCache, k)
	h.liveKitCacheMu.Unlock()
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

	h.evictLiveKitCache(session.lobbyCode, session.playerID)
	// Do not RemovePlayerByID here: a tab refresh closes the socket but the player should stay
	// in the lobby (roles preserved). Explicit leave uses LEAVE_LOBBY before disconnect.
}

var websocketUpgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(request *http.Request) bool {
		origin := strings.TrimSpace(request.Header.Get("Origin"))
		if origin == "" {
			return true
		}
		return isAllowedOrigin(origin)
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

// getLobbyWithShortRetry handles read-your-writes skew: POST /lobbies commits on the primary while
// the next GET /ws may hit a lagging replica, or the browser opens /ws in the same millisecond window.
// Short polling (5 × 100ms) before rejecting the handshake absorbs that micro-latency.
func getLobbyWithShortRetry(ctx context.Context, st *store.Store, lobbyCode string) (*models.Lobby, error) {
	const maxAttempts = 5
	const retryInterval = 100 * time.Millisecond
	var lastErr error
	for attempt := 0; attempt < maxAttempts; attempt++ {
		if attempt > 0 {
			t := time.NewTimer(retryInterval)
			select {
			case <-ctx.Done():
				t.Stop()
				return nil, ctx.Err()
			case <-t.C:
			}
		}
		lobby, err := st.GetLobby(ctx, lobbyCode)
		if err == nil {
			return lobby, nil
		}
		if !errors.Is(err, store.ErrLobbyNotFound) {
			return nil, err
		}
		lastErr = err
	}
	return nil, lastErr
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
	lobbyCode, isValidCode := normalizeLobbyCode(codeRaw)
	if !isValidCode {
		http.Error(responseWriter, "invalid code parameter (4 letters A-Z)", http.StatusBadRequest)
		return
	}

	log.Printf("Tentative WS pour le code: %s", lobbyCode)

	ctx, cancel := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancel()

	token := strings.TrimSpace(request.URL.Query().Get("token"))
	playerName := strings.TrimSpace(request.URL.Query().Get("name"))

	var (
		authUserID    uuid.UUID
		useJWTAuth    bool
		playerIDClaim string
		err           error
	)

	if token != "" {
		useJWTAuth = true
		authUserID, err = auth.ValidateToken(token)
		if err != nil {
			log.Printf("Erreur WS: token JWT invalide pour lobby %s: %v", lobbyCode, err)
			http.Error(responseWriter, "invalid or expired token", http.StatusUnauthorized)
			return
		}
		if playerName == "" && serverConfig.UserStore != nil {
			if u, userErr := serverConfig.UserStore.GetUserByID(ctx, authUserID); userErr == nil && u != nil {
				playerName = strings.TrimSpace(u.Username)
			} else if userErr != nil {
				log.Printf("Erreur WS: impossible de charger le profil utilisateur (lobby %s): %v", lobbyCode, userErr)
			}
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

	if playerName == "" {
		log.Printf("Erreur WS: param name manquant pour lobby %s (fournir ?name= ou un JWT avec profil utilisateur)", lobbyCode)
		http.Error(responseWriter, "missing required name parameter", http.StatusBadRequest)
		return
	}

	existingLobby, err := getLobbyWithShortRetry(ctx, serverConfig.Store, lobbyCode)
	if err != nil {
		if errors.Is(err, store.ErrLobbyNotFound) {
			log.Printf("WS Error: Lobby %s not found in store after polling (connection rejected)", lobbyCode)
			http.Error(responseWriter, "lobby not found", http.StatusNotFound)
			return
		}
		log.Printf("Erreur WS: lecture lobby %s: %v", lobbyCode, err)
		http.Error(responseWriter, "lobby read error", http.StatusInternalServerError)
		return
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
	for attempt := 0; attempt < 3; attempt++ {
		if attempt > 0 {
			time.Sleep(40 * time.Millisecond)
		}
		syncCtx, cancelSync := context.WithTimeout(context.Background(), 5*time.Second)
		syncErr := serverConfig.Hub.SyncLobbyConnections(syncCtx, serverConfig.Store, lobbyCode)
		cancelSync()
		if syncErr == nil {
			break
		}
		log.Printf("hub: SyncLobbyConnections after WS connect (%s) attempt %d: %v", lobbyCode, attempt+1, syncErr)
	}

	defer func() {
		serverConfig.Hub.Unregister(websocketConn)
		_ = websocketConn.Close()
	}()

	const pongWait = 60 * time.Second
	const pingPeriod = 50 * time.Second // must stay < pongWait so Pong arrives before read deadline

	_ = websocketConn.SetReadDeadline(time.Now().Add(pongWait))
	websocketConn.SetPongHandler(func(string) error {
		_ = websocketConn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	go func() {
		ticker := time.NewTicker(pingPeriod)
		defer ticker.Stop()
		for range ticker.C {
			if err := websocketConn.WriteControl(websocket.PingMessage, nil, time.Now().Add(5*time.Second)); err != nil {
				return
			}
		}
	}()

	for {
		_, payloadBytes, err := websocketConn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("websocket read: %v", err)
			}
			break
		}
		_ = websocketConn.SetReadDeadline(time.Now().Add(pongWait))
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
		var claimSeatBody struct {
			ChairID int `json:"chair_id"`
		}
		var phaseSettingsBody models.PhaseSettings
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
				errMsg := "unable to record vote"
				switch {
				case errors.Is(voteErr, store.ErrWrongPhase):
					errMsg = "votes are only allowed during the council vote phase"
				case errors.Is(voteErr, store.ErrVoteInvalid):
					errMsg = "invalid vote"
				case errors.Is(voteErr, store.ErrExcludedFromCouncil):
					errMsg = "excluded from council: cannot vote"
				case errors.Is(voteErr, store.ErrLobbyNotFound):
					errMsg = "lobby not found"
				}
				_ = websocketConn.WriteJSON(models.WSMessage{
					Type:    models.MessageTypeError,
					Payload: map[string]string{"message": errMsg},
				})
				continue
			}
		case models.MessageTypeWendigoIntent:
			if err := json.Unmarshal(inbound.Payload, &voteBody); err != nil {
				log.Printf("websocket: invalid WENDIGO_INTENT payload: %v", err)
				continue
			}
			intentCtx, intentCancel := context.WithTimeout(context.Background(), 5*time.Second)
			intentErr := serverConfig.Store.SubmitWendigoIntent(intentCtx, lobbyCode, playerID, voteBody.TargetID)
			intentCancel()
			if intentErr != nil {
				log.Printf("websocket: SubmitWendigoIntent(%s, %s): %v", lobbyCode, playerID, intentErr)
				errMsg := "unable to update intent"
				switch {
				case errors.Is(intentErr, store.ErrWrongPhase):
					errMsg = "intents are only allowed during the night phase"
				case errors.Is(intentErr, store.ErrNightActionInvalid):
					errMsg = "invalid wendigo intent"
				case errors.Is(intentErr, store.ErrLobbyNotFound):
					errMsg = "lobby not found"
				}
				_ = websocketConn.WriteJSON(models.WSMessage{
					Type:    models.MessageTypeError,
					Payload: map[string]string{"message": errMsg},
				})
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
		case models.MessageTypeSubmitPrayer:
			if err := json.Unmarshal(inbound.Payload, &voteBody); err != nil {
				log.Printf("websocket: invalid SUBMIT_PRAYER payload: %v", err)
				continue
			}
			prayerCtx, prayerCancel := context.WithTimeout(context.Background(), 5*time.Second)
			prayerErr := serverConfig.Store.SubmitPrayer(prayerCtx, lobbyCode, playerID, voteBody.TargetID)
			prayerCancel()
			if prayerErr != nil {
				log.Printf("websocket: SubmitPrayer(%s, %s): %v", lobbyCode, playerID, prayerErr)
				errMsg := "unable to submit prayer"
				switch {
				case errors.Is(prayerErr, store.ErrWrongPhase):
					errMsg = "prayers are only allowed during the night phase"
				case errors.Is(prayerErr, store.ErrVoteInvalid):
					errMsg = "invalid prayer target"
				case errors.Is(prayerErr, store.ErrLobbyNotFound):
					errMsg = "lobby not found"
				}
				_ = websocketConn.WriteJSON(models.WSMessage{
					Type:    models.MessageTypeError,
					Payload: map[string]string{"message": errMsg},
				})
				continue
			}
		case models.MessageTypeUpdatePhaseSettings:
			if err := json.Unmarshal(inbound.Payload, &phaseSettingsBody); err != nil {
				log.Printf("websocket: invalid UPDATE_PHASE_SETTINGS payload: %v", err)
				continue
			}
			settingsCtx, settingsCancel := context.WithTimeout(context.Background(), 5*time.Second)
			settingsErr := serverConfig.Store.UpdatePhaseSettings(settingsCtx, lobbyCode, playerID, phaseSettingsBody)
			settingsCancel()
			if settingsErr != nil {
				log.Printf("websocket: UpdatePhaseSettings(%s, %s): %v", lobbyCode, playerID, settingsErr)
				errMsg := "unable to update settings"
				switch {
				case errors.Is(settingsErr, store.ErrUnauthorized):
					errMsg = "only the host can change phase settings"
				case errors.Is(settingsErr, store.ErrGameAlreadyStarted):
					errMsg = "settings can only be changed before the game starts"
				case errors.Is(settingsErr, store.ErrLobbyNotFound):
					errMsg = "lobby not found"
				}
				_ = websocketConn.WriteJSON(models.WSMessage{
					Type:    models.MessageTypeError,
					Payload: map[string]string{"message": errMsg},
				})
				continue
			}
		case models.MessageTypeStartGame:
			startCtx, startCancel := context.WithTimeout(context.Background(), 5*time.Second)
			startErr := serverConfig.Store.StartGame(startCtx, lobbyCode, playerID)
			startCancel()
			if startErr != nil {
				log.Printf("websocket: StartGame(%s, %s): %v", lobbyCode, playerID, startErr)
				errMsg := "unable to start the game"
				switch {
				case errors.Is(startErr, store.ErrUnauthorized):
					errMsg = "only the host can start the game"
				case errors.Is(startErr, store.ErrGameAlreadyStarted):
					errMsg = "game already started"
				case errors.Is(startErr, store.ErrLobbyNotFound):
					errMsg = "lobby not found"
				}
				_ = websocketConn.WriteJSON(models.WSMessage{
					Type:    models.MessageTypeError,
					Payload: map[string]string{"message": errMsg},
				})
				continue
			}
			gmCtx, gmCancel := context.WithTimeout(context.Background(), 5*time.Second)
			lobbyMgr, getErr := serverConfig.Store.GetLobbyManager(gmCtx, lobbyCode)
			gmCancel()
			if getErr != nil {
				log.Printf("websocket: GetLobbyManager after START_GAME (%s): %v", lobbyCode, getErr)
				continue
			}
			StartGameLoop(context.Background(), serverConfig.Store, serverConfig.Hub, lobbyMgr)
			syncLobbyCtx, syncLobbyCancel := context.WithTimeout(context.Background(), 5*time.Second)
			if syncErr := serverConfig.Hub.SyncLobbyConnections(syncLobbyCtx, serverConfig.Store, lobbyCode); syncErr != nil {
				log.Printf("websocket: SyncLobbyConnections after START_GAME (%s): %v", lobbyCode, syncErr)
			}
			syncLobbyCancel()
			continue
		case models.MessageTypeAccuse:
			if err := json.Unmarshal(inbound.Payload, &voteBody); err != nil {
				log.Printf("websocket: invalid ACCUSE payload: %v", err)
				continue
			}
			accuseCtx, accuseCancel := context.WithTimeout(context.Background(), 5*time.Second)
			accuseErr := serverConfig.Store.SubmitCouncilAccusation(accuseCtx, lobbyCode, playerID, voteBody.TargetID)
			accuseCancel()
			if accuseErr != nil {
				log.Printf("websocket: SubmitCouncilAccusation(%s, %s): %v", lobbyCode, playerID, accuseErr)
				errMsg := "unable to record accusation"
				switch {
				case errors.Is(accuseErr, store.ErrWrongPhase):
					errMsg = "accusations are only allowed during the accusation phase"
				case errors.Is(accuseErr, store.ErrVoteInvalid):
					errMsg = "invalid accusation target"
				case errors.Is(accuseErr, store.ErrAlreadyAccused):
					errMsg = "you have already accused someone this round"
				case errors.Is(accuseErr, store.ErrTargetAlreadyAccused):
					errMsg = "target already accused"
				case errors.Is(accuseErr, store.ErrLobbyNotFound):
					errMsg = "lobby not found"
				}
				_ = websocketConn.WriteJSON(models.WSMessage{
					Type:    models.MessageTypeError,
					Payload: map[string]string{"message": errMsg},
				})
				continue
			}
		case models.MessageTypeStartPleading:
			pleadingCtx, pleadingCancel := context.WithTimeout(context.Background(), 5*time.Second)
			pleadingErr := serverConfig.Store.StartPleading(pleadingCtx, lobbyCode, playerID)
			pleadingCancel()
			if pleadingErr != nil {
				log.Printf("websocket: StartPleading(%s, %s): %v", lobbyCode, playerID, pleadingErr)
				errMsg := "unable to start pleading"
				switch {
				case errors.Is(pleadingErr, store.ErrWrongPhase):
					errMsg = "you cannot start pleading right now"
				case errors.Is(pleadingErr, store.ErrUnauthorized):
					errMsg = "only the current speaker can start their pleading timer"
				case errors.Is(pleadingErr, store.ErrLobbyNotFound):
					errMsg = "lobby not found"
				}
				_ = websocketConn.WriteJSON(models.WSMessage{
					Type:    models.MessageTypeError,
					Payload: map[string]string{"message": errMsg},
				})
				continue
			}
		case models.MessageTypeClaimSeat:
			if err := json.Unmarshal(inbound.Payload, &claimSeatBody); err != nil {
				log.Printf("websocket: invalid CLAIM_SEAT payload: %v", err)
				continue
			}
			seatCtx, seatCancel := context.WithTimeout(context.Background(), 5*time.Second)
			seatErr := serverConfig.Store.SelectSeat(seatCtx, lobbyCode, playerID, claimSeatBody.ChairID)
			seatCancel()
			if seatErr != nil {
				log.Printf("websocket: SelectSeat(%s, %s): %v", lobbyCode, playerID, seatErr)
				continue
			}
		case models.MessageTypeLeaveLobby:
			if serverConfig.Store == nil {
				return
			}
			leaveCtx, leaveCancel := context.WithTimeout(context.Background(), 5*time.Second)
			leaveErr := serverConfig.Store.RemovePlayerByID(leaveCtx, lobbyCode, playerID)
			leaveCancel()
			if leaveErr != nil {
				log.Printf("websocket: LEAVE_LOBBY RemovePlayerByID(%s, %s): %v", lobbyCode, playerID, leaveErr)
			}
			if serverConfig.Hub != nil {
				syncLeaveCtx, leaveSyncCancel := context.WithTimeout(context.Background(), 5*time.Second)
				if syncErr := serverConfig.Hub.SyncLobbyConnections(syncLeaveCtx, serverConfig.Store, lobbyCode); syncErr != nil {
					log.Printf("websocket: SyncLobbyConnections after LEAVE_LOBBY (%s): %v", lobbyCode, syncErr)
				}
				leaveSyncCancel()
			}
			return
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

// SyncLobbyConnections sends either a shared LOBBY_SYNC (pregame only, no secret roles)
// or a per-connection GAME_TICK with redacted roles.
func (h *Hub) SyncLobbyConnections(ctx context.Context, gameTickProvider GameTickProvider, code string) error {
	if h == nil || gameTickProvider == nil {
		return nil
	}
	lobby, err := gameTickProvider.GetLobby(ctx, code)
	if err != nil {
		return err
	}
	if lobby.SafeForFullLobbySync() {
		return h.Broadcast(code, models.MessageTypeLobbySync, lobby)
	}
	return h.BroadcastState(ctx, gameTickProvider, code)
}

func (h *Hub) generateLiveKitToken(lobby *models.Lobby, playerID string) string {
	if h == nil || h.liveKitService == nil || lobby == nil {
		return ""
	}
	playerID = strings.TrimSpace(playerID)
	if playerID == "" {
		log.Printf("hub: LiveKit skip: empty playerID after trim (lobby=%s phase=%s)", lobby.Code, lobby.Phase)
		return ""
	}

	var currentPlayer *models.Player
	for i := range lobby.Players {
		if lobby.Players[i].ID.String() == playerID {
			currentPlayer = &lobby.Players[i]
			break
		}
	}
	if currentPlayer == nil {
		log.Printf("hub: LiveKit skip: player %s not in lobby %s (players=%d phase=%s)", playerID, lobby.Code, len(lobby.Players), lobby.Phase)
		return ""
	}

	cacheKey := liveKitCacheKey(lobby.Code, playerID)
	h.liveKitCacheMu.Lock()
	if cached, ok := h.liveKitCache[cacheKey]; ok {
		if cached.phase == lobby.Phase && cached.isAlive == currentPlayer.IsAlive {
			tok := cached.token
			h.liveKitCacheMu.Unlock()
			return tok
		}
	}
	h.liveKitCacheMu.Unlock()

	token, err := h.liveKitService.GenerateToken(lobby, playerID)
	if err != nil {
		log.Printf("hub: LiveKit token generation failed for lobby %s player %s phase=%s: %v", lobby.Code, playerID, lobby.Phase, err)
		return ""
	}

	h.liveKitCacheMu.Lock()
	h.liveKitCache[cacheKey] = liveKitCachedToken{
		token:   token,
		phase:   lobby.Phase,
		isAlive: currentPlayer.IsAlive,
	}
	h.liveKitCacheMu.Unlock()

	log.Printf("hub: LiveKit mint lobby=%s player=%s phase=%s alive=%v token_len=%d", lobby.Code, playerID, lobby.Phase, currentPlayer.IsAlive, len(token))
	return token
}
