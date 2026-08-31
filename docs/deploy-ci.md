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
- **Réconciliation Authentik** : purge, repair (`pulumi import` type `authentik:index/flow:Flow` + wipe providers/apps), sync token, **`repair_then_refresh`**, purge REST pre-up, **`pulumi up` retry** + up final.
- **Backend différé** : pas de démarrage backend avant fin Pulumi (évite JWKS 404 en boucle).
- **Providers TF orphelins** : `pkill terraform-provider-authentik` avant refresh/up.
- **`concurrency`** : `cancel-in-progress: false` — file d'attente sur serveur unique.

## Impacts

| Composant | Impact |
|-----------|--------|
| `start.sh` | `repair_then_refresh`, kill providers orphelins, backend après Pulumi, retry + up final |
| `repair-wendigo-pulumi-state.py` | `pulumi import` des flows orphelins (slug déjà en DB) + `state delete` des entrées fantômes |
| `flake.nix` | Backend Pulumi hors repo ; shellHook Authentik conditionnel |
| Bootstrap | Premier deploy sans `.env.wendigo` ; état Pulumi conservé entre runs |
| Pulumi | Voir `docs/infrastructure.md` (scopes OIDC, cert RSA, pas de Grafana provider) |
