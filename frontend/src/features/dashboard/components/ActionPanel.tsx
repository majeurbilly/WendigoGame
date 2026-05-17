import { type LobbyState, type Player } from '@/api/game'
import { Trans, t } from '@/lib/lingui'
import ChairPicker from '@/features/dashboard/components/ChairPicker'
import NarrativeBox from '@/features/dashboard/components/NarrativeBox'
import PlayerAvatarGrid, { playerInitial } from '@/features/dashboard/components/game/PlayerAvatarGrid'
import VoxelButton from '@/features/dashboard/components/game/VoxelButton'
import { useGameAudio } from '@/hooks/useGameAudio'
import { safeTrim } from '@/lib/safeTrim'
import { cn } from '@/lib/utils'
import { LoaderCircle } from 'lucide-react'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
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
  /** Indication courte si la narration détaillée de phase n’est pas encore poussée. */
  phaseHint: string
}

const tabletStone =
  'rounded-3xl border-t-4 border-b-8 border-x-2 border-[#2d261f] bg-[#1a1612] shadow-[0_20px_50px_rgba(0,0,0,0.8)]'

/** En jeu : tablette centrée au-dessus du bas d’écran. */
const tabletShellInGameClass =
  'pointer-events-auto fixed bottom-4 left-1/2 z-[85] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 ' + tabletStone

const tabletInnerInGameClass =
  'max-h-[min(52vh,28rem)] overflow-y-auto overscroll-contain px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-4'

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

