import ActionPanel from '@/features/dashboard/components/ActionPanel'
import SecretRoleCard from '@/features/dashboard/components/SecretRoleCard'
import { isGameOverPhase } from '@/lib/gamePhase'
import { useLocalTimer } from '@/hooks/useLocalTimer'
import { useAuthStore } from '@/store/useAuthStore'
import { useGameStore } from '@/store/useGameStore'
import { isVoiceChatGameMode, type LobbyState } from '@/api/game'
import type { ComponentProps } from 'react'
import { useMemo } from 'react'
import {
  Armchair,
  Flame,
  Moon,
  Skull,
  Sparkles,
  Sun,
  Sunrise,
} from 'lucide-react'

const overlayChrome =
  'rounded-xl border border-amber-500/50 bg-[#14100c]/82 text-amber-50 shadow-lg shadow-black/40'

const hudBadge =
  'rounded-md border border-amber-600/50 bg-[#1c1814]/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#f5ecd8] shadow-[inset_0_1px_0_rgba(255,215,160,0.08)]'

const modeLabel = (mode: string | undefined): string =>
  isVoiceChatGameMode(mode) ? 'En ligne' : 'Présentiel'

const modeBadgeClass = (mode: string | undefined): string =>
  isVoiceChatGameMode(mode)
    ? 'border-sky-500/45 bg-sky-950/35 text-sky-100'
    : 'border-amber-600/50 bg-[#2a2118]/90 text-amber-100'

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

const PHASE_HINTS: Record<string, string> = {
  CHAIR_SELECTION: 'Choisissez votre siège au conseil.',
  NIGHT: 'Nuit : agissez avant la fin du sablier.',
  DAY: 'Jour : préparez le vote du village.',
  MORNING: 'L’aube révèle ce qui s’est passé.',
  NO_COUNCIL: 'Pas de conseil — la journée continue.',
  COUNCIL_START: 'Le conseil s’ouvre.',
  ACCUSATION: 'Accusez ou passez votre tour.',
  COUNCIL_SUMMARY: 'Synthèse des accusations.',
  PLEADINGS: 'À la parole : défendez-vous ou écoutez.',
  COUNCIL_VOTE: 'Votez pour le sort du suspect.',
  STAKE: 'Dernière décision au bûcher.',
}

function PhaseGlyph({ phase }: { phase: string }) {
  const p = phase.toUpperCase()
  const cls = 'h-3.5 w-3.5 shrink-0 text-amber-200/95'
  if (p === 'DAY') return <Sun className={cls} aria-hidden />
  if (p === 'NIGHT') return <Moon className={cls} aria-hidden />
  if (p === 'MORNING') return <Sunrise className={cls} aria-hidden />
  if (p === 'STAKE') return <Flame className={cls} aria-hidden />
  if (p === 'CHAIR_SELECTION') return <Armchair className={cls} aria-hidden />
  if (p === 'NO_COUNCIL') return <Sparkles className={cls} aria-hidden />
  if (
    p === 'COUNCIL_START' ||
    p === 'ACCUSATION' ||
    p === 'COUNCIL_SUMMARY' ||
    p === 'COUNCIL_VOTE' ||
    p === 'PLEADINGS'
  ) {
    return <Skull className={cls} aria-hidden />
  }
  return <Sparkles className={cls} aria-hidden />
}

interface LocalDashboardProps {
  sendMessage: ComponentProps<typeof ActionPanel>['sendMessage']
}

