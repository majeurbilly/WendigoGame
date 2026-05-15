import { type ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AuthProvider, hasAuthParams, useAuth } from 'react-oidc-context'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { oidcUserManager } from '@/auth/oidcUserManager'
import AuthLayout from './components/layouts/AuthLayout'
import LobbyPanorama from './components/lobby/LobbyPanorama'
import SmokeTransition from './components/ui/SmokeTransition'
import {
  SmokeTransitionContext,
  type SmokeTransitionContextValue,
} from './contexts/smokeTransitionContext'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import LobbyPage from './pages/LobbyPage'
import LoginPage from './pages/LoginPage'
import GlobalAudioToggle from './features/dashboard/components/GlobalAudioToggle'
import { Toaster } from './components/ui/sonner'
import { isGameOverPhase, isLobbyWaitingPhase } from './lib/gamePhase'
import { useAuthStore } from './store/useAuthStore'
import { useGameStore } from './store/useGameStore'

const WENDIGO_THEME_SRC = '/assets/musiques/wendigo_theme.mp3'

const oidcCallbackPending = (auth: { isLoading: boolean; activeNavigator?: string }) =>
  auth.isLoading || auth.activeNavigator !== undefined || hasAuthParams()

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const auth = useAuth()
  const isProcessingOidc = oidcCallbackPending(auth)

  if (isProcessingOidc) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-200">
        <div className="rounded-xl border border-slate-700/60 bg-black/40 px-6 py-4 backdrop-blur-sm">
          Validation des sceaux du Conseil…
        </div>
      </div>
    )
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

const AppShell = () => {
  const auth = useAuth()
  const isInitializing = useAuthStore((state) => state.isInitializing)
  const syncFromOidc = useAuthStore((state) => state.syncFromOidc)
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
    syncFromOidc({
      isLoading: auth.isLoading,
      isAuthenticated: auth.isAuthenticated,
      accessToken: auth.user?.access_token ?? null,
      oidcUser: auth.user,
    })
  }, [auth.isLoading, auth.isAuthenticated, auth.user, syncFromOidc])

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
    if (path === '/login') {
      return true
    }
    if (path === '/' || path === '/profile' || path === '/settings') {
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

        {oidcCallbackPending(auth) || isInitializing ? (
          <div className="flex h-screen items-center justify-center text-slate-200">
            <div className="rounded-xl border border-slate-700/60 bg-black/40 px-6 py-4 backdrop-blur-sm">
              Validation des sceaux du Conseil…
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
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
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
            </Route>
          </Routes>
        )}
      </div>
    </SmokeTransitionContext.Provider>
  )
}

const onSigninCallback = () => {
  window.history.replaceState({}, document.title, window.location.pathname)
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider userManager={oidcUserManager} onSigninCallback={onSigninCallback}>
        <AppShell />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
