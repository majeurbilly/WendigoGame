import { type Player } from '@/api/game'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import GameHeader from '@/features/dashboard/components/GameHeader'
import { useAuthStore } from '@/store/useAuthStore'
import { useGameStore } from '@/store/useGameStore'
import { useMemo } from 'react'
import { toast } from 'sonner'

interface WaitingRoomProps {
  sendMessage: (type: string, payload: unknown) => boolean
  disconnect: () => void
  onLeave: () => void
}

export default function WaitingRoom({ sendMessage, onLeave }: WaitingRoomProps) {
  const user = useAuthStore((state) => state.user)
  const lobby = useGameStore((state) => state.lobby)

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
