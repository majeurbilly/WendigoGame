# Images Docker (backend + frontend)

## État actuel

Deux Dockerfiles multi-stage (`builder` → `runner`) avec **ordre de layers orienté cache**. Les images sont construites par GitHub Actions et poussées sur **GHCR** — plus de build via Docker Compose.

## Choix techniques

### Principe

Chaque instruction est placée selon **ce qui invalide la couche suivante** :

| Changement | Backend | Frontend |
|------------|---------|----------|
| `go.mod` / `package.json` | `go mod download` / `npm ci` | idem |
| Config (vite, tsconfig, nginx) | — | couche COPY config |
| Code source | `COPY cmd,internal` + `go build` | `COPY src` + `npm run build` |
| Vars Vite OIDC | — | `ARG`/`ENV` puis `npm run build` seulement |
| Binaire / `dist` | `COPY --from=builder` (runner) | idem |

### Backend

- **`go mod download`** (pas de `go mod tidy` en build).
- **`COPY cmd/` + `internal/`** — contexte minimal.
- **`.dockerignore`** : `*_test.go`, scripts.

### Frontend

- **`npm ci`** isolé avant `COPY src/`.
- **Config** avant **src/**.
- **`VITE_*`** injectés en build-args par le workflow GHCR.

### CI

- Runner GitHub-hosted (build) + self-hosted (deploy) via `ci-cd.yml`.
- Registry : `ghcr.io/majeurbilly/wendigame-{backend,frontend}`.

## Impacts

| Fichier | Impact |
|---------|--------|
| `backend/Dockerfile` | Build GHCR uniquement |
| `frontend/Dockerfile` | Build-args `VITE_*` depuis Actions Variables |
| `.github/workflows/ci-cd.yml` | Lint/Test → Build GHCR → Deploy k3s |
| Compose / `start.sh` / ArgoCD | **Supprimés** |
