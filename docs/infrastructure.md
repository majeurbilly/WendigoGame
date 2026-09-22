# Authentik OIDC via Pulumi — MVP

## État actuel

Programme Pulumi minimal dans `infrastructure/index.ts` :

1. Provider API Authentik (`AUTHENTIK_TOKEN`)
2. Flows authorization + invalidation
3. Certificat RSA de signature (JWKS non vide)
4. `ProviderOauth2` + `Application` slug `wendigo`
5. Exports `OIDC_ISSUER_URL` / `AUTHENTIK_JWKS_URL`

Chaîne **strictement séquentielle** via `dependsOn`.

La stack complète (Google SSO, etc.) est conservée dans `index.full.ts`.

## Commandes

```bash
cd infrastructure

# Dépendances (provider Authentik local + tls)
pnpm install
# ou: npm install

# Token API (bootstrap CI / admin)
export AUTHENTIK_TOKEN="<ton-token>"
export AUTHENTIK_URL="http://192.168.0.157:9000"   # défaut si omis

# Stack
pulumi stack select dev || pulumi stack init dev
pulumi config set authentik:url http://192.168.0.157:9000   # optionnel (env prioritaire)

pulumi up -y

# URLs à coller dans le Deployment backend K8s
pulumi stack output OIDC_ISSUER_URL
pulumi stack output AUTHENTIK_JWKS_URL
```

Vérifier JWKS :

```bash
curl -sS http://192.168.0.157:9000/application/o/wendigo/jwks/ | head
# doit contenir "keys": [ ... ] non vide
```

## Init depuis zéro (si le dossier n’existait pas)

```bash
mkdir -p infrastructure && cd infrastructure
pulumi new typescript --name wendigo-authentik --yes
# Puis remplacer le provider généré par le SDK local :
#   pnpm add @pulumi/pulumi @pulumi/tls
#   pnpm add @pulumi/authentik@file:sdks/authentik
# Ou: pulumi package add terraform-provider goauthentik/authentik <version>
```

Dans ce dépôt, le projet existe déjà (`Pulumi.yaml` + `sdks/authentik`).

## Impacts

| Composant | Impact |
|-----------|--------|
| Backend K8s | `AUTHENTIK_JWKS_URL` / `OIDC_*` → `http://192.168.0.157:9000/application/o/wendigo/...` |
| CrashLoopBackOff | Résolu quand `/jwks/` répond 200 avec des clés |
| `index.full.ts` | Ancienne stack complète — non exécutée tant que `main` = `index.ts` MVP |
| Loki / Grafana | Retirés — plus de dépendance Pulumi ni provisioning `deploy/grafana` |
