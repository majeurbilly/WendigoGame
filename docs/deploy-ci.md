# CI/CD — Push hybride (GHCR + k3s)

## État actuel

Push sur **`main`** (ou `workflow_dispatch`) → `.github/workflows/ci-cd.yml` :

1. **Lint & Test** (`ubuntu-latest`) — backend Go + frontend lint/tsc
2. **Build & Push** (`ubuntu-latest`) — images GHCR
3. **Deploy** (`self-hosted`) —
   - démarrage **conditionnel** Authentik (`/-/health/ready/` → skip ; sinon `.env` + `compose up -d --no-recreate` + wait)
   - `pulumi up` dans `infrastructure/` (OIDC Provider + Application)
   - `kustomize edit set image` + `kubectl apply -k deploy/k8s`

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
