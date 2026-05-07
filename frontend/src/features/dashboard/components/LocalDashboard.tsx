import ActionPanel from '@/features/dashboard/components/ActionPanel'
import GameHeader from '@/features/dashboard/components/GameHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { isGameOverPhase } from '@/lib/gamePhase'
import { useAuthStore } from '@/store/useAuthStore'
import { useGameStore } from '@/store/useGameStore'
import type { ComponentProps } from 'react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

const roleStyles: Record<string, string> = {
  WENDIGO: 'border-rose-500/40 bg-rose-950/40 text-rose-200',
  VILLAGER: 'border-slate-500/40 bg-slate-900/80 text-slate-200',
  SEER: 'border-sky-500/40 bg-sky-950/40 text-sky-200',
}

const getRoleContainerClasses = (role: string | null): string => {
  if (!role) return 'border-slate-700 bg-slate-900/80 text-slate-200'
  return roleStyles[role.toUpperCase()] ?? 'border-violet-500/40 bg-violet-950/30 text-violet-200'
}

interface LocalDashboardProps {
  sendMessage: ComponentProps<typeof ActionPanel>['sendMessage']
}

export default function LocalDashboard({ sendMessage }: LocalDashboardProps) {
  const user = useAuthStore((state) => state.user)
  const lobby = useGameStore((state) => state.lobby)
  const [showHostMenu, setShowHostMenu] = useState(false)

  const currentPlayer = useMemo(
    () => lobby?.players.find((player) => player.id === user?.id) ?? null,
    [lobby?.players, user?.id]
  )

  const phaseUpper = lobby?.phase?.toUpperCase() ?? ''
  const gameOver = lobby ? isGameOverPhase(lobby.phase) : false
  const surrenderVotes = lobby?.surrenderVotes ?? {}
  const hasSurrenderVoted = currentPlayer ? Object.prototype.hasOwnProperty.call(surrenderVotes, currentPlayer.id) : false
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

  if (!lobby || !currentPlayer) return null

  const sendHostAction = (type: 'TOGGLE_PAUSE' | 'FORCE_END_GAME' | 'START_SURRENDER_VOTE') => {
    const sent = sendMessage(type, {})
    if (!sent) {
      toast.error('Connexion indisponible. Réessayez.')
    }
  }

  const submitSurrenderVote = (voteYes: boolean) => {
    const sent = sendMessage('SUBMIT_SURRENDER_VOTE', { vote_yes: voteYes })
    if (!sent) {
      toast.error('Connexion indisponible. Réessayez.')
      return
    }
    toast.success('Vote d’abandon enregistré.')
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center space-y-8 px-4 py-12 duration-700 animate-in fade-in">
      <GameHeader lobby={lobby} />
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-wider text-slate-100 uppercase">Phase: {lobby.phase}</h1>
        <p className="text-slate-400">La partie a commencé.</p>
      </div>

      <div
        className={`w-full max-w-md rounded-xl border-2 p-10 text-center shadow-2xl ${getRoleContainerClasses(currentPlayer.role)}`}
      >
        <p className="mb-4 text-sm tracking-[0.2em] uppercase opacity-80">Votre Rôle Secret</p>
        <p className="text-5xl font-black tracking-wide drop-shadow-md">
          {(currentPlayer.role ?? 'INCONNU').toUpperCase()}
        </p>
      </div>

      <p className="animate-pulse text-sm text-slate-500">Ne montrez cet écran à personne...</p>

      {lobby.surrenderVoteActive && currentPlayer.isAlive && !hasSurrenderVoted ? (
        <Card className="w-full max-w-lg border-rose-800/70 bg-rose-950/25 text-rose-50">
          <CardHeader>
            <CardTitle>Vote d&apos;abandon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-rose-100/90">L&apos;hôte propose l&apos;abandon. Acceptez-vous ?</p>
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="destructive" onClick={() => submitSurrenderVote(true)}>
                Oui
              </Button>
              <Button type="button" variant="secondary" onClick={() => submitSurrenderVote(false)}>
                Non
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {showActionPanel ? (
        <Card className="w-full max-w-lg border-slate-800 bg-slate-900/60 text-slate-100">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <ActionPanel lobby={lobby} currentPlayer={currentPlayer} sendMessage={sendMessage} />
          </CardContent>
        </Card>
      ) : null}

      {currentPlayer.isHost && !gameOver ? (
        <div className="flex w-full max-w-lg flex-col items-center gap-2">
          <button
            type="button"
            className="text-xs text-slate-500 transition-colors hover:text-slate-300"
            onClick={() => setShowHostMenu((previous) => !previous)}
          >
            ⚙️ Options de l&apos;hôte
          </button>
          {showHostMenu ? (
            <div className="flex flex-row flex-wrap justify-center gap-2 rounded-lg border border-slate-800/80 bg-slate-950/30 px-3 py-2">
              <Button
                type="button"
                variant="outline"
                className="h-8 border-slate-700 bg-transparent px-3 py-1 text-sm text-slate-300 hover:bg-slate-800/70 hover:text-slate-100"
                onClick={() => sendHostAction('TOGGLE_PAUSE')}
              >
                {lobby.isPaused ? 'Reprendre' : 'Pause'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-8 border-slate-700 bg-transparent px-3 py-1 text-sm text-slate-300 hover:bg-slate-800/70 hover:text-slate-100"
                disabled={lobby.surrenderVoteActive === true || lobby.surrenderApproved === true}
                onClick={() => sendHostAction('START_SURRENDER_VOTE')}
              >
                Abandon
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-8 border-rose-900/70 bg-rose-950/20 px-3 py-1 text-sm text-rose-300 hover:bg-rose-950/40 hover:text-rose-100"
                onClick={() => sendHostAction('FORCE_END_GAME')}
              >
                Forcer la fin
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
