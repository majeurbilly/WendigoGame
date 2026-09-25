# Authentik OIDC — Helm K8s + Pulumi natif

## État actuel

1. **Runtime** : chart Helm Authentik dans K3s (`infrastructure/src/k8s/authentik.ts`)
2. **OIDC** : ressources natives `@pulumi/authentik` (`infrastructure/src/authentik/oidc-app.ts`)
   - `Provider` API (URL NodePort / `AUTHENTIK_URL` + bootstrap token)
   - `Flow` authorization + invalidation
   - `ProviderOauth2` (`wendigo-dev-provider`, client `wendigo-dev`, public)
   - `Application` slug `wendigo`
3. **Plus de blueprints YAML** pour OIDC (`authentik/blueprints/` → README only)

## Choix techniques

| Couche | Rôle |
|--------|------|
| Helm `goauthentik/authentik` | Server + worker in-cluster |
| Pulumi `ProviderOauth2` / `Application` | Source de vérité OIDC (GitOps) |
| Lookups différés (cert + scopes) | Attente post-Helm, évite EOF / cold boot |
| Timeouts create 20m | Bridge TF Authentik parfois lent |

## Impacts

- CI : healthcheck JWKS après `pulumi up` (création OIDC dans le même `up`)
- Migration : si l’app/provider existent déjà (ancien blueprint), importer dans le state ou supprimer dans l’UI Authentik avant le premier `up` natif

Détail ops : `docs/authentik-k8s.md`.
