import type { User } from 'oidc-client-ts'
import { create } from 'zustand'
import { oidcUserManager } from '@/auth/oidcUserManager'
import { internalUserIdFromOidcSub } from '@/lib/internalUserIdFromOidcSub'
import { safeTrim } from '@/lib/safeTrim'

export interface UserProfile {
  id: string
  email: string
  username: string
  games_played?: number
  games_won?: number
  games_lost?: number
  wins_as_wendigo?: number
  wins_as_villager?: number
  created_at?: string
  updated_at?: string
}

/** Snapshot minimal depuis react-oidc-context (évite les cycles de rendu sur l’objet `auth`). */
export interface OidcAuthSyncInput {
  isLoading: boolean
  isAuthenticated: boolean
  accessToken: string | null
  oidcUser: User | null | undefined
}

function userProfileFromOidcUser(oidcUser: User | null | undefined): UserProfile | null {
  if (!oidcUser?.profile || typeof oidcUser.profile !== 'object') {
    return null
  }
  const p = oidcUser.profile as Record<string, unknown>
  const rawSub = safeTrim(p.sub)
  if (!rawSub) {
    return null
  }
  const id = internalUserIdFromOidcSub(rawSub)
  if (!id) {
    return null
  }
  const email = safeTrim(p.email)
  const localPart = email.includes('@') ? safeTrim(email.split('@')[0]) : ''
  const username =
    safeTrim(p.preferred_username) ||
    safeTrim(p.name) ||
    safeTrim(p.nickname) ||
    localPart ||
    id

  return {
    id,
    email,
    username: safeTrim(username) || id,
  }
}

interface AuthState {
  /** Copie du access_token OIDC pour les hooks qui ne lisent pas encore UserManager (ex. WebSocket). */
  token: string | null
  user: UserProfile | null
  isInitializing: boolean
  setUser: (user: UserProfile | null) => void
  logout: () => void
  /** Synchrone : profil issu uniquement du jeton / claims OIDC (Authentik), plus d’appel GET /auth/me. */
  syncFromOidc: (input: OidcAuthSyncInput) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isInitializing: true,
  setUser: (user) => {
    if (user == null) {
      set({ user: null })
      return
    }
    const id = safeTrim(user.id) || 'unknown'
    set({
      user: {
        ...user,
        id,
        email: safeTrim(user.email),
        username: safeTrim(user.username) || id,
      },
    })
  },
  logout: () => {
    set({
      token: null,
      user: null,
    })
  },
  syncFromOidc: ({ isLoading, isAuthenticated, accessToken, oidcUser }) => {
    if (isLoading) {
      set({ isInitializing: true })
      return
    }

    if (!isAuthenticated || !accessToken) {
      set({
        token: null,
        user: null,
        isInitializing: false,
      })
      return
    }

    if (!oidcUser?.profile) {
      set({
        token: accessToken,
        user: null,
        isInitializing: true,
      })
      return
    }

    const profile = userProfileFromOidcUser(oidcUser)
    if (!profile) {
      void oidcUserManager.removeUser()
      set({
        token: null,
        user: null,
        isInitializing: false,
      })
      return
    }

    set({
      token: accessToken,
      user: profile,
      isInitializing: false,
    })
  },
}))
