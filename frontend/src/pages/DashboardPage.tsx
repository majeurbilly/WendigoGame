import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/api/auth'
import { createLobbyAPI } from '@/api/game'
import VoxelButton from '@/features/dashboard/components/game/VoxelButton'
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

  const busy = creatingMode !== null

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 text-slate-100">
      <div className="relative z-10 mx-auto w-full max-w-sm rounded-3xl border-x-2 border-b-8 border-t-4 border-[#2d261f] bg-[#1a1612] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <h1 className="mb-6 text-center text-5xl font-black uppercase tracking-widest text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">
          WENDIGO
        </h1>
        <p className="mb-6 border-b border-[#2d261f] pb-6 text-center font-medium text-amber-200/60">
          Bienvenue{user?.username ? `, ${user.username}` : ''}
        </p>

        <div className="flex flex-col gap-4">
          <VoxelButton
            type="button"
            className="w-full"
            onClick={() => void handleCreateLobby('local')}
            disabled={busy}
          >
            {creatingMode === 'local' ? 'Création…' : 'Create Lobby (Local)'}
          </VoxelButton>

          <VoxelButton
            type="button"
            className="w-full"
            onClick={() => void handleCreateLobby('online')}
            disabled={busy}
          >
            {creatingMode === 'online' ? 'Création…' : 'Create Lobby (Online)'}
          </VoxelButton>

          <VoxelButton type="button" className="w-full" onClick={handleJoinLobby} disabled={busy}>
            Join Lobby
          </VoxelButton>

          <VoxelButton
            type="button"
            variant="muted"
            className="w-full"
            onClick={() => toast.message('Profile : bientôt disponible.')}
            disabled={busy}
          >
            Profile
          </VoxelButton>

          <VoxelButton
            type="button"
            variant="muted"
            className="w-full"
            onClick={() => toast.message('Settings : bientôt disponible.')}
            disabled={busy}
          >
            Settings
          </VoxelButton>

          <VoxelButton type="button" variant="danger" className="w-full" onClick={handleLogout} disabled={busy}>
            Déconnexion
          </VoxelButton>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
