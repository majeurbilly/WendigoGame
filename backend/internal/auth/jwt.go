package auth

import (
	"errors"
	"fmt"
	"log"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const tokenLifetime = 24 * time.Hour

// defaultJWTSecret matches docker-compose dev defaults; override with JWT_SECRET in production.
const defaultJWTSecret = "supersecret_wendigogame_key_2026"

var warnUnsetJWT sync.Once

func jwtSecretBytes() []byte {
	s := strings.TrimSpace(os.Getenv("JWT_SECRET"))
	if s == "" {
		warnUnsetJWT.Do(func() {
			log.Printf("JWT_SECRET is not set; using development default (set JWT_SECRET in production)")
		})
		s = defaultJWTSecret
	}
	return []byte(s)
}

func GenerateToken(userID uuid.UUID) (string, error) {
	secretKey := jwtSecretBytes()

	claims := jwt.MapClaims{
		"sub": userID.String(),
		"exp": time.Now().Add(tokenLifetime).Unix(),
		"iat": time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString(secretKey)
	if err != nil {
		return "", fmt.Errorf("sign jwt: %w", err)
	}
	return signedToken, nil
}

func ValidateToken(tokenString string) (uuid.UUID, error) {
	secretKey := jwtSecretBytes()

	parsedToken, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return secretKey, nil
	})
	if err != nil {
		return uuid.Nil, err
	}

	if !parsedToken.Valid {
		return uuid.Nil, errors.New("invalid token")
	}

	claims, ok := parsedToken.Claims.(jwt.MapClaims)
	if !ok {
		return uuid.Nil, errors.New("invalid token claims")
	}

	subjectValue, err := claims.GetSubject()
	if err != nil {
		return uuid.Nil, err
	}
	userID, err := uuid.Parse(subjectValue)
	if err != nil {
		return uuid.Nil, errors.New("invalid subject in token")
	}

	return userID, nil
}
