import { useAuth } from 'react-oidc-context'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import VoxelButton from '@/features/dashboard/components/game/VoxelButton'

const LOGIN_CONFIG_ERROR =
  "Erreur de configuration de la connexion. Veuillez contacter l'administrateur."

const LoginPage = () => {
  const auth = useAuth()

  if (auth.isLoading) {
    return (
      <div className="flex flex-col items-center gap-6 text-amber-50/90">
        <p className="text-sm uppercase tracking-wide text-amber-200/70">Chargement…</p>
      </div>
    )
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleEnterCouncil = async () => {
    try {
      await auth.signinRedirect()
    } catch (error) {
      console.error('OIDC signinRedirect failed:', error)
      toast.error(LOGIN_CONFIG_ERROR)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 text-amber-50/90">
      <VoxelButton type="button" className="w-full min-w-[240px] px-4 py-3 text-sm uppercase" onClick={handleEnterCouncil}>
        ENTRER DANS LE CONSEIL
      </VoxelButton>
    </div>
  )
}

export default LoginPage