export default function LocalDashboard({ sendMessage }: LocalDashboardProps) {
  const user = useAuthStore((state) => state.user)
  const lobby = useGameStore((state) => state.lobby)

  const currentPlayer = useMemo(
    () => lobby?.players.find((player) => player.id === user?.id) ?? null,
    [lobby?.players, user?.id]
  )

  const phaseUpper = lobby?.phase?.toUpperCase() ?? ''
  const gameOver = lobby ? isGameOverPhase(lobby.phase) : false
  const showActionPanel = Boolean(
    lobby &&
      (currentPlayer?.isAlive || phaseUpper === 'STAKE' || phaseUpper === 'MORNING' || phaseUpper === 'NO_COUNCIL') &&
      !gameOver &&
      [
        'CHAIR_SELECTION',
        'NIGHT',
        'DAY',
        'MORNING',
        'NO_COUNCIL',
        'COUNCIL_START',
        'ACCUSATION',
        'COUNCIL_SUMMARY',
        'PLEADINGS',
        'COUNCIL_VOTE',
        'STAKE',
      ].includes(phaseUpper)
  )

  const localTime = useLocalTimer(lobby?.timeRemaining ?? 0)
  const displayedTime = lobby?.isPaused ? (lobby?.timeRemaining ?? 0) : localTime

  if (!lobby || !currentPlayer) return null

  const phaseLabel = lobby.phase.toUpperCase()
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

  const phaseHint = PHASE_HINTS[phaseUpper] ?? ''

  return (
    <div className="relative min-h-[100dvh] w-full">
      <header
        className="pointer-events-auto fixed left-0 right-0 top-0 z-30 flex flex-col items-stretch gap-2 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4"
      >
        {lobby.isPaused ? (
          <div
            className={`mx-auto w-fit px-4 py-2 text-center text-[11px] font-bold uppercase tracking-[0.22em] ${overlayChrome}`}
          >
            Partie en pause
          </div>
        ) : null}

        <div className="flex w-full flex-wrap items-start gap-2 sm:items-center">
          <div className="pointer-events-none flex min-w-0 flex-1 flex-col items-start gap-1.5 pl-0 sm:max-w-[85%]">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`${hudBadge} ${modeBadgeClass(lobby.mode)}`}>{modeLabel(lobby.mode)}</span>
              <span className={`flex items-center gap-1.5 ${hudBadge} border-amber-500/45 bg-[#231c16]/95`}>
                <PhaseGlyph phase={phaseLabel} />
                <span className="font-mono text-[10px] tracking-wider text-[#f5ecd8]">{phaseLabel}</span>
              </span>
            </div>

            <div className={`min-w-[9.5rem] w-fit max-w-full ${overlayChrome} px-4 py-2.5`}>
              {isInitialChairSelectionWait ? (
                <p className="max-w-[14rem] text-left text-[10px] font-medium leading-tight text-amber-100/85">
                  En attente des joueurs…
                </p>
              ) : (
                <>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-200/75">Temps</p>
                  <p className="font-mono text-xl font-bold tabular-nums tracking-tight text-amber-300 drop-shadow-[0_0_14px_rgba(251,191,36,0.45)] sm:text-2xl sm:text-amber-200">
                    {formatTimer(displayedTime)}
                  </p>
                </>
              )}
              {showChronoBar ? (
                <div className="mt-1.5 h-1.5 w-[min(100%,7.5rem)] overflow-hidden rounded-full bg-black/55">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400/90 to-amber-700/90 transition-[width] duration-1000 ease-linear"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              ) : null}
            </div>

            <p className="font-mono text-lg font-black tracking-[0.42em] text-[#f5ecd8] drop-shadow-[0_2px_0_rgba(0,0,0,0.85)] sm:text-xl">
              {lobby.code}
            </p>
          </div>
        </div>
      </header>

      <div
        className="pointer-events-auto fixed z-30"
        style={{
          left: 'max(0.75rem, env(safe-area-inset-left))',
          bottom: 'calc(1rem + env(safe-area-inset-bottom) + min(38vh, 14rem))',
        }}
      >
        <SecretRoleCard role={currentPlayer.role} />
      </div>

      {showActionPanel ? (
        <ActionPanel lobby={lobby} currentPlayer={currentPlayer} sendMessage={sendMessage} phaseHint={phaseHint} />
      ) : null}
    </div>
  )
}
