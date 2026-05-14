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
import { getApiErrorMessage, loginAPI, registerAPI } from '@/api/auth'
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas'
import VoxelButton from '@/features/dashboard/components/game/VoxelButton'
import { useAuthStore } from '@/store/useAuthStore'

const RegisterForm = () => {
  const navigate = useNavigate()
  const setToken = useAuthStore((state) => state.setToken)
  const setUser = useAuthStore((state) => state.setUser)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    form.clearErrors()

    try {
      await registerAPI(values)
      const loginResponse = await loginAPI({
        email: values.email,
        password: values.password,
      })

      setToken(loginResponse.token)
      setUser(loginResponse.user)
      navigate('/', { replace: true })
    } catch (error: unknown) {
      const message = getApiErrorMessage(error)
      const normalizedMessage = message.toLowerCase()

      if (normalizedMessage.includes('email already exists')) {
        form.setError('email', { message: 'Email already exists' })
      } else if (normalizedMessage.includes('username already exists')) {
        form.setError('username', { message: 'Username already exists' })
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
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-amber-200/80">Pseudo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="votre-pseudo"
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
                    placeholder="Au moins 6 caractères"
                    className="border-[#2d261f] bg-[#0f0c09] text-amber-50 placeholder:text-amber-200/30"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
          <VoxelButton type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Création…' : 'Créer le compte'}
          </VoxelButton>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-amber-200/50">
        Déjà un compte ?{' '}
        <Link to="/login" className="font-medium text-amber-300 underline underline-offset-2 hover:text-amber-200">
          Se connecter
        </Link>
      </p>
    </div>
  )
}

export default RegisterForm
