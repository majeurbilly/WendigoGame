# Ingress Traefik (k3s) — wendigo.local

## État actuel

`deploy/k8s/apps/ingress.yaml` route via Traefik **sans** middleware StripPrefix (évite les 404 si le CRD `traefik.io` / la ref middleware échoue).

| URL | Service |
|-----|---------|
| `http://wendigo.local/` | `frontend:80` |
| `http://wendigo.local/health` | `backend:8080` |
| `http://wendigo.local/auth/*` | `backend:8080` |
| `http://wendigo.local/lobbies/*` | `backend:8080` |
| `http://wendigo.local/ws` | `backend:8080` |
| `http://wendigo.local/metrics` | `backend:8080` |

### Routes Go réelles (`backend/internal/api/health.go`)

- `GET /health`, `GET /metrics`
- `GET /auth/me`
- `POST /lobbies`, `POST /lobbies/{code}/start|seat`
- `GET /ws`

**Pas de** `/api`, **pas de** `/swagger` / `/docs` dans le backend → `wendigo.local/api` et `/api/swagger` resteront en 404 (attendu).

## Frontend

`VITE_API_URL=http://wendigo.local` (défaut CI) — axios appelle `/auth/me`, WS `ws://wendigo.local/ws`.

## Accès LAN

```text
192.168.0.157 wendigo.local
```

dans `/etc/hosts` (ou hosts Windows).

## Vérif rapide

```bash
curl -sS http://wendigo.local/health
# {"status":"ok"}
```
