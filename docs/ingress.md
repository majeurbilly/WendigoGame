# Ingress Traefik (k3s) — wendigo.local + auth.wendigo.local

## État actuel

Deux Ingress dans `deploy/k8s/apps/` (entrypoint Traefik `web`, `ingressClassName: traefik`) :

### Jeu — `wendigo-ingress` (`ingress.yaml`)

| URL | Service |
|-----|---------|
| `http://wendigo.local/` | `frontend:80` |
| `http://wendigo.local/health` | `backend:8080` |
| `http://wendigo.local/auth/*` | `backend:8080` |
| `http://wendigo.local/lobbies/*` | `backend:8080` |
| `http://wendigo.local/ws` | `backend:8080` |
| `http://wendigo.local/metrics` | `backend:8080` |

Chemins Go natifs (pas de StripPrefix). **Pas de** `/api` côté backend.

### Authentik — `authentik-ingress` (`authentik-ingress.yaml`)

| URL | Service |
|-----|---------|
| `http://auth.wendigo.local/` | `authentik-server:80` (Helm Pulumi) |

UI admin + endpoints OIDC (`/application/o/wendigo/`, JWKS, etc.). L’Ingress Helm du chart est **désactivé** pour éviter un doublon.

## Accès LAN

```text
192.168.0.157 wendigo.local
192.168.0.157 auth.wendigo.local
```

NodePort **30900** reste un accès de secours / CI sans hosts.

## Vérif

```bash
curl -sS http://wendigo.local/health
curl -sSf http://auth.wendigo.local/-/health/ready/
kubectl -n wendigo get ingress
```
