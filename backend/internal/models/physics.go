package models

// PlayerPhysicsState holds ephemeral sandbox position and appearance.
// Never persisted to Redis or store.Store.
type PlayerPhysicsState struct {
	X      float64 `json:"x"`
	Y      float64 `json:"y"`
	SkinID string  `json:"skin_id"`
}

const DefaultPhysicsSkinID = "amber"
