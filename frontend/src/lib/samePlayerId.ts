/** Comparaison d’identifiants joueur / JWT (tolère casse, espaces). */
export function samePlayerId(
  a: string | undefined | null,
  b: string | undefined | null
): boolean {
  return safeTrimLower(a) === safeTrimLower(b)
}

function safeTrimLower(v: string | undefined | null): string {
  return String(v ?? '')
    .trim()
    .toLowerCase()
}
