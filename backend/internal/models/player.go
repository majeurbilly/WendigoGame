package models

import "github.com/google/uuid"

type Player struct {
	ID                    uuid.UUID `json:"id"`
	Name                  string    `json:"name,omitempty"`
	IsHost                bool      `json:"is_host"`
	IsAlive               bool      `json:"is_alive"`
	ChairID               int       `json:"chair_id"`
	Role                  string    `json:"role,omitempty"`
	IsExcludedFromCouncil bool      `json:"is_excluded_from_council"`
}
