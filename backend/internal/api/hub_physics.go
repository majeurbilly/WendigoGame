package api

import (
	"log"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/majeurbilly/wendigogame/internal/models"
)

func (h *Hub) runPhysicsTicker() {
	if h == nil {
		return
	}
	ticker := time.NewTicker(physicsTickInterval)
	defer ticker.Stop()
	for range ticker.C {
		h.broadcastDirtyPhysics()
	}
}

func (h *Hub) ensurePhysicsPlayerLocked(lobbyCode string, playerID uuid.UUID) *models.PlayerPhysicsState {
	players, ok := h.physicsStateByLobby[lobbyCode]
	if !ok {
		players = make(map[uuid.UUID]*models.PlayerPhysicsState)
		h.physicsStateByLobby[lobbyCode] = players
	}
	state, ok := players[playerID]
	if !ok {
		state = &models.PlayerPhysicsState{SkinID: models.DefaultPhysicsSkinID}
		players[playerID] = state
	}
	return state
}

func (h *Hub) markPhysicsDirtyLocked(lobbyCode string) {
	h.physicsDirtyLobbies[lobbyCode] = struct{}{}
}

func (h *Hub) updatePlayerPhysics(lobbyCode string, playerID uuid.UUID, x, y float64) {
	h.physicsStateMu.Lock()
	state := h.ensurePhysicsPlayerLocked(lobbyCode, playerID)
	state.X = x
	state.Y = y
	h.markPhysicsDirtyLocked(lobbyCode)
	h.physicsStateMu.Unlock()
}

func (h *Hub) updatePlayerSkin(lobbyCode string, playerID uuid.UUID, skinID string) {
	skinID = strings.TrimSpace(skinID)
	if skinID == "" {
		return
	}
	h.physicsStateMu.Lock()
	state := h.ensurePhysicsPlayerLocked(lobbyCode, playerID)
	state.SkinID = skinID
	h.markPhysicsDirtyLocked(lobbyCode)
	h.physicsStateMu.Unlock()
}

func (h *Hub) removePhysicsPlayer(lobbyCode string, playerID uuid.UUID) {
	h.physicsStateMu.Lock()
	defer h.physicsStateMu.Unlock()
	players, ok := h.physicsStateByLobby[lobbyCode]
	if !ok {
		return
	}
	delete(players, playerID)
	if len(players) == 0 {
		delete(h.physicsStateByLobby, lobbyCode)
		delete(h.physicsDirtyLobbies, lobbyCode)
		return
	}
	h.markPhysicsDirtyLocked(lobbyCode)
}

func (h *Hub) clearLobbyPhysics(lobbyCode string) {
	h.physicsStateMu.Lock()
	delete(h.physicsStateByLobby, lobbyCode)
	delete(h.physicsDirtyLobbies, lobbyCode)
	h.physicsStateMu.Unlock()
}

func (h *Hub) physicsSnapshot(lobbyCode string) map[string]models.PlayerPhysicsState {
	players, ok := h.physicsStateByLobby[lobbyCode]
	if !ok || len(players) == 0 {
		return nil
	}
	snapshot := make(map[string]models.PlayerPhysicsState, len(players))
	for playerID, state := range players {
		if state == nil {
			continue
		}
		snapshot[playerID.String()] = *state
	}
	return snapshot
}

func (h *Hub) broadcastDirtyPhysics() {
	if h == nil {
		return
	}

	h.physicsStateMu.Lock()
	if len(h.physicsDirtyLobbies) == 0 {
		h.physicsStateMu.Unlock()
		return
	}

	type physicsBroadcast struct {
		lobbyCode string
		payload   map[string]models.PlayerPhysicsState
	}
	pending := make([]physicsBroadcast, 0, len(h.physicsDirtyLobbies))
	for lobbyCode := range h.physicsDirtyLobbies {
		snapshot := h.physicsSnapshot(lobbyCode)
		if len(snapshot) == 0 {
			delete(h.physicsDirtyLobbies, lobbyCode)
			continue
		}
		pending = append(pending, physicsBroadcast{
			lobbyCode: lobbyCode,
			payload:   snapshot,
		})
		delete(h.physicsDirtyLobbies, lobbyCode)
	}
	h.physicsStateMu.Unlock()

	for _, item := range pending {
		if err := h.Broadcast(item.lobbyCode, models.MessageTypePhysicsTick, item.payload); err != nil {
			log.Printf("hub: PHYSICS_TICK broadcast (%s): %v", item.lobbyCode, err)
		}
	}
}

func parsePlayerUUID(playerID string) (uuid.UUID, bool) {
	parsed, err := uuid.Parse(strings.TrimSpace(playerID))
	if err != nil {
		return uuid.Nil, false
	}
	return parsed, true
}
