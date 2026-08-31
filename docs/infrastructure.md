# Infrastructure Pulumi (Authentik + observabilité)

## État actuel

Stack `infrastructure/` : provisionne Authentik (OIDC Wendigo, Google SSO), la config Prometheus scrape et génère `.env` pour Docker Compose.

**Grafana** : datasources Prometheus/Loki provisionnés uniquement via `deploy/grafana/provisioning/datasources/datasources.yml` (Zéro ClickOps). Pulumi n’y touche plus — évite les conflits 409 sur redéploiement CI.

**État Pulumi** : backend fichier persistant hors workspace (`$HOME/.pulumi-wendigo` par défaut, `PULUMI_STATE_DIR` surchargeable). Survit au `git clean` du runner Actions.

## Choix techniques (CI / instance fraîche)

- **Zéro `invoke` Authentik fragile** : scopes OIDC et certificat RSA sont des ressources Pulumi (`PropertyMappingProviderScope`, `CertificateKeyPair`).
- **Certificat OIDC** : `@pulumi/tls` + `allowedUses` en snake_case (`key_encipherment`, `digital_signature`).
- **`run_pulumi`** : plus de `nix develop` imbriqué — le workflow lance déjà `nix develop --command bash ./start.sh`. Évite un redémarrage Authentik via le `shellHook` pendant `pulumi up`.
- **`shellHook` flake** : si `/-/health/ready/` répond 200, seul le token API est rafraîchi (pas de `docker compose up` authentik).
- **Réconciliation Authentik** : `prune-wendigo-authentik-ak.py` (Django ORM via `ak shell` dans `authentik-worker`) supprime les objets Wendigo orphelins ; repli API REST (`prune-wendigo-authentik.py`, filtrage client sans `?target=`) si `ak shell` échoue. Puis `pulumi refresh` + `pulumi up`.

## Impacts

| Composant | Impact |
|-----------|--------|
| `deploy.ts` | Suppression `createDatasources` / provider Grafana |
| `index.ts` | `prometheusDatasourceId` / `lokiDatasourceId` = UIDs statiques du YAML |
| `start.sh` | `PULUMI_BACKEND_URL=file://$PULUMI_STATE_DIR`, purge Authentik + `pulumi refresh` avant `up`, `--parallel 2` |
| Backend | JWKS `/application/o/wendigo/jwks/` après `pulumi up` réussi |
| CI | Corrige 409 Grafana, 502 Authentik, 400 « slug already exists » (orphelins API / purge `ak shell`) |
