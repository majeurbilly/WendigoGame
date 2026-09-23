# Authentik OIDC via Pulumi (registre officiel)

## État actuel

`infrastructure/index.ts` provisionne l’OIDC via le provider **Any Terraform Provider** du registre Pulumi (`goauthentik/authentik`), généré par :

```bash
pulumi package add terraform-provider goauthentik/authentik 2026.8.0
```

Chaîne des ressources :

1. Config native `authentik:url` / `authentik:insecure` (`Pulumi.yaml`) + `AUTHENTIK_TOKEN` (env CI)
2. `authentik.getFlow` — `default-provider-authorization-explicit-consent` et `default-provider-invalidation-flow`
3. `authentik.getCertificateKeyPair` — `authentik Self-signed Certificate` (`fetchKey`/`fetchCertificate: false`)
4. `authentik.ProviderOauth2` (`client_id: wendigo-dev`) → `authentik.Application` slug `wendigo` via `protocolProvider` (`providerOauth2Id`)
5. Exports `OIDC_ISSUER_URL` / `AUTHENTIK_JWKS_URL`

## Choix techniques

- **Plus de SDK local désynchronisé** : le SDK sous `sdks/authentik` est celui généré par `pulumi package add` (version TF `2026.8.0`), déclaré dans `Pulumi.yaml` → `packages.authentik`.
- **Pas de `new authentik.Provider()`** : le bridge lit `AUTHENTIK_TOKEN` / `AUTHENTIK_URL` (ou la config Pulumi). Évite le mismatch de schéma qui provoquait `error reading from server: EOF`.
- **Certificat défaut Authentik** plutôt qu’un `tls.PrivateKey` + `CertificateKeyPair` custom : aligné sur la doc registre, JWKS déjà peuplé par l’instance.
- **`protocolProvider`** attend un `number` → conversion depuis `providerOauth2Id`.

## Prérequis CI

- `AUTHENTIK_TOKEN` = bootstrap token (même secret Compose)
- `AUTHENTIK_URL=http://192.168.0.157:9000`
- `PULUMI_CONFIG_PASSPHRASE` pour état local
- Si des ressources manuelles existent déjà (même slug / client_id), les supprimer ou importer avant `pulumi up`.

## Vérification

```bash
curl -sS http://192.168.0.157:9000/application/o/wendigo/jwks/
# "keys": [ ... ] non vide
```
