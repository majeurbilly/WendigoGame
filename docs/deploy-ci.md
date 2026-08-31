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
- **Réconciliation Authentik** : purge, repair état (sans toucher aux flows valides), sync token, **`pulumi refresh -y --parallel 2`**, purge pre-up, puis **`pulumi up` retry** (`--parallel 1`, 3 tentatives si 502).
- **`concurrency`** : `cancel-in-progress: false` — file d'attente sur serveur unique.

## Impacts

| Composant | Impact |
|-----------|--------|
| `start.sh` | réparation état pre-refresh, refresh post-réparation, restart backend |
| `repair-wendigo-pulumi-state.py` | `pulumi state delete` des imports `default_*` + purge API des flows orphelins |
| `flake.nix` | Backend Pulumi hors repo ; shellHook Authentik conditionnel |
| Bootstrap | Premier deploy sans `.env.wendigo` ; état Pulumi conservé entre runs |
| Pulumi | Voir `docs/infrastructure.md` (scopes OIDC, cert RSA, pas de Grafana provider) |
