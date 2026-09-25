# Authentik Full K8s — Helm Pulumi (étape 3)

## État actuel

Authentik tourne **dans K3s** (namespace `wendigo`) via le chart Helm officiel `goauthentik/authentik`, provisionné par Pulumi TypeScript.

| Composant | Source |
|-----------|--------|
| Runtime Authentik (server + worker) | `infrastructure/src/k8s/authentik.ts` → `helm.v3.Release` |
| Postgres | Service partagé `postgres` (DB/role dédiés `authentik`) — Job `authentik-db-init` |
| Redis | Service partagé `redis` (chart Bitnami redis **désactivé**) |
| Secrets | Secret K8s `authentik-credentials` + config Pulumi / GitHub Secrets |
| OIDC app | `OidcProviderResource` (HTTP API) + `Application` — `declare` Outputs `pk`/`clientSecret` |

`docker-compose.yml` et les blueprints YAML OIDC ont été **supprimés**.

## Choix techniques

- **`postgresql.enabled: false` / `redis.enabled: false`** : une seule instance Postgres/Redis pour le jeu + Authentik.
- **Credentials Postgres** : `file:///postgres-creds/{username,password}` (Secret monté) — pas de mot de passe en clair dans les values hors secret_key Helm.
- **Bootstrap** : `AUTHENTIK_BOOTSTRAP_*` via `global.env` ← Secret.
- **Exposition** : Ingress Kustomize `auth.wendigo.local` → `authentik-server:80` + NodePort **30900** (LAN / CI).
- Chart épinglé **2024.12.3** (aligné provider TF `2024.12.1`).
- Ingress Helm du chart **désactivé** — source de vérité : `deploy/k8s/apps/authentik-ingress.yaml`.

## Impacts

- Backend : JWKS en ClusterIP ; `OIDC_EXPECTED_ISSUER` = URL NodePort publique.
- CI : `pulumi up` = Helm + OIDC natif ; healthcheck JWKS après coup.
- Frontend build : défaut `VITE_AUTHENTIK_URL` → `:30900`.
- Étape 6 : plus de blueprint YAML — si provider/app existent déjà, `pulumi import` ou suppression UI avant le 1er create.

## Secrets (CI = source de vérité)

En local, tu peux encore `pulumi config set --secret …`. En CI, les secrets GitHub suivants sont mappés à chaque `pulumi up` :

| GitHub Secret | Pulumi |
|---------------|--------|
| `AUTHENTIK_SECRET_KEY` | `wendigo:authentikSecretKey` |
| `AUTHENTIK_PG_PASS` | `wendigo:authentikPgPass` |
| `AUTHENTIK_BOOTSTRAP_PASSWORD` | `wendigo:authentikBootstrapPassword` |
| `AUTHENTIK_BOOTSTRAP_TOKEN` | `wendigo:authentikBootstrapToken` (+ `AUTHENTIK_TOKEN`) |
| `PULUMI_PG_PASSWORD` | `wendigo:pgPassword` (doit matcher `postgres.yaml`) |

## Preview / apply

Prérequis : `kubectl` pointant sur le cluster K3s, namespace `wendigo` + Postgres/Redis déjà appliqués.

```bash
kubectl apply -f deploy/k8s/base/namespace.yaml
kubectl apply -f deploy/k8s/base/postgres.yaml
kubectl apply -f deploy/k8s/base/redis.yaml

cd infrastructure
pnpm install
export AUTHENTIK_TOKEN='<même valeur que authentikBootstrapToken>'
export AUTHENTIK_URL='http://192.168.0.157:30900'
export KUBECONFIG=...   # si besoin
export PULUMI_CONFIG_PASSPHRASE='wendigo-local-state'  # si state local

pulumi preview   # ou pnpm preview
pulumi up        # ou pnpm up
```

Vérifications :

```bash
kubectl -n wendigo get pods,svc,ingress -l app.kubernetes.io/name=authentik
curl -sSf http://192.168.0.157:30900/-/health/ready/
curl -sS http://192.168.0.157:30900/application/o/wendigo/jwks/ | head
```
