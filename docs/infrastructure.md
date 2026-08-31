# Infrastructure Pulumi (Authentik + observabilité)

## État actuel

Stack `infrastructure/` : provisionne Authentik (OIDC Wendigo, Google SSO), Grafana datasources, Prometheus scrape config et génère `.env` pour Docker Compose.

## Choix techniques (CI / instance fraîche)

- **Zéro `invoke` Authentik fragile** : les scopes OIDC `openid` / `email` / `profile` et le certificat de signature RSA sont des **ressources Pulumi** (`PropertyMappingProviderScope`, `CertificateKeyPair`), plus de lookup `getPropertyMappingProviderScope` / `getCertificateKeyPair` sur les objets managés par défaut d'Authentik.
- **Certificat OIDC** : `@pulumi/tls` génère une paire RSA auto-signée importée dans Authentik (`Wendigo: OIDC Signing (RSA)`). `allowedUses` doit être en snake_case (`key_encipherment`, `digital_signature`) — requis par le provider TLS v5.
- **Alignement** : même philosophie que `references.ts` (« pas de lookups sur une instance fraîche »).

## Impacts

| Composant | Impact |
|-----------|--------|
| `oauth-scopes.ts` | 3 `PropertyMappingProviderScope` Wendigo au lieu de 2 invokes + 1 mapping |
| `signing-certificate.ts` | `tls.SelfSignedCert` + `CertificateKeyPair` |
| `wendigo-oidc.ts` | `dependsOn` sur le certificat avant création du provider |
| Backend | JWKS `/application/o/wendigo/jwks/` disponible après `pulumi up` réussi |
| CI | Corrige l'échec preview `invoke.ts` (2 erreurs) sur runner self-hosted |
