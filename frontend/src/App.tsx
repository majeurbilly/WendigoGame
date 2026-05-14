import { type ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import AuthLayout from './components/layouts/AuthLayout'
import LobbyPanorama from './components/lobby/LobbyPanorama'
import SmokeTransition from './components/ui/SmokeTransition'
import {
  SmokeTransitionContext,
  type SmokeTransitionContextValue,
} from './contexts/smokeTransitionContext'
import DashboardPage from './pages/DashboardPage'
import LobbyPage from './pages/LobbyPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import GlobalAudioToggle from './features/dashboard/components/GlobalAudioToggle'
import { Toaster } from './components/ui/sonner'
import { isGameOverPhase, isLobbyWaitingPhase } from './lib/gamePhase'
import { useAuthStore } from './store/useAuthStore'
import { useGameStore } from './store/useGameStore'

const WENDIGO_THEME_SRC = '/assets/musiques/wendigo_theme.mp3'

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

const AppShell = () => {
  const isInitializing = useAuthStore((state) => state.isInitializing)
  const initAuth = useAuthStore((state) => state.initAuth)
  const location = useLocation()
  const lobby = useGameStore((state) => state.lobby)
  const isCinematicPlaying = useGameStore((state) => state.isCinematicPlaying)
  const globalVolume = useGameStore((state) => state.globalVolume)
  const isMuted = useGameStore((state) => state.isMuted)

  const navigate = useNavigate()
  const globalThemeAudioRef = useRef<HTMLAudioElement | null>(null)

  const [isTransitioning, setIsTransitioning] = useState(false)
  const navTimeoutRef = useRef<number | null>(null)
  const clearTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    void initAuth()
  }, [initAuth])

  const transitionTo = useCallback(
    (to: string) => {
      if (navTimeoutRef.current !== null) {
        window.clearTimeout(navTimeoutRef.current)
      }
      if (clearTimeoutRef.current !== null) {
        window.clearTimeout(clearTimeoutRef.current)
      }

      setIsTransitioning(true)
      // 400ms : écran saturé → navigation.
      navTimeoutRef.current = window.setTimeout(() => {
        navigate(to)
      }, 400)

      // 1000ms : fin de l'animation → dissipation.
      clearTimeoutRef.current = window.setTimeout(() => {
        setIsTransitioning(false)
      }, 1000)
    },
    [navigate]
  )

  const playSmokeOverlay = useCallback((onMidSmoke?: () => void) => {
    if (navTimeoutRef.current !== null) {
      window.clearTimeout(navTimeoutRef.current)
    }
    if (clearTimeoutRef.current !== null) {
      window.clearTimeout(clearTimeoutRef.current)
    }

    setIsTransitioning(true)
    navTimeoutRef.current = window.setTimeout(() => {
      onMidSmoke?.()
      navTimeoutRef.current = null
    }, 400)

    clearTimeoutRef.current = window.setTimeout(() => {
      setIsTransitioning(false)
      clearTimeoutRef.current = null
    }, 1000)
  }, [])

  useEffect(() => {
    return () => {
      if (navTimeoutRef.current !== null) {
        window.clearTimeout(navTimeoutRef.current)
      }
      if (clearTimeoutRef.current !== null) {
        window.clearTimeout(clearTimeoutRef.current)
      }
    }
  }, [])

  const transitionValue = useMemo<SmokeTransitionContextValue>(
    () => ({ isTransitioning, transitionTo, playSmokeOverlay }),
    [isTransitioning, transitionTo, playSmokeOverlay]
  )

  const shouldPlayGlobalTheme = useMemo(() => {
    if (isCinematicPlaying) {
      return false
    }
    const path = location.pathname
    if (path === '/login' || path === '/register') {
      return true
    }
    if (path === '/') {
      return true
    }
    if (path.startsWith('/lobby/')) {
      if (!lobby) {
        return false
      }
      return isLobbyWaitingPhase(lobby.phase) || isGameOverPhase(lobby.phase)
    }
    return false
  }, [isCinematicPlaying, location.pathname, lobby])

  useEffect(() => {
    const audio = new Audio(WENDIGO_THEME_SRC)
    audio.loop = true
    const { globalVolume: gv, isMuted: muted } = useGameStore.getState()
    audio.volume = muted ? 0 : gv
    audio.preload = 'auto'
    globalThemeAudioRef.current = audio

    return () => {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      globalThemeAudioRef.current = null
    }
  }, [])

  useEffect(() => {
    const audio = globalThemeAudioRef.current
    if (!audio) {
      return
    }
    audio.volume = isMuted ? 0 : globalVolume
  }, [globalVolume, isMuted])

  useEffect(() => {
    const audio = globalThemeAudioRef.current
    if (!audio) {
      return
    }
    if (shouldPlayGlobalTheme) {
      void audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [shouldPlayGlobalTheme])

  useEffect(() => {
    const tryResumeAfterGesture = () => {
      const audio = globalThemeAudioRef.current
      if (!audio || !shouldPlayGlobalTheme) {
        return
      }
      void audio.play().catch(() => {})
    }

    window.addEventListener('pointerdown', tryResumeAfterGesture, true)
    return () => {
      window.removeEventListener('pointerdown', tryResumeAfterGesture, true)
    }
  }, [shouldPlayGlobalTheme])

  return (
    <SmokeTransitionContext.Provider value={transitionValue}>
      <div className="relative min-h-screen">
        <div className="fixed inset-0 z-[-1] overflow-hidden">
          <LobbyPanorama fillParent />
        </div>

        <SmokeTransition isActive={isTransitioning} />

        <GlobalAudioToggle />

        {isInitializing ? (
          <div className="flex h-screen items-center justify-center text-slate-200">
            <div className="rounded-xl border border-slate-700/60 bg-black/40 px-6 py-4 backdrop-blur-sm">
              Chargement…
            </div>
          </div>
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lobby/:code"
              element={
                <ProtectedRoute>
                  <LobbyPage />
                </ProtectedRoute>
              }
            />
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
          </Routes>
        )}
      </div>
    </SmokeTransitionContext.Provider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
      <Toaster />
    </BrowserRouter>
  )
}

export default App
