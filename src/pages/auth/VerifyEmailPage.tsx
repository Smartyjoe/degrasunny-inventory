import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
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

  const email = (location.state as { email?: string })?.email || user?.email || ''

  useEffect(() => {
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

    try {
      const response = await authService.verifyEmail({ email, otp })
      if (user) {
        setAuth(response.user, useAuthStore.getState().token || '')
      }
      toast.success(response.message)
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Verification failed. Please try again.')
      setOtp('')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    try {
      await authService.resendOTP({ email, type: 'email_verification' })
      toast.success('New verification code sent to your email')
      setOtp('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend code')
    }
  }

  useEffect(() => {
    if (otp.length === 6 && !isVerifying) {
      handleVerify()
    }
  }, [otp])

  return (
    <AuthLayout title="Verify your account" subtitle="">
      <div className="flex flex-col items-center text-center gap-y-4">
        <p className="text-sm sm:text-base text-gray-600">
          Enter the verification code sent to your email.
        </p>

        <OTPInput value={otp} onChange={setOtp} disabled={isVerifying} />

        <Button
          onClick={handleVerify}
          disabled={otp.length !== 6 || isVerifying}
          isLoading={isVerifying}
          className="w-full"
        >
          Verify Email
        </Button>

        <p className="text-sm text-gray-600">
          Haven't received the email?{' '}
          <ResendOTPButton onResend={handleResend} variant="link" />
        </p>

        <div className="text-center">
          <button
            onClick={() => navigate('/auth/login')}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    </AuthLayout>
  )
}
