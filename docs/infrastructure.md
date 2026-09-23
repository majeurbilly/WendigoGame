# Authentik OIDC via Pulumi

## État actuel

`infrastructure/index.ts` provisionne à nouveau l’OIDC via Pulumi (`@pulumi/authentik`) :

1. Provider API (`AUTHENTIK_TOKEN` / `AUTHENTIK_URL`)
2. Lookup flows défaut (`default-provider-authorization-explicit-consent`, `default-provider-invalidation-flow`)
3. Certificat RSA (`CertificateKeyPair`) — JWKS non vide
4. `ProviderOauth2` (`client_id: wendigo-dev`) → `Application` slug `wendigo`
5. Exports `OIDC_ISSUER_URL` / `AUTHENTIK_JWKS_URL`

Chaîne `dependsOn` : cert → OAuth2 → Application.

## Prérequis CI

- `AUTHENTIK_TOKEN` = bootstrap token (même secret Compose)
- `PULUMI_CONFIG_PASSPHRASE` pour état local
- Si des ressources **manuelles** existent déjà (même slug / client_id), les supprimer dans l’UI ou les importer avant `pulumi up` pour éviter les conflits 400.

## Vérification

```bash
curl -sS http://192.168.0.157:9000/application/o/wendigo/jwks/
# "keys": [ ... ] non vide
```
