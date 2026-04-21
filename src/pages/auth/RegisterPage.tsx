import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Building2 } from 'lucide-react'
import { registerSchema } from '@/utils/validation'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import toast from 'react-hot-toast'
import { useState } from 'react'

type RegisterFormData = {
  name: string
  email: string
  password: string
  confirmPassword: string
  businessName?: string
}

const RegisterPage = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setFormError(null)
    setIsLoading(true)
    try {
      const response = await authService.register(data)
      setAuth(response.user, response.token)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed'
      setFormError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-sm text-gray-600 mt-1">
          Start managing your inventory today
        </p>
      </div>

      {formError && (
        <Alert
          variant="error"
          description={formError}
          className="mb-4"
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Trader"
          icon={<User className="w-5 h-5" />}
          error={errors.name?.message}
          autoComplete="name"
          {...register('name')}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="trader@example.com"
          icon={<Mail className="w-5 h-5" />}
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />

        <Input
          label="Business Name (Optional)"
          type="text"
          placeholder="John's Trading Store"
          icon={<Building2 className="w-5 h-5" />}
          error={errors.businessName?.message}
          {...register('businessName')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="w-5 h-5" />}
          error={errors.password?.message}
          autoComplete="new-password"
          {...register('password')}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="w-5 h-5" />}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">Already have an account? </span>
        <Link
          to="/login"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}

export default RegisterPage
