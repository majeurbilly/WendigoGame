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

func TestRestartGame_ResetsLobbyAndPlayers(t *testing.T) {
	miniredisServer := miniredis.RunT(t)
	redisClient := redis.NewClient(&redis.Options{Addr: miniredisServer.Addr()})
	t.Cleanup(func() { _ = redisClient.Close() })

	st := store.NewForTesting(redisClient)
	ctx := context.Background()

	lobby, err := st.CreateLobby(ctx, models.GameModeLocal, "Host")
	if err != nil {
		t.Fatalf("CreateLobby: %v", err)
	}
	guest := models.Player{ID: uuid.New(), Name: "Guest", IsHost: false, IsAlive: false, ChairID: 3, Role: "WENDIGO"}
	if _, err := st.AppendPlayer(ctx, lobby.Code, guest); err != nil {
		t.Fatalf("AppendPlayer: %v", err)
	}
	lobby, err = st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby: %v", err)
	}

	hostID := lobby.Players[0].ID.String()
	lobby.Phase = models.PhaseGameOver
	lobby.WinnerTeam = "WENDIGO"
	lobby.Players[0].IsAlive = false
	lobby.Players[0].Role = "VILLAGER"
	lobby.Players[0].ChairID = 2
	lobby.Players[0].IsExcludedFromCouncil = true
	lobby.Votes = map[string]string{"a": "b"}
	lobby.Prayers = map[string]string{"x": "y"}
	lobby.NightActions = map[string]string{"n": "t"}
	lobby.CouncilAccusations = map[string]string{"c": "d"}
	lobby.WendigoIntentions = map[string]string{"w": "z"}
	lobby.WendigoIntents = map[string]string{"w2": "z2"}
	lobby.LastLynchVictimID = "victim"
	lobby.LastNightVictimID = "nightvictim"
	lobby.LastNightSavedByPrayer = true
	lobby.DefendantID = "def"
	lobby.SurrenderVoteActive = true
	lobby.SurrenderApproved = true
	lobby.SurrenderVotes = map[string]bool{"p": true}
	lobby.IsPaused = true
	lobby.ChairPromptTriggered = true
	lobby.SocialPhaseTotalTime = 123
	if err := st.SaveLobby(ctx, lobby); err != nil {
		t.Fatalf("SaveLobby: %v", err)
	}

	if err := st.RestartGame(ctx, lobby.Code, hostID); err != nil {
		t.Fatalf("RestartGame: %v", err)
	}

	got, err := st.GetLobby(ctx, lobby.Code)
	if err != nil {
		t.Fatalf("GetLobby after restart: %v", err)
	}
	if got.Phase != models.GamePhaseLobby {
		t.Fatalf("phase: got %q, want %q", got.Phase, models.GamePhaseLobby)
	}
	if got.WinnerTeam != "" {
		t.Fatalf("WinnerTeam: got %q, want empty", got.WinnerTeam)
	}
	if got.IsPaused || got.SurrenderVoteActive || got.SurrenderApproved {
		t.Fatalf("expected admin flags reset, paused=%v surrenderActive=%v surrenderApproved=%v", got.IsPaused, got.SurrenderVoteActive, got.SurrenderApproved)
	}
	if got.DefendantID != "" || got.LastLynchVictimID != "" || got.LastNightVictimID != "" || got.LastNightSavedByPrayer {
		t.Fatalf("expected history cleared, defendant=%q lynch=%q nightVictim=%q saved=%v", got.DefendantID, got.LastLynchVictimID, got.LastNightVictimID, got.LastNightSavedByPrayer)
	}
	if len(got.Votes) != 0 || len(got.Prayers) != 0 || len(got.NightActions) != 0 || len(got.CouncilAccusations) != 0 || len(got.WendigoIntentions) != 0 || len(got.WendigoIntents) != 0 {
		t.Fatalf("expected maps cleared, votes=%v prayers=%v night=%v accusations=%v intents=%v intents2=%v", got.Votes, got.Prayers, got.NightActions, got.CouncilAccusations, got.WendigoIntentions, got.WendigoIntents)
	}
	for i := range got.Players {
		if !got.Players[i].IsAlive {
			t.Fatalf("player %s should be alive", got.Players[i].ID)
		}
		if got.Players[i].Role != "" {
			t.Fatalf("player %s role should be empty, got %q", got.Players[i].ID, got.Players[i].Role)
		}
		if got.Players[i].ChairID != models.UnseatedChair {
			t.Fatalf("player %s chair should be unseated, got %d", got.Players[i].ID, got.Players[i].ChairID)
		}
		if got.Players[i].IsExcludedFromCouncil {
			t.Fatalf("player %s should not be excluded", got.Players[i].ID)
		}
	}
}