function ActionPanelInGame({ lobby, currentPlayer, sendMessage, phaseHint }: ActionPanelProps) {
  const [selectedTarget, setSelectedTarget] = useState<string>('')
  const [prayerTarget, setPrayerTarget] = useState<string>('')
  const [lockedActionMessage, setLockedActionMessage] = useState<string | null>(null)
  const [narrativeText, setNarrativeText] = useState('')
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
    aliveOpponents.find((player) => player.id === targetId)?.name ?? t`Unknown target`

  const findAlivePlayerName = (playerId: string): string =>
    lobby.players.find((player) => player.id === playerId)?.name ?? t`Unknown target`
  const findPlayerName = (playerId: string): string =>
    lobby.players.find((player) => player.id === playerId)?.name ?? playerId.slice(0, 8)

  const submitNightAction = (action: NightAction, targetId: string) => {
    const sent = sendMessage('SUBMIT_NIGHT_ACTION', { action, target_id: targetId })
    if (!sent) {
      toast.error(t`Connection is not ready. Please try again.`)
      return
    }

    toast.success(t`Action submitted.`)
    if (action === 'PRAY') {
      setLockedActionMessage(t`Praying`)
      playLock()
      return
    }

    const targetName = findTargetName(targetId)
    if (action === 'KILL') {
      setLockedActionMessage(t`Targeting ${targetName} for a kill`)
      playLock()
      return
    }

    setLockedActionMessage(t`Inspecting ${targetName}`)
    playLock()
  }

  const submitPrayer = (targetId: string) => {
    const sent = sendMessage('SUBMIT_PRAYER', { target_id: targetId })
    if (!sent) {
      toast.error(t`Connection is not ready. Please try again.`)
      return
    }
    toast.success(t`Prayer sent for ${findAlivePlayerName(targetId)}.`)
    setLockedActionMessage(t`Praying for ${findAlivePlayerName(targetId)}`)
    playLock()
  }

  const submitVoteDay = (targetId: string) => {
    const sent = sendMessage('VOTE_DAY', { target_id: targetId })
    if (!sent) {
      toast.error(t`Connection is not ready. Please try again.`)
      return
    }

    toast.success(t`Vote recorded.`)
    setLockedActionMessage(t`Council vote: ${findAlivePlayerName(targetId)}`)
    playLock()
  }

  const sendWendigoIntent = (targetId: string) => {
    const sent = sendMessage('WENDIGO_INTENT', { target_id: targetId })
    if (!sent) {
      toast.error(t`Connection is not ready. Please try again.`)
      return false
    }
    return true
  }

  const submitCouncilAccuse = (targetId: string) => {
    const sent = sendMessage('ACCUSE', { target_id: targetId })
    if (!sent) {
      toast.error(t`Connection is not ready. Please try again.`)
      return
    }

    toast.success(t`Accusation sent.`)
    setLockedActionMessage(t`You accuse ${findTargetName(targetId)}`)
    playLock()
  }

  const submitStartPleading = () => {
    const sent = sendMessage('START_PLEADING', {})
    if (!sent) {
      toast.error(t`Connection is not ready. Please try again.`)
      return
    }
    toast.success(t`Timer started.`)
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
    if (panelHidden) {
      setNarrativeText('')
      return
    }
    if (lockedActionMessage) {
      setNarrativeText(t`Your action is recorded. Wait until the phase ends.`)
      return
    }

    let msg = ''
    if (phase === 'NIGHT') {
      msg =
        role === 'WENDIGO'
          ? t`The pack coordinates. Tap a target for your intent, then confirm the kill.`
          : t`Night falls. Tap a villager to send your immunity prayer.`
    } else if (phase === 'CHAIR_SELECTION') {
      msg = t`Choose your seat by the fire. When everyone is seated, day breaks.`
    } else if (phase === 'DAY') {
      msg = t`Social phase: discuss and watch the hourglass before the chair rush.`
    } else if (phase === 'COUNCIL_START') {
      msg = t`The village council opens. Who do you suspect?`
    } else if (phase === 'COUNCIL_VOTE') {
      msg = isExcludedFromCouncil
        ? t`You are excluded from council: no vote or speech.`
        : t`The council deliberates. Choose who to eliminate.`
    } else if (phase === 'COUNCIL_SUMMARY') {
      msg =
        councilSummaryCount === 0
          ? t`No accusations today. The village moves to open voting.`
          : t`Accusation tally: the village listens.`
    } else if (phase === 'STAKE') {
      msg =
        stakeVictimId !== ''
          ? t`The stake awaits ${stakeVictimName}.`
          : t`No one burns tonight. Night is falling…`
    } else if (phase === 'MORNING') {
      msg =
        morningVictimId !== ''
          ? t`Dawn reveals tragedy around ${morningVictimName}…`
          : morningSaved
            ? t`Prayers held back the night. The village breathes.`
            : t`An eerily calm night. No one perished.`
    } else if (phase === 'NO_COUNCIL') {
      msg = t`The council stands empty… The village slides toward night.`
    } else if (phase === 'ACCUSATION') {
      msg = isExcludedFromCouncil
        ? t`Excluded from council for missing your seat.`
        : t`One voice, one target. Choose who to accuse at the fire.`
    } else if (phase === 'PLEADINGS') {
      msg = t`Pleadings — now speaking: ${speakerName}.`
    }
    setNarrativeText(msg)
    return () => {
      setNarrativeText('')
    }
  }, [
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

  const surrenderVotes = lobby.surrenderVotes ?? {}
  const hasSurrenderVoted = Object.prototype.hasOwnProperty.call(surrenderVotes, currentPlayer.id)
  const showSurrenderUI = lobby.surrenderVoteActive === true && currentPlayer.isAlive && !hasSurrenderVoted

  const submitSurrenderVote = (voteYes: boolean) => {
    const sent = sendMessage('SUBMIT_SURRENDER_VOTE', { vote_yes: voteYes })
    if (!sent) {
      toast.error(t`Connection unavailable. Please try again.`)
      return
    }
    toast.success(t`Surrender vote recorded.`)
  }

  const narrativeDisplay = safeTrim(safeTrim(narrativeText) || safeTrim(phaseHint))

  const withTablet = (body: ReactNode) => (
    <div className={tabletShellInGameClass}>
      <div className={tabletInnerInGameClass}>
        <NarrativeBox embedded text={narrativeDisplay} />
        {showSurrenderUI ? (
          <div className="mb-3 rounded-xl border border-rose-900/50 bg-[linear-gradient(165deg,rgba(60,20,28,0.55)_0%,rgba(18,10,10,0.92)_100%)] px-3 py-3 text-rose-50 shadow-inner">
            <p className="mb-2 text-center text-xs font-semibold text-rose-100/95">
              <Trans>Surrender vote proposed</Trans>
            </p>
            <p className="mb-3 text-center text-[11px] text-rose-100/80">
              <Trans>End the game?</Trans>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <VoxelButton type="button" variant="danger" className="h-10 text-xs" onClick={() => submitSurrenderVote(true)}>
                <Trans>Yes</Trans>
              </VoxelButton>
              <VoxelButton type="button" variant="muted" className="h-10 text-xs" onClick={() => submitSurrenderVote(false)}>
                <Trans>No</Trans>
              </VoxelButton>
            </div>
          </div>
        ) : null}
        {body}
      </div>
    </div>
  )

  if (panelHidden) {
    return null
  }

  if (lockedActionMessage) {
    return withTablet(
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-xl border border-amber-500/45 bg-[#14100c]/80 px-4 py-3 text-[#f5ecd8] shadow-inner">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-amber-300" aria-hidden />
          <span>
            <Trans>Action locked: {lockedActionMessage}</Trans>
          </span>
        </div>
        <p className="mt-2 text-xs text-amber-200/75">
          <Trans>Waiting for phase to end…</Trans>
        </p>
      </div>
    )
  }

  if (phase === 'NIGHT') {
    if (role === 'WENDIGO') {
      const intentions = lobby.wendigoIntents ?? lobby.wendigoIntentions ?? {}
      return withTablet(
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
                <Trans>Intentions</Trans>
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
            tabletMechanism
            className={pausedControlClass}
            disabled={isPaused || selectedTarget.length === 0}
            onClick={() => submitNightAction('KILL', selectedTarget)}
          >
            <Trans>Confirm kill</Trans>
          </VoxelButton>
          <div className="rounded-lg border border-amber-900/35 bg-black/35 px-2 py-2">
            {canPrayAtNight ? (
              <>
                <p className="mb-2 text-center text-[10px] text-amber-200/80">
                  <Trans>Camouflage: prayer</Trans>
                </p>
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
                  tabletMechanism
                  className={`mt-2 ${pausedControlClass}`}
                  disabled={isPaused || prayerTarget.length === 0}
                  onClick={() => submitPrayer(prayerTarget)}
                >
                  <Trans>Pray for this player</Trans>
                </VoxelButton>
              </>
            ) : null}
            {hasPrayerTallies ? (
              <div className="mt-3 rounded-md border border-amber-900/30 bg-black/40 p-2">
                <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-amber-200/75">
                  <Trans>Echo of prayers</Trans>
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

    return withTablet(
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
          tabletMechanism
          className={pausedControlClass}
          disabled={isPaused || prayerTarget.length === 0}
          onClick={() => submitPrayer(prayerTarget)}
        >
          <Trans>Pray for this player</Trans>
        </VoxelButton>
        {hasPrayerTallies ? (
          <div className="rounded-md border border-amber-900/35 bg-black/40 p-2">
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-amber-200/75">
              <Trans>Echo of prayers</Trans>
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
    return withTablet(
      <div className="space-y-3">
        <ChairPicker lobby={lobby} currentPlayer={currentPlayer} sendMessage={sendMessage} disabled={isPaused} />
        {hasSeat ? (
          <p className="text-center text-xs font-semibold text-emerald-300/95">
            <Trans>You are seated — waiting for others.</Trans>
          </p>
        ) : null}
      </div>
    )
  }

  if (phase === 'DAY') {
    return withTablet(
      <div className="rounded-lg border border-amber-900/30 bg-black/30 px-3 py-4 text-center text-sm text-[#f5ecd8]/90">
        <Trans>Open discussion — get ready for what comes next.</Trans>
      </div>
    )
  }

  if (phase === 'COUNCIL_START') {
    return withTablet(
      <div className="rounded-lg border border-amber-500/35 bg-black/35 px-3 py-5 text-center text-sm font-serif font-medium leading-relaxed text-[#f5ecd8]">
        <Trans>The council fire burns. Eyes meet…</Trans>
      </div>
    )
  }

  if (phase === 'COUNCIL_VOTE') {
    if (isExcludedFromCouncil) {
      return withTablet(
        <div className="rounded-lg border border-rose-800/50 bg-rose-950/25 px-3 py-4 text-center text-sm font-semibold text-rose-100">
          <Trans>Penalty: excluded from council — no vote or speech.</Trans>
        </div>
      )
    }

    return withTablet(
      <div className="space-y-3">
        <PlayerAvatarGrid
          players={aliveForCouncilVote}
          selectedId={selectedTarget}
          allowClear
          clearLabel="?"
          rowTokens
          disabled={isPaused}
          onSelect={(id) => setSelectedTarget(id)}
        />
        <VoxelButton
          type="button"
          variant="danger"
          tabletMechanism
          className={pausedControlClass}
          disabled={isPaused || disableTargetAction}
          onClick={() => submitVoteDay(selectedTarget)}
        >
          <Trans>Vote in council</Trans>
        </VoxelButton>
      </div>
    )
  }

  if (phase === 'COUNCIL_SUMMARY') {
    const accusations = Object.entries(councilAccusations)
    if (accusations.length === 0) {
      return withTablet(
        <div className="rounded-lg border border-amber-500/35 bg-black/35 px-3 py-5 text-center text-sm font-serif text-[#f5ecd8]">
          <Trans>Silence in the village…</Trans>
        </div>
      )
    }

    return withTablet(
      <div className="rounded-lg border border-amber-900/35 bg-black/35 px-2 py-3">
        <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/85">
          <Trans>Accusations</Trans>
        </p>
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
    return withTablet(
      <div className="space-y-3 rounded-lg border border-orange-900/40 bg-black/35 px-2 py-3 text-center">
        <p className="font-serif text-lg font-bold tracking-wide text-orange-200">
          <Trans>The stake</Trans>
        </p>
        {victimID !== '' ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <MiniAvatar name={victimName} className="h-12 w-12 text-base" />
            <p className="text-sm font-semibold text-orange-200/95">
              <Trans>
                The village condemns <span className="text-orange-50">{victimName}</span>.
              </Trans>
            </p>
          </div>
        ) : (
          <p className="py-2 text-sm font-semibold text-orange-200/90">
            <Trans>No one goes to the stake tonight.</Trans>
          </p>
        )}

        <div className="rounded-md border border-amber-900/30 bg-black/30 p-2 text-left">
          <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-amber-200/75">
            <Trans>Votes</Trans>
          </p>
          {voteEntries.length === 0 ? (
            <p className="text-center text-xs text-[#f5ecd8]/75">
              <Trans>No votes recorded.</Trans>
            </p>
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

        <p className="text-[10px] text-orange-200/65">
          <Trans>Waiting for night.</Trans>
        </p>
      </div>
    )
  }

  if (phase === 'MORNING') {
    const victimID = lobby.lastNightVictimId ?? ''
    const saved = lobby.lastNightSavedByPrayer === true
    const victimName = victimID !== '' ? findPlayerName(victimID) : ''

    return withTablet(
      <div className="space-y-2 rounded-lg border border-amber-900/35 bg-black/35 px-2 py-4 text-center">
        <p className="font-serif text-lg font-bold text-[#f5ecd8]">
          <Trans>Morning</Trans>
        </p>
        {victimID !== '' ? (
          <div className="flex flex-col items-center gap-2">
            <MiniAvatar name={victimName} className="h-12 w-12 text-base" />
            <p className="text-sm font-semibold text-rose-200/95">
              <Trans>
                The village learns the fate of <span className="text-rose-50">{victimName}</span>.
              </Trans>
            </p>
          </div>
        ) : saved ? (
          <p className="text-sm font-semibold text-cyan-200/95">
            <Trans>Prayers held through the night.</Trans>
          </p>
        ) : (
          <p className="text-sm font-semibold text-[#f5ecd8]/90">
            <Trans>A night without a victim.</Trans>
          </p>
        )}
        <p className="text-[10px] text-amber-200/60">
          <Trans>Day breaks…</Trans>
        </p>
      </div>
    )
  }

  if (phase === 'NO_COUNCIL') {
    return withTablet(
      <div className="rounded-lg border border-violet-800/40 bg-black/35 px-3 py-5 text-center">
        <p className="font-serif text-lg font-bold text-violet-100">
          <Trans>Council cancelled</Trans>
        </p>
        <p className="mt-2 text-sm font-medium text-violet-200/90">
          <Trans>Empty seats already whisper of night…</Trans>
        </p>
      </div>
    )
  }

  if (phase === 'ACCUSATION') {
    const accuserName = (id: string) => lobby.players.find((p) => p.id === id)?.name ?? id.slice(0, 8)

    if (isExcludedFromCouncil) {
      return withTablet(
        <div className="space-y-2 text-center">
          <p className="text-sm font-bold text-rose-400">
            <Trans>Excluded from council (missed your seat).</Trans>
          </p>
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

    return withTablet(
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
          tabletMechanism
          className={pausedControlClass}
          disabled={isPaused || disableTargetAction || hasAlreadyAccused || accusedTargets.has(selectedTarget)}
          onClick={() => submitCouncilAccuse(selectedTarget)}
        >
          <Trans>Accuse in council</Trans>
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

    return withTablet(
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
            {isCurrentSpeaker ? (
              <Trans>You will speak soon ({lobby.phaseSettings.pleadingSpeechSeconds}s once started).</Trans>
            ) : (
              <Trans>Listening to {speakerNameP}.</Trans>
            )}
          </p>
        ) : (
          <p className="text-center text-xs font-mono font-bold text-amber-200/90">
            <Trans>Time: {lobby.timeRemaining}s</Trans>
          </p>
        )}
        {isCurrentSpeaker && !lobby.pleadingTimerStarted ? (
          <VoxelButton
            type="button"
            tabletMechanism
            className={pausedControlClass}
            disabled={isPaused}
            onClick={submitStartPleading}
          >
            <Trans>Take the floor</Trans>
          </VoxelButton>
        ) : null}
      </div>
    )
  }

  return null
}

export default function ActionPanel(props: ActionPanelProps) {
  return (
    <ActionPanelInGame
      lobby={props.lobby}
      currentPlayer={props.currentPlayer}
      sendMessage={props.sendMessage}
      phaseHint={props.phaseHint}
    />
  )
}
