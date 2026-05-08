import AuthLayout from '@/components/layouts/AuthLayout'
import LobbyPanorama from '@/components/lobby/LobbyPanorama'
import LoginForm from '@/features/auth/components/LoginForm'

const LoginPage = () => {
  return (
    <AuthLayout
      background={
        <LobbyPanorama fillParent />
      }
    >
      <LoginForm />
    </AuthLayout>
  )
}

export default LoginPage
