import { create } from 'zustand'

export interface UserProfile {
  id: string
  email: string
  username: string
}

interface AuthState {
  token: string | null
  user: UserProfile | null
  isAuthenticated: boolean
  setToken: (token: string | null) => void
  setUser: (user: UserProfile | null) => void
  logout: () => void
}

const initialToken = localStorage.getItem('token')

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  user: null,
  isAuthenticated: Boolean(initialToken),
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
}))
