/**
 * Authentik Full K8s — Helm (chart officiel) + lookup OIDC blueprint.
 * Postgres/Redis : services partagés du namespace `wendigo` (pas de DB Compose).
 */
import * as authentik from '@pulumi/authentik';
import * as pulumi from '@pulumi/pulumi';
import { deployAuthentikHelm } from './src/k8s/authentik';

const authentikConfig = new pulumi.Config('authentik');

const applicationSlug = 'wendigo';
const clientId = 'wendigo-dev';
const providerName = 'wendigo-dev-provider';

// --- Étape 3 : Authentik dans K3s via Helm ---
const authentikStack = deployAuthentikHelm();

const authentikUrl = (
  process.env.AUTHENTIK_URL ??
  authentikConfig.get('url') ??
  'http://192.168.0.157:30900'
).replace(/\/+$/, '');

if (!process.env.AUTHENTIK_TOKEN || process.env.AUTHENTIK_TOKEN.trim() === '') {
  throw new Error(
    'AUTHENTIK_TOKEN is required (même valeur que wendigo:authentikBootstrapToken). Example: export AUTHENTIK_TOKEN=...',
  );
}

/**
 * Lookup différé après le Release Helm pour que l'API / blueprints soient prêts.
 * Les Invokes classiques s'exécutent trop tôt (avant le create).
 */
const oidcConfig = authentikStack.release.status.apply(async (status) => {
  if (!status) {
    throw new Error('Authentik Helm release status unavailable');
  }
  const deadline = Date.now() + 180_000;
  let lastError: unknown;
  while (Date.now() < deadline) {
    try {
      const cfg = await authentik.getProviderOauth2Config({ name: providerName });
      if (cfg.providerId || cfg.issuerUrl) {
        return cfg;
      }
    } catch (err) {
      lastError = err;
    }
    await new Promise((resolve) => setTimeout(resolve, 5_000));
  }
  throw new Error(
    `Provider OIDC "${providerName}" introuvable après déploiement Helm. Dernière erreur: ${String(lastError)}`,
  );
});

export const authentikNamespace = authentikStack.namespace;
export const authentikInternalUrl = authentikStack.internalUrl;
export const authentikPublicUrl = authentikStack.publicUrl;
export const authentikIngressHost = authentikStack.ingressHost;
export const authentikHelmStatus = authentikStack.release.status;

export const OIDC_ISSUER_URL = oidcConfig.apply(
  (c) => c.issuerUrl || `${authentikUrl}/application/o/${applicationSlug}/`,
);
export const AUTHENTIK_JWKS_URL = oidcConfig.apply(
  (c) => c.jwksUrl || `${authentikUrl}/application/o/${applicationSlug}/jwks/`,
);
export const OIDC_EXPECTED_ISSUER = OIDC_ISSUER_URL;
export const oidcClientId = clientId;
export const applicationSlugOut = applicationSlug;
export const oidcProviderId = oidcConfig.apply((c) => String(c.providerId ?? c.id));
export const oidcProviderName = providerName;
export const oidcProvisioningMode = 'authentik-helm+blueprint';
