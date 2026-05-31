package auth

import (
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// MustTestAccessToken returns a JWT string for integration tests. With WENDIGO_AUTH_TEST_MODE,
// the API skips JWKS verification and reads sub from this token (alg none, no shared secret).
func MustTestAccessToken(userID uuid.UUID) string {
	token := jwt.NewWithClaims(jwt.SigningMethodNone, jwt.MapClaims{
		"sub": userID.String(),
	})
	s, err := token.SignedString(jwt.UnsafeAllowNoneSignatureType)
	if err != nil {
		panic("MustTestAccessToken: " + err.Error())
	}
	return s
}

// MustTestAccessTokenWithOIDCClaims builds a test JWT with optional preferred_username / email (Authentik-like).
func MustTestAccessTokenWithOIDCClaims(userID uuid.UUID, preferredUsername, email string) string {
	claims := jwt.MapClaims{
		"sub": userID.String(),
	}
	if strings.TrimSpace(preferredUsername) != "" {
		claims["preferred_username"] = strings.TrimSpace(preferredUsername)
	}
	if strings.TrimSpace(email) != "" {
		claims["email"] = strings.TrimSpace(email)
	}
	token := jwt.NewWithClaims(jwt.SigningMethodNone, claims)
	s, err := token.SignedString(jwt.UnsafeAllowNoneSignatureType)
	if err != nil {
		panic("MustTestAccessTokenWithOIDCClaims: " + err.Error())
	}
	return s
}
