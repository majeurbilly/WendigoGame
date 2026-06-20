export function formatOidcError(error: unknown): string {
  if (error && typeof error === 'object') {
    const e = error as { message?: string; source?: string; innerError?: unknown }
    const parts = [e.message, e.source].filter(Boolean)
    if (parts.length > 0) {
      return parts.join(' — ')
    }
    if (e.innerError) {
      return formatOidcError(e.innerError)
    }
  }
  if (error instanceof Error) {
    return error.message || error.name
  }
  return String(error)
}

export function oidcLoginFailedMessage(detail?: string): string {
  if (detail) {
    return `Échec de la connexion : ${detail}`
  }
  return 'Échec de la connexion. Réessaie.'
}
