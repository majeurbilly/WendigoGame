import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AudioState {
  volume: number
  isMuted: boolean
  setVolume: (volume: number) => void
  toggleMute: () => void
}

const clampVolume = (value: number): number => Math.min(1, Math.max(0, value))

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      volume: 0.5,
      isMuted: false,
      setVolume: (volume) =>
        set({
          volume: clampVolume(volume),
        }),
      toggleMute: () =>
        set((state) => ({
          isMuted: !state.isMuted,
        })),
    }),
    {
      name: 'kingdom-audio-settings',
    }
  )
)
