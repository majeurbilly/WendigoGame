package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID             uuid.UUID `json:"id"`
	Username       string    `json:"username"`
	Email          string    `json:"email"`
	PasswordHash   string    `json:"-"`
	GamesPlayed    int       `json:"games_played"`
	GamesWon       int       `json:"games_won"`
	GamesLost      int       `json:"games_lost"`
	WinsAsWendigo  int       `json:"wins_as_wendigo"`
	WinsAsVillager int       `json:"wins_as_villager"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
