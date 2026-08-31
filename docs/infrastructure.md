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
- **Réconciliation Authentik** : clean deploy (`WENDIGO_CLEAN_DEPLOY=1`) = purge ORM + REST puis `pulumi up` unique. Deploy incrémental = token roté + `pulumi up` sans import/repair.

## Impacts

| Composant | Impact |
|-----------|--------|
| `deploy.ts` | Suppression `createDatasources` / provider Grafana |
| `index.ts` | `prometheusDatasourceId` / `lokiDatasourceId` = UIDs statiques du YAML |
| `start.sh` | `PULUMI_BACKEND_URL=file://$PULUMI_STATE_DIR`, clean deploy ou token + `pulumi up`, backend après Pulumi |
| Backend | JWKS `/application/o/wendigo/jwks/` après `pulumi up` réussi |
| CI | Clean deploy pour reset état ; sinon deploy incrémental linéaire |
