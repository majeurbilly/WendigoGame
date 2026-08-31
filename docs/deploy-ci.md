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
- **Réconciliation Authentik** : purge ORM + repli REST (3 tentatives si 502). Token roté + `sync_authentik_provider` via URN regex (`grep -oE`, pas `awk $1` sur l'arbre `├─`). Backend recréé après `pulumi up` pour charger JWKS.
- **`concurrency`** : `cancel-in-progress: false` — file d'attente sur serveur unique.

## Impacts

| Composant | Impact |
|-----------|--------|
| `start.sh` | URN provider via `grep -oE`, retry purge REST, restart backend post-`pulumi up` |
| `flake.nix` | Backend Pulumi hors repo ; shellHook Authentik conditionnel |
| Bootstrap | Premier deploy sans `.env.wendigo` ; état Pulumi conservé entre runs |
| Pulumi | Voir `docs/infrastructure.md` (scopes OIDC, cert RSA, pas de Grafana provider) |
