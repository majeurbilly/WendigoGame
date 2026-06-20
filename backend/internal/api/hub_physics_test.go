package api

import (
	"testing"

	"github.com/google/uuid"
	"github.com/majeurbilly/wendigogame/internal/models"
)

func TestHubUpdatePlayerPhysicsMarksDirtyAndSnapshots(t *testing.T) {
	hub := &Hub{
		physicsStateByLobby: make(map[string]map[uuid.UUID]*models.PlayerPhysicsState),
		physicsDirtyLobbies: make(map[string]struct{}),
	}

	lobbyCode := "ABCD"
	playerID := uuid.New()

	hub.updatePlayerPhysics(lobbyCode, playerID, 120.5, 340.25)

	hub.physicsStateMu.RLock()
	state := hub.physicsStateByLobby[lobbyCode][playerID]
	_, dirty := hub.physicsDirtyLobbies[lobbyCode]
	hub.physicsStateMu.RUnlock()

	if state == nil {
		t.Fatal("expected physics state to be created")
	}
	if state.X != 120.5 || state.Y != 340.25 {
		t.Fatalf("unexpected position: %+v", state)
	}
	if state.SkinID != models.DefaultPhysicsSkinID {
		t.Fatalf("expected default skin %q, got %q", models.DefaultPhysicsSkinID, state.SkinID)
	}
	if !dirty {
		t.Fatal("expected lobby to be marked dirty")
	}

	snapshot := hub.physicsSnapshot(lobbyCode)
	if len(snapshot) != 1 {
		t.Fatalf("expected one player in snapshot, got %d", len(snapshot))
	}
	if got := snapshot[playerID.String()]; got.X != 120.5 || got.Y != 340.25 {
		t.Fatalf("unexpected snapshot entry: %+v", got)
	}
}

func TestHubUpdatePlayerSkinPreservesPosition(t *testing.T) {
	hub := &Hub{
		physicsStateByLobby: make(map[string]map[uuid.UUID]*models.PlayerPhysicsState),
		physicsDirtyLobbies: make(map[string]struct{}),
	}

	lobbyCode := "WXYZ"
	playerID := uuid.New()
	hub.updatePlayerPhysics(lobbyCode, playerID, 10, 20)
	hub.updatePlayerSkin(lobbyCode, playerID, "red")

	hub.physicsStateMu.RLock()
	state := hub.physicsStateByLobby[lobbyCode][playerID]
	hub.physicsStateMu.RUnlock()

	if state.SkinID != "red" {
		t.Fatalf("expected skin red, got %q", state.SkinID)
	}
	if state.X != 10 || state.Y != 20 {
		t.Fatalf("position should be preserved: %+v", state)
	}
}

func TestHubRemovePhysicsPlayerClearsEmptyLobby(t *testing.T) {
	hub := &Hub{
		physicsStateByLobby: make(map[string]map[uuid.UUID]*models.PlayerPhysicsState),
		physicsDirtyLobbies: make(map[string]struct{}),
	}

	lobbyCode := "LOBB"
	playerID := uuid.New()
	hub.updatePlayerPhysics(lobbyCode, playerID, 1, 2)
	hub.removePhysicsPlayer(lobbyCode, playerID)

	hub.physicsStateMu.RLock()
	_, hasLobby := hub.physicsStateByLobby[lobbyCode]
	_, dirty := hub.physicsDirtyLobbies[lobbyCode]
	hub.physicsStateMu.RUnlock()

	if hasLobby {
		t.Fatal("expected lobby physics map to be removed")
	}
	if dirty {
		t.Fatal("expected dirty flag to be cleared for empty lobby")
	}
}

func TestParsePlayerUUID(t *testing.T) {
	id := uuid.New()
	parsed, ok := parsePlayerUUID(id.String())
	if !ok || parsed != id {
		t.Fatalf("parsePlayerUUID failed for %s", id)
	}
	if _, ok := parsePlayerUUID("not-a-uuid"); ok {
		t.Fatal("expected invalid uuid to fail parsing")
	}
}
