import type { LobbyState, Player } from '@/api/game'
import { Button } from '@/components/ui/button'
import { useGameAudio } from '@/hooks/useGameAudio'
import { LoaderCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

type NightAction = 'PRAY' | 'KILL' | 'INSPECT'
type SocketActionType = 'SUBMIT_NIGHT_ACTION' | 'VOTE_DAY'

interface SubmitNightActionPayload {
  action: NightAction
  target_id: string
}

interface VoteDayPayload {
  target_id: string
}

type ActionPayloadByType = {
  SUBMIT_NIGHT_ACTION: SubmitNightActionPayload
  VOTE_DAY: VoteDayPayload
}

interface ActionPanelProps {
  lobby: LobbyState
  currentPlayer: Player
  sendMessage: <TType extends SocketActionType>(
    type: TType,
    payload: ActionPayloadByType[TType]
  ) => boolean
}

const ActionPanel = ({ lobby, currentPlayer, sendMessage }: ActionPanelProps) => {
  const [selectedTarget, setSelectedTarget] = useState<string>('')
  const [lockedActionMessage, setLockedActionMessage] = useState<string | null>(null)
  const { playLock } = useGameAudio()

  const aliveOpponents = useMemo(
    () => lobby.players.filter((player) => player.isAlive && player.id !== currentPlayer.id),
    [currentPlayer.id, lobby.players]
  )

  useEffect(() => {
    setLockedActionMessage(null)
    setSelectedTarget('')
  }, [lobby.phase])

  if (!currentPlayer.isAlive) {
    return null
  }

  const phase = lobby.phase.toUpperCase()
  const role = (currentPlayer.role ?? '').toUpperCase()
  const findTargetName = (targetId: string): string =>
    aliveOpponents.find((player) => player.id === targetId)?.name ?? 'Unknown target'

  const submitNightAction = (action: NightAction, targetId: string) => {
    const sent = sendMessage('SUBMIT_NIGHT_ACTION', { action, target_id: targetId })
    if (!sent) {
      toast.error('Connection is not ready. Please try again.')
      return
    }

    toast.success('Action submitted.')
    if (action === 'PRAY') {
      setLockedActionMessage('Praying')
      playLock()
      return
    }

    const targetName = findTargetName(targetId)
    if (action === 'KILL') {
      setLockedActionMessage(`Targeting ${targetName} for a kill`)
      playLock()
      return
    }

    setLockedActionMessage(`Inspecting ${targetName}`)
    playLock()
  }

  const submitVoteDay = (targetId: string) => {
    const sent = sendMessage('VOTE_DAY', { target_id: targetId })
    if (!sent) {
      toast.error('Connection is not ready. Please try again.')
      return
    }

    toast.success('Action submitted.')
    setLockedActionMessage(`Voted to lynch ${findTargetName(targetId)}`)
    playLock()
  }

  const requiresTarget = role === 'WENDIGO' || role === 'SEER' || phase === 'DAY' || phase === 'ACCUSATION'
  const disableTargetAction = requiresTarget && selectedTarget.length === 0

  if (lockedActionMessage) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-lg border border-slate-700 bg-slate-950/70 p-4 text-slate-200">
        <div className="flex items-center gap-2 text-sm font-medium">
          <LoaderCircle className="h-4 w-4 animate-spin text-slate-300" />
          <span>Action locked: {lockedActionMessage}</span>
        </div>
        <p className="mt-2 text-xs text-slate-400">Waiting for phase to end...</p>
      </div>
    )
  }

  if (phase === 'NIGHT') {
    if (role === 'VILLAGER') {
      return (
        <div className="space-y-3">
          <p className="text-sm text-slate-300">The night is dark. Hold your faith and pray.</p>
          <Button type="button" className="w-full" onClick={() => submitNightAction('PRAY', '')}>
            PRAY
          </Button>
        </div>
      )
    }

    if (role === 'WENDIGO' || role === 'SEER') {
      return (
        <div className="space-y-3">
          <select
            value={selectedTarget}
            onChange={(event) => setSelectedTarget(event.target.value)}
            className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          >
            <option value="">Select target</option>
            {aliveOpponents.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>

          {role === 'WENDIGO' ? (
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              disabled={disableTargetAction}
              onClick={() => submitNightAction('KILL', selectedTarget)}
            >
              KILL
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={disableTargetAction}
              onClick={() => submitNightAction('INSPECT', selectedTarget)}
            >
              INSPECT
            </Button>
          )}
        </div>
      )
    }
  }

  if (phase === 'DAY' || phase === 'ACCUSATION') {
    return (
      <div className="space-y-3">
        <select
          value={selectedTarget}
          onChange={(event) => setSelectedTarget(event.target.value)}
          className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
        >
          <option value="">Select target</option>
          {aliveOpponents.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name}
            </option>
          ))}
        </select>
        <Button
          type="button"
          className="w-full"
          disabled={disableTargetAction}
          onClick={() => submitVoteDay(selectedTarget)}
        >
          VOTE TO LYNCH
        </Button>
      </div>
    )
  }

  return null
}

export default ActionPanel
