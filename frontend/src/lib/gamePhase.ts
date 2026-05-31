/** Backend uses LOBBY; legacy clients may use WAITING. */
export const isLobbyWaitingPhase = (phase: string | undefined): boolean => {
  if (!phase) {
    return false
  }
  const p = phase.toUpperCase()
  return p === 'LOBBY' || p === 'WAITING'
}

export const isGameOverPhase = (phase: string | undefined): boolean => {
  if (!phase) {
    return false
  }
  const p = phase.toUpperCase()
  return p === 'ENDED' || p === 'GAME_OVER'
}
