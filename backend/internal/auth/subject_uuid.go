package auth

import (
	"errors"
	"strings"

	"github.com/google/uuid"
)

// SubjectUUIDFromOIDCSub mappe le claim OIDC `sub` vers l'UUID interne utilisé par l'API et Postgres.
// - Si `sub` est déjà un UUID RFC 4122, il est utilisé tel quel (rétrocompatibilité).
// - Sinon (hash Authentik 64 caractères, etc.), un UUID **déterministe** est dérivé (SHA-1, même espace que les UUID v5),
//   ce qui évite de changer le schéma SQL (colonnes UUID) tout en acceptant n'importe quelle chaîne `sub`.
func SubjectUUIDFromOIDCSub(sub string) (uuid.UUID, error) {
	sub = strings.TrimSpace(sub)
	if sub == "" {
		return uuid.Nil, errors.New("empty OIDC sub")
	}
	if id, err := uuid.Parse(sub); err == nil {
		return id, nil
	}
	// Préfixe versionné pour limiter les collisions avec d'autres usages de NameSpaceURL.
	const subDerivationPrefix = "wendigo:oidc-sub:v1:"
	return uuid.NewSHA1(uuid.NameSpaceURL, []byte(subDerivationPrefix+sub)), nil
}
