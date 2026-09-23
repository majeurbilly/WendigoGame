# CI/CD — Push hybride (GHCR + k3s)

## État actuel

Push sur **`main`** (ou `workflow_dispatch`) → `.github/workflows/ci-cd.yml` :

1. **Lint & Test** (`ubuntu-latest`) — backend Go + frontend lint/tsc
2. **Build & Push** (`ubuntu-latest`) — images GHCR
3. **Deploy** (`self-hosted`) —
   - démarrage **conditionnel** Authentik **via SSH** sur `gaston@192.168.0.157`
     (`scp docker-compose.yml` + `.env` distant + `docker compose up -d --no-recreate`)
   - healthcheck **toujours** : `http://192.168.0.157:9000/-/health/ready/` (timeout 120s)
   - `pulumi up` avec `AUTHENTIK_TOKEN` = `secrets.AUTHENTIK_BOOTSTRAP_TOKEN`
   - `kustomize edit set image` + `kubectl apply -k deploy/k8s`

Répertoire Compose distant : `/home/gaston/WendigoGame` (surcharge possible via variable repo `AUTHENTIK_REMOTE_DIR`).
Prérequis runner `moumou` : clé SSH vers `gaston@192.168.0.157` (BatchMode).

Images :

- `ghcr.io/majeurbilly/wendigame-backend:latest` et `:${{ github.sha }}`
- `ghcr.io/majeurbilly/wendigame-frontend:latest` et `:${{ github.sha }}`

Le job deploy force les Deployments sur le tag **SHA** (pas seulement `latest`).

## Variables repository (frontend)

| Variable | Défaut CI |
|----------|-----------|
| `VITE_API_URL` | `http://localhost:8080` |
| `VITE_AUTHENTIK_URL` | `http://localhost:9000/application/o/wendigo/` |
| `VITE_AUTHENTIK_CLIENT_ID` | `wendigo-dev` |

## Permissions

- Jobs build : `packages: write` (GITHUB_TOKEN → GHCR)
- Job deploy : `contents: read` uniquement ; kubectl via kubeconfig local du runner

## Pull cluster (packages privés)

Les manifests apps référencent `imagePullSecrets: ghcr-creds`. Créer le secret une fois sur le cluster (voir `docs/gitops.md`). Sans secret, et si GHCR est privé → `ErrImagePull`.

## Obsolète

- ArgoCD / `deploy/k8s/argocd-app.yaml`
- `.github/workflows/build-and-push-ghcr.yml`
- Docker Compose / `start.sh`

Voir `docs/gitops.md`.
