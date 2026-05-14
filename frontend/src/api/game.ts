import { apiClient } from '@/api/axios'

export type LobbyPhase = 'waiting' | 'day' | 'night' | 'ended' | string

export interface Player {
  id: string
  name: string
  isAlive: boolean
  role: string | null
  isHost: boolean
  chairId: number
  isExcludedFromCouncil?: boolean
}

export type GameMode = 'local' | 'online' | string

/** True uniquement pour le mode en ligne (LiveKit / micro). Présentiel = `local` ou absent. */
export function isVoiceChatGameMode(mode: GameMode | undefined): boolean {
  return String(mode ?? 'local').toLowerCase() === 'online'
}

/** Durées de phase (secondes), alignées sur le backend `PhaseSettings`. */
export interface PhaseSettings {
  chairSelectionSeconds: number
  daySocialSeconds: number
  morningSeconds: number
  noCouncilSeconds: number
  councilStartSeconds: number
  councilAccusationPostChairSeconds: number
  councilAccusationAfterDaySeconds: number
  councilSummarySeconds: number
  pleadingSpeechSeconds: number
  councilVoteSeconds: number
  stakeSeconds: number
  nightSeconds: number
  postNightDaySeconds: number
}

export const defaultPhaseSettings = (): PhaseSettings => ({
  chairSelectionSeconds: 10,
  daySocialSeconds: 600,
  morningSeconds: 10,
  noCouncilSeconds: 10,
  councilStartSeconds: 10,
  councilAccusationPostChairSeconds: 30,
  councilAccusationAfterDaySeconds: 120,
  councilSummarySeconds: 10,
  pleadingSpeechSeconds: 45,
  councilVoteSeconds: 45,
  stakeSeconds: 10,
  nightSeconds: 60,
  postNightDaySeconds: 15,
})

export type PhasePresetId = 'blitz' | 'normal' | 'long'

/** Préréglages hôte (restent dans les plages clampées côté serveur). */
export const phasePresetFromId = (id: PhasePresetId): PhaseSettings => {
  switch (id) {
    case 'normal':
      return defaultPhaseSettings()
    case 'blitz':
      return {
        chairSelectionSeconds: 5,
        daySocialSeconds: 300,
        morningSeconds: 5,
        noCouncilSeconds: 5,
        councilStartSeconds: 5,
        councilAccusationPostChairSeconds: 15,
        councilAccusationAfterDaySeconds: 45,
        councilSummarySeconds: 5,
        pleadingSpeechSeconds: 20,
        councilVoteSeconds: 20,
        stakeSeconds: 5,
        nightSeconds: 35,
        postNightDaySeconds: 10,
      }
    case 'long':
      return {
        chairSelectionSeconds: 15,
        daySocialSeconds: 1200,
        morningSeconds: 15,
        noCouncilSeconds: 15,
        councilStartSeconds: 15,
        councilAccusationPostChairSeconds: 45,
        councilAccusationAfterDaySeconds: 180,
        councilSummarySeconds: 15,
        pleadingSpeechSeconds: 90,
        councilVoteSeconds: 75,
        stakeSeconds: 15,
        nightSeconds: 120,
        postNightDaySeconds: 30,
      }
    default:
      return defaultPhaseSettings()
  }
}

/** Payload JSON attendu par le backend (`UPDATE_PHASE_SETTINGS`). */
export const phaseSettingsToServerPayload = (s: PhaseSettings): Record<string, number> => ({
  chair_selection_seconds: s.chairSelectionSeconds,
  day_social_seconds: s.daySocialSeconds,
  morning_seconds: s.morningSeconds,
  no_council_seconds: s.noCouncilSeconds,
  council_start_seconds: s.councilStartSeconds,
  council_accusation_post_chair_seconds: s.councilAccusationPostChairSeconds,
  council_accusation_after_day_seconds: s.councilAccusationAfterDaySeconds,
  council_summary_seconds: s.councilSummarySeconds,
  pleading_speech_seconds: s.pleadingSpeechSeconds,
  council_vote_seconds: s.councilVoteSeconds,
  stake_seconds: s.stakeSeconds,
  night_seconds: s.nightSeconds,
  post_night_day_seconds: s.postNightDaySeconds,
})

export interface LobbyState {
  code: string
  phase: LobbyPhase
  mode?: GameMode
  timeRemaining: number
  phaseTotalSeconds?: number
  phaseSettings: PhaseSettings
  socialPhaseTotalTime?: number
  chairPromptTriggered?: boolean
  isPaused?: boolean
  surrenderVoteActive?: boolean
  surrenderVotes?: Record<string, boolean>
  surrenderApproved?: boolean
  councilAccusations?: Record<string, string>
  wendigoIntentions?: Record<string, string>
  wendigoIntents?: Record<string, string>
  prayerTallies?: Record<string, number>
  pleadingsQueue?: string[]
  currentSpeakerId?: string
  pleadingTimerStarted?: boolean
  votes?: Record<string, string>
  lastLynchVictimId?: string
  lastNightVictimId?: string
  lastNightSavedByPrayer?: boolean
  players: Player[]
  winnerTeam?: 'VILLAGER' | 'WENDIGO' | string
  maxPlayers?: number
  minPlayers?: number
}

interface CreateLobbyResponse {
  code: string
}

export const createLobbyAPI = async (mode: 'local' | 'online' = 'local'): Promise<string> => {
  const { data } = await apiClient.post<CreateLobbyResponse>('/lobbies', { mode })
  return data.code
}

export const startGameAPI = async (code: string, hostPlayerId: string): Promise<void> => {
  await apiClient.post(`/lobbies/${code}/start`, null, {
    headers: { 'X-Player-ID': hostPlayerId },
  })
}
