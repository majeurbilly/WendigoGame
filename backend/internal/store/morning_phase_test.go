package store_test

import (
	"context"
	"testing"

	"github.com/alicebob/miniredis/v2"
	"github.com/google/uuid"
	"github.com/majeurbilly/wendigogame/internal/models"
	"github.com/majeurbilly/wendigogame/internal/store"
	"github.com/redis/go-redis/v9"
)

func TestProcessGameTick_NightTransitionsToMorning_KillRecorded(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })

	st := store.NewForTesting(redisClient)
	ctx := context.Background()

	lobby, err := st.CreateLobby(ctx, models.GameModeLocal, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	v1 := models.Player{ID: uuid.New(), Name: "V1", IsHost: false, IsAlive: true, ChairID: 1, Role: "VILLAGER"}
	v2 := models.Player{ID: uuid.New(), Name: "V2", IsHost: false, IsAlive: true, ChairID: 2, Role: "VILLAGER"}
	if _, err := st.AppendPlayer(ctx, lobby.Code, v1); err != nil {
		t.Fatalf("AppendPlayer v1: %v", err)
	}
	if _, err := st.AppendPlayer(ctx, lobby.Code, v2); err != nil {
		t.Fatalf("AppendPlayer v2: %v", err)
	}
	lobby, err = st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}

	lobby.Players[0].Role = "WENDIGO"
	wendigoID := lobby.Players[0].ID.String()
	victimID := lobby.Players[1].ID.String()
	lobby.Phase = models.GamePhaseNight
	lobby.TimeRemaining = 0
	lobby.NightActions = map[string]string{wendigoID: victimID}
	lobby.Prayers = map[string]string{}
	if err := st.SaveLobby(ctx, lobby); err != nil {
		t.Fatalf("SaveLobby: %v", err)
	}

	if _, err := st.ProcessGameTick(ctx, lobby.Code); err != nil {
		t.Fatalf("ProcessGameTick: %v", err)
	}

	got, err := st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby after tick: %v", err)
	}
	if got.Phase != models.GamePhaseMorning {
		t.Fatalf("phase: got %q, want %q", got.Phase, models.GamePhaseMorning)
	}
	if got.TimeRemaining != models.DefaultPhaseSettings().MorningSeconds {
		t.Fatalf("morning timer: got %d, want %d", got.TimeRemaining, models.DefaultPhaseSettings().MorningSeconds)
	}
	if got.LastNightVictimID != victimID {
		t.Fatalf("LastNightVictimID: got %q, want %q", got.LastNightVictimID, victimID)
	}
	if got.LastNightSavedByPrayer {
		t.Fatal("LastNightSavedByPrayer: expected false")
	}
	if got.Players[1].IsAlive {
		t.Fatal("expected victim to be dead after night")
	}
}

func TestProcessGameTick_NightTransitionsToMorning_PrayerBlocksKill(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })

	st := store.NewForTesting(redisClient)
	ctx := context.Background()

	lobby, err := st.CreateLobby(ctx, models.GameModeLocal, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	v1 := models.Player{ID: uuid.New(), Name: "V1", IsHost: false, IsAlive: true, ChairID: 1, Role: "VILLAGER"}
	v2 := models.Player{ID: uuid.New(), Name: "V2", IsHost: false, IsAlive: true, ChairID: 2, Role: "VILLAGER"}
	if _, err := st.AppendPlayer(ctx, lobby.Code, v1); err != nil {
		t.Fatalf("AppendPlayer v1: %v", err)
	}
	if _, err := st.AppendPlayer(ctx, lobby.Code, v2); err != nil {
		t.Fatalf("AppendPlayer v2: %v", err)
	}
	lobby, err = st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}

	lobby.Players[0].Role = "WENDIGO"
	wendigoID := lobby.Players[0].ID.String()
	victimID := lobby.Players[1].ID.String()
	prayer1 := lobby.Players[1].ID.String()
	prayer2 := lobby.Players[2].ID.String()
	lobby.Phase = models.GamePhaseNight
	lobby.TimeRemaining = 0
	lobby.NightActions = map[string]string{wendigoID: victimID}
	lobby.Prayers = map[string]string{prayer1: victimID, prayer2: victimID}
	if err := st.SaveLobby(ctx, lobby); err != nil {
		t.Fatalf("SaveLobby: %v", err)
	}

	if _, err := st.ProcessGameTick(ctx, lobby.Code); err != nil {
		t.Fatalf("ProcessGameTick: %v", err)
	}

	got, err := st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby after tick: %v", err)
	}
	if got.Phase != models.GamePhaseMorning {
		t.Fatalf("phase: got %q, want %q", got.Phase, models.GamePhaseMorning)
	}
	if got.LastNightVictimID != "" {
		t.Fatalf("LastNightVictimID: got %q, want empty", got.LastNightVictimID)
	}
	if !got.LastNightSavedByPrayer {
		t.Fatal("LastNightSavedByPrayer: expected true")
	}
	if !got.Players[1].IsAlive {
		t.Fatal("expected victim to be alive (kill blocked by prayer)")
	}
}

func TestProcessGameTick_NightTransitionsToMorning_NoKill(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })

	st := store.NewForTesting(redisClient)
	ctx := context.Background()

	lobby, err := st.CreateLobby(ctx, models.GameModeLocal, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	v1 := models.Player{ID: uuid.New(), Name: "V1", IsHost: false, IsAlive: true, ChairID: 1, Role: "VILLAGER"}
	if _, err := st.AppendPlayer(ctx, lobby.Code, v1); err != nil {
		t.Fatalf("AppendPlayer v1: %v", err)
	}
	lobby, err = st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}

	lobby.Players[0].Role = "WENDIGO"
	lobby.Phase = models.GamePhaseNight
	lobby.TimeRemaining = 0
	lobby.NightActions = map[string]string{}
	lobby.Prayers = map[string]string{}
	if err := st.SaveLobby(ctx, lobby); err != nil {
		t.Fatalf("SaveLobby: %v", err)
	}

	if _, err := st.ProcessGameTick(ctx, lobby.Code); err != nil {
		t.Fatalf("ProcessGameTick: %v", err)
	}

	got, err := st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby after tick: %v", err)
	}
	if got.Phase != models.GamePhaseMorning {
		t.Fatalf("phase: got %q, want %q", got.Phase, models.GamePhaseMorning)
	}
	if got.LastNightVictimID != "" {
		t.Fatalf("LastNightVictimID: got %q, want empty", got.LastNightVictimID)
	}
	if got.LastNightSavedByPrayer {
		t.Fatal("LastNightSavedByPrayer: expected false")
	}
}

func TestProcessGameTick_MorningTransitionsToDay(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })

	st := store.NewForTesting(redisClient)
	ctx := context.Background()

	lobby, err := st.CreateLobby(ctx, models.GameModeLocal, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	lobby.Phase = models.GamePhaseMorning
	lobby.TimeRemaining = 0
	if err := st.SaveLobby(ctx, lobby); err != nil {
		t.Fatalf("SaveLobby: %v", err)
	}

	if _, err := st.ProcessGameTick(ctx, lobby.Code); err != nil {
		t.Fatalf("ProcessGameTick: %v", err)
	}

	got, err := st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby after tick: %v", err)
	}
	if got.Phase != models.GamePhaseDay {
		t.Fatalf("phase: got %q, want %q", got.Phase, models.GamePhaseDay)
	}
	if got.TimeRemaining != models.DefaultPhaseSettings().DaySocialSeconds {
		t.Fatalf("day timer: got %d, want %d", got.TimeRemaining, models.DefaultPhaseSettings().DaySocialSeconds)
	}
}

