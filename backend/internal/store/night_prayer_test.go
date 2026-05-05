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

func TestSubmitPrayer_AllowsAliveSelfOrOther(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })

	st := store.NewForTesting(redisClient)
	ctx := context.Background()

	lobby, err := st.CreateLobby(ctx, models.GameModeLocal, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	guest := models.Player{ID: uuid.New(), Name: "Guest", IsHost: false, IsAlive: true, ChairID: 1}
	if _, err := st.AppendPlayer(ctx, lobby.Code, guest); err != nil {
		t.Fatalf("AppendPlayer: %v", err)
	}
	lobby, err = st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}
	lobby.Phase = models.GamePhaseNight
	if err := st.SaveLobby(ctx, lobby); err != nil {
		t.Fatalf("SaveLobby: %v", err)
	}

	hostID := lobby.Players[0].ID.String()
	guestID := lobby.Players[1].ID.String()
	if err := st.SubmitPrayer(ctx, lobby.Code, hostID, hostID); err != nil {
		t.Fatalf("SubmitPrayer self: %v", err)
	}
	if err := st.SubmitPrayer(ctx, lobby.Code, guestID, hostID); err != nil {
		t.Fatalf("SubmitPrayer other: %v", err)
	}

	got, err := st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby after prayer: %v", err)
	}
	if got.Prayers[hostID] != hostID {
		t.Fatalf("host prayer: got %q want %q", got.Prayers[hostID], hostID)
	}
	if got.Prayers[guestID] != hostID {
		t.Fatalf("guest prayer: got %q want %q", got.Prayers[guestID], hostID)
	}
}

func TestSubmitPrayer_RejectsInvalidTarget(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })

	st := store.NewForTesting(redisClient)
	ctx := context.Background()

	lobby, err := st.CreateLobby(ctx, models.GameModeLocal, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	lobby.Phase = models.GamePhaseNight
	if err := st.SaveLobby(ctx, lobby); err != nil {
		t.Fatalf("SaveLobby: %v", err)
	}
	hostID := lobby.Players[0].ID.String()
	err = st.SubmitPrayer(ctx, lobby.Code, hostID, uuid.New().String())
	if !errors.Is(err, store.ErrVoteInvalid) {
		t.Fatalf("error: got %v want ErrVoteInvalid", err)
	}
}
