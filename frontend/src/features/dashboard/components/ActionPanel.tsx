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
  | 'SUBMIT_PRAYER'
  | 'VOTE_DAY'
  | 'WENDIGO_INTENT'
  | 'CLAIM_SEAT'
  | 'ACCUSE'
  | 'START_PLEADING'
  | 'TOGGLE_PAUSE'
  | 'FORCE_END_GAME'
  | 'START_SURRENDER_VOTE'
  | 'SUBMIT_SURRENDER_VOTE'

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
interface SubmitPrayerPayload {
  target_id: string
}

interface SubmitSurrenderVotePayload {
  vote_yes: boolean
}

type ActionPayloadByType = {
  SUBMIT_NIGHT_ACTION: SubmitNightActionPayload
  SUBMIT_PRAYER: SubmitPrayerPayload
  VOTE_DAY: VoteDayPayload
  WENDIGO_INTENT: WendigoIntentPayload
  CLAIM_SEAT: ClaimSeatPayload
  ACCUSE: AccusePayload
  START_PLEADING: Record<string, never>
  TOGGLE_PAUSE: Record<string, never>
  FORCE_END_GAME: Record<string, never>
  START_SURRENDER_VOTE: Record<string, never>
  SUBMIT_SURRENDER_VOTE: SubmitSurrenderVotePayload
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
  const [prayerTarget, setPrayerTarget] = useState<string>('')
  const [lockedActionMessage, setLockedActionMessage] = useState<string | null>(null)
  const { playLock } = useGameAudio()

  const aliveOpponents = useMemo(
    () => lobby.players.filter((player) => player.isAlive && player.id !== currentPlayer.id),
    [currentPlayer.id, lobby.players]
  )

  const aliveForCouncilVote = useMemo(
    () => lobby.players.filter((player) => player.isAlive && player.id !== currentPlayer.id),
    [currentPlayer.id, lobby.players]
  )

  const aliveTargetsForWendigo = useMemo(
    () => lobby.players.filter((player) => player.isAlive && player.id !== currentPlayer.id),
    [currentPlayer.id, lobby.players]
  )
  const alivePrayerTargets = useMemo(
    () => lobby.players.filter((player) => player.isAlive && player.id !== currentPlayer.id),
    [currentPlayer.id, lobby.players]
  )

  const councilAccusations = lobby.councilAccusations ?? {}
  const accusedTargets = useMemo(() => new Set(Object.values(councilAccusations)), [councilAccusations])
  const hasAlreadyAccused = Object.prototype.hasOwnProperty.call(councilAccusations, currentPlayer.id)
  const isExcludedFromCouncil = currentPlayer.isExcludedFromCouncil === true
  const prayerTallies = lobby.prayerTallies ?? {}
  const livingPlayersCount = alivePrayerTargets.length
  const prayerThreshold = Math.ceil(livingPlayersCount / 2)
  const hasPrayerTallies = Object.keys(prayerTallies).length > 0

  useEffect(() => {
    setLockedActionMessage(null)
    setSelectedTarget('')
    setPrayerTarget('')
  }, [lobby.phase, lobby.currentSpeakerId])

  const phase = lobby.phase.toUpperCase()

  useEffect(() => {
    if (alivePrayerTargets.length === 0) {
      setPrayerTarget('')
      return
    }
    const defaultTarget = alivePrayerTargets[0].id
    setPrayerTarget((prev) => {
      if (prev !== '' && alivePrayerTargets.some((player) => player.id === prev)) {
        return prev
      }
      return defaultTarget
    })
  }, [alivePrayerTargets, currentPlayer.id])

  // Les phases narratives (ex: STAKE / MORNING) doivent s'afficher même pour les joueurs éliminés.
  if (!currentPlayer.isAlive && phase !== 'STAKE' && phase !== 'MORNING') {
    return null
  }

  const role = (currentPlayer.role ?? '').toUpperCase()
  const isPaused = lobby.isPaused === true
  const pausedControlClass = isPaused ? 'cursor-not-allowed opacity-50' : ''
  const canPrayAtNight = currentPlayer.role !== 'WENDIGO'
  const findTargetName = (targetId: string): string =>
    aliveOpponents.find((player) => player.id === targetId)?.name ?? 'Unknown target'

  const findAlivePlayerName = (playerId: string): string =>
    lobby.players.find((player) => player.id === playerId)?.name ?? 'Unknown target'
  const findPlayerName = (playerId: string): string =>
    lobby.players.find((player) => player.id === playerId)?.name ?? playerId.slice(0, 8)

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

  const submitPrayer = (targetId: string) => {
    const sent = sendMessage('SUBMIT_PRAYER', { target_id: targetId })
    if (!sent) {
      toast.error('Connection is not ready. Please try again.')
      return
    }
    toast.success(`Prière envoyée pour ${findAlivePlayerName(targetId)}.`)
    setLockedActionMessage(`Prière en cours : ${findAlivePlayerName(targetId)}`)
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
      const intentions = lobby.wendigoIntents ?? lobby.wendigoIntentions ?? {}
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
          {aliveTargetsForWendigo.length > 0 ? (
            <div className="rounded-md border border-slate-800 bg-slate-950/30 p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Intentions par cible</p>
              <ul className="space-y-1 text-xs text-slate-300">
                {aliveTargetsForWendigo.map((candidate) => {
                  const aiming = Object.entries(intentions)
                    .filter(([, targetId]) => targetId === candidate.id)
                    .map(([wendigoId]) => findAlivePlayerName(wendigoId))
                  return (
                    <li key={candidate.id} className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-slate-200">{candidate.name}</span>
                      {aiming.length > 0 ? (
                        <span className="rounded-full border border-rose-900/60 bg-rose-950/30 px-2 py-0.5 text-[11px] text-rose-200">
                          Visé par {aiming.join(', ')}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">—</span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}
          <select
            value={selectedTarget}
            disabled={isPaused}
            onChange={(event) => {
              const next = event.target.value
              setSelectedTarget(next)
              sendWendigoIntent(next)
            }}
            className={`h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-slate-500 ${pausedControlClass}`}
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
            className={`w-full ${pausedControlClass}`}
            disabled={isPaused || selectedTarget.length === 0}
            onClick={() => submitNightAction('KILL', selectedTarget)}
          >
            Confirmer le meurtre
          </Button>
          <div className="rounded-md border border-slate-700 bg-slate-950/40 p-3">
            {canPrayAtNight ? (
              <>
                <p className="mb-2 text-xs text-slate-400">
                  Camouflage optionnel : priez comme n'importe quel villageois pour protéger une cible.
                </p>
                <select
                  value={prayerTarget}
                  disabled={isPaused}
                  onChange={(event) => setPrayerTarget(event.target.value)}
                  className={`h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-slate-500 ${pausedControlClass}`}
                >
                  {alivePrayerTargets.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                      {player.id === currentPlayer.id ? ' (vous)' : ''}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="secondary"
                  className={`mt-2 w-full ${pausedControlClass}`}
                  disabled={isPaused || prayerTarget.length === 0}
                  onClick={() => submitPrayer(prayerTarget)}
                >
                  Prier pour ce joueur
                </Button>
              </>
            ) : null}
            {hasPrayerTallies ? (
              <div className="mt-3 rounded-md border border-slate-800 bg-slate-950/60 p-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Echo des prieres</p>
                <div className="space-y-1 text-xs text-slate-400">
                  {Object.entries(prayerTallies).map(([targetID, count]) => {
                    const name = findAlivePlayerName(targetID)
                    const reachedThreshold = count >= prayerThreshold
                    return (
                      <p key={targetID} className={reachedThreshold ? 'text-emerald-300' : 'text-slate-400'}>
                        {name} : {count} priere(s)
                      </p>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-300">
          La nuit tombe. Choisissez une cible vivante (vous inclus) et envoyez votre prière d'immunité.
        </p>
        <select
          value={prayerTarget}
          disabled={isPaused}
          onChange={(event) => setPrayerTarget(event.target.value)}
          className={`h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-slate-500 ${pausedControlClass}`}
        >
          {alivePrayerTargets.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name}
              {player.id === currentPlayer.id ? ' (vous)' : ''}
            </option>
          ))}
        </select>
        <Button
          type="button"
          className={`w-full ${pausedControlClass}`}
          disabled={isPaused || prayerTarget.length === 0}
          onClick={() => submitPrayer(prayerTarget)}
        >
          Prier pour ce joueur
        </Button>
        {hasPrayerTallies ? (
          <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Echo des prieres</p>
            <div className="space-y-1 text-xs text-slate-400">
              {Object.entries(prayerTallies).map(([targetID, count]) => {
                const name = findAlivePlayerName(targetID)
                const reachedThreshold = count >= prayerThreshold
                return (
                  <p key={targetID} className={reachedThreshold ? 'text-emerald-300' : 'text-slate-400'}>
                    {name} : {count} priere(s)
                  </p>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  if (phase === 'CHAIR_SELECTION') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-300">
          Choisissez votre place autour du feu. Dès que tout le monde est assis, le jour se lève.
        </p>
        <ChairPicker lobby={lobby} currentPlayer={currentPlayer} sendMessage={sendMessage} disabled={isPaused} />
        {hasSeat ? (
          <p className="text-center text-xs text-emerald-400/90">Vous êtes assis — en attente des autres.</p>
        ) : null}
      </div>
    )
  }

  if (phase === 'DAY') {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-950/40 p-6 text-center text-slate-200">
        <p className="text-sm leading-relaxed text-slate-300">
          Phase sociale en cours. Discutez et gardez un œil sur le chrono pour la course aux chaises.
        </p>
      </div>
    )
  }

  if (phase === 'COUNCIL_START') {
    return (
      <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-violet-900/40 bg-violet-950/20 p-8 text-center">
        <p className="max-w-md font-serif text-xl font-semibold leading-snug tracking-wide text-violet-100 md:text-2xl">
          Bienvenue au conseil du village. Avez-vous des soupçons sur quelqu'un ?
        </p>
      </div>
    )
  }

  if (phase === 'COUNCIL_VOTE') {
    if (isExcludedFromCouncil) {
      return (
        <div className="rounded-lg border border-rose-900/50 bg-rose-950/25 p-6 text-center">
          <p className="text-sm font-semibold leading-relaxed text-rose-200">
            Sanction : Vous êtes exclu du conseil. Vous êtes privé du droit de vote et de parole.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <p className="text-sm text-amber-100/90">
          Le Conseil délibère. Choisissez qui éliminer — tout le monde vivant est éligible, y compris vous-même.
        </p>
        <select
          value={selectedTarget}
          disabled={isPaused}
          onChange={(event) => setSelectedTarget(event.target.value)}
          className={`h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-slate-500 ${pausedControlClass}`}
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
          className={`w-full ${pausedControlClass}`}
          disabled={isPaused || disableTargetAction}
          onClick={() => submitVoteDay(selectedTarget)}
        >
          VOTER AU CONSEIL
        </Button>
      </div>
    )
  }

  if (phase === 'COUNCIL_SUMMARY') {
    const accusations = Object.entries(councilAccusations)
    if (accusations.length === 0) {
      return (
        <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border border-violet-900/40 bg-violet-950/20 p-8 text-center">
          <p className="max-w-md font-serif text-xl font-semibold leading-snug tracking-wide text-violet-100 md:text-2xl">
            Aucun habitant n&apos;a porté d&apos;accusation aujourd&apos;hui. Le village va maintenant passer au vote libre.
          </p>
        </div>
      )
    }

    return (
      <div className="rounded-lg border border-violet-900/40 bg-violet-950/20 p-6 text-center">
        <p className="font-serif text-xl font-semibold tracking-wide text-violet-100">Bilan des accusations</p>
        <ul className="mt-4 space-y-2 text-left text-sm text-violet-100/90">
          {accusations.map(([accuserId, accusedId]) => (
            <li key={accuserId} className="rounded-md border border-violet-900/40 bg-slate-950/40 px-3 py-2">
              <span className="font-semibold text-violet-50">{findPlayerName(accuserId)}</span>
              <span className="px-2 text-violet-300">-&gt;</span>
              <span className="font-semibold text-amber-100">{findPlayerName(accusedId)}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (phase === 'STAKE') {
    const victimID = lobby.lastLynchVictimId ?? ''
    const victimName = victimID !== '' ? findPlayerName(victimID) : ''
    const votes = lobby.votes ?? {}
    const voteEntries = Object.entries(votes)
    return (
      <div className="rounded-lg border border-orange-900/50 bg-gradient-to-b from-orange-950/30 via-rose-950/20 to-slate-950/40 p-6 text-center">
        <p className="font-serif text-2xl font-semibold tracking-wide text-orange-200">Le Bûcher</p>
        {victimID !== '' ? (
          <p className="mt-3 p-4 text-center text-sm font-semibold leading-relaxed text-orange-300">
            Le village a décidé de condamner <span className="font-semibold text-orange-100">{victimName}</span>. Il finit
            sur le bûcher.
          </p>
        ) : (
          <p className="mt-3 p-4 text-center text-sm font-semibold leading-relaxed text-orange-300">
            Après de longues hésitations, le village n&apos;a brûlé personne ce soir. La nuit tombe sur le campement...
          </p>
        )}

        <div className="mt-4 rounded-md border border-slate-800 bg-slate-950/40 p-4 text-left">
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-slate-300">
            Votes du conseil
          </p>
          {voteEntries.length === 0 ? (
            <p className="text-center text-sm text-slate-300">Aucun vote n&apos;a été exprimé.</p>
          ) : (
            <ul className="space-y-1 text-sm text-slate-300">
              {voteEntries.map(([voterId, targetId]) => (
                <li key={voterId} className="text-center">
                  <span className="font-semibold text-slate-100">{findPlayerName(voterId)}</span> a voté contre{' '}
                  <span className="font-semibold text-slate-100">{findPlayerName(targetId)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="mt-2 text-xs text-orange-200/70">En attente de la nuit.</p>
      </div>
    )
  }

  if (phase === 'MORNING') {
    const victimID = lobby.lastNightVictimId ?? ''
    const saved = lobby.lastNightSavedByPrayer === true
    const victimName = victimID !== '' ? findPlayerName(victimID) : ''

    return (
      <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-6 text-center">
        <p className="font-serif text-2xl font-semibold tracking-wide text-slate-100">Matin</p>
        {victimID !== '' ? (
          <p className="mt-3 p-4 text-center text-sm font-semibold leading-relaxed text-rose-300">
            Le village se réveille... et découvre le corps de{' '}
            <span className="font-semibold text-rose-100">{victimName}</span>.
          </p>
        ) : saved ? (
          <p className="mt-3 p-4 text-center text-sm font-semibold leading-relaxed text-cyan-200">
            Le village se réveille. Les prières ont été entendues, une attaque a été repoussée cette nuit !
          </p>
        ) : (
          <p className="mt-3 p-4 text-center text-sm font-semibold leading-relaxed text-slate-200">
            Le village se réveille. Étonnamment, la nuit a été calme. Personne n&apos;est mort.
          </p>
        )}
        <p className="mt-2 text-xs text-slate-400">Le jour se lève...</p>
      </div>
    )
  }

  if (phase === 'NO_COUNCIL') {
    return (
      <div className="rounded-lg border border-violet-900/40 bg-violet-950/15 p-6 text-center">
        <p className="font-serif text-2xl font-semibold tracking-wide text-violet-100">Conseil annulé</p>
        <p className="mt-3 p-4 text-center text-sm font-semibold leading-relaxed text-violet-200/90">
          Le conseil est désert... Personne n&apos;a daigné se présenter au feu de camp. Les habitants ont préféré rester
          couchés ou festoyer dans leurs tentes. La nuit tombe sur un village insouciant...
        </p>
        <p className="mt-2 text-xs text-violet-200/70">La nuit approche.</p>
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
          disabled={isPaused || hasAlreadyAccused}
          onChange={(event) => setSelectedTarget(event.target.value)}
          className={`h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-slate-500 ${pausedControlClass}`}
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
          className={`w-full ${pausedControlClass}`}
          disabled={isPaused || disableTargetAction || hasAlreadyAccused || accusedTargets.has(selectedTarget)}
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
          <Button
            type="button"
            className={`w-full ${pausedControlClass}`}
            disabled={isPaused}
            onClick={submitStartPleading}
          >
            PRENDRE LA PAROLE
          </Button>
        ) : null}
      </div>
    )
  }

  return null
}

export default ActionPanel
