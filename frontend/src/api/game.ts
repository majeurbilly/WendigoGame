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

/** Durées de phase (secondes), alignées sur le backend `PhaseSettings`. */
export interface PhaseSettings {
  chairSelectionSeconds: number
  daySocialSeconds: number
  councilStartSeconds: number
  councilAccusationPostChairSeconds: number
  councilAccusationAfterDaySeconds: number
  pleadingSpeechSeconds: number
  councilVoteSeconds: number
  nightSeconds: number
  postNightDaySeconds: number
}

export const defaultPhaseSettings = (): PhaseSettings => ({
  chairSelectionSeconds: 10,
  daySocialSeconds: 600,
  councilStartSeconds: 10,
  councilAccusationPostChairSeconds: 30,
  councilAccusationAfterDaySeconds: 120,
  pleadingSpeechSeconds: 45,
  councilVoteSeconds: 45,
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
        councilStartSeconds: 5,
        councilAccusationPostChairSeconds: 15,
        councilAccusationAfterDaySeconds: 45,
        pleadingSpeechSeconds: 20,
        councilVoteSeconds: 20,
        nightSeconds: 35,
        postNightDaySeconds: 10,
      }
    case 'long':
      return {
        chairSelectionSeconds: 15,
        daySocialSeconds: 1200,
        councilStartSeconds: 15,
        councilAccusationPostChairSeconds: 45,
        councilAccusationAfterDaySeconds: 180,
        pleadingSpeechSeconds: 90,
        councilVoteSeconds: 75,
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
  council_start_seconds: s.councilStartSeconds,
  council_accusation_post_chair_seconds: s.councilAccusationPostChairSeconds,
  council_accusation_after_day_seconds: s.councilAccusationAfterDaySeconds,
  pleading_speech_seconds: s.pleadingSpeechSeconds,
  council_vote_seconds: s.councilVoteSeconds,
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
  councilAccusations?: Record<string, string>
  wendigoIntentions?: Record<string, string>
  prayerTallies?: Record<string, number>
  pleadingsQueue?: string[]
  currentSpeakerId?: string
  pleadingTimerStarted?: boolean
  players: Player[]
  winnerTeam?: 'VILLAGERS' | 'WENDIGOS' | string
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
