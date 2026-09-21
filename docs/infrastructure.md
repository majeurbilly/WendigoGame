# Infrastructure Pulumi (Authentik OIDC)

## État actuel

Stack `infrastructure/` : provisionne Authentik (OIDC Wendigo, Google SSO) via Pulumi.

**Phase 1.5** : Docker Compose et `start.sh` sont **supprimés**. Le runtime cible est **k3s + ArgoCD** (`deploy/k8s/`). Cette stack Pulumi n’est plus branchée sur un bootstrap Compose ; la migration Authentik/Grafana vers manifests K8s reste à faire.

**Grafana** : datasources Prometheus/Loki via `deploy/grafana/provisioning/` (Zéro ClickOps) — configs historiques Compose, à rebrancher en cluster.

**État Pulumi** : backend fichier (`$HOME/.pulumi-wendigo`, surcharge `PULUMI_STATE_DIR`).

## Choix techniques

- Scopes OIDC et certificat RSA = ressources Pulumi (`PropertyMappingProviderScope`, `CertificateKeyPair`).
- Certificat OIDC : `@pulumi/tls` + `allowedUses` snake_case.
- Scripts sous `infrastructure/scripts/` (purge Authentik) : utiles uniquement tant qu’une instance Authentik joignable existe.

## Impacts

| Composant | Impact |
|-----------|--------|
| Compose / `start.sh` | Supprimés — plus de génération `.env` Compose |
| `deploy/k8s/` | Source de vérité runtime (postgres, redis, backend, frontend) |
| CI | Build/push GHCR uniquement (`docs/deploy-ci.md`) |
| Authentik sur K8s | Prochaine phase GitOps |
