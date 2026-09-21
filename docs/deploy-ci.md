# CI/CD — Build & Push GHCR

## État actuel

Push sur **`main`** (ou `workflow_dispatch`) → `.github/workflows/build-and-push-ghcr.yml` :

1. Checkout
2. Login GHCR via `${{ secrets.GITHUB_TOKEN }}`
3. Build/push parallèle :
   - `ghcr.io/majeurbilly/wendigame-backend:latest` (+ `:sha`)
   - `ghcr.io/majeurbilly/wendigame-frontend:latest` (+ `:sha`)

ArgoCD synchronise `deploy/k8s/` et tire les images `:latest`.

## Variables repository (frontend)

Optionnelles — build-args Vite :

| Variable | Défaut CI |
|----------|-----------|
| `VITE_API_URL` | `http://localhost:8080` |
| `VITE_AUTHENTIK_URL` | `http://localhost:9000/application/o/wendigo/` |
| `VITE_AUTHENTIK_CLIENT_ID` | `wendigo-dev` |

À renseigner avec les URLs publiques (Ingress) dès qu’elles existent.

## Permissions

Le workflow déclare `packages: write`. Le package GHCR doit autoriser Actions du dépôt (visibilité / Inherit).

## Obsolète (supprimé Phase 1.5)

- `.github/workflows/deploy.yml` (self-hosted → Compose → `start.sh`)
- `docker-compose.yml`, `start.sh`

Voir `docs/gitops.md`.
