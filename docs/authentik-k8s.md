# Authentik Full K8s — Helm Pulumi (étape 3)

## État actuel

Authentik tourne **dans K3s** (namespace `wendigo`) via le chart Helm officiel `goauthentik/authentik`, provisionné par Pulumi TypeScript.

| Composant | Source |
|-----------|--------|
| Runtime Authentik (server + worker) | `infrastructure/src/k8s/authentik.ts` → `helm.v3.Release` |
| Postgres | Service partagé `postgres` (DB/role dédiés `authentik`) — Job `authentik-db-init` |
| Redis | Service partagé `redis` (chart Bitnami redis **désactivé**) |
| Secrets | Secret K8s `authentik-credentials` + config Pulumi `--secret` |
| OIDC app | Blueprint `authentik/blueprints/wendigo-oidc.yaml` monté via ConfigMap |
| Lookup issuer/JWKS | `infrastructure/index.ts` (après status Helm) |

`docker-compose.yml` a été **supprimé** de la racine du dépôt — Authentik n’est plus déployé hors cluster.

## Choix techniques

- **`postgresql.enabled: false` / `redis.enabled: false`** : une seule instance Postgres/Redis pour le jeu + Authentik.
- **Credentials Postgres** : `file:///postgres-creds/{username,password}` (Secret monté) — pas de mot de passe en clair dans les values hors secret_key Helm.
- **Bootstrap** : `AUTHENTIK_BOOTSTRAP_*` via `global.env` ← Secret.
- **Exposition** : Ingress Kustomize `auth.wendigo.local` → `authentik-server:80` + NodePort **30900** (LAN / CI).
- Chart épinglé **2024.12.3** (aligné provider TF `2024.12.1`).
- Ingress Helm du chart **désactivé** — source de vérité : `deploy/k8s/apps/authentik-ingress.yaml`.

## Impacts

- Backend : JWKS en ClusterIP ; `OIDC_EXPECTED_ISSUER` = URL NodePort publique.
- CI : plus de SSH Compose ; `pulumi up` déploie le Helm après Postgres/Redis.
- Frontend build : défaut `VITE_AUTHENTIK_URL` → `:30900`.

## Secrets Pulumi (une fois)

```bash
cd infrastructure
pulumi stack select dev   # ou pulumi stack init dev
pulumi config set --secret wendigo:authentikSecretKey "$(openssl rand -base64 48)"
pulumi config set --secret wendigo:authentikPgPass "$(openssl rand -hex 24)"
pulumi config set --secret wendigo:authentikBootstrapPassword '<admin-password>'
pulumi config set --secret wendigo:authentikBootstrapToken '<api-token>'
# Doit matcher POSTGRES_PASSWORD dans deploy/k8s/base/postgres.yaml
pulumi config set --secret wendigo:pgPassword '74c1683725b72d02b0a7ef7146e1e0b45efae36f7cd4a8e4'
```

## Preview / apply

Prérequis : `kubectl` pointant sur le cluster K3s, namespace `wendigo` + Postgres/Redis déjà appliqués.

```bash
kubectl apply -f deploy/k8s/base/namespace.yaml
kubectl apply -f deploy/k8s/base/postgres.yaml
kubectl apply -f deploy/k8s/base/redis.yaml

cd infrastructure
pnpm install
export AUTHENTIK_TOKEN='<même valeur que authentikBootstrapToken>'
export AUTHENTIK_URL='http://192.168.0.157:30900'
export KUBECONFIG=...   # si besoin
export PULUMI_CONFIG_PASSPHRASE='wendigo-local-state'  # si state local

pulumi preview   # ou pnpm preview
pulumi up        # ou pnpm up
```

Vérifications :

```bash
kubectl -n wendigo get pods,svc,ingress -l app.kubernetes.io/name=authentik
curl -sSf http://192.168.0.157:30900/-/health/ready/
curl -sS http://192.168.0.157:30900/application/o/wendigo/jwks/ | head
```
