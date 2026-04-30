import axios from 'axios'
import { apiClient } from '@/api/axios'

export interface AuthUser {
  id: string
  username: string
  email: string
}

/** Matches backend `models.User` JSON from GET /auth/me */
export interface AuthMeResponse {
  id: string
  username: string
  email: string
  games_played: number
  games_won: number
  games_lost: number
  wins_as_wendigo: number
  wins_as_villager: number
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface RegisterResponse {
  id: string
  username: string
  email: string
  games_played: number
  games_won: number
  games_lost: number
  wins_as_wendigo: number
  wins_as_villager: number
  created_at: string
  updated_at: string
}

export const loginAPI = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials)
  return data
}

export const registerAPI = async (payload: RegisterRequest): Promise<RegisterResponse> => {
  const { data } = await apiClient.post<RegisterResponse>('/auth/register', payload)
  return data
}

export const getMeAPI = async (): Promise<AuthMeResponse> => {
  const { data } = await apiClient.get<AuthMeResponse>('/auth/me')
  return data
}

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data
    if (typeof payload === 'string' && payload.trim().length > 0) {
      return payload
    }

    if (typeof payload === 'object' && payload !== null && 'message' in payload) {
      const message = (payload as { message?: unknown }).message
      if (typeof message === 'string' && message.trim().length > 0) {
        return message
      }
    }
  }

  return 'Unexpected error. Please try again.'
}
