import * as path from 'node:path';
import * as authentik from '@pulumi/authentik';
import * as pulumi from '@pulumi/pulumi';

const authentikConfig = new pulumi.Config('authentik');
const grafanaConfig = new pulumi.Config('grafana');
const wendigoConfig = new pulumi.Config('wendigo');

// Authentik IaC
export const authentikBaseUrl =
  authentikConfig.get('url')?.replace(/\/+$/, '') ?? 'http://localhost:9000';
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
  wendigoConfig.get('redirectUris') ?? 'http://localhost:5173/,http://localhost:5173/login',
);

export function createAuthentikProvider(): authentik.Provider {
  const configUrl = authentikConfig.get('url')?.replace(/\/+$/, '') ?? 'http://localhost:9000';
  const url = process.env.AUTHENTIK_URL?.replace(/\/+$/, '') ?? configUrl;
  // CI: start.sh exporte AUTHENTIK_TOKEN après rotation — prioritaire sur le secret stack
  // pour éviter un refresh avec le token figé dans l'état du provider.
  const token =
    process.env.AUTHENTIK_TOKEN !== undefined
      ? pulumi.secret(process.env.AUTHENTIK_TOKEN)
      : authentikToken;
  return new authentik.Provider('wendigo-authentik', {
    url,
    token,
    insecure: authentikConfig.getBoolean('insecure') ?? false,
  });
}

// Docker Compose secrets (written to .env by the dotenv resource)
export const authentikSecretKey = wendigoConfig.requireSecret('authentikSecretKey');
export const authentikPgPass = wendigoConfig.requireSecret('authentikPgPass');
export const authentikBootstrapPassword = wendigoConfig.requireSecret('authentikBootstrapPassword');
export const pgPassword = wendigoConfig.requireSecret('pgPassword');

// Grafana
export const grafanaUrl = grafanaConfig.get('url') ?? 'http://localhost:3000';
export const grafanaAdminUser = grafanaConfig.get('adminUser') ?? 'admin';
export const grafanaAdminPassword = grafanaConfig.requireSecret('adminPassword');

export const prometheusUrl = wendigoConfig.get('prometheusUrl') ?? 'http://prometheus:9090';
export const lokiUrl = wendigoConfig.get('lokiUrl') ?? 'http://loki:3100';
export const prometheusReloadUrl =
  wendigoConfig.get('prometheusReloadUrl') ?? 'http://localhost:9090';

// __dirname = infrastructure/src; one level up reaches infrastructure/
export const prometheusConfigPath = path.resolve(__dirname, '../assets/prometheus/prometheus.yml');
