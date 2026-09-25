import * as authentik from '@pulumi/authentik';
import * as pulumi from '@pulumi/pulumi';

const authentikConfig = new pulumi.Config('authentik');
const wendigoConfig = new pulumi.Config('wendigo');

// Authentik API (lookup OIDC / stack complète)
export const authentikBaseUrl =
  authentikConfig.get('url')?.replace(/\/+$/, '') ?? 'http://192.168.0.157:30900';
export const authentikToken = authentikConfig.requireSecret('token');

export const oidcClientId = wendigoConfig.get('clientId') ?? 'wendigo-dev';
export const oidcClientSecret = wendigoConfig.getSecret('clientSecret');
export const googleClientId = wendigoConfig.require('googleClientId');
export const googleClientSecret = wendigoConfig.requireSecret('googleClientSecret');
export const applicationName = 'Wendigo';
export const applicationSlug = 'wendigo';
export const oidcIncludePropertyMappings =
  wendigoConfig.getBoolean('oidcIncludePropertyMappings') ?? true;

export function parseRedirectUris(raw: string): { matchingMode: string; url: string }[] {
  return raw
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean)
    .map((url) => ({ matchingMode: 'strict', url }));
}

export const allowedRedirectUris = parseRedirectUris(
  wendigoConfig.get('redirectUris') ??
    'http://wendigo.local/,http://wendigo.local/login,http://localhost:5173/,http://localhost:5173/login',
);

export function createAuthentikProvider(): authentik.Provider {
  const configUrl = authentikConfig.get('url')?.replace(/\/+$/, '') ?? authentikBaseUrl;
  const url = process.env.AUTHENTIK_URL?.replace(/\/+$/, '') ?? configUrl;
  // AUTHENTIK_TOKEN env prioritaire sur le secret stack (rotation manuelle / CI).
  const token =
    process.env.AUTHENTIK_TOKEN !== undefined
      ? pulumi.secret(process.env.AUTHENTIK_TOKEN)
      : authentikToken;
  return new authentik.Provider('wendigo-authentik', {
    url,
    token,
    insecure: authentikConfig.getBoolean('insecure') ?? true,
  });
}

// Secrets runtime Authentik (Helm → Secret K8s `authentik-credentials`)
export const authentikSecretKey = wendigoConfig.requireSecret('authentikSecretKey');
export const authentikPgPass = wendigoConfig.requireSecret('authentikPgPass');
export const authentikBootstrapPassword = wendigoConfig.requireSecret(
  'authentikBootstrapPassword',
);
export const authentikBootstrapToken = wendigoConfig.requireSecret('authentikBootstrapToken');
/** Mot de passe du rôle Postgres admin (`wendigo`) — création DB/role Authentik. */
export const pgPassword = wendigoConfig.requireSecret('pgPassword');
