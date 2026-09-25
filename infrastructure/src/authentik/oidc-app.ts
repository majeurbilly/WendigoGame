/**
 * Étape 6 — OIDC Wendigo via API Authentik (dynamic resource) + CertificateKeyPair.
 *
 * Pourquoi pas `authentik.ProviderOauth2` ?
 * Le bridge TF 2024.12.x plante en EOF côté plugin Pulumi (pas de POST visible
 * dans les logs Authentik). On utilise `OidcProviderResource` (HTTP + adopt/EOF recovery).
 */
import * as authentik from '@pulumi/authentik';
import * as pulumi from '@pulumi/pulumi';
import * as tls from '@pulumi/tls';
import { OidcProviderResource } from './applications/providers/oidc-provider-resource';
import { akInvokeOpts, akOpts } from '../utils';

export const APPLICATION_NAME = 'Wendigo';
export const APPLICATION_SLUG = 'wendigo';
export const OIDC_CLIENT_ID = 'wendigo-dev';
export const OIDC_PROVIDER_NAME = 'wendigo-dev-provider';

const DEFAULT_REDIRECT_URIS = [
  'http://wendigo.local/',
  'http://wendigo.local/login',
  'http://192.168.0.157/',
  'http://192.168.0.157/login',
  'http://localhost:5173/',
  'http://localhost:5173/login',
];

const BUILTIN_SCOPES = ['openid', 'email', 'profile', 'offline_access'] as const;

export interface WendigoOidcArgs {
  authentikProvider: authentik.Provider;
  authentikUrl: string;
  authentikToken: pulumi.Input<string>;
  dependsOn: pulumi.Input<pulumi.Resource> | pulumi.Input<pulumi.Resource>[];
  redirectUris?: string[];
}

export interface WendigoOidcResult {
  authorizationFlow: authentik.Flow;
  invalidationFlow: authentik.Flow;
  signingCertificate: authentik.CertificateKeyPair;
  oidcProvider: OidcProviderResource;
  application: authentik.Application;
  oidcClientId: string;
  oidcProviderId: pulumi.Output<string>;
  oidcProviderName: string;
  applicationSlug: string;
  oidcIssuerUrl: pulumi.Output<string>;
  authentikJwksUrl: pulumi.Output<string>;
}

function parseRedirectUris(
  urls: string[],
): { matchingMode: string; url: string }[] {
  return urls
    .map((u) => u.trim())
    .filter(Boolean)
    .map((url) => ({ matchingMode: 'strict', url }));
}

async function waitForBuiltinScopes(
  provider: authentik.Provider,
  timeoutMs = 180_000,
): Promise<string[]> {
  const invokeOpts = akInvokeOpts(provider);
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const propertyMappingIds: string[] = [];
      for (const scopeName of BUILTIN_SCOPES) {
        const scope = await authentik.getPropertyMappingProviderScope(
          { scopeName },
          invokeOpts,
        );
        propertyMappingIds.push(scope.id);
      }
      return propertyMappingIds;
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 5_000));
    }
  }

  throw new Error(
    `Scopes OIDC built-in Authentik indisponibles. Dernière erreur: ${String(lastError)}`,
  );
}

function createOidcSigningCertificate(
  provider: authentik.Provider,
  dependsOn: pulumi.Input<pulumi.Resource>[],
): authentik.CertificateKeyPair {
  const privateKey = new tls.PrivateKey(
    'wendigo-oidc-signing-key',
    { algorithm: 'RSA', rsaBits: 2048 },
    { dependsOn },
  );

  const selfSigned = new tls.SelfSignedCert(
    'wendigo-oidc-signing-cert',
    {
      privateKeyPem: privateKey.privateKeyPem,
      subject: {
        commonName: 'wendigo-oidc-signing',
        organization: 'Wendigo',
      },
      validityPeriodHours: 87600,
      allowedUses: ['key_encipherment', 'digital_signature'],
    },
    { dependsOn: [privateKey] },
  );

  return new authentik.CertificateKeyPair(
    'wendigo-jwt-key',
    {
      name: 'Wendigo: OIDC Signing (RSA)',
      certificateData: selfSigned.certPem,
      keyData: privateKey.privateKeyPem,
    },
    akOpts(provider, {
      dependsOn: [...dependsOn, selfSigned],
      customTimeouts: { create: '10m', update: '10m', delete: '5m' },
    }),
  );
}

