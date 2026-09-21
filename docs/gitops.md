# GitOps k3s / ArgoCD — Phase 1.5

## État actuel

Orchestration 100 % Kubernetes (GitOps). Docker Compose et `start.sh` ont été **supprimés**. Docker reste uniquement l’outil de **build** d’images (Dockerfiles → GHCR).

```
deploy/k8s/
├── argocd-app.yaml          # Application ArgoCD (bootstrap manuel)
├── kustomization.yaml
├── base/                    # namespace, postgres, redis
└── apps/                    # backend (replicas: 1), frontend
```

CI : `.github/workflows/build-and-push-ghcr.yml` — push sur `main` → build/push
`ghcr.io/majeurbilly/wendigame-{backend,frontend}:latest` (+ tag SHA).

## Choix techniques

| Décision | Raison |
|---|---|
| Org GHCR `majeurbilly` | Dépôt `majeurbilly/WendigoGame` |
| Backend `replicas: 1` + `Recreate` | Hub WebSocket in-memory |
| `ALLOWED_ORIGINS=*` | CORS permissif Phase 1.5 ; middleware Go traite `*` comme allow-all (echo Origin) |
| Mot de passe Postgres en clair dans les manifests | Temporaire — Secret/SealedSecret à venir |
| Pas de Compose | IaC / Authentik / Grafana ciblés K8s uniquement |
| Images `:latest` + `:sha` | ArgoCD suit `latest` ; SHA pour traçabilité |

## Bootstrap cluster

```bash
kubectl apply -f deploy/k8s/argocd-app.yaml -n argocd
```

ArgoCD sync path : `deploy/k8s` (Kustomize exclut `argocd-app.yaml`).

## Impacts

- **CI** : plus de runner self-hosted / `start.sh` ; GitHub-hosted + GHCR.
- **Frontend build** : `VITE_*` via repository Variables (sinon défauts localhost — à surcharger avant prod réelle).
- **Pulumi / Authentik** : hors Compose ; migration K8s à planifier (manifests non inclus Phase 1.5).
- **Observabilité** : configs sous `deploy/{grafana,prometheus,promtail}/` héritées Compose — à rebrancher en K8s.
