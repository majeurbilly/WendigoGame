# Authentik OIDC via Pulumi — stub manuel

## État actuel

`infrastructure/index.ts` est un **stub** : plus de `ProviderOauth2` / `Application` Pulumi
(crash API EOF vs version Authentik). Le stack exporte seulement les URLs cibles et un
checklist ; le provisionnement OIDC se fait **dans l’UI Authentik**.

À créer manuellement sur `http://192.168.0.157:9000` :

1. Provider OAuth2/OIDC — `client_id: wendigo-dev`, type public
2. Application slug `wendigo` liée au provider
3. Certificat de signature RSA (sinon JWKS vide → CrashLoop backend)

Exports Pulumi (placeholders) :

- `OIDC_ISSUER_URL` → `http://192.168.0.157:9000/application/o/wendigo/`
- `AUTHENTIK_JWKS_URL` → `…/jwks/`
- `oidcProvisioningMode` → `manual-ui`

La stack complète reste dans `index.full.ts` (non exécutée).

## Stack `dev` (CI)

`Pulumi.dev.yaml` a été **retiré du dépôt**. Le stack est recréé en CI avec
`PULUMI_CONFIG_PASSPHRASE=wendigo-local-state` et `AUTHENTIK_TOKEN` (env).

## Vérification

```bash
curl -sS http://192.168.0.157:9000/application/o/wendigo/jwks/
# doit contenir "keys": [ ... ] non vide après config UI
```
