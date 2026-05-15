import axios, { type AxiosRequestHeaders, type InternalAxiosRequestConfig } from 'axios'
import { safeTrim } from '@/lib/safeTrim'
import { useAuthStore } from '@/store/useAuthStore'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL,
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = safeTrim(useAuthStore.getState().token)
  if (!token) {
    return config
  }

  const headers: AxiosRequestHeaders = (config.headers ?? {}) as AxiosRequestHeaders
  headers.Authorization = `Bearer ${token}`
  config.headers = headers

  return config
})

// Ticket 5.7 : pas d’intercepteur 401 → logout / Zustand ici (risque de boucles avec OIDC et APIs sans lien profil).

export interface ApiResponse<TData> {
  data: TData
  message?: string
}
