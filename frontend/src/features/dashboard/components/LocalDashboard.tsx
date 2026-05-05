import ActionPanel from '@/features/dashboard/components/ActionPanel'
import GameHeader from '@/features/dashboard/components/GameHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { isGameOverPhase } from '@/lib/gamePhase'
import { useAuthStore } from '@/store/useAuthStore'
import { useGameStore } from '@/store/useGameStore'
import type { ComponentProps } from 'react'
import { useMemo } from 'react'

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

  const currentPlayer = useMemo(
    () => lobby?.players.find((player) => player.id === user?.id) ?? null,
    [lobby?.players, user?.id]
  )

  const phaseUpper = lobby?.phase?.toUpperCase() ?? ''
  const showActionPanel = Boolean(
    lobby &&
      currentPlayer?.isAlive &&
      !isGameOverPhase(lobby.phase) &&
      [
        'CHAIR_SELECTION',
        'NIGHT',
        'DAY',
        'COUNCIL_START',
        'ACCUSATION',
        'PLEADINGS',
        'COUNCIL_VOTE',
      ].includes(phaseUpper)
  )

  if (!lobby || !currentPlayer) return null

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
    </div>
  )
}
