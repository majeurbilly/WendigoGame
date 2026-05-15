import { useState } from 'react'
import { useAuth } from 'react-oidc-context'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/api/auth'
import { createLobbyAPI } from '@/api/game'
import VoxelButton from '@/features/dashboard/components/game/VoxelButton'
import { useSmokeTransition } from '@/contexts/smokeTransitionContext'
import { safeTrim } from '@/lib/safeTrim'
import { useAuthStore } from '@/store/useAuthStore'

const JOIN_PANEL_MIN_H = 'min-h-[24.5rem]'

const DashboardPage = () => {
  const auth = useAuth()
  const { transitionTo } = useSmokeTransition()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)

  const [creatingMode, setCreatingMode] = useState<'local' | 'online' | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  const [joinCode, setJoinCode] = useState('')

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

  const handleJoinLobby = (code: string) => {
    const normalized = safeTrim(code).toUpperCase()
    if (!normalized) {
      toast.error('Entrez un code de lobby.')
      return
    }
    setJoinCode('')
    setIsJoining(false)
    transitionTo(`/lobby/${normalized}`)
  }

  const handleCancelJoin = () => {
    setIsJoining(false)
    setJoinCode('')
  }

  const handleLogout = () => {
    logout()
    void auth.signoutRedirect()
  }

  const busy = creatingMode !== null

  const onJoinCodeChange = (raw: string) => {
    const next = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
    setJoinCode(next)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 text-slate-100">
      <div className="relative z-10 mx-auto w-full max-w-sm rounded-3xl border-x-2 border-b-8 border-t-4 border-[#2d261f] bg-[#1a1612] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        <h1 className="mb-6 text-center text-5xl font-black uppercase tracking-widest text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">
          WENDIGO
        </h1>
        <p className="mb-6 border-b border-[#2d261f] pb-6 text-center font-medium text-amber-200/60">
          Bienvenue{user?.username ? `, ${user.username}` : ''}
        </p>

        <div className={`flex flex-col gap-4 ${JOIN_PANEL_MIN_H} transition-[opacity] duration-200 ease-out`}>
          {!isJoining ? (
            <>
              <VoxelButton
                type="button"
                className="w-full"
                onClick={() => void handleCreateLobby('local')}
                disabled={busy}
              >
                {creatingMode === 'local' ? 'Création…' : 'Create Lobby (Local)'}
              </VoxelButton>

              <VoxelButton type="button" className="w-full" disabled title="Bientôt disponible">
                Create Lobby (Online)
              </VoxelButton>

              <VoxelButton
                type="button"
                className="w-full"
                onClick={() => {
                  setJoinCode('')
                  setIsJoining(true)
                }}
                disabled={busy}
              >
                Join Lobby
              </VoxelButton>

              <VoxelButton
                type="button"
                variant="muted"
                className="w-full"
                onClick={() => transitionTo('/profile')}
                disabled={busy}
              >
                Profile
              </VoxelButton>

              <VoxelButton
                type="button"
                variant="muted"
                className="w-full"
                onClick={() => transitionTo('/settings')}
              >
                Settings
              </VoxelButton>

              <VoxelButton type="button" variant="danger" className="w-full" onClick={handleLogout} disabled={busy}>
                Déconnexion
              </VoxelButton>
            </>
          ) : (
            <form
              className="flex h-full flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                handleJoinLobby(joinCode)
              }}
            >
              <p className="mb-2 text-center text-sm text-amber-200/60">
                Saisissez le code à 4 caractères affiché par l&apos;hôte.
              </p>
              <input
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={4}
                value={joinCode}
                onChange={(e) => onJoinCodeChange(e.target.value)}
                className="mb-4 w-full rounded-xl border-2 border-[#2d261f] bg-[#241e18] px-4 py-3 text-center text-2xl font-black uppercase tracking-[0.3em] text-amber-500 shadow-inner focus:border-amber-500/50 focus:outline-none"
                aria-label="Code du lobby"
              />
              <VoxelButton type="submit" className="w-full" disabled={busy}>
                Rejoindre
              </VoxelButton>
              <VoxelButton type="button" variant="danger" className="w-full" onClick={handleCancelJoin} disabled={busy}>
                Annuler
              </VoxelButton>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
