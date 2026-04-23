package api

import (
	"context"
	"errors"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/majeurbilly/wendigogame/internal/models"
	"github.com/majeurbilly/wendigogame/internal/store"
)

type websocketSession struct {
	lobbyCode string
	playerID  string
}

type Hub struct {
	hubMutex               sync.RWMutex
	connectionsByLobbyCode map[string]map[*websocket.Conn]struct{}
	sessionByConnection    map[*websocket.Conn]websocketSession
	lobbyStore             *store.Store
}

func NewHub(lobbyStore *store.Store) *Hub {
	return &Hub{
		connectionsByLobbyCode: make(map[string]map[*websocket.Conn]struct{}),
		sessionByConnection:    make(map[*websocket.Conn]websocketSession),
		lobbyStore:             lobbyStore,
	}
}

// Broadcast envoie un message JSON à toutes les connexions WebSocket du lobby (copie des connexions sous verrou de lecture).
func (h *Hub) Broadcast(code string, messageType string, payload any) {
	if h == nil {
		return
	}
	msg := models.WSMessage{Type: messageType, Payload: payload}
	h.hubMutex.RLock()
	connSet, ok := h.connectionsByLobbyCode[code]
	if !ok || len(connSet) == 0 {
		h.hubMutex.RUnlock()
		return
	}
	conns := make([]*websocket.Conn, 0, len(connSet))
	for c := range connSet {
		conns = append(conns, c)
	}
	h.hubMutex.RUnlock()

	for _, c := range conns {
		if err := c.WriteJSON(msg); err != nil {
			log.Printf("hub: WriteJSON(%s): %v", messageType, err)
		}
	}
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
		h.Broadcast(session.lobbyCode, models.MessageTypeLobbySync, lobby)
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
		http.Error(responseWriter, "configuration serveur invalide", http.StatusServiceUnavailable)
		return
	}
	if request.Method != http.MethodGet {
		http.Error(responseWriter, "méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	codeRaw := request.URL.Query().Get("code")
	playerName := strings.TrimSpace(request.URL.Query().Get("name"))
	lobbyCode, isValidCode := normalizeLobbyCode(codeRaw)
	if !isValidCode {
		http.Error(responseWriter, "paramètre code invalide (4 lettres A–Z)", http.StatusBadRequest)
		return
	}
	if playerName == "" {
		http.Error(responseWriter, "paramètre name requis", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(request.Context(), 5*time.Second)
	defer cancel()
	existingLobby, err := serverConfig.Store.GetLobby(ctx, lobbyCode)
	if err != nil {
		if err == store.ErrLobbyNotFound {
			http.Error(responseWriter, "lobby introuvable", http.StatusNotFound)
			return
		}
		http.Error(responseWriter, "erreur lecture lobby", http.StatusInternalServerError)
		return
	}

	playerIDClaim := strings.TrimSpace(request.URL.Query().Get("player_id"))
	bindExistingHost := false
	if playerIDClaim != "" {
		var hostPlayer *models.Player
		for i := range existingLobby.Players {
			p := &existingLobby.Players[i]
			if p.ID == playerIDClaim && p.IsHost {
				hostPlayer = p
				break
			}
		}
		if hostPlayer == nil {
			http.Error(responseWriter, "player_id ne correspond pas à l'hôte du lobby", http.StatusForbidden)
			return
		}
		if strings.TrimSpace(playerName) != strings.TrimSpace(hostPlayer.Name) {
			http.Error(responseWriter, "le nom ne correspond pas à l'hôte du lobby", http.StatusForbidden)
			return
		}
		bindExistingHost = true
	}

	websocketConn, err := websocketUpgrader.Upgrade(responseWriter, request, nil)
	if err != nil {
		log.Printf("websocket upgrade: %v", err)
		var handshakeErr websocket.HandshakeError
		if errors.As(err, &handshakeErr) {
			return
		}
		http.Error(responseWriter, "échec de la négociation WebSocket: "+err.Error(), http.StatusBadRequest)
		return
	}

	var playerID string
	if bindExistingHost {
		playerID = playerIDClaim
	} else {
		player := models.Player{
			ID:     uuid.NewString(),
			Name:   playerName,
			IsHost: false,
		}
		appendCtx, cancelAppend := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancelAppend()
		if _, err := serverConfig.Store.AppendPlayer(appendCtx, lobbyCode, player); err != nil {
			log.Printf("append player: %v", err)
			_ = websocketConn.Close()
			return
		}
		playerID = player.ID
	}

	serverConfig.Hub.Register(lobbyCode, websocketConn, playerID)
	syncCtx, cancelSync := context.WithTimeout(context.Background(), 5*time.Second)
	if lobbyAfterJoin, syncErr := serverConfig.Store.GetLobby(syncCtx, lobbyCode); syncErr == nil {
		serverConfig.Hub.Broadcast(lobbyCode, models.MessageTypeLobbySync, lobbyAfterJoin)
	} else {
		log.Printf("hub: GetLobby après connexion WS (%s): %v", lobbyCode, syncErr)
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
		_, _, err := websocketConn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("websocket read: %v", err)
			}
			break
		}
	}
}
