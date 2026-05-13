import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/api/auth'
import { createLobbyAPI } from '@/api/game'
import MinecraftButton from '@/components/ui/MinecraftButton'
import { useSmokeTransition } from '@/contexts/smokeTransitionContext'
import { useAuthStore } from '@/store/useAuthStore'

const DashboardPage = () => {
  const navigate = useNavigate()
  const { transitionTo } = useSmokeTransition()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)

  const [creatingMode, setCreatingMode] = useState<'local' | 'online' | null>(null)

  const handleCreateLobby = async (mode: 'local' | 'online') => {
    setCreatingMode(mode)
    try {
      const code = await createLobbyAPI(mode)
      transitionTo(`/lobby/${code}`)
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setCreatingMode(null)
    }
  }

  const handleJoinLobby = () => {
    const code = window.prompt('Code du lobby ?')?.trim().toUpperCase() ?? ''
    if (!code) {
      return
    }
    transitionTo(`/lobby/${code}`)
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-700/60 bg-black/40 p-8 shadow-2xl backdrop-blur-sm">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-wider text-slate-100 drop-shadow">
            WENDIGO
          </h1>
          <p className="mt-2 text-sm text-slate-200/90">
            Bienvenue{user?.username ? `, ${user.username}` : ''}.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <MinecraftButton
            onClick={() => void handleCreateLobby('local')}
            disabled={creatingMode !== null}
          >
            {creatingMode === 'local' ? 'Creating...' : 'Create Lobby (Local)'}
          </MinecraftButton>

          <MinecraftButton
            onClick={() => void handleCreateLobby('online')}
            disabled={creatingMode !== null}
          >
            {creatingMode === 'online' ? 'Creating...' : 'Create Lobby (Online)'}
          </MinecraftButton>

          <MinecraftButton onClick={handleJoinLobby} disabled={creatingMode !== null}>
            Join Lobby
          </MinecraftButton>

          <MinecraftButton
            onClick={() => toast.message('Profile : bientôt disponible.')}
            disabled={creatingMode !== null}
          >
            Profile
          </MinecraftButton>

          <MinecraftButton
            onClick={() => toast.message('Settings : bientôt disponible.')}
            disabled={creatingMode !== null}
          >
            Settings
          </MinecraftButton>

          <MinecraftButton onClick={handleLogout} disabled={creatingMode !== null}>
            Log Out
          </MinecraftButton>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
