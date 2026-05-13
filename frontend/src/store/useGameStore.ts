import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { LobbyState } from '@/api/game'

const clampGlobalVolume = (value: number): number => Math.min(1, Math.max(0, value))

interface GameState {
  lobby: LobbyState | null
  isConnected: boolean
  livekitToken: string | null
  /** Verrou UI pendant la vidéo de transition lobby → jeu. */
  isCinematicPlaying: boolean
  /** Volume global 0–1 ; si muté, l’effet perçu est 0 mais la valeur du slider est conservée. */
  globalVolume: number
  isMuted: boolean
  setLobby: (lobby: LobbyState | null) => void
  setConnected: (status: boolean) => void
  setLiveKitToken: (token: string | null) => void
  setCinematicPlaying: (playing: boolean) => void
  setGlobalVolume: (volume: number) => void
  toggleGlobalMute: () => void
  resetGame: () => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      lobby: null,
      isConnected: false,
      livekitToken: null,
      isCinematicPlaying: false,
      globalVolume: 0.5,
      isMuted: false,
      setLobby: (lobby) => set({ lobby }),
      setConnected: (status) => set({ isConnected: status }),
      setLiveKitToken: (token) => set({ livekitToken: token }),
      setCinematicPlaying: (playing) => set({ isCinematicPlaying: playing }),
      setGlobalVolume: (volume) =>
        set(() => {
          const globalVolume = clampGlobalVolume(volume)
          return {
            globalVolume,
            ...(globalVolume > 0.001 ? { isMuted: false } : {}),
          }
        }),
      toggleGlobalMute: () => set((state) => ({ isMuted: !state.isMuted })),
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
        globalVolume: state.globalVolume,
        isMuted: state.isMuted,
      }),
    }
  )
)
