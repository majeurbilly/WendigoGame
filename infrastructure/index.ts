/**
 * Authentik OIDC — provider officiel du registre Pulumi
 * (`pulumi package add terraform-provider goauthentik/authentik`).
 *
 * Auth : AUTHENTIK_TOKEN / AUTHENTIK_URL (ou config Pulumi authentik:*).
 * Pas de Provider explicite ni de SDK local bricolé — config native du bridge TF.
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

const timeouts: pulumi.CustomResourceOptions = {
  customTimeouts: { create: '20m', update: '20m', delete: '10m' },
};

// ── 1. Flows défaut Authentik (data sources officiels) ──────────────────────
const authFlow = authentik.getFlow({
  slug: 'default-provider-authorization-explicit-consent',
});

const invalidationFlow = authentik.getFlow({
  slug: 'default-provider-invalidation-flow',
});

// ── 2. Certificat self-signed Authentik (signature OIDC / JWKS) ─────────────
const signingCert = authentik.getCertificateKeyPair({
  name: 'authentik Self-signed Certificate',
  fetchKey: false,
  fetchCertificate: false,
});

// ── 3. Provider OAuth2 / OIDC ────────────────────────────────────────────────
const oidcProvider = new authentik.ProviderOauth2(
  'wendigo-oauth2-provider',
  {
    name: 'wendigo-dev-provider',
    clientId,
    clientType: 'public',
    authorizationFlow: authFlow.then((f) => f.id),
    invalidationFlow: invalidationFlow.then((f) => f.id),
    signingKey: signingCert.then((c) => c.id),
    issuerMode: 'perProvider',
    subMode: 'userUuid',
    includeClaimsInIdToken: true,
    accessTokenValidity: 'minutes=15',
    refreshTokenValidity: 'days=30',
    allowedRedirectUris: [
      { matchingMode: 'strict', url: 'http://192.168.0.157/' },
      { matchingMode: 'strict', url: 'http://192.168.0.157/login' },
      { matchingMode: 'strict', url: 'http://localhost:5173/' },
      { matchingMode: 'strict', url: 'http://localhost:5173/login' },
    ],
  },
  timeouts,
);

// ── 4. Application liée (protocolProvider = ID numérique TF) ────────────────
const wendigoApp = new authentik.Application(
  'wendigo-application',
  {
    name: 'Wendigo',
    slug: applicationSlug,
    protocolProvider: oidcProvider.providerOauth2Id.apply((id) => {
      const n = Number.parseInt(String(id), 10);
      if (!Number.isFinite(n)) {
        throw new pulumi.RunError(`Invalid OIDC provider id: ${id}`);
      }
      return n;
    }),
    metaLaunchUrl: 'http://192.168.0.157/',
    metaPublisher: 'Wendigo Game',
  },
  { ...timeouts, dependsOn: [oidcProvider] },
);

// ── 5. Exports cluster K3s / backend ────────────────────────────────────────
export const OIDC_ISSUER_URL = pulumi.interpolate`${authentikUrl}/application/o/${wendigoApp.slug}/`;
export const AUTHENTIK_JWKS_URL = pulumi.interpolate`${authentikUrl}/application/o/${wendigoApp.slug}/jwks/`;
export const OIDC_EXPECTED_ISSUER = OIDC_ISSUER_URL;
export const oidcClientId = clientId;
export const applicationSlugOut = wendigoApp.slug;
export const oidcProviderId = oidcProvider.providerOauth2Id;
export const oidcProvisioningMode = 'pulumi-registry';
