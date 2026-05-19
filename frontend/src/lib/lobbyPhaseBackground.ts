import type { LobbyState } from '@/api/game'
import { isGameOverPhase, isLobbyWaitingPhase } from '@/lib/gamePhase'

const LOBBY_WAITING_BG = '/assets/images/lobby-picture.png'

const PHASE_DAY = '/assets/images/phase_day.png'
const PHASE_COUNCIL = '/assets/images/council.png'
const PHASE_NIGHT = '/assets/images/night.png'
const PHASE_STAKE = '/assets/images/stake.png'
const PHASE_NO_STAKE = '/assets/images/no_stake.png'
const PHASE_MORNING_DEATH = '/assets/images/morning_death.png'
const PHASE_MORNING_NO_DEATH = '/assets/images/morning_nodeath.png'

const nonEmptyId = (id: string | undefined): boolean => Boolean(id?.trim())

/** Arrière-plan plein écran selon la phase et les victimes (nuit / bûcher). */
export function resolveLobbyBackgroundImagePath(lobby: LobbyState | null): string {
  if (!lobby) {
    return LOBBY_WAITING_BG
  }

  const phase = lobby.phase ? String(lobby.phase).toUpperCase() : ''

  if (isLobbyWaitingPhase(phase) || isGameOverPhase(phase)) {
    return LOBBY_WAITING_BG
  }

  switch (phase) {
    case 'DAY':
    case 'CHAIR_SELECTION':
    case 'NO_COUNCIL':
      return PHASE_DAY
    case 'COUNCIL_START':
    case 'ACCUSATION':
    case 'PLEADINGS':
    case 'COUNCIL_VOTE':
    case 'COUNCIL_SUMMARY':
      return PHASE_COUNCIL
    case 'STAKE':
      return nonEmptyId(lobby.lastLynchVictimId) ? PHASE_STAKE : PHASE_NO_STAKE
    case 'NIGHT':
      return PHASE_NIGHT
    case 'MORNING':
      return nonEmptyId(lobby.lastNightVictimId) ? PHASE_MORNING_DEATH : PHASE_MORNING_NO_DEATH
    default:
      return LOBBY_WAITING_BG
  }
}
