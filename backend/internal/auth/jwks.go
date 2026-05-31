package auth

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/MicahParks/keyfunc/v2"
	"github.com/golang-jwt/jwt/v5"
)

// DefaultOIDCIssuer is the public issuer URL browsers use (normalized without trailing slash for iss comparison).
// Used when OIDC_EXPECTED_ISSUER is unset (local dev).
const DefaultOIDCIssuer = "http://localhost:9000/application/o/wendigo"

// DefaultJWKSURL is used only when OIDC_ISSUER_URL is empty and AUTHENTIK_JWKS_URL is unset.
const DefaultJWKSURL = "http://localhost:9000/application/o/wendigo/jwks/"

var oidcValidMethods = []string{
	jwt.SigningMethodRS256.Alg(),
	jwt.SigningMethodRS384.Alg(),
	jwt.SigningMethodRS512.Alg(),
	jwt.SigningMethodES256.Alg(),
	jwt.SigningMethodES384.Alg(),
	jwt.SigningMethodES512.Alg(),
	jwt.SigningMethodPS256.Alg(),
	jwt.SigningMethodPS384.Alg(),
	jwt.SigningMethodPS512.Alg(),
}

// normalizeIssuer trims space and a single trailing slash so iss values match across Authentik variants.
func normalizeIssuer(s string) string {
	return strings.TrimSuffix(strings.TrimSpace(s), "/")
}

// TokenParser validates OIDC access tokens using Authentik JWKS (cached + background refresh by keyfunc).
// When WENDIGO_AUTH_TEST_MODE is set (go test), validation is bypassed so MustTestAccessToken (alg "none") still works.
type TokenParser struct {
	jwks        *keyfunc.JWKS
	bypass      bool
	expectedIss string // normalized; empty => do not enforce iss
}

func testAuthBypass() bool {
	v := strings.TrimSpace(os.Getenv("WENDIGO_AUTH_TEST_MODE"))
	return strings.EqualFold(v, "1") || strings.EqualFold(v, "true")
}

// skipRegisteredClaimsValidation désactive exp/nbf/etc. côté golang-jwt (Ticket 7.2 diagnostic).
// Par défaut la lib ne vérifie pas `aud` sans jwt.WithAudience ; ce flag sert surtout à isoler exp / horloge.
func skipRegisteredClaimsValidation() bool {
	v := strings.TrimSpace(os.Getenv("WENDIGO_JWT_SKIP_REGISTERED_CLAIM_VALIDATION"))
	return strings.EqualFold(v, "1") || strings.EqualFold(v, "true")
}

// resolveJWKSURL returns where to download JWKS: AUTHENTIK_JWKS_URL, or OIDC_ISSUER_URL + "/jwks/", or DefaultJWKSURL.
// issuerBaseForJWKS is typically the internal Docker hostname (e.g. authentik-server), not the public issuer.
func resolveJWKSURL(issuerBaseForJWKS string) string {
	if u := strings.TrimSpace(os.Getenv("AUTHENTIK_JWKS_URL")); u != "" {
		return u
	}
	if iss := normalizeIssuer(issuerBaseForJWKS); iss != "" {
		return iss + "/jwks/"
	}
	return DefaultJWKSURL
}

// NewTokenParser loads JWKS from AUTHENTIK_JWKS_URL or OIDC_ISSUER_URL + "/jwks/".
// JWT claim "iss" is checked against OIDC_EXPECTED_ISSUER (public URL, e.g. localhost) when set, else DefaultOIDCIssuer.
// OIDC_ISSUER_URL alone is only for JWKS discovery from inside Docker (e.g. http://authentik-server:9000/...).
// Test mode (WENDIGO_AUTH_TEST_MODE): skips JWKS HTTP and accepts unverified tokens (unit / integration tests only).
func NewTokenParser(ctx context.Context) (*TokenParser, error) {
	jwksBase := strings.TrimSpace(os.Getenv("OIDC_ISSUER_URL"))
	if jwksBase == "" {
		jwksBase = DefaultOIDCIssuer
	}

	expectedRaw := strings.TrimSpace(os.Getenv("OIDC_EXPECTED_ISSUER"))
	if expectedRaw == "" {
		expectedRaw = DefaultOIDCIssuer
	}
	expectedIss := normalizeIssuer(expectedRaw)

	if testAuthBypass() {
		log.Printf("auth: WENDIGO_AUTH_TEST_MODE — JWT JWKS verification disabled (tests only)")
		return &TokenParser{bypass: true, expectedIss: expectedIss}, nil
	}

	jwksURL := resolveJWKSURL(jwksBase)

	jwksCtx := ctx
	if jwksCtx == nil {
		jwksCtx = context.Background()
	}

	jwks, err := keyfunc.Get(jwksURL, keyfunc.Options{
		Ctx:                 jwksCtx,
		RefreshInterval:     time.Hour,
		RefreshTimeout:      30 * time.Second,
		RefreshRateLimit:    5 * time.Minute,
		RefreshErrorHandler: func(err error) {
			log.Printf("auth: JWKS refresh error: %v", err)
		},
	})
	if err != nil {
		return nil, fmt.Errorf("jwks get %q: %w", jwksURL, err)
	}

	log.Printf("auth: JWKS download URL %q | expected JWT iss (after normalize) %q", jwksURL, expectedIss)
	return &TokenParser{jwks: jwks, expectedIss: expectedIss}, nil
}

