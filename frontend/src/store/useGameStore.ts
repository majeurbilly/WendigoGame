import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { LobbyState } from '@/api/game'

interface GameState {
  lobby: LobbyState | null
  isConnected: boolean
  livekitToken: string | null
  /** Verrou UI pendant la vidéo de transition lobby → jeu. */
  isCinematicPlaying: boolean
  setLobby: (lobby: LobbyState | null) => void
  setConnected: (status: boolean) => void
  setLiveKitToken: (token: string | null) => void
  setCinematicPlaying: (playing: boolean) => void
  resetGame: () => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      lobby: null,
      isConnected: false,
      livekitToken: null,
      isCinematicPlaying: false,
      setLobby: (lobby) => set({ lobby }),
      setConnected: (status) => set({ isConnected: status }),
      setLiveKitToken: (token) => set({ livekitToken: token }),
      setCinematicPlaying: (playing) => set({ isCinematicPlaying: playing }),
      resetGame: () =>
        set({
          lobby: null,
          isConnected: false,
          livekitToken: null,
          isCinematicPlaying: false,
        }),
    }),
    {
      name: 'wendigo-game-storage',
      storage: createJSONStorage(() => localStorage),
      // Ne pas persister isConnected : après F5 le WS n'est pas encore ouvert.
      partialize: (state) => ({
        lobby: state.lobby,
        livekitToken: state.livekitToken,
      }),
    }
  )
)
