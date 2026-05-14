import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { useGameStore } from '@/store/useGameStore'
import { Volume1, Volume2, VolumeX } from 'lucide-react'

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value))

/** Panneau curseur + mute (partagé entre l’overlay global et d’autres surfaces si besoin). */
export const GlobalVolumePopoverBody = () => {
  const volume = useGameStore((state) => state.globalVolume)
  const isMuted = useGameStore((state) => state.isMuted)
  const setGlobalVolume = useGameStore((state) => state.setGlobalVolume)
  const toggleGlobalMute = useGameStore((state) => state.toggleGlobalMute)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Volume global</p>
        <span className="text-xs opacity-60">{Math.round(volume * 100)}%</span>
      </div>
      <Slider
        value={isMuted ? [0] : [volume]}
        min={0}
        max={1}
        step={0.05}
        onValueChange={(values) => {
          const nextVolume = clamp01(values[0] ?? 0)
          setGlobalVolume(nextVolume)
        }}
      />
      <Button type="button" size="sm" variant="secondary" className="w-full" onClick={toggleGlobalMute}>
        {isMuted ? 'Réactiver le son' : 'Couper le son'}
      </Button>
    </div>
  )
}

const triggerClass =
  'fixed top-4 right-4 z-[9999] flex h-10 w-10 items-center justify-center rounded-lg border border-[#2d261f] ' +
  'bg-[#1a1612] p-2 shadow-lg text-amber-500/80 transition-all hover:bg-[#241e18] hover:text-amber-400 cursor-pointer ' +
  'outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40'

const GlobalAudioToggle = () => {
  const volume = useGameStore((state) => state.globalVolume)
  const isMuted = useGameStore((state) => state.isMuted)
  const isEffectivelySilent = isMuted || volume <= 0.001
  const Icon = isEffectivelySilent ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Réglages du volume"
          className={triggerClass}
          style={{
            marginTop: 'max(0.25rem, env(safe-area-inset-top))',
            marginRight: 'max(0.25rem, env(safe-area-inset-right))',
          }}
        >
          <Icon className="h-5 w-5 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-64 border-amber-700/50 bg-[#1a1510]/95 text-amber-50 shadow-xl backdrop-blur-sm"
      >
        <GlobalVolumePopoverBody />
      </PopoverContent>
    </Popover>
  )
}

export default GlobalAudioToggle
