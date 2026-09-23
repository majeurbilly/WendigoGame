# Authentik OIDC via Pulumi (registre officiel)

## État actuel

`infrastructure/index.ts` provisionne l’OIDC via le provider **Any Terraform Provider** du registre Pulumi (`goauthentik/authentik`), généré par :

```bash
pulumi package add terraform-provider goauthentik/authentik 2024.12.1
```

**Alignement de version** : Compose déploie Authentik `2024.12.5` → provider TF pinné à `2024.12.1` (même ligne majeure/mineure). Évite les erreurs de désérialisation API du type `no value given for required property autocomplete` (schéma 2026.x trop récent pour l’instance).

Chaîne des ressources :

1. Config native `authentik:url` / `authentik:insecure` (`Pulumi.yaml`) + `AUTHENTIK_TOKEN` (env CI)
2. `authentik.getFlow` — `default-provider-authorization-explicit-consent` et `default-provider-invalidation-flow`
3. `authentik.getCertificateKeyPair` — `authentik Self-signed Certificate` (`fetchKey`/`fetchCertificate: false`)
4. `authentik.ProviderOauth2` (`client_id: wendigo-dev`) → `authentik.Application` slug `wendigo` via `protocolProvider` (`providerOauth2Id`)
5. Exports `OIDC_ISSUER_URL` / `AUTHENTIK_JWKS_URL`

## Choix techniques

- SDK sous `sdks/authentik` généré par `pulumi package add`, déclaré dans `Pulumi.yaml` → `packages.authentik` (`2024.12.1`).
- Pas de `new authentik.Provider()` : le bridge lit `AUTHENTIK_TOKEN` / `AUTHENTIK_URL`.
- Certificat défaut Authentik plutôt qu’un `tls` + `CertificateKeyPair` custom.
- `protocolProvider` attend un `number` → conversion depuis `providerOauth2Id`.
- Enums OAuth2 (`issuerMode`, `subMode`) : valeurs **snake_case TF** (`per_provider`, `user_uuid`) — le validateur Terraform rejette le camelCase Node (`perProvider` / `userUuid`).

## Prérequis CI

- `AUTHENTIK_TOKEN` = bootstrap token (même secret Compose)
- `AUTHENTIK_URL=http://192.168.0.157:9000`
- `PULUMI_CONFIG_PASSPHRASE` pour état local

## Vérification

```bash
curl -sS http://192.168.0.157:9000/application/o/wendigo/jwks/
# "keys": [ ... ] non vide
```
