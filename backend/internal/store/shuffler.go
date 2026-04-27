package store

import (
	"crypto/rand"
	"fmt"
	"math/big"

	"github.com/majeurbilly/wendigogame/internal/models"
)

func shuffleRoles(roles []models.Role) error {
	for index := len(roles) - 1; index > 0; index-- {
		randomIndex, err := secureRandomIndex(index + 1)
		if err != nil {
			return err
		}
		roles[index], roles[randomIndex] = roles[randomIndex], roles[index]
	}
	return nil
}

func secureRandomIndex(exclusiveUpperBound int) (int, error) {
	if exclusiveUpperBound <= 0 {
		return 0, fmt.Errorf("invalid exclusiveUpperBound: %d", exclusiveUpperBound)
	}
	maxValue := big.NewInt(int64(exclusiveUpperBound))
	randomValue, err := rand.Int(rand.Reader, maxValue)
	if err != nil {
		return 0, fmt.Errorf("secure random generation failed: %w", err)
	}
	return int(randomValue.Int64()), nil
}
