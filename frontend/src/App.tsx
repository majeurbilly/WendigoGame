import { type ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
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
import { Toaster } from './components/ui/sonner'
import { useAuthStore } from './store/useAuthStore'

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

  const navigate = useNavigate()

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

  return (
    <SmokeTransitionContext.Provider value={transitionValue}>
      <div className="relative min-h-screen">
        <div className="fixed inset-0 z-[-1] overflow-hidden">
          <LobbyPanorama fillParent />
        </div>

        <SmokeTransition isActive={isTransitioning} />

        {isInitializing ? (
          <div className="flex h-screen items-center justify-center text-slate-200">
            <div className="rounded-xl border border-slate-700/60 bg-black/40 px-6 py-4 backdrop-blur-sm">
              Loading kingDOM...
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
