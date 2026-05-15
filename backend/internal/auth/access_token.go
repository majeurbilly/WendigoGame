package auth

import (
	"errors"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// AccessTokenAuth résulte de la validation d’un access token OIDC : identifiant interne (UUID dérivé du sub)
// et indices de profil pour synchroniser la table users.
type AccessTokenAuth struct {
	Sub                  string
	InternalUserID       uuid.UUID
	DisplayNameHint      string // pseudo issu des claims (vide si aucun claim exploitable)
	EmailHint            string // email en minuscules si présent dans le jeton
	VoluntaryDisplayName bool   // true si DisplayNameHint provient d’un vrai claim (preferred_username, name, nickname, partie locale de email)
}

// voluntaryDisplayNameFromClaims extrait un pseudo d’affichage OIDC standard (Authentik, etc.).
func voluntaryDisplayNameFromClaims(claims jwt.MapClaims) (name string, ok bool) {
	if s, hit := stringClaim(claims, "preferred_username"); hit {
		return s, true
	}
	if s, hit := stringClaim(claims, "name"); hit {
		return s, true
	}
	if s, hit := stringClaim(claims, "nickname"); hit {
		return s, true
	}
	if s, hit := stringClaim(claims, "email"); hit {
		if at := strings.Index(s, "@"); at > 0 {
			return strings.TrimSpace(s[:at]), true
		}
	}
	return "", false
}

func emailHintFromClaims(claims jwt.MapClaims) (email string, ok bool) {
	if s, hit := stringClaim(claims, "email"); hit {
		return strings.ToLower(s), true
	}
	return "", false
}

func stringClaim(claims jwt.MapClaims, key string) (string, bool) {
	raw, ok := claims[key].(string)
	if !ok {
		return "", false
	}
	s := strings.TrimSpace(raw)
	if s == "" {
		return "", false
	}
	return s, true
}

// subjectFromMapClaims returns the OIDC subject: prefers "sub", then "preferred_username" (Authentik / access tokens).
func subjectFromMapClaims(claims jwt.MapClaims) (string, error) {
	if s, ok := stringClaim(claims, "sub"); ok {
		return s, nil
	}
	if s, ok := stringClaim(claims, "preferred_username"); ok {
		return s, nil
	}
	return "", errors.New("missing sub and preferred_username claims")
}
