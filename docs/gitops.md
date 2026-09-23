# CI/CD Push — k3s (sans ArgoCD)

## État actuel

Déploiement **push** via GitHub Actions. ArgoCD et le modèle GitOps pull ont été abandonnés (charge CPU/RAM de réconciliation sur le serveur k3s).

```
deploy/k8s/
├── kustomization.yaml
├── base/          # namespace, postgres, redis
└── apps/          # backend, frontend, ingress (Traefik → wendigo.local)
```

Pipeline : `.github/workflows/ci-cd.yml` (push sur `main`)

| Job | Runner | Rôle |
|-----|--------|------|
| `lint-test` | `ubuntu-latest` | `go test` + ESLint + `tsc -b` |
| `build-backend` / `build-frontend` | `ubuntu-latest` | Build/push GHCR `:latest` + `:${{ github.sha }}` |
| `deploy` | `self-hosted` | `kustomize edit set image` → `kubectl apply -k deploy/k8s` |

## Choix techniques

| Décision | Raison |
|---|---|
| Pas d’ArgoCD | Évite la boucle de sync continue sur machine saturée |
| Hybrid runners | Builds cloud ; deploy local LAN (`192.168.x`) avec kubectl natif |
| Tag SHA en deploy | Image immuable ; patch éphémère via `kustomize edit` (non commité) |
| Backend `replicas: 1` | Hub WebSocket in-memory |
| `ALLOWED_ORIGINS=*` | CORS permissif temporaire |
| `imagePullSecrets: ghcr-creds` | Packages GHCR privés — auth docker-registry côté cluster |
| OIDC / JWKS → `192.168.0.157:9000` | Authentik hors cluster (LAN) ; évite les défauts Go `localhost:9000` |
| Ingress Traefik `wendigo.local` | Frontend `/` + backend `/api` (StripPrefix) — voir `docs/ingress.md` |

## Prérequis runner self-hosted

- Runner GitHub installé sur le serveur (ou machine LAN) avec accès API k3s (`kubectl` configuré).
- Labels : au minimum `self-hosted` (job `deploy`).
- Docker + Compose : exécutés **sur gaston** via SSH depuis le runner (`moumou`) — pas de Docker local requis sur le runner.
- Secrets bootstrap injectés dans `.env` distant ; healthcheck HTTP puis Pulumi (`AUTHENTIK_TOKEN` = bootstrap token).
- Sync `authentik/blueprints/` vers gaston (volume Compose `/blueprints/custom`).

## Secrets GitHub Actions (Authentik)

À définir dans le dépôt (Settings → Secrets) :

| Secret | Usage |
|--------|--------|
| `AUTHENTIK_BOOTSTRAP_PASSWORD` | Mot de passe admin initial (`akadmin`) |
| `AUTHENTIK_BOOTSTRAP_TOKEN` | Token API bootstrap Authentik (+ `AUTHENTIK_TOKEN` pour Pulumi) |

Email bootstrap fixé dans le workflow : `admin@stringempty.dev`.

Compose Authentik : `docker-compose.yml` à la racine (postgres + redis + server + worker, port **9000**) + mount blueprints OIDC.

Après Compose, le job attend le JWKS `/application/o/wendigo/jwks/` puis lance **Pulumi** en **lookup** (`getProviderOauth2Config`) — plus de création `ProviderOauth2` via le bridge TF.

## Secret GHCR (`ghcr-creds`)

Les Deployments `backend` et `frontend` référencent `imagePullSecrets: [{ name: ghcr-creds }]`.

Créer une fois dans le namespace `wendigo` (PAT GitHub avec `read:packages`) :

```bash
kubectl -n wendigo create secret docker-registry ghcr-creds \
  --docker-server=ghcr.io \
  --docker-username=majeurbilly \
  --docker-password=<GITHUB_PAT> \
  --docker-email=<email>
```

Si les packages GHCR sont **publics**, le secret est inutile mais inoffensif tant qu’il existe (sinon `ImagePullBackOff`).

## Impacts

- **CI** : un seul workflow `ci-cd.yml` ; plus de `build-and-push-ghcr.yml` ni `argocd-app.yaml`.
- **Frontend** : Variables repo `VITE_*` (sinon défauts localhost).
- **Authentik** : Compose sur l’hôte ; OIDC via blueprint + lookup Pulumi.
- **Loki / Grafana / Promtail** : **retirés** du dépôt (OOM sur homelab).
