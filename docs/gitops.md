# CI/CD Push — k3s (sans ArgoCD)

## État actuel

Déploiement **push** via GitHub Actions. ArgoCD et le modèle GitOps pull ont été abandonnés (charge CPU/RAM de réconciliation sur le serveur k3s).

```
deploy/k8s/
├── kustomization.yaml
├── base/          # namespace, postgres, redis
└── apps/          # backend (replicas: 1), frontend
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

## Prérequis runner self-hosted

- Runner GitHub installé sur le serveur (ou machine LAN) avec accès API k3s (`kubectl` configuré).
- Labels : au minimum `self-hosted` (job `deploy`).

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
- **Authentik / Grafana** : migration K8s toujours à planifier.
