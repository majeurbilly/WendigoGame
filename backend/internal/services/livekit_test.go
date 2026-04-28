package services

import (
	"testing"

	"github.com/majeurbilly/wendigogame/internal/models"
)

func TestResolveAudioPublishPolicy_NightIsCouncilForAliveOnly(t *testing.T) {
	canPublishAlive, profileAlive := resolveAudioPublishPolicy(models.GamePhaseNight, true)
	if !canPublishAlive {
		t.Fatal("alive player should publish during NIGHT")
	}
	if profileAlive != "Council Token" {
		t.Fatalf("profile: got %q, want %q", profileAlive, "Council Token")
	}

	canPublishDead, profileDead := resolveAudioPublishPolicy(models.GamePhaseNight, false)
	if canPublishDead {
		t.Fatal("dead player should not publish during NIGHT")
	}
	if profileDead != "Council Token" {
		t.Fatalf("profile: got %q, want %q", profileDead, "Council Token")
	}
}

func TestResolveAudioPublishPolicy_DayCouncilForAliveOnly(t *testing.T) {
	canPublishAlive, profileAlive := resolveAudioPublishPolicy(models.GamePhaseDay, true)
	if !canPublishAlive {
		t.Fatal("alive player should publish during DAY")
	}
	if profileAlive != "Council Token" {
		t.Fatalf("profile: got %q, want %q", profileAlive, "Council Token")
	}

	canPublishAliveAccusation, profileAliveAccusation := resolveAudioPublishPolicy(models.GamePhaseAccusation, true)
	if !canPublishAliveAccusation {
		t.Fatal("alive player should publish during ACCUSATION")
	}
	if profileAliveAccusation != "Council Token" {
		t.Fatalf("profile: got %q, want %q", profileAliveAccusation, "Council Token")
	}
}

func TestResolveAudioPublishPolicy_DeadPlayerMutedAtStartOfDay(t *testing.T) {
	// This validates the transition requirement: after a NIGHT death, the dead player
	// receives muted permissions when the phase becomes DAY.
	canPublish, profile := resolveAudioPublishPolicy(models.GamePhaseDay, false)
	if canPublish {
		t.Fatal("dead player should remain muted at start of DAY")
	}
	if profile != "Council Token" {
		t.Fatalf("profile: got %q, want %q", profile, "Council Token")
	}
}
