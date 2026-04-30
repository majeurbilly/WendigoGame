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
import { getApiErrorMessage, loginAPI, registerAPI } from '@/api/auth'
import {
  registerSchema,
  type RegisterFormValues,
} from '@/features/auth/schemas'
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
    <Card className="border-slate-700 bg-slate-900/80 text-slate-100">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription className="text-slate-300">
          Create your account to join the game.
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
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="your-username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    <Input type="password" placeholder="At least 6 characters" {...field} />
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
              {form.formState.isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-slate-300">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-slate-100 underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default RegisterForm
