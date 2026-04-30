import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import { useAudioStore } from '@/store/useAudioStore'
import { Volume2, Volume1, VolumeX } from 'lucide-react'

const VolumeControl = () => {
  const volume = useAudioStore((state) => state.volume)
  const isMuted = useAudioStore((state) => state.isMuted)
  const setVolume = useAudioStore((state) => state.setVolume)
  const toggleMute = useAudioStore((state) => state.toggleMute)

  const isEffectivelySilent = isMuted || volume <= 0.001
  const Icon = isEffectivelySilent ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="icon-sm" aria-label="Audio settings">
          <Icon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 border-slate-700 bg-slate-900 text-slate-100">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Global volume</p>
            <span className="text-xs text-slate-400">{Math.round(volume * 100)}%</span>
          </div>
          <Slider
            value={isMuted ? [0] : [volume]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={(values) => {
              const nextVolume = values[0] ?? 0
              if (isMuted) {
                toggleMute()
              }
              setVolume(nextVolume)
            }}
          />
          <Button type="button" size="sm" variant="secondary" className="w-full" onClick={toggleMute}>
            {isMuted ? 'Unmute' : 'Mute'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default VolumeControl
