import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import {
  loginSchema,
  type LoginFormValues,
} from '@/features/auth/schemas'
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
    <Card className="border-slate-700 bg-slate-900/80 text-slate-100">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription className="text-slate-300">
          Access your WendigoGame account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {form.formState.errors.root?.message ? (
          <p className="text-sm text-red-400">{form.formState.errors.root.message}</p>
        ) : null}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-slate-300">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-slate-100 underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default LoginForm
