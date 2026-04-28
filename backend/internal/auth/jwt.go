package auth

import (
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const tokenLifetime = 24 * time.Hour

func GenerateToken(userID uuid.UUID) (string, error) {
	secretKey := os.Getenv("JWT_SECRET")
	if secretKey == "" {
		return "", errors.New("jwt secret is required (JWT_SECRET)")
	}

	claims := jwt.MapClaims{
		"sub": userID.String(),
		"exp": time.Now().Add(tokenLifetime).Unix(),
		"iat": time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return "", fmt.Errorf("sign jwt: %w", err)
	}
	return signedToken, nil
}

func ValidateToken(tokenString string) (uuid.UUID, error) {
	secretKey := os.Getenv("JWT_SECRET")
	if secretKey == "" {
		return uuid.Nil, errors.New("jwt secret is required (JWT_SECRET)")
	}

	parsedToken, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secretKey), nil
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
