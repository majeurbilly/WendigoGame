/**
 * Authentik OIDC — Provider OAuth2 + Application "wendigo".
 * SDK local: @pulumi/authentik (file:sdks/authentik). Auth via AUTHENTIK_TOKEN.
 *
 * Ordre strict dependsOn : Provider API → cert → OAuth2 → Application.
 * Flows d'authz / invalidation : lookup des flows défaut Authentik (évite IDs manquants).
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
const clientId = 'wendigo-dev';

const timeouts: pulumi.CustomResourceOptions = {
  customTimeouts: { create: '20m', update: '20m', delete: '10m' },
};

function withAk(
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

// ── 2. Flows défaut Authentik (IDs résolus avant ProviderOauth2) ─────────────
const authFlow = authentik.getFlowOutput(
  { slug: 'default-provider-authorization-explicit-consent' },
  { provider: ak },
);

const invalidationFlow = authentik.getFlowOutput(
  { slug: 'default-provider-invalidation-flow' },
  { provider: ak },
);

// ── 3. Clé RSA + CertificateKeyPair (certificateData obligatoire) ───────────
const oidcPrivateKey = new tls.PrivateKey('wendigo-oidc-signing-key', {
  algorithm: 'RSA',
  rsaBits: 2048,
});

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

const signingKeyPair = new authentik.CertificateKeyPair(
  'wendigo-oidc-signing',
  {
    name: 'Wendigo: OIDC Signing (RSA)',
    certificateData: oidcSelfSigned.certPem,
    keyData: oidcPrivateKey.privateKeyPem,
  },
  withAk(ak, { dependsOn: [oidcSelfSigned] }),
);

// ── 4. OAuth2 / OIDC Provider ───────────────────────────────────────────────
const oidcProvider = new authentik.ProviderOauth2(
  'wendigo-oauth2-provider',
  {
    name: 'wendigo-dev-provider',
    clientId,
    clientType: 'public',
    signingKey: signingKeyPair.id,
    authorizationFlow: authFlow.id,
    invalidationFlow: invalidationFlow.id,
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
  withAk(ak, { dependsOn: [signingKeyPair] }),
);

// ── 5. Application liée au provider ─────────────────────────────────────────
const wendigoApplication = new authentik.Application(
  'wendigo-application',
  {
    name: 'Wendigo',
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
  withAk(ak, { dependsOn: [oidcProvider] }),
);

// ── 6. Exports (backend K8s / vérif JWKS) ───────────────────────────────────
export const OIDC_ISSUER_URL = pulumi.interpolate`${authentikUrl}/application/o/${wendigoApplication.slug}/`;
export const AUTHENTIK_JWKS_URL = pulumi.interpolate`${authentikUrl}/application/o/${wendigoApplication.slug}/jwks/`;
export const OIDC_EXPECTED_ISSUER = OIDC_ISSUER_URL;
export const oidcClientId = clientId;
export const applicationSlugOut = wendigoApplication.slug;
export const oidcProviderId = oidcProvider.id;
export const oidcProvisioningMode = 'pulumi';
