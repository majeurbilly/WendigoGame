# Images Docker (backend + frontend)

## État actuel

Deux Dockerfiles multi-stage (`builder` → `runner`) avec **ordre de layers orienté cache**. Pas de `--mount=type=cache` : le runner `gaston` utilise Docker classique sans BuildKit/buildx.

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

- **`go mod download`** (plus `go mod tidy` en build — tidy modifie `go.sum` et casse la reproductibilité).
- **`COPY cmd/` + `internal/`** au lieu de `COPY . .` — contexte minimal.
- **`.dockerignore`** : `*_test.go`, scripts — les tests n'invalident plus le build.

### Frontend

- **`npm ci`** isolé avant `COPY src/`.
- **Config** copiée avant **src/** — edit composant ≠ refetch deps.
- **`rebuild_frontend`** (`start.sh`) : **sans `--no-cache`** — un changement de `VITE_*` rebuild uniquement depuis `ARG` (layer `npm run build`).

### CI

- `compose_up` : `up -d --build` réutilise le cache du daemon sur le runner self-hosted.
- Pas de registry cache GHA (runner local).

## Impacts

| Fichier | Impact |
|---------|--------|
| `backend/Dockerfile` | Layers deps / sources / build séparés |
| `frontend/Dockerfile` | Layers deps / config / src / build env séparés |
| `start.sh` | `build` frontend cache-friendly |
| `.dockerignore` | Moins d'invalidations parasites |
