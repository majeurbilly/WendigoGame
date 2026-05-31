import { Trans, t } from '@/lib/lingui'
import VoxelButton from '@/features/dashboard/components/game/VoxelButton'
import { useSmokeTransition } from '@/contexts/smokeTransitionContext'
import { type AppLocale } from '@/i18n'
import { useGameStore } from '@/store/useGameStore'

const rangeClass =
  'h-3 w-full cursor-pointer appearance-none rounded-lg bg-[#14100c] accent-amber-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]'

const sectionClass = 'mb-8 rounded-xl border-2 border-[#2d261f] bg-[#241e18] p-6 shadow-inner'

const sectionTitleClass = 'mb-4 text-sm font-bold uppercase tracking-wider text-amber-200/80'

const SettingsPage = () => {
  const { transitionTo } = useSmokeTransition()
  const globalVolume = useGameStore((state) => state.globalVolume)
  const isMuted = useGameStore((state) => state.isMuted)
  const language = useGameStore((state) => state.language)
  const setGlobalVolume = useGameStore((state) => state.setGlobalVolume)
  const toggleGlobalMute = useGameStore((state) => state.toggleGlobalMute)
  const setLanguage = useGameStore((state) => state.setLanguage)

  const volumePercent = Math.round(globalVolume * 100)

  const languageButtonClass = (locale: AppLocale) =>
    locale === language
      ? 'from-[#5c4a2a] via-[#4a3a1f] to-[#2d2414] border-t-amber-200/90 border-l-amber-200/90 text-amber-100'
      : ''

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center p-4 text-slate-100">
      <div className="mx-auto flex w-full max-w-xl flex-col rounded-3xl border-x-2 border-b-8 border-t-4 border-[#2d261f] bg-[#1a1612] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] max-h-[calc(100vh-2rem)] overflow-y-auto">
        <h1 className="mb-8 text-center text-4xl font-black uppercase tracking-widest text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] md:text-5xl">
          <Trans>Settings</Trans>
        </h1>

        <div className={sectionClass}>
          <p className={sectionTitleClass}>
            <Trans>Audio</Trans>
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold uppercase tracking-wider text-amber-200/80">
              <Trans>Global volume: {volumePercent}%</Trans>
            </p>
            <button
              type="button"
              onClick={toggleGlobalMute}
              aria-pressed={isMuted}
              className="shrink-0 rounded-lg border-2 border-[#2d261f] bg-[#14100c] px-3 py-1.5 text-xs font-black uppercase tracking-wide text-amber-300/90 shadow-inner transition-colors hover:border-amber-500/40 hover:text-amber-200"
            >
              {isMuted ? <Trans>Sound</Trans> : <Trans>Mute</Trans>}
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
            aria-label={t`Global volume`}
          />
        </div>

        <div className={sectionClass}>
          <p className={sectionTitleClass}>
            <Trans>Language</Trans>
          </p>
          <div className="flex gap-3">
            <VoxelButton
              type="button"
              variant={language === 'en' ? 'stone' : 'muted'}
              className={`flex-1 py-3 text-sm ${languageButtonClass('en')}`}
              onClick={() => setLanguage('en')}
              aria-pressed={language === 'en'}
            >
              ENGLISH
            </VoxelButton>
            <VoxelButton
              type="button"
              variant={language === 'fr' ? 'stone' : 'muted'}
              className={`flex-1 py-3 text-sm ${languageButtonClass('fr')}`}
              onClick={() => setLanguage('fr')}
              aria-pressed={language === 'fr'}
            >
              FRANÇAIS
            </VoxelButton>
          </div>
        </div>

        <VoxelButton type="button" variant="danger" className="w-full" onClick={() => transitionTo('/')}>
          <Trans>Back to menu</Trans>
        </VoxelButton>
      </div>
    </div>
  )
}

export default SettingsPage
