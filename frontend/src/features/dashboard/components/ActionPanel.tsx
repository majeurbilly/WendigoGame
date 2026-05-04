import type { LobbyState, Player } from '@/api/game'
import ChairPicker from '@/features/dashboard/components/ChairPicker'
import { Button } from '@/components/ui/button'
import { useGameAudio } from '@/hooks/useGameAudio'
import { LoaderCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

type NightAction = 'PRAY' | 'KILL' | 'INSPECT'
type SocketActionType =
  | 'SUBMIT_NIGHT_ACTION'
  | 'VOTE_DAY'
  | 'WENDIGO_INTENT'
  | 'CLAIM_SEAT'
  | 'ACCUSE'
  | 'START_PLEADING'

interface SubmitNightActionPayload {
  action: NightAction
  target_id: string
}

interface VoteDayPayload {
  target_id: string
}

interface ClaimSeatPayload {
  chair_id: number
}

interface AccusePayload {
  target_id: string
}

interface WendigoIntentPayload {
  target_id: string
}

type ActionPayloadByType = {
  SUBMIT_NIGHT_ACTION: SubmitNightActionPayload
  VOTE_DAY: VoteDayPayload
  WENDIGO_INTENT: WendigoIntentPayload
  CLAIM_SEAT: ClaimSeatPayload
  ACCUSE: AccusePayload
  START_PLEADING: Record<string, never>
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

  const aliveForCouncilVote = useMemo(
    () => lobby.players.filter((player) => player.isAlive),
    [lobby.players]
  )

  const aliveTargetsForWendigo = useMemo(
    () => lobby.players.filter((player) => player.isAlive && player.id !== currentPlayer.id),
    [currentPlayer.id, lobby.players]
  )

  const councilAccusations = lobby.councilAccusations ?? {}
  const accusedTargets = useMemo(() => new Set(Object.values(councilAccusations)), [councilAccusations])
  const hasAlreadyAccused = Object.prototype.hasOwnProperty.call(councilAccusations, currentPlayer.id)
  const isExcludedFromCouncil = currentPlayer.isExcludedFromCouncil === true

  useEffect(() => {
    setLockedActionMessage(null)
    setSelectedTarget('')
  }, [lobby.phase, lobby.currentSpeakerId])

  if (!currentPlayer.isAlive) {
    return null
  }

  const phase = lobby.phase.toUpperCase()
  const role = (currentPlayer.role ?? '').toUpperCase()
  const findTargetName = (targetId: string): string =>
    aliveOpponents.find((player) => player.id === targetId)?.name ?? 'Unknown target'

  const findAlivePlayerName = (playerId: string): string =>
    lobby.players.find((player) => player.id === playerId)?.name ?? 'Unknown target'

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

    toast.success('Vote enregistré.')
    setLockedActionMessage(`Vote conseil : ${findAlivePlayerName(targetId)}`)
    playLock()
  }

  const sendWendigoIntent = (targetId: string) => {
    const sent = sendMessage('WENDIGO_INTENT', { target_id: targetId })
    if (!sent) {
      toast.error('Connection is not ready. Please try again.')
      return false
    }
    return true
  }

  const submitCouncilAccuse = (targetId: string) => {
    const sent = sendMessage('ACCUSE', { target_id: targetId })
    if (!sent) {
      toast.error('Connection is not ready. Please try again.')
      return
    }

    toast.success('Accusation envoyée.')
    setLockedActionMessage(`Vous accusez ${findTargetName(targetId)}`)
    playLock()
  }

  const submitStartPleading = () => {
    const sent = sendMessage('START_PLEADING', {})
    if (!sent) {
      toast.error('Connection is not ready. Please try again.')
      return
    }
    toast.success('Chrono lancé.')
    playLock()
  }

  const requiresTarget = phase === 'COUNCIL_VOTE' || (phase === 'ACCUSATION' && !isExcludedFromCouncil)
  const disableTargetAction = requiresTarget && selectedTarget.length === 0
  const hasSeat = currentPlayer.chairId >= 0

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
    if (role === 'WENDIGO') {
      const intentions = lobby.wendigoIntentions ?? {}
      return (
        <div className="space-y-3">
          <p className="text-sm text-slate-300">
            La meute se coordonne. Choisissez une intention visible par les autres Wendigos, puis confirmez le meurtre.
          </p>
          {Object.keys(intentions).length > 0 ? (
            <ul className="space-y-1 rounded-md border border-rose-900/50 bg-rose-950/20 p-3 text-xs text-rose-100/90">
              {Object.entries(intentions).map(([wendigoId, targetId]) => (
                <li key={wendigoId}>
                  <span className="font-medium">{findAlivePlayerName(wendigoId)}</span> pointe vers{' '}
                  <span className="font-medium text-rose-50">{findAlivePlayerName(targetId)}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <select
            value={selectedTarget}
            onChange={(event) => {
              const next = event.target.value
              setSelectedTarget(next)
              sendWendigoIntent(next)
            }}
            className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          >
            <option value="">— Retirer mon intention —</option>
            {aliveTargetsForWendigo.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            disabled={selectedTarget.length === 0}
            onClick={() => submitNightAction('KILL', selectedTarget)}
          >
            Confirmer le meurtre
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-300">
          La nuit tombe. Fermez les yeux ou patientez — le village reprendra demain matin.
        </p>
        <Button type="button" className="w-full" onClick={() => submitNightAction('PRAY', '')}>
          Prier
        </Button>
      </div>
    )
  }

  if (phase === 'CHAIR_SELECTION') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-300">
          Choisissez votre place autour du feu. Dès que tout le monde est assis, le jour se lève.
        </p>
        <ChairPicker lobby={lobby} currentPlayer={currentPlayer} sendMessage={sendMessage} />
        {hasSeat ? (
          <p className="text-center text-xs text-emerald-400/90">Vous êtes assis — en attente des autres.</p>
        ) : null}
      </div>
    )
  }

  if (phase === 'DAY') {
    return (
      <div className="space-y-2 rounded-lg border border-slate-700 bg-slate-950/40 p-4 text-center text-slate-200">
        <p className="text-sm font-medium text-slate-100">Phase sociale</p>
        <p className="text-xs text-slate-400">
          {`Discutez autour du feu. Le rappel des chaises partira automatiquement quand le chrono du jour atteindra le tiers du temps restant (règle « haute tension »). L'élimination au village se joue plus tard, lors du vote du conseil, pas ici.`}
        </p>
        {lobby.socialPhaseTotalTime != null && lobby.socialPhaseTotalTime > 0 ? (
          <p className="text-[11px] text-slate-500">
            Chrono du jour : {lobby.timeRemaining}s / {lobby.socialPhaseTotalTime}s
          </p>
        ) : null}
      </div>
    )
  }

  if (phase === 'COUNCIL_VOTE') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-amber-100/90">
          Le Conseil délibère. Choisissez qui éliminer — tout le monde vivant est éligible, y compris vous-même.
        </p>
        <select
          value={selectedTarget}
          onChange={(event) => setSelectedTarget(event.target.value)}
          className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
        >
          <option value="">Choisir une cible</option>
          {aliveForCouncilVote.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name}
              {player.id === currentPlayer.id ? ' (vous)' : ''}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="destructive"
          className="w-full"
          disabled={disableTargetAction}
          onClick={() => submitVoteDay(selectedTarget)}
        >
          VOTER AU CONSEIL
        </Button>
      </div>
    )
  }

  if (phase === 'ACCUSATION') {
    const accuserName = (id: string) => lobby.players.find((p) => p.id === id)?.name ?? id.slice(0, 8)

    if (isExcludedFromCouncil) {
      return (
        <div className="space-y-3 text-center">
          <p className="font-bold text-rose-500">Vous êtes exclu du Conseil pour avoir raté votre chaise.</p>
          {Object.keys(councilAccusations).length > 0 ? (
            <ul className="space-y-1 text-left text-xs text-slate-400">
              {Object.entries(councilAccusations).map(([accuserId, accusedId]) => (
                <li key={accuserId}>
                  <span className="text-slate-200">{accuserName(accuserId)}</span> accuse{' '}
                  <span className="text-slate-200">{accuserName(accusedId)}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {Object.keys(councilAccusations).length > 0 ? (
          <ul className="space-y-1 rounded-md border border-slate-700 bg-slate-950/50 p-3 text-xs text-slate-300">
            {Object.entries(councilAccusations).map(([accuserId, accusedId]) => (
              <li key={accuserId}>
                <span className="font-medium text-slate-100">{accuserName(accuserId)}</span> →{' '}
                <span className="font-medium text-amber-200/90">{accuserName(accusedId)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">Conseil : désignez une unique cible. Une place, une voix.</p>
        )}

        <select
          value={selectedTarget}
          onChange={(event) => setSelectedTarget(event.target.value)}
          className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          disabled={hasAlreadyAccused}
        >
          <option value="">Choisir un joueur à accuser</option>
          {aliveOpponents.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name}
              {accusedTargets.has(player.id) ? ' (déjà accusé)' : ''}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled={disableTargetAction || hasAlreadyAccused || accusedTargets.has(selectedTarget)}
          onClick={() => submitCouncilAccuse(selectedTarget)}
        >
          ACCUSER AU CONSEIL
        </Button>
      </div>
    )
  }

  if (phase === 'PLEADINGS') {
    const sid = lobby.currentSpeakerId ?? ''
    const speakerName =
      sid !== '' ? lobby.players.find((p) => p.id === sid)?.name ?? sid.slice(0, 8) : '—'
    const isCurrentSpeaker = sid !== '' && sid === currentPlayer.id
    const queue = lobby.pleadingsQueue ?? []

    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-300">
          Plaidoiries — à la parole :{' '}
          <span className="font-semibold text-amber-100/95">{speakerName}</span>
        </p>
        {queue.length > 0 ? (
          <p className="text-xs text-slate-500">
            Prochains passages :{' '}
            {queue
              .map((id) => lobby.players.find((p) => p.id === id)?.name ?? id.slice(0, 6))
              .join(' → ')}
          </p>
        ) : null}
        {!lobby.pleadingTimerStarted ? (
          <p className="text-xs text-slate-400">
            L’orateur démarre son temps de parole quand il est prêt (45 s une fois lancé).
          </p>
        ) : (
          <p className="text-xs text-amber-200/85">Temps restant : {lobby.timeRemaining}s</p>
        )}
        {isCurrentSpeaker && !lobby.pleadingTimerStarted ? (
          <Button type="button" className="w-full" onClick={submitStartPleading}>
            PRENDRE LA PAROLE
          </Button>
        ) : null}
      </div>
    )
  }

  return null
}

export default ActionPanel
