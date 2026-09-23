/**
 * Stub Pulumi — OIDC Provider / Application gérés manuellement dans l'UI Authentik.
 *
 * ProviderOauth2 + Application ont été retirés : le provider Pulumi crashait en EOF
 * (mismatch schéma / API vs version Authentik). On re-couche le code IaC plus tard.
 *
 * Créer manuellement dans http://192.168.0.157:9000 :
 *   - Provider OAuth2/OIDC (client_id: wendigo-dev)
 *   - Application slug `wendigo`, liée au provider, avec clé de signature RSA (JWKS non vide)
 *
 * Stack complète (Google SSO, etc.) : voir index.full.ts
 */
const authentikUrl = (
  process.env.AUTHENTIK_URL ?? 'http://192.168.0.157:9000'
).replace(/\/+$/, '');

// Conservé pour valider le pipeline CI (même secret bootstrap que Compose)
const authentikToken = process.env.AUTHENTIK_TOKEN;
if (!authentikToken || authentikToken.trim() === '') {
  throw new Error(
    'AUTHENTIK_TOKEN is required (API token bootstrap Authentik). Example: export AUTHENTIK_TOKEN=...',
  );
}

const applicationSlug = 'wendigo';
const clientId = 'wendigo-dev';

// Exports attendus par la doc / backend K8s (URLs cibles après config UI manuelle)
export const OIDC_ISSUER_URL = `${authentikUrl}/application/o/${applicationSlug}/`;
export const AUTHENTIK_JWKS_URL = `${authentikUrl}/application/o/${applicationSlug}/jwks/`;
export const OIDC_EXPECTED_ISSUER = OIDC_ISSUER_URL;
export const oidcClientId = clientId;
export const applicationSlugOut = applicationSlug;
export const oidcProvisioningMode = 'manual-ui';
export const oidcManualChecklist = [
  'Authentik UI → Create OAuth2/OpenID Provider (client_id: wendigo-dev, type: public)',
  'Create Application slug=wendigo linked to that provider',
  'Attach signing certificate so /application/o/wendigo/jwks/ returns non-empty keys',
  'Redirect URIs: http://192.168.0.157/ , http://192.168.0.157/login , http://localhost:5173/',
].join(' | ');
