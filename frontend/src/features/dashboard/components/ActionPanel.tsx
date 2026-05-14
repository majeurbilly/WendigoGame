import type { LobbyState, Player } from '@/api/game'
import ChairPicker from '@/features/dashboard/components/ChairPicker'
import PlayerAvatarGrid, { playerInitial } from '@/features/dashboard/components/game/PlayerAvatarGrid'
import VoxelButton from '@/features/dashboard/components/game/VoxelButton'
import { useGameAudio } from '@/hooks/useGameAudio'
import { cn } from '@/lib/utils'
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
  /** Texte affiché dans le cartouche narratif au-dessus du dock (overlay). */
  onNarrativeChange?: (text: string) => void
}

const MiniAvatar = ({ name, className }: { name: string; className?: string }) => (
  <span
    className={cn(
      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-t-[#c9a66b]/80 border-l-[#c9a66b]/80 border-b-[#1a0f08] border-r-[#1a0f08] bg-gradient-to-b from-[#3d342c] to-[#1e1814] text-xs font-black text-amber-50',
      className
    )}
  >
    {playerInitial(name)}
  </span>
)

const ActionPanel = ({ lobby, currentPlayer, sendMessage, onNarrativeChange }: ActionPanelProps) => {
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

  const pleadingSid = lobby.currentSpeakerId ?? ''
  const speakerName =
    pleadingSid !== '' ? lobby.players.find((p) => p.id === pleadingSid)?.name ?? pleadingSid.slice(0, 8) : '—'
  const councilSummaryCount = Object.keys(lobby.councilAccusations ?? {}).length
  const stakeVictimId = lobby.lastLynchVictimId ?? ''
  const morningVictimId = lobby.lastNightVictimId ?? ''
  const morningSaved = lobby.lastNightSavedByPrayer === true

  const panelHidden = !currentPlayer.isAlive && phase !== 'STAKE' && phase !== 'MORNING'

  const stakeVictimName = useMemo(
    () => (stakeVictimId !== '' ? lobby.players.find((p) => p.id === stakeVictimId)?.name ?? '…' : ''),
    [lobby.players, stakeVictimId]
  )
  const morningVictimName = useMemo(
    () => (morningVictimId !== '' ? lobby.players.find((p) => p.id === morningVictimId)?.name ?? '…' : ''),
    [lobby.players, morningVictimId]
  )

  useEffect(() => {
    if (!onNarrativeChange) return
    if (panelHidden) {
      onNarrativeChange('')
      return
    }
    if (lockedActionMessage) {
      onNarrativeChange('Votre action est enregistrée. Patientez jusqu’à la fin de la phase.')
      return
    }

    let msg = ''
    if (phase === 'NIGHT') {
      msg =
        role === 'WENDIGO'
          ? 'La meute se coordonne. Touchez une cible pour votre intention, puis confirmez le meurtre.'
          : 'La nuit tombe. Touchez un habitant pour envoyer votre prière d’immunité.'
    } else if (phase === 'CHAIR_SELECTION') {
      msg = 'Choisissez votre place au feu. Quand tous sont assis, le jour se lève.'
    } else if (phase === 'DAY') {
      msg = 'Phase sociale : discutez et surveillez le sablier avant la course aux chaises.'
    } else if (phase === 'COUNCIL_START') {
      msg = 'Le conseil du village s’ouvre. Qui soupçonnez-vous ?'
    } else if (phase === 'COUNCIL_VOTE') {
      msg = isExcludedFromCouncil
        ? 'Vous êtes exclu du conseil : ni vote ni parole.'
        : 'Le conseil délibère. Désignez qui éliminer.'
    } else if (phase === 'COUNCIL_SUMMARY') {
      msg =
        councilSummaryCount === 0
          ? 'Nulle accusation aujourd’hui. Le village passe au vote libre.'
          : 'Bilan des accusations : le village écoute.'
    } else if (phase === 'STAKE') {
      msg =
        stakeVictimId !== ''
          ? `Le bûcher attend ${stakeVictimName}.`
          : 'Personne ne brûle ce soir. La nuit va tomber…'
    } else if (phase === 'MORNING') {
      msg =
        morningVictimId !== ''
          ? `L’aube révèle un drame autour de ${morningVictimName}…`
          : morningSaved
            ? 'Les prières ont repoussé la nuit. Le village respire.'
            : 'Une nuit étrangement calme. Personne n’a péri.'
    } else if (phase === 'NO_COUNCIL') {
      msg = 'Le conseil est désert… Le village glisse vers la nuit.'
    } else if (phase === 'ACCUSATION') {
      msg = isExcludedFromCouncil
        ? 'Exclu du conseil pour votre chaise manquée.'
        : 'Une voix, une cible. Désignez qui accuser au feu.'
    } else if (phase === 'PLEADINGS') {
      msg = `Plaidoiries — à la parole : ${speakerName}.`
    }
    onNarrativeChange(msg)
    return () => {
      onNarrativeChange('')
    }
  }, [
    onNarrativeChange,
    panelHidden,
    lockedActionMessage,
    phase,
    role,
    isExcludedFromCouncil,
    councilSummaryCount,
    stakeVictimId,
    stakeVictimName,
    morningVictimId,
    morningVictimName,
    morningSaved,
    speakerName,
  ])

  if (panelHidden) {
    return null
  }

  if (lockedActionMessage) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-xl border border-amber-500/45 bg-[#14100c]/80 px-4 py-3 text-[#f5ecd8] shadow-inner">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-amber-300" aria-hidden />
          <span>Action verrouillée : {lockedActionMessage}</span>
        </div>
        <p className="mt-2 text-xs text-amber-200/75">En attente de la fin de phase…</p>
      </div>
    )
  }

  if (phase === 'NIGHT') {
    if (role === 'WENDIGO') {
      const intentions = lobby.wendigoIntents ?? lobby.wendigoIntentions ?? {}
      return (
        <div className="space-y-3">
          {Object.keys(intentions).length > 0 ? (
            <div className="flex flex-wrap gap-2 rounded-lg border border-rose-900/45 bg-black/35 px-2 py-2">
              {Object.entries(intentions).map(([wendigoId, targetId]) => (
                <div key={wendigoId} className="flex items-center gap-1.5 rounded-full border border-rose-800/40 bg-rose-950/25 px-2 py-1">
                  <MiniAvatar name={findAlivePlayerName(wendigoId)} />
                  <span className="text-[10px] text-rose-200/90">→</span>
                  <MiniAvatar name={findAlivePlayerName(targetId)} />
                </div>
              ))}
            </div>
          ) : null}
          {aliveTargetsForWendigo.length > 0 ? (
            <div className="rounded-lg border border-amber-900/35 bg-black/35 px-2 py-2">
              <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200/80">
                Intentions
              </p>
              <div className="flex flex-col gap-2">
                {aliveTargetsForWendigo.map((candidate) => {
                  const aiming = Object.entries(intentions)
                    .filter(([, targetId]) => targetId === candidate.id)
                    .map(([wendigoId]) => findAlivePlayerName(wendigoId))
                  return (
                    <div key={candidate.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <MiniAvatar name={candidate.name} />
                        <span className="max-w-[40%] truncate text-xs font-medium text-[#f5ecd8]">{candidate.name}</span>
                      </div>
                      {aiming.length > 0 ? (
                        <div className="flex flex-wrap justify-end gap-1">
                          {aiming.map((n, idx) => (
                            <MiniAvatar key={`${candidate.id}-aim-${idx}`} name={n} className="h-6 w-6 text-[10px]" />
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-amber-200/50">—</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}
          <PlayerAvatarGrid
            players={aliveTargetsForWendigo}
            selectedId={selectedTarget}
            allowClear
            clearLabel="∅"
            disabled={isPaused}
            onSelect={(id) => {
              setSelectedTarget(id)
              void sendWendigoIntent(id)
            }}
          />
          <VoxelButton
            type="button"
            variant="danger"
            className={`w-full ${pausedControlClass}`}
            disabled={isPaused || selectedTarget.length === 0}
            onClick={() => submitNightAction('KILL', selectedTarget)}
          >
            Confirmer le meurtre
          </VoxelButton>
          <div className="rounded-lg border border-amber-900/35 bg-black/35 px-2 py-2">
            {canPrayAtNight ? (
              <>
                <p className="mb-2 text-center text-[10px] text-amber-200/80">Camouflage : prière</p>
                <PlayerAvatarGrid
                  players={alivePrayerTargets}
                  selectedId={prayerTarget}
                  selfId={currentPlayer.id}
                  disabled={isPaused}
                  onSelect={(id) => setPrayerTarget(id)}
                />
                <VoxelButton
                  type="button"
                  variant="muted"
                  className={`mt-2 w-full ${pausedControlClass}`}
                  disabled={isPaused || prayerTarget.length === 0}
                  onClick={() => submitPrayer(prayerTarget)}
                >
                  Prier pour ce joueur
                </VoxelButton>
              </>
            ) : null}
            {hasPrayerTallies ? (
              <div className="mt-3 rounded-md border border-amber-900/30 bg-black/40 p-2">
                <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-amber-200/75">
                  Écho des prières
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {Object.entries(prayerTallies).map(([targetID, count]) => {
                    const name = findAlivePlayerName(targetID)
                    const reachedThreshold = count >= prayerThreshold
                    return (
                      <div
                        key={targetID}
                        className={`flex items-center gap-1.5 rounded-full border px-2 py-1 ${
                          reachedThreshold ? 'border-emerald-600/60 bg-emerald-950/30' : 'border-amber-900/40 bg-black/30'
                        }`}
                      >
                        <MiniAvatar name={name} className="h-6 w-6 text-[10px]" />
                        <span className={`text-xs font-black ${reachedThreshold ? 'text-emerald-200' : 'text-amber-100/90'}`}>
                          ×{count}
                        </span>
                      </div>
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
        <PlayerAvatarGrid
          players={alivePrayerTargets}
          selectedId={prayerTarget}
          selfId={currentPlayer.id}
          disabled={isPaused}
          onSelect={(id) => setPrayerTarget(id)}
        />
        <VoxelButton
          type="button"
          className={`w-full ${pausedControlClass}`}
          disabled={isPaused || prayerTarget.length === 0}
          onClick={() => submitPrayer(prayerTarget)}
        >
          Prier pour ce joueur
        </VoxelButton>
        {hasPrayerTallies ? (
          <div className="rounded-md border border-amber-900/35 bg-black/40 p-2">
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-amber-200/75">Écho des prières</p>
            <div className="flex flex-wrap justify-center gap-2">
              {Object.entries(prayerTallies).map(([targetID, count]) => {
                const name = findAlivePlayerName(targetID)
                const reachedThreshold = count >= prayerThreshold
                return (
                  <div
                    key={targetID}
                    className={`flex items-center gap-1.5 rounded-full border px-2 py-1 ${
                      reachedThreshold ? 'border-emerald-600/60 bg-emerald-950/30' : 'border-amber-900/40 bg-black/30'
                    }`}
                  >
                    <MiniAvatar name={name} className="h-6 w-6 text-[10px]" />
                    <span className={`text-xs font-black ${reachedThreshold ? 'text-emerald-200' : 'text-amber-100/90'}`}>×{count}</span>
                  </div>
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
      <div className="space-y-3">
        <ChairPicker lobby={lobby} currentPlayer={currentPlayer} sendMessage={sendMessage} disabled={isPaused} />
        {hasSeat ? (
          <p className="text-center text-xs font-semibold text-emerald-300/95">Vous êtes assis — en attente des autres.</p>
        ) : null}
      </div>
    )
  }

  if (phase === 'DAY') {
    return (
      <div className="rounded-lg border border-amber-900/30 bg-black/30 px-3 py-4 text-center text-sm text-[#f5ecd8]/90">
        Discussions libres — préparez-vous pour la suite.
      </div>
    )
  }

  if (phase === 'COUNCIL_START') {
    return (
      <div className="rounded-lg border border-amber-500/35 bg-black/35 px-3 py-5 text-center text-sm font-serif font-medium leading-relaxed text-[#f5ecd8]">
        Le feu du conseil brûle. Les regards se croisent…
      </div>
    )
  }

  if (phase === 'COUNCIL_VOTE') {
    if (isExcludedFromCouncil) {
      return (
        <div className="rounded-lg border border-rose-800/50 bg-rose-950/25 px-3 py-4 text-center text-sm font-semibold text-rose-100">
          Sanction : exclu du conseil — pas de vote ni de parole.
        </div>
      )
    }

    return (
      <div className="space-y-3">
        <PlayerAvatarGrid
          players={aliveForCouncilVote}
          selectedId={selectedTarget}
          allowClear
          clearLabel="?"
          disabled={isPaused}
          onSelect={(id) => setSelectedTarget(id)}
        />
        <VoxelButton
          type="button"
          variant="danger"
          className={`w-full ${pausedControlClass}`}
          disabled={isPaused || disableTargetAction}
          onClick={() => submitVoteDay(selectedTarget)}
        >
          Voter au conseil
        </VoxelButton>
      </div>
    )
  }

  if (phase === 'COUNCIL_SUMMARY') {
    const accusations = Object.entries(councilAccusations)
    if (accusations.length === 0) {
      return (
        <div className="rounded-lg border border-amber-500/35 bg-black/35 px-3 py-5 text-center text-sm font-serif text-[#f5ecd8]">
          Silence au village…
        </div>
      )
    }

    return (
      <div className="rounded-lg border border-amber-900/35 bg-black/35 px-2 py-3">
        <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/85">Accusations</p>
        <ul className="flex flex-col gap-2">
          {accusations.map(([accuserId, accusedId]) => (
            <li
              key={accuserId}
              className="flex items-center justify-center gap-2 rounded-lg border border-amber-900/30 bg-black/25 px-2 py-2"
            >
              <MiniAvatar name={findPlayerName(accuserId)} />
              <span className="text-xs font-black text-amber-400/90">→</span>
              <MiniAvatar name={findPlayerName(accusedId)} />
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
      <div className="space-y-3 rounded-lg border border-orange-900/40 bg-black/35 px-2 py-3 text-center">
        <p className="font-serif text-lg font-bold tracking-wide text-orange-200">Le bûcher</p>
        {victimID !== '' ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <MiniAvatar name={victimName} className="h-12 w-12 text-base" />
            <p className="text-sm font-semibold text-orange-200/95">
              Le village condamne <span className="text-orange-50">{victimName}</span>.
            </p>
          </div>
        ) : (
          <p className="py-2 text-sm font-semibold text-orange-200/90">Nul ne monte sur le bûcher ce soir.</p>
        )}

        <div className="rounded-md border border-amber-900/30 bg-black/30 p-2 text-left">
          <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-amber-200/75">Votes</p>
          {voteEntries.length === 0 ? (
            <p className="text-center text-xs text-[#f5ecd8]/75">Aucun vote enregistré.</p>
          ) : (
            <ul className="flex flex-col gap-1.5 text-xs text-[#f5ecd8]/90">
              {voteEntries.map(([voterId, targetId]) => (
                <li key={voterId} className="flex items-center justify-center gap-2">
                  <MiniAvatar name={findPlayerName(voterId)} className="h-6 w-6 text-[10px]" />
                  <span className="text-amber-300/80">→</span>
                  <MiniAvatar name={findPlayerName(targetId)} className="h-6 w-6 text-[10px]" />
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-[10px] text-orange-200/65">En attente de la nuit.</p>
      </div>
    )
  }

  if (phase === 'MORNING') {
    const victimID = lobby.lastNightVictimId ?? ''
    const saved = lobby.lastNightSavedByPrayer === true
    const victimName = victimID !== '' ? findPlayerName(victimID) : ''

    return (
      <div className="space-y-2 rounded-lg border border-amber-900/35 bg-black/35 px-2 py-4 text-center">
        <p className="font-serif text-lg font-bold text-[#f5ecd8]">Matin</p>
        {victimID !== '' ? (
          <div className="flex flex-col items-center gap-2">
            <MiniAvatar name={victimName} className="h-12 w-12 text-base" />
            <p className="text-sm font-semibold text-rose-200/95">
              Le village découvre le sort de <span className="text-rose-50">{victimName}</span>.
            </p>
          </div>
        ) : saved ? (
          <p className="text-sm font-semibold text-cyan-200/95">Les prières ont tenu la nuit.</p>
        ) : (
          <p className="text-sm font-semibold text-[#f5ecd8]/90">Une nuit sans victime.</p>
        )}
        <p className="text-[10px] text-amber-200/60">Le jour se lève…</p>
      </div>
    )
  }

  if (phase === 'NO_COUNCIL') {
    return (
      <div className="rounded-lg border border-violet-800/40 bg-black/35 px-3 py-5 text-center">
        <p className="font-serif text-lg font-bold text-violet-100">Conseil annulé</p>
        <p className="mt-2 text-sm font-medium text-violet-200/90">Les sièges vides murmurent déjà la nuit…</p>
      </div>
    )
  }

  if (phase === 'ACCUSATION') {
    const accuserName = (id: string) => lobby.players.find((p) => p.id === id)?.name ?? id.slice(0, 8)

    if (isExcludedFromCouncil) {
      return (
        <div className="space-y-2 text-center">
          <p className="text-sm font-bold text-rose-400">Exclu du conseil (chaise manquée).</p>
          {Object.keys(councilAccusations).length > 0 ? (
            <div className="flex flex-col gap-2 rounded-lg border border-amber-900/30 bg-black/30 p-2">
              {Object.entries(councilAccusations).map(([accuserId, accusedId]) => (
                <div key={accuserId} className="flex items-center justify-center gap-2">
                  <MiniAvatar name={accuserName(accuserId)} className="h-6 w-6 text-[10px]" />
                  <span className="text-amber-300/80">→</span>
                  <MiniAvatar name={accuserName(accusedId)} className="h-6 w-6 text-[10px]" />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {Object.keys(councilAccusations).length > 0 ? (
          <div className="flex flex-col gap-2 rounded-lg border border-amber-900/30 bg-black/30 p-2">
            {Object.entries(councilAccusations).map(([accuserId, accusedId]) => (
              <div key={accuserId} className="flex items-center justify-center gap-2">
                <MiniAvatar name={accuserName(accuserId)} className="h-6 w-6 text-[10px]" />
                <span className="text-amber-300/80">→</span>
                <MiniAvatar name={accuserName(accusedId)} className="h-6 w-6 text-[10px]" />
              </div>
            ))}
          </div>
        ) : null}

        <PlayerAvatarGrid
          players={aliveOpponents}
          selectedId={selectedTarget}
          idsDisabled={accusedTargets}
          disabled={isPaused || hasAlreadyAccused}
          onSelect={(id) => setSelectedTarget(id)}
        />
        <VoxelButton
          type="button"
          variant="muted"
          className={`w-full ${pausedControlClass}`}
          disabled={isPaused || disableTargetAction || hasAlreadyAccused || accusedTargets.has(selectedTarget)}
          onClick={() => submitCouncilAccuse(selectedTarget)}
        >
          Accuser au conseil
        </VoxelButton>
      </div>
    )
  }

  if (phase === 'PLEADINGS') {
    const sid = lobby.currentSpeakerId ?? ''
    const speakerNameP =
      sid !== '' ? lobby.players.find((p) => p.id === sid)?.name ?? sid.slice(0, 8) : '—'
    const isCurrentSpeaker = sid !== '' && sid === currentPlayer.id
    const queue = lobby.pleadingsQueue ?? []

    return (
      <div className="space-y-3">
        {queue.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-1">
            {queue.map((id) => {
              const n = lobby.players.find((p) => p.id === id)?.name ?? id.slice(0, 6)
              return <MiniAvatar key={id} name={n} className="h-7 w-7 text-[11px]" />
            })}
          </div>
        ) : null}
        {!lobby.pleadingTimerStarted ? (
          <p className="text-center text-[10px] text-amber-200/75">
            {isCurrentSpeaker
              ? `Vous parlez bientôt (${lobby.phaseSettings.pleadingSpeechSeconds}s une fois lancé).`
              : `À l’écoute de ${speakerNameP}.`}
          </p>
        ) : (
          <p className="text-center text-xs font-mono font-bold text-amber-200/90">Temps : {lobby.timeRemaining}s</p>
        )}
        {isCurrentSpeaker && !lobby.pleadingTimerStarted ? (
          <VoxelButton type="button" className={`w-full ${pausedControlClass}`} disabled={isPaused} onClick={submitStartPleading}>
            Prendre la parole
          </VoxelButton>
        ) : null}
      </div>
    )
  }

  return null
}

export default ActionPanel
