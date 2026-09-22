/**
 * MVP Authentik OIDC — Provider OAuth2 + Application "WendigoGame".
 * Chaîne strictement séquentielle via dependsOn (évite la corruption d'état).
 *
 * Prérequis :
 *   export AUTHENTIK_TOKEN="<bootstrap API token>"
 *   export AUTHENTIK_URL="http://192.168.0.157:9000"   # optionnel
 *
 * Stack complète (Google SSO, etc.) : voir index.full.ts
 */
import * as authentik from '@pulumi/authentik';
import * as pulumi from '@pulumi/pulumi';
import * as tls from '@pulumi/tls';

const authentikUrl = (
  process.env.AUTHENTIK_URL ?? 'http://192.168.0.157:9000'
).replace(/\/+$/, '');

const authentikToken = process.env.AUTHENTIK_TOKEN;
if (!authentikToken || authentikToken.trim() === '') {
  throw new Error(
    'AUTHENTIK_TOKEN is required (API token bootstrap Authentik). Example: export AUTHENTIK_TOKEN=...',
  );
}

const applicationSlug = 'wendigo';
const applicationName = 'WendigoGame';
const clientId = 'wendigo-dev';

const timeouts: pulumi.CustomResourceOptions = {
  customTimeouts: { create: '20m', update: '20m', delete: '10m' },
};

function withProvider(
  provider: authentik.Provider,
  opts?: pulumi.CustomResourceOptions,
): pulumi.CustomResourceOptions {
  return { ...timeouts, provider, ...opts };
}

// ── 1. Authentik API provider ───────────────────────────────────────────────
const ak = new authentik.Provider('wendigo-authentik', {
  url: authentikUrl,
  token: pulumi.secret(authentikToken),
  insecure: true,
});

// ── 2. Authorization flow (requis par ProviderOauth2) ───────────────────────
const authorizationFlow = new authentik.Flow(
  'wendigo-provider-authorization-flow',
  {
    name: 'Wendigo: Provider Authorization',
    slug: 'wendigo-provider-authorization',
    title: 'Wendigo: Consent',
    designation: 'authorization',
    authentication: 'require_authenticated',
  },
  withProvider(ak, { dependsOn: [ak] }),
);

// ── 3. Invalidation flow (requis par ProviderOauth2) ────────────────────────
const invalidationFlow = new authentik.Flow(
  'wendigo-provider-invalidation-flow',
  {
    name: 'Wendigo: Provider Invalidation',
    slug: 'wendigo-provider-invalidation',
    title: 'Wendigo: Logout',
    designation: 'invalidation',
    authentication: 'none',
  },
  withProvider(ak, { dependsOn: [authorizationFlow] }),
);

// ── 4. Clé de signature RSA (JWKS non vide) ─────────────────────────────────
const oidcPrivateKey = new tls.PrivateKey(
  'wendigo-oidc-signing-key',
  {
    algorithm: 'RSA',
    rsaBits: 2048,
  },
  { dependsOn: [invalidationFlow] },
);

const oidcSelfSigned = new tls.SelfSignedCert(
  'wendigo-oidc-signing-cert',
  {
    privateKeyPem: oidcPrivateKey.privateKeyPem,
    subject: {
      commonName: 'wendigo-oidc-signing',
      organization: 'Wendigo',
    },
    validityPeriodHours: 87600,
    allowedUses: ['key_encipherment', 'digital_signature'],
  },
  { dependsOn: [oidcPrivateKey] },
);

const signingKey = new authentik.CertificateKeyPair(
  'wendigo-oidc-signing',
  {
    name: 'Wendigo: OIDC Signing (RSA)',
    certificateData: oidcSelfSigned.certPem,
    keyData: oidcPrivateKey.privateKeyPem,
  },
  withProvider(ak, { dependsOn: [oidcSelfSigned] }),
);

// ── 5. OAuth2 / OIDC Provider ───────────────────────────────────────────────
const oidcProvider = new authentik.ProviderOauth2(
  'wendigo-oidc',
  {
    name: applicationName,
    clientId,
    clientType: 'public',
    authorizationFlow: authorizationFlow.uuid,
    invalidationFlow: invalidationFlow.uuid,
    signingKey: signingKey.id,
    issuerMode: 'per_provider',
    subMode: 'user_uuid',
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
  withProvider(ak, { dependsOn: [signingKey] }),
);

// ── 6. Application liée au provider ─────────────────────────────────────────
const application = new authentik.Application(
  'wendigo-app',
  {
    name: applicationName,
    slug: applicationSlug,
    protocolProvider: oidcProvider.id.apply((id) => {
      const n = Number.parseInt(String(id), 10);
      if (!Number.isFinite(n)) {
        throw new pulumi.RunError(`Invalid OIDC provider id: ${id}`);
      }
      return n;
    }),
    metaLaunchUrl: 'http://192.168.0.157/',
    metaPublisher: 'Wendigo Game',
  },
  withProvider(ak, { dependsOn: [oidcProvider] }),
);

// ── Exports (à coller dans deploy/k8s/apps/backend.yaml) ─────────────────────
export const OIDC_ISSUER_URL = pulumi.interpolate`${authentikUrl}/application/o/${applicationSlug}/`;
export const AUTHENTIK_JWKS_URL = pulumi.interpolate`${authentikUrl}/application/o/${applicationSlug}/jwks/`;
export const OIDC_EXPECTED_ISSUER = OIDC_ISSUER_URL;
export const oidcClientId = clientId;
export const applicationSlugOut = applicationSlug;
export const applicationId = application.id;
export const oidcProviderId = oidcProvider.id;
