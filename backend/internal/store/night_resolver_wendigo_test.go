package store

import (
	"testing"

	"github.com/google/uuid"
	"github.com/majeurbilly/wendigogame/internal/models"
)

func TestResolveNight_WendigoTallyUniqueVictim(t *testing.T) {
	w1 := uuid.New()
	w2 := uuid.New()
	v := uuid.New()
	lobby := &models.Lobby{
		Players: []models.Player{
			{ID: w1, Name: "W1", IsAlive: true, Role: "WENDIGO"},
			{ID: w2, Name: "W2", IsAlive: true, Role: "WENDIGO"},
			{ID: v, Name: "V", IsAlive: true, Role: "VILLAGER"},
		},
		NightActions: map[string]string{
			w1.String(): v.String(),
			w2.String(): v.String(),
		},
	}
	dead, _ := ResolveNight(lobby)
	if len(dead) != 1 || dead[0] != v.String() {
		t.Fatalf("deceased: %v", dead)
	}
}

func TestResolveNight_WendigoTieNoKill(t *testing.T) {
	w1 := uuid.New()
	w2 := uuid.New()
	a := uuid.New()
	b := uuid.New()
	lobby := &models.Lobby{
		Players: []models.Player{
			{ID: w1, Name: "W1", IsAlive: true, Role: "WENDIGO"},
			{ID: w2, Name: "W2", IsAlive: true, Role: "WENDIGO"},
			{ID: a, Name: "A", IsAlive: true, Role: "VILLAGER"},
			{ID: b, Name: "B", IsAlive: true, Role: "VILLAGER"},
		},
		NightActions: map[string]string{
			w1.String(): a.String(),
			w2.String(): b.String(),
		},
	}
	dead, _ := ResolveNight(lobby)
	if len(dead) != 0 {
		t.Fatalf("expected no kill on tie, got %v", dead)
	}
}

func TestResolveNight_PrayerProtects(t *testing.T) {
	w := uuid.New()
	v := uuid.New()
	p1 := uuid.New()
	p2 := uuid.New()
	p3 := uuid.New()
	lobby := &models.Lobby{
		Players: []models.Player{
			{ID: w, Name: "W", IsAlive: true, Role: "WENDIGO"},
			{ID: v, Name: "V", IsAlive: true, Role: "VILLAGER"},
			{ID: p1, Name: "P1", IsAlive: true, Role: "VILLAGER"},
			{ID: p2, Name: "P2", IsAlive: true, Role: "VILLAGER"},
			{ID: p3, Name: "P3", IsAlive: true, Role: "VILLAGER"},
		},
		NightActions: map[string]string{
			w.String():  v.String(),
			p1.String(): v.String(),
			p2.String(): v.String(),
			p3.String(): v.String(),
		},
	}
	dead, _ := ResolveNight(lobby)
	if len(dead) != 0 {
		t.Fatalf("expected protection, got %v", dead)
	}
}
