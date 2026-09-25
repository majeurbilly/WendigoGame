/**
 * Étape 6 — OIDC Wendigo via provider Authentik natif (@pulumi/authentik).
 * Remplace le blueprint YAML `authentik/blueprints/wendigo-oidc.yaml`.
 */
import * as authentik from '@pulumi/authentik';
import * as pulumi from '@pulumi/pulumi';
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
  /** URL publique Authentik (issuer / JWKS exports). */
  authentikUrl: string;
  /** Typiquement le Helm Release — l'API doit être joignable avant create. */
  dependsOn: pulumi.Input<pulumi.Resource> | pulumi.Input<pulumi.Resource>[];
  redirectUris?: string[];
}

export interface WendigoOidcResult {
  authorizationFlow: authentik.Flow;
  invalidationFlow: authentik.Flow;
  oidcProvider: authentik.ProviderOauth2;
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

async function waitForBuiltinOidcDeps(
  provider: authentik.Provider,
  timeoutMs = 180_000,
): Promise<{ signingKeyId: string; propertyMappingIds: string[] }> {
  const invokeOpts = akInvokeOpts(provider);
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const signing = await authentik.getCertificateKeyPair(
        {
          name: 'authentik Self-signed Certificate',
          fetchCertificate: false,
          fetchKey: false,
        },
        invokeOpts,
      );

      const propertyMappingIds: string[] = [];
      for (const scopeName of BUILTIN_SCOPES) {
        const scope = await authentik.getPropertyMappingProviderScope(
          { scopeName },
          invokeOpts,
        );
        propertyMappingIds.push(scope.id);
      }

      return { signingKeyId: signing.id, propertyMappingIds };
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 5_000));
    }
  }

  throw new Error(
    `Authentik builtins (signing cert / OIDC scopes) indisponibles. Dernière erreur: ${String(lastError)}`,
  );
}

/**
 * Flows + ProviderOauth2 + Application — idempotent via state Pulumi.
 */
export function provisionWendigoOidc(args: WendigoOidcArgs): WendigoOidcResult {
  const { authentikProvider, authentikUrl } = args;
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

  // Lookups différés après Helm (+ flows) pour éviter les invokes trop tôt (cold boot).
  const builtins = pulumi
    .all([authorizationFlow.id, invalidationFlow.id])
    .apply(async () => waitForBuiltinOidcDeps(authentikProvider));

  const oidcProvider = new authentik.ProviderOauth2(
    'wendigo-oidc',
    {
      name: OIDC_PROVIDER_NAME,
      clientId: OIDC_CLIENT_ID,
      clientType: 'public',
      authorizationFlow: authorizationFlow.id,
      invalidationFlow: invalidationFlow.id,
      signingKey: builtins.signingKeyId,
      issuerMode: 'perProvider',
      subMode: 'userUuid',
      includeClaimsInIdToken: true,
      accessTokenValidity: 'minutes=15',
      refreshTokenValidity: 'days=30',
      allowedRedirectUris: redirectUris,
      propertyMappings: builtins.propertyMappingIds,
    },
    akOpts(authentikProvider, {
      dependsOn: [...dependsOn, authorizationFlow, invalidationFlow],
      customTimeouts: { create: '20m', update: '20m', delete: '10m' },
    }),
  );

  const application = new authentik.Application(
    'wendigo-app',
    {
      name: APPLICATION_NAME,
      slug: APPLICATION_SLUG,
      protocolProvider: oidcProvider.providerOauth2Id.apply((id) => {
        const n = Number.parseInt(String(id), 10);
        if (!Number.isFinite(n)) {
          throw new pulumi.RunError(
            `Invalid OIDC provider ID from ProviderOauth2: ${String(id)}`,
          );
        }
        return n;
      }),
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
    oidcProvider,
    application,
    oidcClientId: OIDC_CLIENT_ID,
    oidcProviderId: oidcProvider.providerOauth2Id,
    oidcProviderName: OIDC_PROVIDER_NAME,
    applicationSlug: APPLICATION_SLUG,
    oidcIssuerUrl,
    authentikJwksUrl,
  };
}

/**
 * Provider API Authentik (URL + token bootstrap).
 * Token : AUTHENTIK_TOKEN (env/CI) > wendigo:authentikBootstrapToken > authentik:token
 */
export function createAuthentikApiProvider(): authentik.Provider {
  const authentikConfig = new pulumi.Config('authentik');
  const wendigoConfig = new pulumi.Config('wendigo');

  const url = (
    process.env.AUTHENTIK_URL ??
    authentikConfig.get('url') ??
    'http://192.168.0.157:30900'
  ).replace(/\/+$/, '');

  let token: pulumi.Input<string>;
  if (process.env.AUTHENTIK_TOKEN && process.env.AUTHENTIK_TOKEN.trim() !== '') {
    token = pulumi.secret(process.env.AUTHENTIK_TOKEN);
  } else {
    try {
      token = wendigoConfig.requireSecret('authentikBootstrapToken');
    } catch {
      token = authentikConfig.requireSecret('token');
    }
  }

  return new authentik.Provider('wendigo-authentik-api', {
    url,
    token,
    insecure: authentikConfig.getBoolean('insecure') ?? true,
  });
}
