import MainLayout from '@/components/layouts/MainLayout'
import { type Player } from '@/api/game'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ActionPanel from '@/features/dashboard/components/ActionPanel'
import EndedScreen from '@/features/dashboard/components/EndedScreen'
import GameHeader from '@/features/dashboard/components/GameHeader'
import { useGameAudio } from '@/hooks/useGameAudio'
import { useGameWebSocket } from '@/hooks/useGameWebSocket'
import { isGameOverPhase, isLobbyWaitingPhase } from '@/lib/gamePhase'
import { useAuthStore } from '@/store/useAuthStore'
import { useGameStore } from '@/store/useGameStore'
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { useNavigate, useParams } from 'react-router-dom'

const roleStyles: Record<string, string> = {
  WENDIGO: 'border-rose-500/40 bg-rose-950/40 text-rose-200',
  VILLAGER: 'border-slate-500/40 bg-slate-900/80 text-slate-200',
  SEER: 'border-sky-500/40 bg-sky-950/40 text-sky-200',
}

const getRoleContainerClasses = (role: string | null): string => {
  if (!role) {
    return 'border-slate-700 bg-slate-900/80 text-slate-200'
  }

  return roleStyles[role.toUpperCase()] ?? 'border-violet-500/40 bg-violet-950/30 text-violet-200'
}

const GameAudioRoom = lazy(() => import('@/features/dashboard/components/GameAudioRoom'))

const LobbyPage = () => {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const lobby = useGameStore((state) => state.lobby)
  const isConnected = useGameStore((state) => state.isConnected)
  const livekitToken = useGameStore((state) => state.livekitToken)
  const previousPhaseRef = useRef<string | null>(null)
  const { playHeartbeat, stopHeartbeat, playNightFall, playDayBreak, playGameOver } = useGameAudio()

  const handleInvalidLobby = useCallback(
    (_message: string) => {
      navigate('/', { replace: true })
    },
    [navigate]
  )

  useEffect(() => {
    if (!code) {
      navigate('/', { replace: true })
    }
  }, [code, navigate])

  const { sendMessage, disconnect } = useGameWebSocket(code, { onInvalidLobby: handleInvalidLobby })

  const hostPlayer = useMemo(
    () => lobby?.players.find((player) => player.isHost) ?? null,
    [lobby?.players]
  )
  const currentPlayer = useMemo(
    () => lobby?.players.find((player) => player.id === user?.id) ?? null,
    [lobby?.players, user?.id]
  )
  const isHost = Boolean(user?.id && hostPlayer?.id === user.id)
  const isEndedPhase = Boolean(lobby && isGameOverPhase(lobby.phase))
  const isWaitingInLobby = Boolean(lobby && isLobbyWaitingPhase(lobby.phase))
  const shouldShowActionPanel = Boolean(
    lobby &&
      currentPlayer &&
      currentPlayer.isAlive &&
      !isLobbyWaitingPhase(lobby.phase) &&
      !isGameOverPhase(lobby.phase)
  )

  const showActionPanelCard = Boolean(lobby && shouldShowActionPanel && currentPlayer)

  const handleLeaveLobby = () => {
    disconnect()
    navigate('/', { replace: true })
  }

  const handleStartGame = () => {
    const sent = sendMessage('START_GAME', {})
    if (!sent) {
      toast.error('Connexion indisponible. Réessayez.')
      return
    }
    toast.success('Démarrage envoyé au serveur.')
  }

  useEffect(() => {
    const nextPhase = lobby?.phase?.toUpperCase()

    if (!nextPhase) {
      return () => {
        stopHeartbeat()
      }
    }

    const previousPhase = previousPhaseRef.current
    if (previousPhase !== nextPhase) {
      if (nextPhase === 'NIGHT') {
        playNightFall()
        playHeartbeat()
      } else if (nextPhase === 'DAY' || nextPhase === 'ACCUSATION') {
        stopHeartbeat()
        playDayBreak()
      } else if (nextPhase === 'ENDED' || nextPhase === 'GAME_OVER') {
        stopHeartbeat()
        playGameOver()
      }
      previousPhaseRef.current = nextPhase
    }

    return () => {
      stopHeartbeat()
    }
  }, [lobby?.phase, playDayBreak, playGameOver, playHeartbeat, playNightFall, stopHeartbeat])

  const renderPlayerCard = (player: Player) => (
    <Card
      key={player.id}
      className="border-slate-800 bg-slate-900/70 text-slate-100 shadow-md shadow-black/20"
    >
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

  return (
    <MainLayout>
      {!isConnected ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-6 py-4 text-slate-200">
            Connecting to server...
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {isEndedPhase && lobby ? <EndedScreen lobby={lobby} /> : null}

          {!isEndedPhase && lobby ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <GameHeader lobby={lobby} />
              </div>
              <Button
                type="button"
                variant="outline"
                className="shrink-0 border-rose-500/55 bg-slate-950/40 text-rose-100 hover:bg-rose-950/50 hover:text-rose-50"
                onClick={handleLeaveLobby}
              >
                Quitter le lobby
              </Button>
            </div>
          ) : null}

          {!isEndedPhase && lobby && isWaitingInLobby && isHost ? (
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

          {!isEndedPhase && lobby && currentPlayer ? (
            <div className={`rounded-xl border p-4 ${getRoleContainerClasses(currentPlayer.role)}`}>
              <p className="text-xs uppercase tracking-[0.18em] opacity-80">Secret Role</p>
              <p className="mt-1 text-2xl font-bold tracking-wide">
                Your Role: {(currentPlayer.role ?? 'UNKNOWN').toUpperCase()}
              </p>
            </div>
          ) : null}

          {!isEndedPhase && showActionPanelCard && lobby && currentPlayer ? (
            <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
              <CardHeader>
                <CardTitle>Action Panel</CardTitle>
              </CardHeader>
              <CardContent>
                <ActionPanel lobby={lobby} currentPlayer={currentPlayer} sendMessage={sendMessage} />
              </CardContent>
            </Card>
          ) : null}

          {!isEndedPhase ? (
            <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
              <CardHeader>
                <CardTitle>Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {lobby?.players.map(renderPlayerCard)}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
      {livekitToken && !isEndedPhase ? (
        <Suspense
          fallback={
            <div className="fixed right-4 bottom-4 z-50 flex items-center justify-center rounded-md border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400 animate-pulse">
              Initializing secure audio channel...
            </div>
          }
        >
          <GameAudioRoom token={livekitToken} />
        </Suspense>
      ) : null}
    </MainLayout>
  )
}

export default LobbyPage
