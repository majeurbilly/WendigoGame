package store_test

import (
	"context"
	"errors"
	"testing"

	"github.com/alicebob/miniredis/v2"
	"github.com/google/uuid"
	"github.com/majeurbilly/wendigogame/internal/models"
	"github.com/majeurbilly/wendigogame/internal/store"
	"github.com/redis/go-redis/v9"
)

func TestSubmitCouncilAccusation_OK(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })

	st := store.NewForTesting(redisClient)
	ctx := context.Background()

	lobby, err := st.CreateLobby(ctx, models.GameModeLocal, "A")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	b := models.Player{ID: uuid.New(), Name: "B", IsHost: false, IsAlive: true, ChairID: 1}
	if _, err := st.AppendPlayer(ctx, lobby.Code, b); err != nil {
		t.Fatalf("AppendPlayer: %v", err)
	}
	lobby, err = st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}
	lobby.Phase = models.GamePhaseAccusation
	lobby.Players[0].ChairID = 0
	lobby.Players[1].ChairID = 1
	if err := st.SaveLobby(ctx, lobby); err != nil {
		t.Fatalf("SaveLobby: %v", err)
	}

	accuser := lobby.Players[0].ID.String()
	target := lobby.Players[1].ID.String()
	if err := st.SubmitCouncilAccusation(ctx, lobby.Code, accuser, target); err != nil {
		t.Fatalf("SubmitCouncilAccusation: %v", err)
	}

	got, err := st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}
	if got.CouncilAccusations[accuser] != target {
		t.Fatalf("council map: %+v", got.CouncilAccusations)
	}
}

func TestSubmitCouncilAccusation_ErrAlreadyAccused(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })

	st := store.NewForTesting(redisClient)
	ctx := context.Background()

	lobby, err := st.CreateLobby(ctx, models.GameModeLocal, "A")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	b := models.Player{ID: uuid.New(), Name: "B", IsHost: false, IsAlive: true, ChairID: 1}
	c := models.Player{ID: uuid.New(), Name: "C", IsHost: false, IsAlive: true, ChairID: 2}
	if _, err := st.AppendPlayer(ctx, lobby.Code, b); err != nil {
		t.Fatalf("AppendPlayer B: %v", err)
	}
	if _, err := st.AppendPlayer(ctx, lobby.Code, c); err != nil {
		t.Fatalf("AppendPlayer C: %v", err)
	}
	lobby, err = st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}
	lobby.Phase = models.GamePhaseAccusation
	for i := range lobby.Players {
		lobby.Players[i].ChairID = i
	}
	if err := st.SaveLobby(ctx, lobby); err != nil {
		t.Fatalf("SaveLobby: %v", err)
	}

	accuser := lobby.Players[0].ID.String()
	if err := st.SubmitCouncilAccusation(ctx, lobby.Code, accuser, lobby.Players[1].ID.String()); err != nil {
		t.Fatalf("first accusation: %v", err)
	}
	if err := st.SubmitCouncilAccusation(ctx, lobby.Code, accuser, lobby.Players[2].ID.String()); err == nil {
		t.Fatal("expected ErrAlreadyAccused")
	} else if !errors.Is(err, store.ErrAlreadyAccused) {
		t.Fatalf("error: %v", err)
	}
}

func TestSubmitCouncilAccusation_ErrTargetAlreadyAccused(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })

	st := store.NewForTesting(redisClient)
	ctx := context.Background()

	lobby, err := st.CreateLobby(ctx, models.GameModeLocal, "A")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	b := models.Player{ID: uuid.New(), Name: "B", IsHost: false, IsAlive: true, ChairID: 1}
	c := models.Player{ID: uuid.New(), Name: "C", IsHost: false, IsAlive: true, ChairID: 2}
	if _, err := st.AppendPlayer(ctx, lobby.Code, b); err != nil {
		t.Fatalf("AppendPlayer B: %v", err)
	}
	if _, err := st.AppendPlayer(ctx, lobby.Code, c); err != nil {
		t.Fatalf("AppendPlayer C: %v", err)
	}
	lobby, err = st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}
	lobby.Phase = models.GamePhaseAccusation
	for i := range lobby.Players {
		lobby.Players[i].ChairID = i
	}
	if err := st.SaveLobby(ctx, lobby); err != nil {
		t.Fatalf("SaveLobby: %v", err)
	}

	target := lobby.Players[2].ID.String()
	if err := st.SubmitCouncilAccusation(ctx, lobby.Code, lobby.Players[0].ID.String(), target); err != nil {
		t.Fatalf("first: %v", err)
	}
	if err := st.SubmitCouncilAccusation(ctx, lobby.Code, lobby.Players[1].ID.String(), target); err == nil {
		t.Fatal("expected ErrTargetAlreadyAccused")
	} else if !errors.Is(err, store.ErrTargetAlreadyAccused) {
		t.Fatalf("error: %v", err)
	}
}
