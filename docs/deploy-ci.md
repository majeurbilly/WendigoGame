# Déploiement CI/CD (self-hosted)

## État actuel

Push sur **`dev`** ou **`workflow_dispatch`** → `.github/workflows/deploy.yml` sur runner **`self-hosted`** :

1. Checkout
2. Copie **optionnelle** de `/home/gaston/.env.wendigo` → `.env`
3. `nix develop --command bash ./start.sh`
4. Smoke check + logs Docker si échec

## Choix techniques

- **`.env.wendigo` non bloquant** : sans fichier persistant, Compose utilise les defaults et Pulumi regénère `.env` via `docker-env.ts`.
- **État Pulumi persistant** : `PULUMI_STATE_DIR` (défaut `$HOME/.pulumi-wendigo`) — non effacé par `git clean` du checkout CI. Les retries reprennent les ressources déjà créées.
- **Un seul `nix develop`** : `run_pulumi()` appelle `pulumi` directement ; le `shellHook` ne redémarre plus Authentik si le healthcheck est déjà OK.
- **Réconciliation Authentik** : purge ORM puis REST. **`import_authentik_orphans` avant `sync_authentik_provider`** (répare les imports `default_*` avant `pulumi up --target`). Token roté + sync provider, puis **`pulumi refresh -y --parallel 2`**, puis `pulumi up`. Backend recréé après `pulumi up` pour JWKS.
- **`concurrency`** : `cancel-in-progress: false` — file d'attente sur serveur unique.

## Impacts

| Composant | Impact |
|-----------|--------|
| `start.sh` | sync provider via `refresh --target`, import orphelins, refresh post-import, restart backend |
| `import-wendigo-orphans.py` | `pulumi import` avec provider `wendigo-authentik` ; répare les imports `default_*` |
| `flake.nix` | Backend Pulumi hors repo ; shellHook Authentik conditionnel |
| Bootstrap | Premier deploy sans `.env.wendigo` ; état Pulumi conservé entre runs |
| Pulumi | Voir `docs/infrastructure.md` (scopes OIDC, cert RSA, pas de Grafana provider) |
