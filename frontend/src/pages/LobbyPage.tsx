import MainLayout from '@/components/layouts/MainLayout'
import EndedScreen from '@/features/dashboard/components/EndedScreen'
import LocalDashboard from '@/features/dashboard/components/LocalDashboard'
import WaitingRoom from '@/features/dashboard/components/WaitingRoom'
import { useGameAudio } from '@/hooks/useGameAudio'
import { useGameWebSocket } from '@/hooks/useGameWebSocket'
import { isGameOverPhase, isLobbyWaitingPhase } from '@/lib/gamePhase'
import { useGameStore } from '@/store/useGameStore'
import { Suspense, lazy, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const GameAudioRoom = lazy(() => import('@/features/dashboard/components/GameAudioRoom'))

export default function LobbyPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()

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

  const handleLeaveLobby = () => {
    disconnect()
    navigate('/', { replace: true })
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

  const isEndedPhase = Boolean(lobby && isGameOverPhase(lobby.phase))
  const isWaitingInLobby = Boolean(lobby && isLobbyWaitingPhase(lobby.phase))

  return (
    <MainLayout>
      {!isConnected ? (
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-pulse rounded-lg border border-slate-800 bg-slate-900/60 px-6 py-4 text-slate-200">
            Connexion au serveur...
          </div>
        </div>
      ) : isEndedPhase ? (
        <EndedScreen lobby={lobby!} />
      ) : isWaitingInLobby ? (
        <WaitingRoom sendMessage={sendMessage} disconnect={disconnect} onLeave={handleLeaveLobby} />
      ) : (
        <LocalDashboard sendMessage={sendMessage} />
      )}
      {livekitToken && !isEndedPhase ? (
        <Suspense
          fallback={
            <div className="fixed right-4 bottom-4 z-50 flex animate-pulse items-center justify-center rounded-md border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400">
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
