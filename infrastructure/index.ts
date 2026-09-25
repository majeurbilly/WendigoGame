/**
 * Authentik Full K8s — Helm + OIDC natif Pulumi (@pulumi/authentik).
 * Postgres/Redis partagés (namespace wendigo). Plus de blueprints YAML.
 */
import * as pulumi from '@pulumi/pulumi';
import {
  createAuthentikApiProvider,
  provisionWendigoOidc,
  resolveAuthentikApiToken,
} from './src/authentik/oidc-app';
import { deployAuthentikHelm } from './src/k8s/authentik';

const authentikConfig = new pulumi.Config('authentik');

const authentikUrl = (
  process.env.AUTHENTIK_URL ??
  authentikConfig.get('url') ??
  'http://192.168.0.157:30900'
).replace(/\/+$/, '');

if (!process.env.AUTHENTIK_TOKEN || process.env.AUTHENTIK_TOKEN.trim() === '') {
  const wendigo = new pulumi.Config('wendigo');
  if (!wendigo.getSecret('authentikBootstrapToken')) {
    throw new Error(
      'AUTHENTIK_TOKEN (env) ou wendigo:authentikBootstrapToken requis pour le provider API Authentik.',
    );
  }
}

const authentikStack = deployAuthentikHelm();
const authentikApi = createAuthentikApiProvider();
const oidc = provisionWendigoOidc({
  authentikProvider: authentikApi,
  authentikUrl,
  authentikToken: resolveAuthentikApiToken(),
  dependsOn: [authentikStack.release],
});

export const authentikNamespace = authentikStack.namespace;
export const authentikInternalUrl = authentikStack.internalUrl;
export const authentikPublicUrl = authentikStack.publicUrl;
export const authentikIngressHost = authentikStack.ingressHost;
export const authentikHelmStatus = authentikStack.release.status;

export const OIDC_ISSUER_URL = oidc.oidcIssuerUrl;
export const AUTHENTIK_JWKS_URL = oidc.authentikJwksUrl;
export const OIDC_EXPECTED_ISSUER = OIDC_ISSUER_URL;
export const oidcClientId = oidc.oidcClientId;
export const applicationSlugOut = oidc.applicationSlug;
export const oidcProviderId = oidc.oidcProviderId;
export const oidcProviderName = oidc.oidcProviderName;
export const oidcApplicationId = oidc.application.id;
export const oidcProvisioningMode = 'authentik-helm+pulumi-native';
