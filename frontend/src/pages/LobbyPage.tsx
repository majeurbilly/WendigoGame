import { useSmokeTransition } from '@/contexts/smokeTransitionContext'
import MainLayout, { type GameOverlayHostMenuProps } from '@/components/layouts/MainLayout'
import EndedScreen from '@/features/dashboard/components/EndedScreen'
import LocalDashboard from '@/features/dashboard/components/LocalDashboard'
import WaitingRoom from '@/features/dashboard/components/WaitingRoom'
import { useGameAudio } from '@/hooks/useGameAudio'
import { useGameWebSocket } from '@/hooks/useGameWebSocket'
import { isGameOverPhase, isLobbyWaitingPhase } from '@/lib/gamePhase'
import { resolveLobbyBackgroundImagePath } from '@/lib/lobbyPhaseBackground'
import { useAuthStore } from '@/store/useAuthStore'
import { useGameStore } from '@/store/useGameStore'
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

const GameAudioRoom = lazy(() => import('@/features/dashboard/components/GameAudioRoom'))

export default function LobbyPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const lobby = useGameStore((state) => state.lobby)
  const isConnected = useGameStore((state) => state.isConnected)
  const livekitToken = useGameStore((state) => state.livekitToken)
  const isCinematicPlaying = useGameStore((state) => state.isCinematicPlaying)
  const setCinematicPlaying = useGameStore((state) => state.setCinematicPlaying)

  const previousPhaseRef = useRef<string | null>(null)
  const cinematicPhaseRef = useRef<string | null>(null)
  const cinematicTimerRef = useRef<number | null>(null)
  const cinematicEndHandledRef = useRef(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { playSmokeOverlay } = useSmokeTransition()

  useEffect(() => {
    audioRef.current = new Audio('/assets/musiques/Feu.mp3')
    if (audioRef.current) {
      audioRef.current.volume = 0.5
    }
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      audioRef.current?.pause()
      videoRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  const targetBackgroundPath = useMemo(() => resolveLobbyBackgroundImagePath(lobby), [lobby])
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(targetBackgroundPath)
  const previousTargetBackgroundRef = useRef<string | null>(null)

  useEffect(() => {
    const prev = previousTargetBackgroundRef.current
    if (prev === null) {
      previousTargetBackgroundRef.current = targetBackgroundPath
      setBackgroundImageUrl(targetBackgroundPath)
      return
    }
    if (prev === targetBackgroundPath) {
      return
    }
    previousTargetBackgroundRef.current = targetBackgroundPath
    playSmokeOverlay(() => {
      setBackgroundImageUrl(targetBackgroundPath)
    })
  }, [targetBackgroundPath, playSmokeOverlay])
  const { playHeartbeat, stopHeartbeat, playNightFall, playDayBreak, playGameOver } = useGameAudio()

  const endCinematicWithMenuTransition = useCallback(() => {
    if (cinematicEndHandledRef.current) {
      return
    }
    cinematicEndHandledRef.current = true
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (cinematicTimerRef.current !== null) {
      window.clearTimeout(cinematicTimerRef.current)
      cinematicTimerRef.current = null
    }
    audioRef.current?.pause()
    videoRef.current?.pause()
    playSmokeOverlay(() => {
      setCinematicPlaying(false)
    })
  }, [playSmokeOverlay, setCinematicPlaying])

  /** Audio 10 s démarre tout de suite ; vidéo 8 s après 2 s — fin alignée (J-cut). */
  const startMedia = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    const audio = audioRef.current
    const video = videoRef.current
    if (audio) {
      audio.currentTime = 0
    }
    if (video) {
      video.currentTime = 0
    }
    void audio?.play().catch(() => {})
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null
      void videoRef.current?.play().catch(() => {})
    }, 2000)
  }, [])

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
      /** 2 s de pré-roll audio + 8 s de vidéo = 10 s (piste Feu alignée sur la fin). */
      cinematicTimerRef.current = window.setTimeout(() => {
        endCinematicWithMenuTransition()
      }, 10_000)
    }

    cinematicPhaseRef.current = phase
  }, [lobby, lobby?.phase, endCinematicWithMenuTransition, setCinematicPlaying])

  useEffect(() => {
    if (!isCinematicPlaying) {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      audioRef.current?.pause()
      videoRef.current?.pause()
      return
    }

    startMedia()

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      audioRef.current?.pause()
      videoRef.current?.pause()
    }
  }, [isCinematicPlaying, startMedia])

  const isEndedPhase = Boolean(lobby && isGameOverPhase(lobby.phase))
  const isWaitingInLobby = Boolean(lobby && isLobbyWaitingPhase(lobby.phase))
  const showLobbyWaitingLayout = isWaitingInLobby || isCinematicPlaying
  /** Même chrome minimal qu’en partie (pas d’en-tête « dashboard ») — y compris écran de fin. */
  const gameOverlayLayout = isConnected && !showLobbyWaitingLayout

  const gameOverlayHostMenu = useMemo((): GameOverlayHostMenuProps | undefined => {
    if (!gameOverlayLayout || !lobby || !user) return undefined
    const cp = lobby.players.find((p) => p.id === user.id)
    if (!cp?.isHost) return undefined
    if (isGameOverPhase(lobby.phase)) return undefined
    return {
      isPaused: lobby.isPaused === true,
      surrenderDisabled: lobby.surrenderVoteActive === true || lobby.surrenderApproved === true,
      onTogglePause: () => {
        if (!sendMessage('TOGGLE_PAUSE', {})) toast.error('Connexion indisponible. Réessayez.')
      },
      onStartSurrender: () => {
        if (!sendMessage('START_SURRENDER_VOTE', {})) toast.error('Connexion indisponible. Réessayez.')
      },
      onForceEnd: () => {
        if (!sendMessage('FORCE_END_GAME', {})) toast.error('Connexion indisponible. Réessayez.')
      },
    }
  }, [gameOverlayLayout, lobby, user, sendMessage])

  return (
    <>
      {/* Arrière-plan dynamique (phase + victimes), sous l’UI ; z faible, jamais interactif */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${backgroundImageUrl}")` }}
        />
        {/* Voile sombre pour garder la lisibilité des boutons actuels */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10">
        <MainLayout transparentBg gameOverlay={gameOverlayLayout} gameOverlayHostMenu={gameOverlayHostMenu}>
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
            ref={videoRef}
            className="h-full w-full object-cover"
            src="/assets/videos/lobby_video.mp4"
            muted
            playsInline
            onEnded={endCinematicWithMenuTransition}
          />
        </div>
      ) : null}
    </>
  )
}
