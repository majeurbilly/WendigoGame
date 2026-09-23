# Ingress Traefik (k3s) — wendigo.local

## État actuel

`deploy/k8s/apps/ingress.yaml` expose le jeu via Traefik (ingress controller k3s) :

| URL | Backend |
|-----|---------|
| `http://wendigo.local/` | Service `frontend:80` |
| `http://wendigo.local/api/*` | Service `backend:8080` (middleware **StripPrefix** `/api`) |

Le middleware `strip-api-prefix` (`traefik.io/v1alpha1`) retire `/api` avant le Go (`/auth/me`, `/lobbies`, `/ws`…).

Inclus dans `deploy/k8s/kustomization.yaml` → appliqué par la CI (`kubectl apply -k`).

## Accès LAN

Sur la machine cliente (`/etc/hosts` ou `C:\Windows\System32\drivers\etc\hosts`) :

```text
192.168.0.157 wendigo.local
```

## Build frontend (CI)

Défauts workflow :

- `VITE_API_URL=http://wendigo.local/api` → axios + WS (`/api/ws` → strip → `/ws`)
- `VITE_AUTHENTIK_URL=http://192.168.0.157:9000/application/o/wendigo/`

Redirects OIDC blueprint : `http://wendigo.local/` et `/login` (plus IP / Vite).

## Impacts

- Pas de `port-forward` pour le jeu.
- Authentik reste hors cluster sur `:9000`.
- Si le CRD `traefik.io` est absent (très vieux k3s), migrer le Middleware vers `traefik.containo.us/v1alpha1`.
