# Authentik OIDC — Helm K8s + lookup Pulumi

## État actuel

1. **Runtime** : chart Helm Authentik dans K3s (`infrastructure/src/k8s/authentik.ts`) — Postgres/Redis **partagés** `wendigo`
2. **Blueprint** `authentik/blueprints/wendigo-oidc.yaml` via ConfigMap `wendigo-oidc-blueprint`
3. **Pulumi** (`infrastructure/index.ts`) : deploy Helm puis **lookup** différé `getProviderOauth2Config`
4. Exports `OIDC_ISSUER_URL` / `AUTHENTIK_JWKS_URL`

Détail opérationnel (secrets, preview/up) : **`docs/authentik-k8s.md`**.

## Choix techniques

| Couche | Rôle |
|--------|------|
| Helm `goauthentik/authentik` 2024.12.3 | Server + worker in-cluster |
| Job `authentik-db-init` | Crée rôle/DB `authentik` sur Postgres central |
| Secret `authentik-credentials` | PG user/pass, bootstrap, secret-key |
| Blueprint + lookup | OIDC sans `ProviderOauth2` TF (évite EOF) |
| `docker-compose.yml` | **Supprimé** — runtime 100 % K3s / Helm |

## Impacts

- CI : Authentik via Pulumi Helm uniquement — voir `docs/gitops.md`
- URL LAN Authentik : **NodePort 30900**
