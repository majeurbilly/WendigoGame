import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { LobbyState } from '@/api/game'
import { type AppLocale, defaultLocale, loadCatalog } from '@/i18n'

const clampGlobalVolume = (value: number): number => Math.min(1, Math.max(0, value))

const isAppLocale = (value: string): value is AppLocale => value === 'en' || value === 'fr'

interface GameState {
  lobby: LobbyState | null
  isConnected: boolean
  /** Verrou UI pendant la vidéo de transition lobby → jeu. */
  isCinematicPlaying: boolean
  /** Volume global 0–1 ; si muté, l’effet perçu est 0 mais la valeur du slider est conservée. */
  globalVolume: number
  isMuted: boolean
  language: AppLocale
  setLobby: (lobby: LobbyState | null) => void
  setConnected: (status: boolean) => void
  setCinematicPlaying: (playing: boolean) => void
  setGlobalVolume: (volume: number) => void
  toggleGlobalMute: () => void
  setLanguage: (locale: AppLocale) => void
  resetGame: () => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      lobby: null,
      isConnected: false,
      isCinematicPlaying: false,
      globalVolume: 0.5,
      isMuted: false,
      language: defaultLocale,
      setLobby: (lobby) => set({ lobby }),
      setConnected: (status) => set({ isConnected: status }),
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
      setLanguage: (locale) => {
        set({ language: locale })
        void loadCatalog(locale)
      },
      resetGame: () =>
        set({
          lobby: null,
          isConnected: false,
          isCinematicPlaying: false,
        }),
    }),
    {
      name: 'wendigo-game-storage',
      storage: createJSONStorage(() => localStorage),
      // Ne pas persister isConnected : après F5 le WS n'est pas encore ouvert.
      partialize: (state) => ({
        lobby: state.lobby,
        globalVolume: state.globalVolume,
        isMuted: state.isMuted,
        language: state.language,
      }),
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<GameState>) }
        const lang = merged.language
        merged.language = isAppLocale(lang) ? lang : defaultLocale
        return merged
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          void loadCatalog(state.language)
        }
      },
    }
  )
)