export function resolveAuthentikApiToken(): pulumi.Input<string> {
  const authentikConfig = new pulumi.Config('authentik');
  const wendigoConfig = new pulumi.Config('wendigo');
  if (process.env.AUTHENTIK_TOKEN && process.env.AUTHENTIK_TOKEN.trim() !== '') {
    return pulumi.secret(process.env.AUTHENTIK_TOKEN);
  }
  try {
    return wendigoConfig.requireSecret('authentikBootstrapToken');
  } catch {
    return authentikConfig.requireSecret('token');
  }
}

export function provisionWendigoOidc(args: WendigoOidcArgs): WendigoOidcResult {
  const { authentikProvider, authentikUrl, authentikToken } = args;
  const dependsOn = Array.isArray(args.dependsOn) ? args.dependsOn : [args.dependsOn];
  const baseOpts = akOpts(authentikProvider, { dependsOn });

  const wendigoConfig = new pulumi.Config('wendigo');
  const redirectUris = parseRedirectUris(
    args.redirectUris ??
      (wendigoConfig.get('redirectUris')?.split(',') ?? DEFAULT_REDIRECT_URIS),
  );

  const authorizationFlow = new authentik.Flow(
    'wendigo-provider-authorization-flow',
    {
      name: 'Wendigo: Provider Authorization',
      slug: 'wendigo-provider-authorization',
      title: 'Wendigo: Consent',
      designation: 'authorization',
      authentication: 'require_authenticated',
    },
    baseOpts,
  );

  const invalidationFlow = new authentik.Flow(
    'wendigo-provider-invalidation-flow',
    {
      name: 'Wendigo: Provider Invalidation',
      slug: 'wendigo-provider-invalidation',
      title: 'Wendigo: Logout',
      designation: 'invalidation',
      authentication: 'none',
    },
    baseOpts,
  );

  const signingCertificate = createOidcSigningCertificate(authentikProvider, [
    ...dependsOn,
    authorizationFlow,
    invalidationFlow,
  ]);

  const propertyMappings = pulumi
    .all([authorizationFlow.uuid, invalidationFlow.uuid, signingCertificate.id])
    .apply(async () => waitForBuiltinScopes(authentikProvider));

  const oidcProvider = new OidcProviderResource(
    'wendigo-oidc',
    {
      authentikUrl,
      authentikToken,
      name: OIDC_PROVIDER_NAME,
      clientId: OIDC_CLIENT_ID,
      clientType: 'public',
      // API REST Authentik exige des UUID (Flow.id = slug côté provider TF)
      authorizationFlow: authorizationFlow.uuid,
      invalidationFlow: invalidationFlow.uuid,
      signingKey: signingCertificate.id,
      issuerMode: 'per_provider',
      subMode: 'user_uuid',
      includeClaimsInIdToken: true,
      accessTokenValidity: 'minutes=15',
      refreshTokenValidity: 'days=30',
      redirectUris,
      propertyMappings,
    },
    {
      dependsOn: [
        ...dependsOn,
        authorizationFlow,
        invalidationFlow,
        signingCertificate,
      ],
      customTimeouts: { create: '20m', update: '20m', delete: '10m' },
    },
  );

  const application = new authentik.Application(
    'wendigo-app',
    {
      name: APPLICATION_NAME,
      slug: APPLICATION_SLUG,
      protocolProvider: oidcProvider.pk,
      metaLaunchUrl: 'http://wendigo.local/',
      metaPublisher: 'Wendigo Game',
      policyEngineMode: 'any',
    },
    akOpts(authentikProvider, {
      dependsOn: [oidcProvider],
      customTimeouts: { create: '20m', update: '20m', delete: '10m' },
    }),
  );

  const oidcIssuerUrl = pulumi.interpolate`${authentikUrl.replace(/\/+$/, '')}/application/o/${APPLICATION_SLUG}/`;
  const authentikJwksUrl = pulumi.interpolate`${oidcIssuerUrl}jwks/`;

  return {
    authorizationFlow,
    invalidationFlow,
    signingCertificate,
    oidcProvider,
    application,
    oidcClientId: OIDC_CLIENT_ID,
    oidcProviderId: oidcProvider.pk.apply(String),
    oidcProviderName: OIDC_PROVIDER_NAME,
    applicationSlug: APPLICATION_SLUG,
    oidcIssuerUrl,
    authentikJwksUrl,
  };
}

export function createAuthentikApiProvider(): authentik.Provider {
  const authentikConfig = new pulumi.Config('authentik');
  const url = (
    process.env.AUTHENTIK_URL ??
    authentikConfig.get('url') ??
    'http://192.168.0.157:30900'
  ).replace(/\/+$/, '');

  return new authentik.Provider('wendigo-authentik-api', {
    url,
    token: resolveAuthentikApiToken(),
    insecure: authentikConfig.getBoolean('insecure') ?? true,
  });
}
