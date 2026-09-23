/**
 * Authentik OIDC — lecture seule via data sources Pulumi.
 * Provisioning : blueprint natif `authentik/blueprints/wendigo-oidc.yaml` (monté Compose).
 * Évite `ProviderOauth2` / `Application` (crash EOF côté bridge TF).
 */
import * as authentik from '@pulumi/authentik';
import * as pulumi from '@pulumi/pulumi';

const authentikUrl = (
  process.env.AUTHENTIK_URL ?? 'http://192.168.0.157:9000'
).replace(/\/+$/, '');

if (!process.env.AUTHENTIK_TOKEN || process.env.AUTHENTIK_TOKEN.trim() === '') {
  throw new Error(
    'AUTHENTIK_TOKEN is required (API token bootstrap Authentik). Example: export AUTHENTIK_TOKEN=...',
  );
}

const applicationSlug = 'wendigo';
const clientId = 'wendigo-dev';
const providerName = 'wendigo-dev-provider';

// Lookup du provider OIDC créé par le blueprint (issuer / JWKS officiels Authentik)
const oidcConfig = authentik.getProviderOauth2Config({
  name: providerName,
});

export const OIDC_ISSUER_URL = pulumi.output(
  oidcConfig.then((c) => c.issuerUrl || `${authentikUrl}/application/o/${applicationSlug}/`),
);
export const AUTHENTIK_JWKS_URL = pulumi.output(
  oidcConfig.then((c) => c.jwksUrl || `${authentikUrl}/application/o/${applicationSlug}/jwks/`),
);
export const OIDC_EXPECTED_ISSUER = OIDC_ISSUER_URL;
export const oidcClientId = clientId;
export const applicationSlugOut = applicationSlug;
export const oidcProviderId = pulumi.output(
  oidcConfig.then((c) => String(c.providerId ?? c.id)),
);
export const oidcProviderName = providerName;
export const oidcProvisioningMode = 'authentik-blueprint';
