# Déploiement CI/CD (self-hosted)

## État actuel

Push sur **`dev`** ou **`workflow_dispatch`** → `.github/workflows/deploy.yml` sur runner **`self-hosted`** (`gaston`) :

1. Checkout
2. Copie **optionnelle** de `/home/gaston/.env.wendigo` → `.env`
3. `nix develop --command bash ./start.sh`
4. Smoke check + logs Docker si échec

## Clean deploy (reset état corrompu)

Option **`clean_deploy`** sur `workflow_dispatch` (ou `WENDIGO_CLEAN_DEPLOY=1` / `./start.sh --clean`) :

1. Rotation token Authentik (`pulumi-deploy`)
2. **`rm -rf $HOME/.pulumi-wendigo`** — état Pulumi local obsolète
3. Purge Authentik Wendigo (ORM `ak shell` + API REST)
4. Nouveau token + `pulumi stack init dev`
5. **`pulumi up` unique** — provisionnement d'une traite, sans import/retry

Usage après désynchronisation état Pulumi / slugs Authentik :

```bash
# Local (runner gaston)
WENDIGO_CLEAN_DEPLOY=1 nix develop --command bash ./start.sh

# GitHub Actions
workflow_dispatch → cocher « clean_deploy »
```

## Pipeline normal (incrémental)

Sans clean deploy :

1. Docker Compose up (backend stoppé jusqu'à Pulumi)
2. Token Authentik roté
3. `pulumi stack select dev`
4. `pulumi up -y --parallel 1`
5. Rebuild frontend (vars Vite OIDC) + verify JWKS

Plus de boucles `repair_then_refresh` / `import` / retries avec purge entre chaque tentative — elles recréaient des orphelins Authentik.

## Choix techniques

- **`.env.wendigo` non bloquant** : defaults Compose + `.env` généré par Pulumi.
- **État Pulumi persistant** : `PULUMI_STATE_DIR` (défaut `$HOME/.pulumi-wendigo`) — survit au checkout CI ; reset explicite via clean deploy uniquement.
- **Backend différé** : pas de JWKS 404 en boucle avant fin Pulumi.
- **`concurrency`** : `cancel-in-progress: false` — file d'attente sur serveur unique.
- **Cache Docker** : voir `docs/docker.md` (couches deps / code / `VITE_*`).

## Scripts manuels (hors CI)

| Script | Usage |
|--------|--------|
| `prune-wendigo-authentik.py` | Purge REST Wendigo (appelé par clean deploy) |
| `prune-wendigo-authentik-ak.py` | Purge ORM via `ak shell` |
| `repair-wendigo-pulumi-state.py` | **Déprécié dans start.sh** — récupération manuelle uniquement |

## Impacts

| Composant | Impact |
|-----------|--------|
| `start.sh` | Pipeline linéaire ; clean deploy one-shot |
| `deploy.yml` | Input `clean_deploy` → `WENDIGO_CLEAN_DEPLOY` |
| Pulumi | Voir `docs/infrastructure.md` |
