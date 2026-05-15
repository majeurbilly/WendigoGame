import { safeTrim } from '@/lib/safeTrim'
import { UserManager, type UserManagerSettings } from 'oidc-client-ts'

/** URL exacte enregistrée côté Authentik comme « redirect URI » (ex. http://localhost:5173/). */
export function getOidcRedirectUri(): string {
  return new URL(import.meta.env.BASE_URL || '/', window.location.origin).href
}

function buildUserManagerSettings(): UserManagerSettings {
  const authority = safeTrim(import.meta.env.VITE_AUTHENTIK_URL).replace(/\/+$/, '')
  const client_id = safeTrim(import.meta.env.VITE_AUTHENTIK_CLIENT_ID)

  return {
    authority,
    client_id,
    redirect_uri: getOidcRedirectUri(),
    post_logout_redirect_uri: `${window.location.origin}/login`,
    response_type: 'code',
    scope: 'openid profile email offline_access',
    automaticSilentRenew: true,
    loadUserInfo: true,
  }
}

/** Instance partagée : AuthProvider + intercepteur Axios utilisent le même UserManager (cache OIDC). */
export const oidcUserManager = new UserManager(buildUserManagerSettings())
