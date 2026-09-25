# CI/CD — Push hybride (GHCR + k3s)

## État actuel

Push sur **`main`** (ou `workflow_dispatch`) → `.github/workflows/ci-cd.yml` :

1. **Lint & Test** (`ubuntu-latest`) — backend Go + frontend lint/tsc
2. **Build & Push** (`ubuntu-latest`) — images GHCR
3. **Deploy** (`self-hosted`) —
   - apply Postgres/Redis (`deploy/k8s/base`)
   - **Pulumi** : chart Helm Authentik + lookup OIDC (`AUTHENTIK_URL=http://192.168.0.157:30900`)
   - healthcheck NodePort : `/-/health/ready/` + JWKS blueprint
   - `kustomize edit set image` + `kubectl apply -k deploy/k8s`

Prérequis : secrets GitHub repo (`AUTHENTIK_*`, `PULUMI_PG_PASSWORD`) — injectés automatiquement dans Pulumi à chaque deploy (voir `docs/gitops.md`).

Images :

- `ghcr.io/majeurbilly/wendigame-backend:latest` et `:${{ github.sha }}`
- `ghcr.io/majeurbilly/wendigame-frontend:latest` et `:${{ github.sha }}`

## Variables repository (frontend)

| Variable | Défaut CI |
|----------|-----------|
| `VITE_API_URL` | `http://wendigo.local` |
| `VITE_AUTHENTIK_URL` | `http://192.168.0.157:30900/application/o/wendigo/` |
| `VITE_AUTHENTIK_CLIENT_ID` | `wendigo-dev` |

Accès jeu : `http://wendigo.local` — voir `docs/ingress.md`. Authentik UI/API : `http://auth.wendigo.local` (ou NodePort **30900**).

## Permissions

- Jobs build : `packages: write` (GITHUB_TOKEN → GHCR)
- Job deploy : `contents: read` ; kubectl via kubeconfig local du runner

## Obsolète / retiré

- ArgoCD / Compose SSH Authentik sur gaston
- `docker-compose.yml` (racine) — **supprimé** ; déploiement Authentik = Helm Pulumi uniquement

Voir `docs/gitops.md`, `docs/authentik-k8s.md`.
