import type { LobbyState, Player } from '@/api/game'
import { Trans, t } from '@/lib/lingui'
import NarrativeBox from '@/features/dashboard/components/NarrativeBox'
import VoxelButton from '@/features/dashboard/components/game/VoxelButton'
import { playerInitial } from '@/features/dashboard/components/game/PlayerAvatarGrid'
import { samePlayerId } from '@/lib/samePlayerId'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'
import { useGameStore } from '@/store/useGameStore'
import { DoorOpen, Flame, Skull, Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

const VILLAGER_WIN_BG = '/assets/images/villager_win.png'
const WENDIGO_WIN_BG = '/assets/images/wendigo_win.png'

interface EndedScreenProps {
  lobby: LobbyState
  sendMessage: (type: string, payload: unknown) => boolean
}

const roleLabel = (role: string | null): string => {
  const r = (role ?? 'UNKNOWN').toUpperCase()
  if (r === 'WENDIGO') return 'Wendigo'
  if (r === 'VILLAGER') return 'Villager'
  if (r === 'SEER') return 'Seer'
  return r.replaceAll('_', ' ')
}

const tabletShellClass =
  'pointer-events-auto fixed bottom-4 left-1/2 z-[85] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 ' +
  'rounded-3xl border-t-4 border-b-8 border-x-2 border-[#2d261f] bg-[#1a1612] ' +
  'p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)]'

const MiniPion = ({ name, className }: { name: string; className?: string }) => (
  <span
    className={cn(
      'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-t-[#c9a66b]/85 border-l-[#c9a66b]/85 border-b-[#1a0f08] border-r-[#1a0f08] bg-gradient-to-b from-[#3d342c] to-[#1e1814] text-sm font-black text-amber-50',
      className
    )}
  >
    {playerInitial(name)}
  </span>
)

function SummaryTile({ player }: { player: Player }) {
  const alive = player.isAlive === true
  const role = roleLabel(player.role)

  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-3 rounded-xl border-t border-x border-[#3d3428] bg-[#241e18] px-3 py-2.5 transition-all duration-200',
        alive
          ? 'border-b-4 border-b-[#14100c] ring-4 ring-inset ring-amber-500/50 shadow-[0_0_18px_rgba(245,158,11,0.22)]'
          : 'border-b-4 border-b-[#14100c] opacity-40 grayscale-[70%]'
      )}
    >
      <MiniPion name={player.name} className={cn(!alive && 'opacity-90')} />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="truncate font-black text-[#f5ecd8] sm:text-base">{player.name}</span>
          {player.isHost ? (
            <span className="shrink-0 rounded border border-amber-600/50 px-1.5 py-0 text-[9px] font-bold uppercase tracking-wider text-amber-200/90">
              <Trans>Host</Trans>
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-amber-200/95">{role}</p>
        <p className={cn('mt-1 text-[11px] font-semibold', alive ? 'text-emerald-300/95' : 'text-rose-300/80')}>
          {alive ? <Trans>Survivor</Trans> : <Trans>Eliminated</Trans>}
        </p>
      </div>
      {!alive ? (
        <Skull className="h-5 w-5 shrink-0 text-rose-400/70" aria-hidden />
      ) : (
        <span className="w-5 shrink-0" aria-hidden />
      )}
    </div>
  )
}

const EndedScreen = ({ lobby, sendMessage }: EndedScreenProps) => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const currentPlayer = lobby.players.find((player) => samePlayerId(player.id, user?.id)) ?? null

  const winnerTeam = (lobby.winnerTeam ?? '').toUpperCase()
  const isVillageWin = winnerTeam === 'VILLAGER'
  const winBg = isVillageWin ? VILLAGER_WIN_BG : WENDIGO_WIN_BG

  const endedNarrationText = useMemo(
    () =>
      isVillageWin
        ? t`Every Wendigo has been unmasked or brought down. The village still stands; the embers are not yet cold.`
        : t`The Wendigos claimed the village. The shadows drank their fear, and night closes its jaws on the last survivors.`,
    [isVillageWin]
  )

  const titleColorClass = isVillageWin
    ? 'text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.7)]'
    : 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.7)]'

  const handleQuitLobby = () => {
    useGameStore.getState().resetGame()
    navigate('/')
  }

  const handleRestart = () => {
    sendMessage('RESTART_GAME', {})
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] animate-in fade-in duration-500">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${winBg}")` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/65" aria-hidden />

      <div className={cn(tabletShellClass, 'max-h-[min(88vh,calc(100vh-5.5rem))] overflow-y-auto overscroll-contain')}>
        <div className="pointer-events-auto space-y-6">
          <header className="text-center">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.35em] text-amber-200/55">
              <Trans>Final verdict</Trans>
            </p>
            <h1 className={cn('text-5xl font-black uppercase tracking-tight sm:text-6xl', titleColorClass)}>
              {isVillageWin ? (
                <Trans>BLAZING VICTORY</Trans>
              ) : (
                <Trans>WENDIGO VICTORY</Trans>
              )}
            </h1>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
              {isVillageWin ? <Trans>The village prevailed</Trans> : <Trans>The Wendigos rule the night</Trans>}
            </p>
          </header>

          <NarrativeBox embedded text={endedNarrationText} className="rounded-xl border border-amber-900/35 bg-[#141210]/75 px-3 py-3" />

          <div>
            <p className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.28em] text-amber-200/75">
              <Trans>Souls accounted for</Trans>
            </p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              {lobby.players.map((player) => (
                <SummaryTile key={player.id} player={player} />
              ))}
            </div>
          </div>

          <div className="flex flex-col items-stretch justify-center gap-6 border-t border-[#2d261f] py-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            {currentPlayer?.isHost ? (
              <VoxelButton
                type="button"
                tabletMechanism={false}
                className="mx-auto w-64 rounded-xl py-4 text-xl font-black uppercase tracking-wide"
                onClick={handleRestart}
              >
                <Flame className="h-6 w-6 shrink-0 text-amber-300" aria-hidden />
                <Sparkles className="h-5 w-5 shrink-0 text-amber-200/90" aria-hidden />
                <Trans>Restart game</Trans>
              </VoxelButton>
            ) : null}
            <VoxelButton
              type="button"
              variant="muted"
              tabletMechanism={false}
              className="mx-auto w-64 rounded-xl py-4 text-xl font-black uppercase tracking-wide"
              onClick={handleQuitLobby}
            >
              <DoorOpen className="h-6 w-6 shrink-0" aria-hidden />
              <Trans>Leave lobby</Trans>
            </VoxelButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EndedScreen
