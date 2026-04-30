import AuthLayout from '@/components/layouts/AuthLayout'
import LoginForm from '@/features/auth/components/LoginForm'

const LoginPage = () => {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}

export default LoginPage
