import { apiClient } from '@/api/axios'

export type LobbyPhase = 'waiting' | 'day' | 'night' | 'ended' | string

export interface Player {
  id: string
  name: string
  isAlive: boolean
  role: string | null
  isHost: boolean
}

export type GameMode = 'local' | 'online' | string

export interface LobbyState {
  code: string
  phase: LobbyPhase
  mode?: GameMode
  timeRemaining: number
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
