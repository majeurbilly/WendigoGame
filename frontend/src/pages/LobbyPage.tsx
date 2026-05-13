import { useSmokeTransition } from '@/contexts/smokeTransitionContext'
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
  const isCinematicPlaying = useGameStore((state) => state.isCinematicPlaying)
  const setCinematicPlaying = useGameStore((state) => state.setCinematicPlaying)

  const previousPhaseRef = useRef<string | null>(null)
  const cinematicPhaseRef = useRef<string | null>(null)
  const cinematicTimerRef = useRef<number | null>(null)
  const cinematicEndHandledRef = useRef(false)
  const { playSmokeOverlay } = useSmokeTransition()
  const { playHeartbeat, stopHeartbeat, playNightFall, playDayBreak, playGameOver } = useGameAudio()

  const endCinematicWithMenuTransition = useCallback(() => {
    if (cinematicEndHandledRef.current) {
      return
    }
    cinematicEndHandledRef.current = true
    if (cinematicTimerRef.current !== null) {
      window.clearTimeout(cinematicTimerRef.current)
      cinematicTimerRef.current = null
    }
    playSmokeOverlay(() => {
      setCinematicPlaying(false)
    })
  }, [playSmokeOverlay, setCinematicPlaying])

  const handleInvalidLobby = useCallback(
    () => {
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
      } else if (
        nextPhase === 'DAY' ||
        nextPhase === 'MORNING' ||
        nextPhase === 'COUNCIL_START' ||
        nextPhase === 'ACCUSATION' ||
        nextPhase === 'COUNCIL_SUMMARY' ||
        nextPhase === 'STAKE'
      ) {
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

  useEffect(() => {
    return () => {
      if (cinematicTimerRef.current !== null) {
        window.clearTimeout(cinematicTimerRef.current)
        cinematicTimerRef.current = null
      }
      setCinematicPlaying(false)
    }
  }, [setCinematicPlaying])

  useEffect(() => {
    const phase = lobby?.phase ? lobby.phase.toUpperCase() : null
    const prev = cinematicPhaseRef.current

    if (
      lobby &&
      prev !== null &&
      isLobbyWaitingPhase(prev) &&
      phase &&
      !isLobbyWaitingPhase(phase) &&
      !isGameOverPhase(phase)
    ) {
      cinematicEndHandledRef.current = false
      setCinematicPlaying(true)
      if (cinematicTimerRef.current !== null) {
        window.clearTimeout(cinematicTimerRef.current)
      }
      cinematicTimerRef.current = window.setTimeout(() => {
        endCinematicWithMenuTransition()
      }, 8000)
    }

    cinematicPhaseRef.current = phase
  }, [lobby, lobby?.phase, endCinematicWithMenuTransition, setCinematicPlaying])

  const isEndedPhase = Boolean(lobby && isGameOverPhase(lobby.phase))
  const isWaitingInLobby = Boolean(lobby && isLobbyWaitingPhase(lobby.phase))
  const showLobbyWaitingLayout = isWaitingInLobby || isCinematicPlaying

  return (
    <>
      {/* Background Layer dédié au Lobby */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/assets/images/lobby-picture.png")' }}
        />
        {/* Voile sombre pour garder la lisibilité des boutons actuels */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10">
        <MainLayout transparentBg={true}>
          {!isConnected ? (
            <div className="flex h-[50vh] items-center justify-center">
              <div className="animate-pulse rounded-lg border border-slate-800 bg-slate-900/60 px-6 py-4 text-slate-200">
                Connexion au serveur...
              </div>
            </div>
          ) : isEndedPhase ? (
            <EndedScreen lobby={lobby!} sendMessage={sendMessage} />
          ) : showLobbyWaitingLayout ? (
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
      </div>

      {isCinematicPlaying ? (
        <div className="fixed inset-0 z-[100] bg-black">
          <video
            className="h-full w-full object-cover"
            src="/assets/videos/lobby_video.mp4"
            autoPlay
            muted
            playsInline
            onEnded={endCinematicWithMenuTransition}
          />
        </div>
      ) : null}
    </>
  )
}
