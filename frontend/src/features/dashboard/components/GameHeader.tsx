import type { LobbyState } from '@/api/game'
import { useLocalTimer } from '@/hooks/useLocalTimer'

interface GameHeaderProps {
  lobby: LobbyState
}

const phaseClassByLabel: Record<string, string> = {
  LOBBY: 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30',
  WAITING: 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30',
  DAY: 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-400/30',
  MORNING: 'bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/30',
  NO_COUNCIL: 'bg-violet-500/15 text-violet-200 ring-1 ring-violet-400/30',
  COUNCIL_START: 'bg-violet-500/20 text-violet-200 ring-1 ring-violet-400/35',
  COUNCIL_SUMMARY: 'bg-violet-500/20 text-violet-200 ring-1 ring-violet-400/35',
  STAKE: 'bg-orange-500/20 text-orange-200 ring-1 ring-orange-400/35',
  NIGHT: 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/30',
  ENDED: 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/30',
  GAME_OVER: 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/30',
}

const modeLabel = (mode: string | undefined): string => {
  const m = (mode ?? 'local').toLowerCase()
  if (m === 'online') {
    return 'En ligne'
  }
  return 'Présentiel'
}

const modeBadgeClass = (mode: string | undefined): string => {
  const m = (mode ?? 'local').toLowerCase()
  return m === 'online'
    ? 'border-sky-500/40 bg-sky-500/15 text-sky-200'
    : 'border-amber-500/40 bg-amber-500/15 text-amber-200'
}

const formatTimer = (seconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const minutesPart = Math.floor(safeSeconds / 60)
  const secondsPart = safeSeconds % 60
  return `${String(minutesPart).padStart(2, '0')}:${String(secondsPart).padStart(2, '0')}`
}

const phaseProgressTotal = (lobby: LobbyState, phaseLabel: string): number => {
  if (phaseLabel === 'DAY' && (lobby.socialPhaseTotalTime ?? 0) > 0) {
    return lobby.socialPhaseTotalTime as number
  }
  const t = lobby.phaseTotalSeconds ?? 0
  return t > 0 ? t : 0
}

const GameHeader = ({ lobby }: GameHeaderProps) => {
  const localTime = useLocalTimer(lobby.timeRemaining)
  const displayedTime = lobby.isPaused ? lobby.timeRemaining : localTime
  const phaseLabel = lobby.phase.toUpperCase()
  const phaseClasses =
    phaseClassByLabel[phaseLabel] ?? 'bg-slate-700/40 text-slate-200 ring-1 ring-slate-500/50'
  const isInitialChairSelectionWait =
    phaseLabel === 'CHAIR_SELECTION' && lobby.chairPromptTriggered !== true
  const total = isInitialChairSelectionWait ? 0 : phaseProgressTotal(lobby, phaseLabel)
  const progress = total > 0 ? Math.min(1, Math.max(0, displayedTime / total)) : 0
  const showChronoBar =
    !isInitialChairSelectionWait &&
    total > 0 &&
    phaseLabel !== 'LOBBY' &&
    phaseLabel !== 'GAME_OVER' &&
    phaseLabel !== 'ENDED'

  return (
    <>
      {lobby.isPaused ? (
        <div className="rounded-xl border border-amber-500/50 bg-amber-500/15 px-5 py-3 text-center text-sm font-bold uppercase tracking-[0.25em] text-amber-100 shadow-lg shadow-amber-950/30">
          Partie en pause
        </div>
      ) : null}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-black/30 md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Lobby</p>
          <span
            className={`rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${modeBadgeClass(lobby.mode)}`}
          >
            {modeLabel(lobby.mode)}
          </span>
        </div>
        <h2 className="text-3xl font-bold tracking-widest text-slate-100">{lobby.code}</h2>
      </div>

      <div className="flex w-full min-w-0 flex-col items-stretch gap-3 md:w-auto md:items-end">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wider ${phaseClasses}`}>
            {phaseLabel}
          </span>
          <div className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-center">
            {isInitialChairSelectionWait ? (
              <>
                <p className="text-xs uppercase tracking-wider text-slate-500">Statut</p>
                <p className="text-sm font-medium text-slate-400">En attente des joueurs...</p>
              </>
            ) : (
              <>
                <p className="text-xs uppercase tracking-wider text-slate-400">Temps restant</p>
                <p className="font-mono text-xl font-semibold text-slate-100">{formatTimer(displayedTime)}</p>
              </>
            )}
          </div>
        </div>
        {showChronoBar ? (
          <div className="w-full min-w-[200px] max-w-md md:max-w-xs">
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-[width] duration-1000 ease-linear"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
      </div>
    </>
  )
}

export default GameHeader
