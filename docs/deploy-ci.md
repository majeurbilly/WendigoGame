# Déploiement CI/CD (self-hosted)

## État actuel

Push sur **`dev`** ou **`workflow_dispatch`** → `.github/workflows/deploy.yml` sur runner **`self-hosted`** :

1. Checkout
2. Copie **optionnelle** de `/home/gaston/.env.wendigo` → `.env` (overrides prod ; absent = notice, pas d'échec)
3. `nix develop --command bash ./start.sh` après `source` du profile Nix daemon — expose Node/npm/pnpm/Go/Pulumi au runner (évite `npm: command not found` hors flake)
4. Smoke check + logs Docker si échec

## Choix techniques

- **`.env.wendigo` non bloquant** : sans fichier persistant, Compose utilise les defaults et Pulumi regénère `.env` via `infrastructure/src/docker-env.ts`. L'étape CI sert uniquement aux overrides futurs (URLs publiques, etc.).
- **Secrets primaires** : config chiffrée `infrastructure/Pulumi.dev.yaml` + état `infrastructure/.pulumi/` sur le serveur (gitignoré).
- **`concurrency`** : `cancel-in-progress: false` — file d'attente sur serveur unique.

## Impacts

| Composant | Impact |
|-----------|--------|
| `start.sh` | `wait_authentik` / `verify` : `i=$((i + 1))` au lieu de `((i++))` — sous `set -e`, `((i++))` avec `i=0` quitte avec code 1 (piège Bash, pas curl/502). PATH exporté vers `node_modules/.bin` pour que `tsc` (SDK Authentik / `postinstall.js`) soit trouvé hors PATH système. `run_pulumi` n'appelle plus `./setup-pulumi.sh` (fichier absent du repo) : init stack + token Authentik assurés par `ensure_pulumi_deps()` et le `shellHook` de `flake.nix`. |
| `flake.nix` | Paquet `typescript` dans le devShell — filet de sécurité si `node_modules/.bin` n’est pas encore peuplé. |
| Bootstrap serveur | Plus besoin de créer `.env.wendigo` pour le premier deploy. |
| Overrides | Placer `/home/gaston/.env.wendigo` si besoin ; peut être partiellement écrasé par `pulumi up`. |
