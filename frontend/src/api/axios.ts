import axios, { type AxiosRequestHeaders, type InternalAxiosRequestConfig } from 'axios'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL,
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')

  if (!token) {
    return config
  }

  const headers: AxiosRequestHeaders = (config.headers ?? {}) as AxiosRequestHeaders
  headers.Authorization = `Bearer ${token}`
  config.headers = headers

  return config
})

export interface ApiResponse<TData> {
  data: TData
  message?: string
}
