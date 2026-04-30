import { create } from 'zustand'
import { getMeAPI } from '@/api/auth'

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

interface AuthState {
  token: string | null
  user: UserProfile | null
  isAuthenticated: boolean
  isInitializing: boolean
  setToken: (token: string | null) => void
  setUser: (user: UserProfile | null) => void
  logout: () => void
  initAuth: () => Promise<void>
}

const initialToken = localStorage.getItem('token')

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initialToken,
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }

    set({
      token,
      isAuthenticated: Boolean(token),
    })
  },
  setUser: (user) => {
    set({ user })
  },
  logout: () => {
    localStorage.removeItem('token')
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    })
  },
  initAuth: async () => {
    const token = localStorage.getItem('token')
    set({ token })

    if (!token) {
      set({
        isInitializing: false,
        isAuthenticated: false,
      })
      return
    }

    try {
      const me = await getMeAPI()
      set({
        user: {
          id: me.id,
          username: me.username,
          email: me.email,
          games_played: me.games_played,
          games_won: me.games_won,
          games_lost: me.games_lost,
          wins_as_wendigo: me.wins_as_wendigo,
          wins_as_villager: me.wins_as_villager,
          created_at: me.created_at,
          updated_at: me.updated_at,
        },
        isAuthenticated: true,
        isInitializing: false,
      })
    } catch {
      get().logout()
      set({ isInitializing: false })
    }
  },
}))
