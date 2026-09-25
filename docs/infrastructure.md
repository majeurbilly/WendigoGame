# Authentik OIDC — Helm K8s + Pulumi natif

## État actuel

1. **Runtime** : chart Helm Authentik dans K3s (`infrastructure/src/k8s/authentik.ts`)
2. **OIDC** : `infrastructure/src/authentik/oidc-app.ts`
   - `Provider` API (URL NodePort / `AUTHENTIK_URL` + bootstrap token)
   - `Flow` authorization + invalidation
   - `OidcProviderResource` HTTP (`wendigo-dev-provider`, client `wendigo-dev`) — pas le bridge TF `ProviderOauth2`
   - `Application` slug `wendigo` liée via `oidcProvider.pk`
3. **Plus de blueprints YAML** pour OIDC (`authentik/blueprints/` → README only)

## Choix techniques

| Couche | Rôle |
|--------|------|
| Helm `goauthentik/authentik` | Server + worker in-cluster |
| Pulumi OIDC | `OidcProviderResource` (HTTP) + `Application` — contourne EOF du bridge TF |
| Outputs dynamiques | `declare public readonly pk/clientSecret` — empêche TS (`useDefineForClassFields`) d’écraser les Outputs après `super()` |
| `CertificateKeyPair` + `@pulumi/tls` | Signing key explicite |
| Lookups différés (scopes) | Attente post-Helm pour openid/email/profile/offline_access |

## Impacts

- CI : healthcheck JWKS après `pulumi up` (création OIDC dans le même `up`)
- Migration : si l’app/provider existent déjà (ancien blueprint), importer dans le state ou supprimer dans l’UI Authentik avant le premier `up` natif

Détail ops : `docs/authentik-k8s.md`.
