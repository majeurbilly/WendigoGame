import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { getApiErrorMessage, loginAPI } from '@/api/auth'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas'
import VoxelButton from '@/features/dashboard/components/game/VoxelButton'
import { useAuthStore } from '@/store/useAuthStore'

const LoginForm = () => {
  const navigate = useNavigate()
  const setToken = useAuthStore((state) => state.setToken)
  const setUser = useAuthStore((state) => state.setUser)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    form.clearErrors()

    try {
      const response = await loginAPI(values)
      setToken(response.token)
      setUser(response.user)
      navigate('/', { replace: true })
    } catch (error: unknown) {
      const message = getApiErrorMessage(error)

      if (message.toLowerCase().includes('invalid credentials')) {
        form.setError('password', { message: 'Invalid credentials' })
      }

      form.setError('root', { message })
    }
  }

  return (
    <div className="text-amber-50/90">
      {form.formState.errors.root?.message ? (
        <p className="mb-4 text-center text-sm text-red-400">{form.formState.errors.root.message}</p>
      ) : null}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-amber-200/80">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="border-[#2d261f] bg-[#0f0c09] text-amber-50 placeholder:text-amber-200/30"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-amber-200/80">Mot de passe</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="border-[#2d261f] bg-[#0f0c09] text-amber-50 placeholder:text-amber-200/30"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <VoxelButton type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Connexion…' : 'Se connecter'}
          </VoxelButton>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-amber-200/50">
        Pas encore de compte ?{' '}
        <Link to="/register" className="font-medium text-amber-300 underline underline-offset-2 hover:text-amber-200">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  )
}

export default LoginForm
