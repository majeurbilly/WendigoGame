import VoxelButton from '@/features/dashboard/components/game/VoxelButton'
import { useSmokeTransition } from '@/contexts/smokeTransitionContext'
import { useGameStore } from '@/store/useGameStore'

const rangeClass =
  'h-3 w-full cursor-pointer appearance-none rounded-lg bg-[#14100c] accent-amber-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]'

const SettingsPage = () => {
  const { transitionTo } = useSmokeTransition()
  const globalVolume = useGameStore((state) => state.globalVolume)
  const isMuted = useGameStore((state) => state.isMuted)
  const setGlobalVolume = useGameStore((state) => state.setGlobalVolume)
  const toggleGlobalMute = useGameStore((state) => state.toggleGlobalMute)

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center p-4 text-slate-100">
      <div className="mx-auto flex w-full max-w-xl flex-col rounded-3xl border-x-2 border-b-8 border-t-4 border-[#2d261f] bg-[#1a1612] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] max-h-[calc(100vh-2rem)] overflow-y-auto">
        <h1 className="mb-8 text-center text-4xl font-black uppercase tracking-widest text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] md:text-5xl">
          Réglages
        </h1>

        <div className="mb-8 rounded-xl border-2 border-[#2d261f] bg-[#241e18] p-6 shadow-inner">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold uppercase tracking-wider text-amber-200/80">
              Volume global : {Math.round(globalVolume * 100)}%
            </p>
            <button
              type="button"
              onClick={toggleGlobalMute}
              aria-pressed={isMuted}
              className="shrink-0 rounded-lg border-2 border-[#2d261f] bg-[#14100c] px-3 py-1.5 text-xs font-black uppercase tracking-wide text-amber-300/90 shadow-inner transition-colors hover:border-amber-500/40 hover:text-amber-200"
            >
              {isMuted ? 'Son' : 'Muet'}
            </button>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={globalVolume}
            onChange={(e) => setGlobalVolume(Number(e.target.value))}
            className={rangeClass}
            aria-label="Volume global"
          />
        </div>

        <VoxelButton type="button" variant="danger" className="w-full" onClick={() => transitionTo('/')}>
          Retour au menu
        </VoxelButton>
      </div>
    </div>
  )
}

export default SettingsPage
