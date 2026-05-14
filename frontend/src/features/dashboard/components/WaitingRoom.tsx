import {
  type LobbyState,
  type Player,
  defaultPhaseSettings,
  phasePresetFromId,
  phaseSettingsToServerPayload,
  type PhasePresetId,
  type PhaseSettings,
} from '@/api/game'
import NarrativeBox from '@/features/dashboard/components/NarrativeBox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import VoxelButton from '@/features/dashboard/components/game/VoxelButton'
import { playerInitial } from '@/features/dashboard/components/game/PlayerAvatarGrid'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'
import { useGameStore } from '@/store/useGameStore'
import { Check, Flame, Hourglass, LogOut, Sparkles } from 'lucide-react'
import { type ChangeEvent, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

interface WaitingRoomProps {
  sendMessage: (type: string, payload: unknown) => boolean
  disconnect: () => void
  onLeave: () => void
}

const plateauStone =
  'relative w-full overflow-visible rounded-3xl border-t-4 border-b-8 border-x-2 border-[#2d261f] bg-[#1a1612] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)]'

const modeLabel = (mode: string | undefined): string => {
  const m = (mode ?? 'local').toLowerCase()
  return m === 'online' ? 'En ligne' : 'Présentiel'
}

const phaseFieldRowsLobby: { key: keyof PhaseSettings; label: string }[] = [
  { key: 'chairSelectionSeconds', label: 'Sélection des chaises (s)' },
  { key: 'daySocialSeconds', label: 'Jour social / discussion (s)' },
  { key: 'morningSeconds', label: 'Matin (s)' },
  { key: 'noCouncilSeconds', label: 'Conseil annulé (s)' },
  { key: 'councilStartSeconds', label: 'Début du conseil (s)' },
  { key: 'councilAccusationPostChairSeconds', label: 'Accusation après rappel chaises (s)' },
  { key: 'councilAccusationAfterDaySeconds', label: 'Accusation fin de journée (s)' },
  { key: 'councilSummarySeconds', label: 'Résumé du conseil (s)' },
  { key: 'pleadingSpeechSeconds', label: 'Temps de parole plaidoirie (s)' },
  { key: 'councilVoteSeconds', label: 'Vote du conseil (s)' },
  { key: 'stakeSeconds', label: 'Le Bûcher (s)' },
  { key: 'nightSeconds', label: 'Phase de nuit (s)' },
  { key: 'postNightDaySeconds', label: 'Segment jour après la nuit (s)' },
]

const lobbySettingsTabBodyClass =
  'mx-auto mt-6 w-full max-w-2xl max-h-[50vh] overflow-y-auto overscroll-contain pr-4 [scrollbar-width:thin] [scrollbar-color:#2a231c_#0c0a08] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-md [&::-webkit-scrollbar-track]:bg-[#0c0a08] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#241e18] [&::-webkit-scrollbar-thumb]:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.45)] hover:[&::-webkit-scrollbar-thumb]:bg-[#322a22]'

const lobbySettingsSummaryClass =
  'cursor-pointer rounded-lg border border-[#2d261f] bg-[#241e18] px-4 py-2 text-sm font-bold uppercase tracking-widest text-amber-500/80 shadow-md transition-all hover:text-amber-400'

const ReadySeal = ({ ready }: { ready: boolean }) => (
  <div
    className={cn(
      'flex shrink-0 items-center justify-center rounded-full p-3.5 sm:p-4',
      ready
        ? 'bg-green-950/35 text-emerald-300 shadow-[0_0_22px_rgba(34,197,94,0.4)] ring-4 ring-inset ring-green-500/60'
        : 'bg-red-950/20 text-red-300/75 ring-4 ring-inset ring-red-500/40'
    )}
    title={ready ? 'Prêt' : 'Pas prêt'}
  >
    {ready ? (
      <Check className="h-7 w-7 stroke-[3] sm:h-8 sm:w-8" strokeLinecap="round" aria-hidden />
    ) : (
      <Hourglass className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden />
    )}
  </div>
)

function LobbyRhythmHostSettingsBody({
  lobby,
  sendMessage,
}: {
  lobby: LobbyState
  sendMessage: (type: string, payload: unknown) => boolean
}) {
  const [draft, setDraft] = useState<PhaseSettings>(defaultPhaseSettings)

  useEffect(() => {
    if (lobby.phase?.toUpperCase() === 'LOBBY') {
      setDraft(lobby.phaseSettings)
    }
  }, [lobby, lobby.phaseSettings, lobby.phase])

  const handleApplyPhaseSettings = () => {
    const sent = sendMessage('UPDATE_PHASE_SETTINGS', phaseSettingsToServerPayload(draft))
    if (!sent) {
      toast.error('Connexion indisponible. Réessayez.')
      return
    }
    toast.success('Durées envoyées au serveur.')
  }

  const onDraftNumberChange = (key: keyof PhaseSettings) => (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(event.target.value, 10)
    setDraft((prev) => ({ ...prev, [key]: Number.isFinite(parsed) ? parsed : 0 }))
  }

  const applyPreset = (id: PhasePresetId) => {
    setDraft(phasePresetFromId(id))
  }

  return (
    <div className={lobbySettingsTabBodyClass}>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700/95">Rythme de partie</p>
      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
          <VoxelButton type="button" variant="danger" className="flex-1 text-[10px] sm:text-xs" onClick={() => applyPreset('blitz')}>
            Blitz
          </VoxelButton>
          <VoxelButton type="button" className="flex-1 text-[10px] sm:text-xs" onClick={() => applyPreset('normal')}>
            Normal
          </VoxelButton>
          <VoxelButton type="button" variant="muted" className="flex-1 text-[10px] sm:text-xs" onClick={() => applyPreset('long')}>
            Longue
          </VoxelButton>
        </div>
        <p className="text-[10px] leading-relaxed text-[#8a7a66]/95">
          Les préréglages remplissent le brouillon ; appuyez sur « Graver les durées » pour les envoyer au serveur.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {phaseFieldRowsLobby.map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <Label htmlFor={`lobby-phase-${key}`} className="text-[11px] font-semibold uppercase tracking-wide text-amber-700/90">
                {label}
              </Label>
              <Input
                id={`lobby-phase-${key}`}
                type="number"
                min={1}
                className="border-[#2d261f] bg-[#0c0a08] text-[#f5ecd8] focus-visible:ring-amber-600/40"
                value={draft[key]}
                onChange={onDraftNumberChange(key)}
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <VoxelButton type="button" variant="muted" className="w-full text-xs" onClick={handleApplyPhaseSettings}>
              Graver les durées
            </VoxelButton>
          </div>
        </div>
      </div>
    </div>
  )
}

function LobbyRhythmGuestSettingsBody({ lobby }: { lobby: LobbyState }) {
  return (
    <div className={lobbySettingsTabBodyClass}>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700/95">Durées gravées par l’hôte</p>
      <div className="grid gap-1.5 text-[11px] sm:grid-cols-2">
        {phaseFieldRowsLobby.map(({ key, label }) => (
          <div key={key} className="flex justify-between gap-2 border-b border-[#2a241c] py-1 text-[#c9b8a0]">
            <span className="min-w-0 flex-1 truncate">{label}</span>
            <span className="shrink-0 font-mono text-amber-100/90">{lobby.phaseSettings[key]}s</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function WaitingRoom({ sendMessage, disconnect: _disconnect, onLeave }: WaitingRoomProps) {
  const [activeTab, setActiveTab] = useState<'main' | 'settings'>('main')
  const user = useAuthStore((state) => state.user)
  const lobby = useGameStore((state) => state.lobby)

  const hostPlayer = useMemo(() => lobby?.players.find((player) => player.isHost) ?? null, [lobby?.players])
  const isHost = Boolean(user?.id && hostPlayer?.id === user.id)
  const isMember = Boolean(user?.id && lobby?.players.some((p) => p.id === user.id))

  const handleStartGame = () => {
    const sent = sendMessage('START_GAME', {})
    if (!sent) {
      toast.error('Connexion indisponible. Réessayez.')
      return
    }
    toast.success('Démarrage envoyé au serveur.')
  }

  const grimoireNarrative = isHost
    ? 'Vous présidez le conseil : ajustez le rythme des phases, puis enclenchez le feu lorsque les sièges sont prêts.'
    : 'Le conseil se rassemble autour du code gravé. Attendez que l’hôte allume la partie.'

  if (!lobby) return null

  return (
    <div className={cn(plateauStone, 'z-10 pb-14 pt-14 sm:pb-16 sm:pt-16')}>
      {isMember ? (
        <div className="absolute left-6 top-6 z-30">
          <button
            type="button"
            className={lobbySettingsSummaryClass}
            onClick={() => setActiveTab(activeTab === 'main' ? 'settings' : 'main')}
          >
            {isHost ? (activeTab === 'main' ? 'RÉGLAGES' : 'RETOUR') : activeTab === 'main' ? 'DURÉES' : 'RETOUR'}
          </button>
        </div>
      ) : null}

      <div className="absolute right-6 top-6 z-30">
        <VoxelButton
          type="button"
          variant="danger"
          title="Quitter le lobby"
          aria-label="Quitter le lobby"
          onClick={onLeave}
          className="!h-11 !w-11 !min-w-0 shrink-0 !rounded-lg !p-0"
        >
          <LogOut className="h-5 w-5 shrink-0 opacity-95" aria-hidden />
        </VoxelButton>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-14 flex justify-center px-16 sm:top-16 sm:px-20">
        <h1
          className="text-center font-black uppercase tracking-[0.2em] text-amber-300 drop-shadow-[0_0_18px_rgba(251,191,36,0.55)] sm:tracking-[0.28em]"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          <span className="block text-[10px] font-bold text-amber-600/90 sm:text-[11px]">Code du lobby</span>
          <span className="mt-1 block text-5xl text-amber-400 sm:text-6xl md:text-7xl">{lobby.code}</span>
        </h1>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 px-4 pt-20 sm:px-6 sm:pt-24">
        <span className="rounded-md border border-amber-800/50 bg-black/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200/85">
          {modeLabel(lobby.mode)}
        </span>
        {typeof lobby.players?.length === 'number' ? (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#c9a66b]/80">
            {lobby.players.length}
            {lobby.maxPlayers != null ? ` / ${lobby.maxPlayers}` : ''} conseillers
          </span>
        ) : null}
      </div>

      {activeTab === 'main' && (
        <>
          {isMember ? (
            <div className="mx-auto mt-4 max-w-2xl px-2">
              <NarrativeBox
                embedded
                text={grimoireNarrative}
                className="rounded-xl border border-[#3d3428]/60 bg-[#0f0c0a]/75 px-3 py-2.5 text-center shadow-inner sm:py-3"
              />
            </div>
          ) : null}

          <div className="mb-8 mt-8 flex flex-row flex-wrap justify-center gap-6 px-2 sm:gap-8">
            {lobby.players.map((player: Player) => (
              <div
                key={player.id}
                className="flex w-[6.75rem] flex-col items-center gap-3 sm:w-[7.75rem] md:w-[8.25rem]"
              >
                <div
                  className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-[3px] border-t-[#e8c98a] border-l-[#e8c98a] border-b-[#0a0604] border-r-[#0a0604] bg-gradient-to-b from-[#4a3f35] to-[#1a1510] text-3xl font-black text-amber-50 shadow-[0_10px_0_rgba(0,0,0,0.45),0_14px_28px_rgba(0,0,0,0.5)] ring-4 ring-inset ring-amber-500/45 sm:h-28 sm:w-28 sm:text-4xl active:translate-y-1 active:shadow-[0_6px_0_rgba(0,0,0,0.45)]"
                  aria-hidden
                >
                  {playerInitial(player.name)}
                </div>
                <p className="w-full truncate text-center text-sm font-bold uppercase tracking-tight text-[#e8dcc4] sm:text-base">
                  {player.name}
                </p>
                {player.isHost ? (
                  <p className="-mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-amber-500/90">Maître du feu</p>
                ) : null}
                <ReadySeal ready={player.isAlive} />
              </div>
            ))}
          </div>

          {isHost ? (
            <div className="relative z-20 -mb-6 mt-2 flex justify-center sm:-mb-8">
              <VoxelButton
                type="button"
                tabletMechanism
                className={cn(
                  'relative w-[min(100%,26rem)] max-w-[92vw] translate-y-6 rounded-2xl py-6 text-lg tracking-[0.08em] sm:translate-y-7 sm:py-7 sm:text-2xl',
                  'border-t-[#f5d78a] border-l-[#f5d78a] border-b-[#1a1208] border-r-[#1a1208]',
                  'bg-gradient-to-b from-[#7a5f30] via-[#4a3a22] to-[#1a1208] text-amber-50',
                  'shadow-[inset_0_4px_0_rgba(255,230,180,0.25),inset_0_-6px_0_rgba(0,0,0,0.55),0_12px_0_rgba(0,0,0,0.55),0_22px_48px_rgba(0,0,0,0.6)]'
                )}
                onClick={handleStartGame}
              >
                <Flame className="h-7 w-7 shrink-0 text-orange-200 sm:h-8 sm:w-8" aria-hidden />
                Lancer la partie
                <Sparkles className="h-6 w-6 shrink-0 text-amber-200/90 sm:h-7 sm:w-7" aria-hidden />
              </VoxelButton>
            </div>
          ) : null}
        </>
      )}

      {activeTab === 'settings' && isMember ? (
        isHost ? (
          <LobbyRhythmHostSettingsBody lobby={lobby} sendMessage={sendMessage} />
        ) : (
          <LobbyRhythmGuestSettingsBody lobby={lobby} />
        )
      ) : null}
    </div>
  )
}