// Close stops JWKS background refresh. Call from main shutdown.
func (p *TokenParser) Close() {
	if p == nil || p.jwks == nil {
		return
	}
	p.jwks.EndBackground()
}

// parsedClaimsFromAccessToken valide le jeton (sauf bypass test) et retourne les MapClaims.
func (p *TokenParser) parsedClaimsFromAccessToken(ctx context.Context, raw string) (jwt.MapClaims, error) {
	if p == nil {
		return nil, errors.New("token parser is nil")
	}
	if strings.TrimSpace(raw) == "" {
		return nil, errors.New("empty token")
	}

	if p.bypass {
		parser := jwt.NewParser()
		token, _, err := parser.ParseUnverified(raw, jwt.MapClaims{})
		if err != nil {
			return nil, err
		}
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return nil, errors.New("invalid token claims")
		}
		return claims, nil
	}

	if p.jwks == nil {
		return nil, errors.New("jwks client not initialized")
	}

	claims := jwt.MapClaims{}
	parserOpts := []jwt.ParserOption{jwt.WithValidMethods(oidcValidMethods)}
	if skipRegisteredClaimsValidation() {
		log.Printf("auth: WENDIGO_JWT_SKIP_REGISTERED_CLAIM_VALIDATION — validation des claims enregistrés (exp, nbf, …) désactivée (diagnostic)")
		parserOpts = append(parserOpts, jwt.WithoutClaimsValidation())
	}
	_, err := jwt.ParseWithClaims(raw, &claims, p.jwks.Keyfunc, parserOpts...)
	if err != nil {
		log.Printf("auth: Erreur de validation JWT (parse / signature / claims enregistrés): %v", err)
		return nil, err
	}

	if p.expectedIss != "" {
		rawIss, ok := claims["iss"].(string)
		if !ok || normalizeIssuer(rawIss) != p.expectedIss {
			issErr := fmt.Errorf("invalid or missing iss claim (expected %q, normalized)", p.expectedIss)
			log.Printf("auth: Erreur de validation JWT (iss): %v", issErr)
			return nil, issErr
		}
	}

	return claims, nil
}

// ParseAccessToken valide le jeton et renvoie le sujet OIDC, l’UUID interne Wendigo et les indices de profil pour Postgres.
func (p *TokenParser) ParseAccessToken(ctx context.Context, raw string) (*AccessTokenAuth, error) {
	claims, err := p.parsedClaimsFromAccessToken(ctx, raw)
	if err != nil {
		return nil, err
	}
	sub, err := subjectFromMapClaims(claims)
	if err != nil {
		log.Printf("auth: Erreur de validation JWT (sujet OIDC): %v", err)
		return nil, err
	}
	internalID, err := SubjectUUIDFromOIDCSub(sub)
	if err != nil {
		return nil, err
	}
	display, voluntary := voluntaryDisplayNameFromClaims(claims)
	email, _ := emailHintFromClaims(claims)
	return &AccessTokenAuth{
		Sub:                  sub,
		InternalUserID:       internalID,
		DisplayNameHint:      display,
		EmailHint:            email,
		VoluntaryDisplayName: voluntary,
	}, nil
}

// SubjectFromAccessToken validates the bearer token (unless test bypass) and returns the OIDC subject
// (sub or preferred_username from claims).
func (p *TokenParser) SubjectFromAccessToken(ctx context.Context, raw string) (string, error) {
	claims, err := p.parsedClaimsFromAccessToken(ctx, raw)
	if err != nil {
		return "", err
	}
	sub, err := subjectFromMapClaims(claims)
	if err != nil {
		log.Printf("auth: Erreur de validation JWT (sujet OIDC): %v", err)
		return "", err
	}
	return sub, nil
}
