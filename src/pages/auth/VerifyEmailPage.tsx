import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import AuthLayout from '@/components/layout/AuthLayout'
import OTPInput from '@/components/auth/OTPInput'
import ResendOTPButton from '@/components/auth/ResendOTPButton'
import Button from '@/components/ui/Button'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, setAuth } = useAuthStore()
  
  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Get email from location state or user
  const email = (location.state as { email?: string })?.email || user?.email || ''

  useEffect(() => {
    // Redirect if no email available
    if (!email) {
      toast.error('Email address not found. Please login again.')
      navigate('/auth/login')
    }
  }, [email, navigate])

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the complete 6-digit code')
      return
    }

    setIsVerifying(true)
    setHasError(false)

    try {
      const response = await authService.verifyEmail({ email, otp })
      
      // Update user in store
      if (user) {
        setAuth(response.user, useAuthStore.getState().token || '')
      }
      
      toast.success(response.message)
      navigate('/dashboard')
    } catch (error: any) {
      setHasError(true)
      toast.error(error.message || 'Verification failed. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    try {
      await authService.resendOTP({ email, type: 'email_verification' })
      toast.success('New verification code sent to your email')
      setOtp('')
      setHasError(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend code')
    }
  }

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle={`We've sent a 6-digit code to ${email}`}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
            Enter Verification Code
          </label>
          <OTPInput
            value={otp}
            onChange={(value) => {
              setOtp(value)
              setHasError(false)
            }}
            disabled={isVerifying}
            error={hasError}
          />
          {hasError && (
            <p className="text-sm text-red-600 text-center mt-2">
              Invalid code. Please try again.
            </p>
          )}
        </div>

        <Button
          onClick={handleVerify}
          disabled={otp.length !== 6 || isVerifying}
          isLoading={isVerifying}
          className="w-full"
        >
          Verify Email
        </Button>

        <ResendOTPButton onResend={handleResend} />

        <div className="text-center">
          <button
            onClick={() => navigate('/auth/login')}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}
