import { safeTrim } from '@/lib/safeTrim'
import { UserManager, type UserManagerSettings } from 'oidc-client-ts'

/** URL exacte enregistrée côté Authentik comme « redirect URI » (ex. http://localhost:5173/). */
export function getOidcRedirectUri(): string {
  return new URL(import.meta.env.BASE_URL || '/', window.location.origin).href
}

/** Cible post-déconnexion (doit figurer dans Redirect URIs/Origins Authentik). */
export function getPostLogoutRedirectUri(): string {
  return new URL('login', window.location.origin + (import.meta.env.BASE_URL || '/')).href
}

/** Origine du serveur Authentik (ex. http://localhost:9000) dérivée de VITE_AUTHENTIK_URL. */
export function getAuthentikServerOrigin(): string {
  const issuer = safeTrim(import.meta.env.VITE_AUTHENTIK_URL)
  if (!issuer) {
    return 'http://localhost:9000'
  }
  try {
    return new URL(issuer).origin
  } catch {
    return 'http://localhost:9000'
  }
}

/**
 * Flux d'invalidation Authentik avec ?next= — évite l'écran de déconnexion intermédiaire.
 * @see https://goauthentik.io/docs/flow/
 */
export function getAuthentikInvalidationLogoutUrl(
  flowSlug = 'default-invalidation-flow'
): string {
  const next = encodeURIComponent(getPostLogoutRedirectUri())
  return `${getAuthentikServerOrigin()}/if/flow/${flowSlug}/?next=${next}`
}

/** Efface la session OIDC locale puis redirige vers le flux d'invalidation Authentik. */
export async function performAuthentikLogout(): Promise<void> {
  await oidcUserManager.removeUser()
  window.location.assign(getAuthentikInvalidationLogoutUrl())
}

function buildUserManagerSettings(): UserManagerSettings {
  const authority = safeTrim(import.meta.env.VITE_AUTHENTIK_URL).replace(/\/+$/, '')
  const client_id = safeTrim(import.meta.env.VITE_AUTHENTIK_CLIENT_ID)

  return {
    authority,
    client_id,
    redirect_uri: getOidcRedirectUri(),
    post_logout_redirect_uri: getPostLogoutRedirectUri(),
    response_type: 'code',
    scope: 'openid profile email offline_access',
    automaticSilentRenew: true,
    loadUserInfo: true,
  }
}

/** Instance partagée : AuthProvider + intercepteur Axios utilisent le même UserManager (cache OIDC). */
export const oidcUserManager = new UserManager(buildUserManagerSettings())
