# Déploiement CI/CD (self-hosted)

## État actuel

Push sur **`dev`** ou **`workflow_dispatch`** → `.github/workflows/deploy.yml` sur runner **`self-hosted`** :

1. Checkout
2. Copie **optionnelle** de `/home/gaston/.env.wendigo` → `.env` (overrides prod ; absent = notice, pas d'échec)
3. `bash ./start.sh` (Compose defaults → `pulumi up` génère `.env` à la racine)
4. Smoke check + logs Docker si échec

## Choix techniques

- **`.env.wendigo` non bloquant** : sans fichier persistant, Compose utilise les defaults et Pulumi regénère `.env` via `infrastructure/src/docker-env.ts`. L'étape CI sert uniquement aux overrides futurs (URLs publiques, etc.).
- **Secrets primaires** : config chiffrée `infrastructure/Pulumi.dev.yaml` + état `infrastructure/.pulumi/` sur le serveur (gitignoré).
- **`concurrency`** : `cancel-in-progress: false` — file d'attente sur serveur unique.

## Impacts

| Composant | Impact |
|-----------|--------|
| `start.sh` | Inchangé ; `compose_up` avant `pulumi up`. |
| Bootstrap serveur | Plus besoin de créer `.env.wendigo` pour le premier deploy. |
| Overrides | Placer `/home/gaston/.env.wendigo` si besoin ; peut être partiellement écrasé par `pulumi up`. |
