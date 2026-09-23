# Authentik OIDC — Blueprints + lookup Pulumi

## État actuel

Provisioning OIDC **hors** création de ressources Terraform/Pulumi (évite le crash `EOF` du bridge) :

1. **Blueprint natif** `authentik/blueprints/wendigo-oidc.yaml` monté dans Compose (`/blueprints/custom`)
2. Crée `oauth2provider` (`client_id: wendigo-dev`, public) + `Application` slug `wendigo`
3. **Pulumi** (`infrastructure/index.ts`) ne fait qu’un **lookup** : `authentik.getProviderOauth2Config({ name: "wendigo-dev-provider" })`
4. Exports `OIDC_ISSUER_URL` / `AUTHENTIK_JWKS_URL` depuis les URLs officielles renvoyées par l’API

## Choix techniques

| Couche | Rôle |
|--------|------|
| Blueprint Authentik | Source de vérité OIDC (flows défaut, cert self-signed, scopes, redirects) |
| Compose volume `./authentik/blueprints:/blueprints/custom:ro` | Découverte auto (server + worker) |
| Pulumi `getProviderOauth2Config` | Lecture safe — pas de `ProviderOauth2` / `Application` |
| Provider TF `2024.12.1` | Aligné Compose `2024.12.5` (data sources uniquement) |

## Prérequis CI

- Sync SSH : `docker-compose.yml` + `authentik/blueprints/*.yaml` puis `docker compose up -d`
- Attente `/-/health/ready/` puis JWKS `/application/o/wendigo/jwks/`
- `AUTHENTIK_TOKEN` = bootstrap token (lookup API)

## Migration depuis ProviderOauth2 Pulumi

Si le stack `dev` contient encore d’anciennes ressources `ProviderOauth2` / `Application`, `pulumi up` tentera de les **supprimer** via l’API (risque EOF). Dans ce cas, retirer les URNs du state sans appeler Authentik :

```bash
cd infrastructure
pulumi stack select dev
pulumi state delete '<urn ProviderOauth2>'
pulumi state delete '<urn Application>'
# puis pulumi up -y (lookup only)
```