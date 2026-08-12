import { Trans } from '@/lib/lingui'
import { formatOidcError, oidcLoginFailedMessage } from '@/auth/oidcErrors'
import { resetOidcSession } from '@/auth/oidcUserManager'
import { useAuth } from 'react-oidc-context'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import VoxelButton from '@/features/dashboard/components/game/VoxelButton'

const LoginPage = () => {
  const auth = useAuth()

  if (auth.isLoading) {
    return (
      <div className="flex flex-col items-center gap-6 text-amber-50/90">
        <p className="text-sm uppercase tracking-wide text-amber-200/70">
          <Trans>Loading…</Trans>
        </p>
      </div>
    )
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleEnterCouncil = async () => {
    try {
      await resetOidcSession()
      await auth.signinRedirect()
    } catch (error) {
      console.error('OIDC signinRedirect failed:', error)
      toast.error(oidcLoginFailedMessage(formatOidcError(error)))
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 text-amber-50/90">
      <VoxelButton type="button" className="w-full min-w-[240px] px-4 py-3 text-sm uppercase" onClick={handleEnterCouncil}>
        <Trans>Enter the Council</Trans>
      </VoxelButton>
    </div>
  )
}

export default LoginPage
