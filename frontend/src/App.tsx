import {
  type ReactElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
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

type TransitionContextValue = {
  isTransitioning: boolean
  transitionTo: (to: string) => void
}

const TransitionContext = createContext<TransitionContextValue | null>(null)

export const useSmokeTransition = (): TransitionContextValue => {
  const value = useContext(TransitionContext)
  if (!value) {
    throw new Error('useSmokeTransition must be used within TransitionContext.Provider')
  }
  return value
}

const AppShell = () => {
  const isInitializing = useAuthStore((state) => state.isInitializing)
  const initAuth = useAuthStore((state) => state.initAuth)

  const navigate = useNavigate()
  const location = useLocation()

  const [isTransitioning, setIsTransitioning] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    void initAuth()
  }, [initAuth])

  const transitionTo = useCallback(
    (to: string) => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }

      setIsTransitioning(true)
      timeoutRef.current = window.setTimeout(() => {
        navigate(to)
      }, 500)
    },
    [navigate]
  )

  useEffect(() => {
    // À chaque navigation effective, dissipe la fumée.
    setIsTransitioning(false)
  }, [location.key])

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const transitionValue = useMemo<TransitionContextValue>(
    () => ({ isTransitioning, transitionTo }),
    [isTransitioning, transitionTo]
  )

  return (
    <TransitionContext.Provider value={transitionValue}>
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
    </TransitionContext.Provider>
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
