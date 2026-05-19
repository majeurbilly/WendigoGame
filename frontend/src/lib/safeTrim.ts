/**
 * Trim défensif : null, undefined ou valeur non chaîne → jamais d’exception à l’exécution.
 */
export function safeTrim(value: unknown): string {
  if (value == null) {
    return ''
  }
  if (typeof value === 'string') {
    return value.trim()
  }
  return String(value).trim()
}

/** Libellé quand le backend / le WS n’envoie pas de nom de joueur exploitable. */
export const UNKNOWN_PLAYER_LABEL = 'Conseiller Inconnu'
