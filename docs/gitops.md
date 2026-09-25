# CI/CD Push — k3s (sans ArgoCD)

## État actuel

Déploiement **push** via GitHub Actions. ArgoCD et le modèle GitOps pull ont été abandonnés (charge CPU/RAM de réconciliation sur le serveur k3s).

```
deploy/k8s/
├── kustomization.yaml
├── base/          # namespace, postgres, redis
└── apps/          # backend, frontend, ingress (Traefik → wendigo.local)

infrastructure/    # Pulumi : Authentik Helm + lookup OIDC
```

Pipeline : `.github/workflows/ci-cd.yml` (push sur `main`)

| Job | Runner | Rôle |
|-----|--------|------|
| `lint-test` | `ubuntu-latest` | `go test` + ESLint + `tsc -b` |
| `build-backend` / `build-frontend` | `ubuntu-latest` | Build/push GHCR `:latest` + `:${{ github.sha }}` |
| `deploy` | `self-hosted` | Postgres/Redis → Pulumi Authentik Helm → `kubectl apply -k` apps |

## Choix techniques

| Décision | Raison |
|---|---|
| Pas d’ArgoCD | Évite la boucle de sync continue sur machine saturée |
| Hybrid runners | Builds cloud ; deploy local LAN (`192.168.x`) avec kubectl natif |
| Tag SHA en deploy | Image immuable ; patch éphémère via `kustomize edit` (non commité) |
| Backend `replicas: 1` | Hub WebSocket in-memory |
| `ALLOWED_ORIGINS=*` | CORS permissif temporaire |
| `imagePullSecrets: ghcr-creds` | Packages GHCR privés — auth docker-registry côté cluster |
| Authentik in-cluster | Helm Pulumi ; NodePort **30900** + Ingress `auth.wendigo.local` |
| Ingress Traefik `wendigo.local` | Frontend `/` + backend chemins natifs — voir `docs/ingress.md` |

## Prérequis runner self-hosted

- Runner GitHub avec accès API k3s (`kubectl` configuré).
- Labels : au minimum `self-hosted` (job `deploy`).
- Stack Pulumi `dev` avec secrets `wendigo:authentik*` et `wendigo:pgPassword` (voir `docs/authentik-k8s.md`).
- `AUTHENTIK_TOKEN` CI = `AUTHENTIK_BOOTSTRAP_TOKEN` (secret GitHub).

## Secrets GitHub Actions (Authentik / Pulumi)

Source de vérité pour un runner neuf — injectés à chaque deploy via `pulumi config set --secret` :

| Secret GitHub | Clé Pulumi stack | Usage |
|---------------|------------------|--------|
| `AUTHENTIK_BOOTSTRAP_PASSWORD` | `wendigo:authentikBootstrapPassword` | Admin Authentik initial |
| `AUTHENTIK_BOOTSTRAP_TOKEN` | `wendigo:authentikBootstrapToken` (+ env `AUTHENTIK_TOKEN`) | API bootstrap / lookup OIDC |
| `AUTHENTIK_SECRET_KEY` | `wendigo:authentikSecretKey` | Cookie / crypto Authentik (≥50 chars) |
| `AUTHENTIK_PG_PASS` | `wendigo:authentikPgPass` | Mot de passe rôle Postgres `authentik` |
| `PULUMI_PG_PASSWORD` | `wendigo:pgPassword` | Admin Postgres `wendigo` (Job db-init ; aligné `postgres.yaml`) |

Email bootstrap : `admin@stringempty.dev` (Secret K8s / values Helm).

## Secret GHCR (`ghcr-creds`)

```bash
kubectl -n wendigo create secret docker-registry ghcr-creds \
  --docker-server=ghcr.io \
  --docker-username=majeurbilly \
  --docker-password=<GITHUB_PAT> \
  --docker-email=<email>
```

## Impacts

- **CI** : Authentik via Pulumi Helm + OIDC natif — `docker-compose.yml` / blueprints YAML retirés.
- **Frontend** : Variables repo `VITE_*` (défaut Authentik `:30900`).
- **Loki / Grafana / Promtail** : retirés (OOM homelab).

Voir aussi `docs/authentik-k8s.md`, `docs/infrastructure.md`.
