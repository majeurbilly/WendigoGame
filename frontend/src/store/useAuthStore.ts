import type { User } from 'oidc-client-ts'
import { create } from 'zustand'
import { apiClient } from '@/api/axios'
import { oidcUserManager } from '@/auth/oidcUserManager'
import { internalUserIdFromOidcSub } from '@/lib/internalUserIdFromOidcSub'
import { safeTrim } from '@/lib/safeTrim'

export interface UserProfile {
  id: string
  email: string
  username: string
  picture?: string
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

  const picture =
    safeTrim(p.picture) || safeTrim(p.avatar) || safeTrim(p.avatar_url) || undefined

  return {
    id,
    email,
    username: safeTrim(username) || id,
    picture,
  }
}

function mergeUserProfile(current: UserProfile | null, incoming: UserProfile): UserProfile {
  const id = safeTrim(incoming.id) || safeTrim(current?.id) || 'unknown'
  return {
    ...current,
    ...incoming,
    id,
    email: safeTrim(incoming.email) || safeTrim(current?.email) || '',
    username: safeTrim(incoming.username) || safeTrim(current?.username) || id,
    picture: current?.picture ?? incoming.picture,
  }
}

interface AuthState {
  /** Copie du access_token OIDC pour les hooks qui ne lisent pas encore UserManager (ex. WebSocket). */
  token: string | null
  user: UserProfile | null
  isInitializing: boolean
  setUser: (user: UserProfile | null) => void
  logout: () => void
  /** Synchrone : profil issu des claims OIDC (Authentik / Google). */
  syncFromOidc: (input: OidcAuthSyncInput) => void
  /** Charge pseudo, email et statistiques depuis GET /auth/me (fusionne avec le profil OIDC). */
  fetchMeProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isInitializing: true,
  setUser: (user) => {
    if (user == null) {
      set({ user: null })
      return
    }
    const id = safeTrim(user.id) || 'unknown'
    const picture = safeTrim(user.picture) || undefined
    set({
      user: {
        ...user,
        id,
        email: safeTrim(user.email),
        username: safeTrim(user.username) || id,
        picture,
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

    set((state) => ({
      token: accessToken,
      user: mergeUserProfile(state.user, profile),
      isInitializing: false,
    }))
  },
  fetchMeProfile: async () => {
    if (!safeTrim(get().token)) {
      return
    }
    try {
      const { data } = await apiClient.get<UserProfile>('/auth/me')
      set((state) => ({
        user: state.user ? mergeUserProfile(state.user, data) : data,
      }))
    } catch (error) {
      console.error('fetchMeProfile failed:', error)
    }
  },
}))
