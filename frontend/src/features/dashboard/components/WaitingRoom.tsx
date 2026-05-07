import {
  defaultPhaseSettings,
  phasePresetFromId,
  phaseSettingsToServerPayload,
  type PhasePresetId,
  type PhaseSettings,
  type Player,
} from '@/api/game'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import GameHeader from '@/features/dashboard/components/GameHeader'
import { useAuthStore } from '@/store/useAuthStore'
import { useGameStore } from '@/store/useGameStore'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { type ChangeEvent, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

interface WaitingRoomProps {
  sendMessage: (type: string, payload: unknown) => boolean
  disconnect: () => void
  onLeave: () => void
}

const phaseFieldRows: { key: keyof PhaseSettings; label: string }[] = [
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

export default function WaitingRoom({ sendMessage, onLeave }: WaitingRoomProps) {
  const user = useAuthStore((state) => state.user)
  const lobby = useGameStore((state) => state.lobby)
  const [draft, setDraft] = useState<PhaseSettings>(defaultPhaseSettings)
  const [isRhythmOpen, setIsRhythmOpen] = useState(false)
  const [isGuestRhythmOpen, setIsGuestRhythmOpen] = useState(false)

  useEffect(() => {
    if (!lobby) return
    if (lobby.phase?.toUpperCase() === 'LOBBY') {
      setDraft(lobby.phaseSettings)
    }
  }, [lobby, lobby?.phaseSettings, lobby?.phase])

  const hostPlayer = useMemo(
    () => lobby?.players.find((player) => player.isHost) ?? null,
    [lobby?.players]
  )
  const isHost = Boolean(user?.id && hostPlayer?.id === user.id)

  const handleStartGame = () => {
    const sent = sendMessage('START_GAME', {})
    if (!sent) {
      toast.error('Connexion indisponible. Réessayez.')
      return
    }
    toast.success('Démarrage envoyé au serveur.')
  }

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

  const renderPlayerCard = (player: Player) => (
    <Card key={player.id} className="border-slate-800 bg-slate-900/70 text-slate-100 shadow-md shadow-black/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span>{player.name}</span>
          {player.isHost ? (
            <span className="rounded-md border border-amber-400/30 bg-amber-500/15 px-2 py-0.5 text-xs text-amber-200">
              Host
            </span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-sm ${player.isAlive ? 'text-emerald-300' : 'text-rose-300'}`}>
          {player.isAlive ? 'Alive' : 'Dead'}
        </p>
      </CardContent>
    </Card>
  )

  if (!lobby) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <GameHeader lobby={lobby} />
        </div>
        <Button
          type="button"
          variant="outline"
          className="shrink-0 border-rose-500/55 bg-slate-950/40 text-rose-100 hover:bg-rose-950/50 hover:text-rose-50"
          onClick={onLeave}
        >
          Quitter le lobby
        </Button>
      </div>

      {isHost ? (
        <Card className="border-amber-500/25 bg-slate-900/70 text-slate-100 shadow-md shadow-amber-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Actions hôte</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              size="lg"
              className="h-14 w-full text-base font-semibold tracking-wide"
              onClick={handleStartGame}
            >
              Start Game
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {isHost ? (
        <Card className="overflow-hidden border-slate-700 bg-slate-900/70 text-slate-100">
          <button
            type="button"
            aria-expanded={isRhythmOpen}
            className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-slate-800/60"
            onClick={() => setIsRhythmOpen((open) => !open)}
          >
            <div className="min-w-0 space-y-1">
              <CardTitle className="text-lg">Rythme de partie</CardTitle>
              <p className="text-sm text-slate-400">
                Ouvrez pour préréglages (Blitz / Normal / Long) et durées personnalisées.
              </p>
            </div>
            <span className="shrink-0 text-slate-400" aria-hidden>
              {isRhythmOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </span>
          </button>
          {isRhythmOpen ? (
            <CardContent className="space-y-6 border-t border-slate-700 bg-slate-950/40 px-4 pb-4 pt-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-rose-500/35 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
                  onClick={() => applyPreset('blitz')}
                >
                  Blitz
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-sky-500/35 bg-sky-500/10 text-sky-100 hover:bg-sky-500/20"
                  onClick={() => applyPreset('normal')}
                >
                  Normal
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-emerald-500/35 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20"
                  onClick={() => applyPreset('long')}
                >
                  Partie longue
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Les préréglages remplissent le brouillon ; cliquez ensuite sur « Appliquer les durées » pour les envoyer au
                serveur.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {phaseFieldRows.map(({ key, label }) => (
                  <div key={key} className="space-y-1.5">
                    <Label htmlFor={`phase-${key}`} className="text-slate-300">
                      {label}
                    </Label>
                    <Input
                      id={`phase-${key}`}
                      type="number"
                      min={1}
                      className="border-slate-700 bg-slate-950 text-slate-100"
                      value={draft[key]}
                      onChange={onDraftNumberChange(key)}
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
                    onClick={handleApplyPhaseSettings}
                  >
                    Appliquer les durées
                  </Button>
                </div>
              </div>
            </CardContent>
          ) : null}
        </Card>
      ) : (
        <Card className="overflow-hidden border-slate-800 bg-slate-900/50 text-slate-300">
          <button
            type="button"
            aria-expanded={isGuestRhythmOpen}
            className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-slate-800/40"
            onClick={() => setIsGuestRhythmOpen((open) => !open)}
          >
            <CardTitle className="text-base text-slate-200">Durées prévues par l&apos;hôte</CardTitle>
            <span className="shrink-0 text-slate-500" aria-hidden>
              {isGuestRhythmOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </span>
          </button>
          {isGuestRhythmOpen ? (
            <CardContent className="border-t border-slate-800/80 px-4 pb-4 pt-3">
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                {phaseFieldRows.map(({ key, label }) => (
                  <div key={key} className="flex justify-between gap-2 border-b border-slate-800/80 py-1">
                    <span className="text-slate-400">{label}</span>
                    <span className="font-mono text-slate-100">{lobby.phaseSettings[key]}s</span>
                  </div>
                ))}
              </div>
            </CardContent>
          ) : null}
        </Card>
      )}

      <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
        <CardHeader>
          <CardTitle>Players ({lobby.players.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lobby.players.map(renderPlayerCard)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
