import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthLayout from '@/components/layout/AuthLayout'
import OTPInput from '@/components/auth/OTPInput'
import ResendOTPButton from '@/components/auth/ResendOTPButton'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { authService } from '@/services/authService'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [step, setStep] = useState<'verify' | 'reset'>('verify')
  const [email, setEmail] = useState((location.state as { email?: string })?.email || '')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!email) {
      toast.error('Please request a password reset first')
      navigate('/auth/forgot-password')
    }
  }, [email, navigate])

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit code')
      return
    }

    setIsLoading(true)

    try {
      await authService.verifyPasswordResetOTP({ email, otp })
      toast.success('Code verified! Please set your new password.')
      setStep('reset')
    } catch (error: any) {
      toast.error(error.message || 'Invalid code. Please try again.')
      setOtp('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      await authService.resetPasswordWithOTP({
        email,
        otp,
        password,
        password_confirmation: confirmPassword,
      })

      toast.success('Password reset successfully! Please login.')
      navigate('/auth/login')
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await authService.resendOTP({ email, type: 'password_reset' })
      toast.success('New reset code sent to your email')
      setOtp('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend code')
    }
  }

  useEffect(() => {
    if (step === 'verify' && otp.length === 6 && !isLoading) {
      handleVerifyOTP()
    }
  }, [otp])

  return (
    <AuthLayout title={step === 'verify' ? 'Verify your account' : 'Set new password'} subtitle="">
      {step === 'verify' ? (
        <div className="flex flex-col items-center text-center gap-y-4">
          <p className="text-sm sm:text-base text-gray-600">
            Enter the verification code sent to your email.
          </p>

          <OTPInput value={otp} onChange={setOtp} disabled={isLoading} />

          <Button
            onClick={handleVerifyOTP}
            disabled={otp.length !== 6 || isLoading}
            isLoading={isLoading}
            className="w-full"
          >
            Verify Code
          </Button>

          <p className="text-sm text-gray-600">
            Haven't received the email?{' '}
            <ResendOTPButton onResend={handleResend} variant="link" />
          </p>

          <div className="text-center">
            <button
              onClick={() => navigate('/auth/forgot-password')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Back to Forgot Password
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }} className="space-y-6">
          <div className="text-center space-y-1">
            <p className="text-sm text-gray-600">
              Choose a strong password for your account
            </p>
            <p className="text-xs text-gray-500">
              Must be at least 8 characters long
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
            isLoading={isLoading}
            className="w-full"
          >
            Reset Password
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setStep('verify')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Back to Verification
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}
