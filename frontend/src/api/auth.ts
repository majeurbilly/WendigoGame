import axios from 'axios'
import { safeTrim } from '@/lib/safeTrim'

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data
    if (typeof payload === 'string' && safeTrim(payload).length > 0) {
      return safeTrim(payload)
    }

    if (typeof payload === 'object' && payload !== null && 'message' in payload) {
      const message = (payload as { message?: unknown }).message
      if (typeof message === 'string' && safeTrim(message).length > 0) {
        return safeTrim(message)
      }
    }
  }

  return 'Unexpected error. Please try again.'
}
