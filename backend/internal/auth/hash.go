package auth

import "golang.org/x/crypto/bcrypt"

const bcryptCost = bcrypt.DefaultCost

func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcryptCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

func VerifyPassword(hashedPassword, plainPassword string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(plainPassword)) == nil
}
