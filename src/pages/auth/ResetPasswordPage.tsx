import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
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
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Redirect if no email available
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
    setHasError(false)

    try {
      await authService.verifyPasswordResetOTP({ email, otp })
      toast.success('Code verified! Please set your new password.')
      setStep('reset')
    } catch (error: any) {
      setHasError(true)
      toast.error(error.message || 'Invalid code. Please try again.')
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
      setHasError(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend code')
    }
  }

  return (
    <AuthLayout
      title={step === 'verify' ? 'Verify Reset Code' : 'Set New Password'}
      subtitle={step === 'verify' ? `Enter the code sent to ${email}` : 'Choose a strong password for your account'}
    >
      {step === 'verify' ? (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Enter Reset Code
            </label>
            <OTPInput
              value={otp}
              onChange={(value) => {
                setOtp(value)
                setHasError(false)
              }}
              disabled={isLoading}
              error={hasError}
            />
            {hasError && (
              <p className="text-sm text-red-600 text-center mt-2">
                Invalid code. Please try again.
              </p>
            )}
          </div>

          <Button
            onClick={handleVerifyOTP}
            disabled={otp.length !== 6 || isLoading}
            isLoading={isLoading}
            className="w-full"
          >
            Verify Code
          </Button>

          <ResendOTPButton onResend={handleResend} />

          <div className="text-center">
            <button
              onClick={() => navigate('/auth/forgot-password')}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Back to Forgot Password
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
            minLength={8}
          />

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            minLength={8}
          />

          <Button
            type="submit"
            disabled={isLoading || !password || !confirmPassword}
            isLoading={isLoading}
            className="w-full"
          >
            Reset Password
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setStep('verify')}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Back to Verification
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}
