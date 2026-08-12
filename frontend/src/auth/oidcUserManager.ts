import { safeTrim } from '@/lib/safeTrim'
import { UserManager, type UserManagerSettings } from 'oidc-client-ts'

function normalizeAuthority(raw: string): string {
  const base = safeTrim(raw) || 'http://localhost:9000/application/o/wendigo'
  return base.endsWith('/') ? base : `${base}/`
}

/** URL exacte enregistrée côté Authentik comme « redirect URI ». */
export function getOidcRedirectUri(): string {
  return new URL('login', window.location.origin + (import.meta.env.BASE_URL || '/')).href
}

/** Cible post-déconnexion (doit figurer dans Redirect URIs/Origins Authentik). */
export function getPostLogoutRedirectUri(): string {
  return getOidcRedirectUri()
}

/** RP-initiated logout OIDC : envoie post_logout_redirect_uri à Authentik (end-session). */
export async function performAuthentikLogout(): Promise<void> {
  await oidcUserManager.signoutRedirect({
    post_logout_redirect_uri: getPostLogoutRedirectUri(),
  })
}

export async function resetOidcSession(): Promise<void> {
  await oidcUserManager.clearStaleState()
  await oidcUserManager.removeUser()
}

function buildUserManagerSettings(): UserManagerSettings {
  const authority = normalizeAuthority(
    import.meta.env.VITE_AUTHENTIK_URL || 'http://localhost:9000/application/o/wendigo',
  )
  const client_id =
    safeTrim(import.meta.env.VITE_AUTHENTIK_CLIENT_ID) || 'wendigo-dev'

  return {
    authority,
    client_id,
    redirect_uri: getOidcRedirectUri(),
    post_logout_redirect_uri: getPostLogoutRedirectUri(),
    response_type: 'code',
    scope: 'openid profile email',
    automaticSilentRenew: false,
    // Claims déjà dans l'id_token (Authentik includeClaimsInIdToken) — évite CORS userinfo
    loadUserInfo: false,
  }
}

/** Instance partagée : AuthProvider + intercepteur Axios utilisent le même UserManager (cache OIDC). */
export const oidcUserManager = new UserManager(buildUserManagerSettings())
