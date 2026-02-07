import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'

interface ResendOTPButtonProps {
  onResend: () => Promise<void>
  cooldownSeconds?: number
  disabled?: boolean
  variant?: 'button' | 'link'
}

//debuged to find why the resend button is not working, the issue was that the onResend function was not being called when the button was clicked. This was because the handleResend function was not being passed to the onClick prop of the button. I have fixed this issue by passing the handleResend function to the onClick prop of the button.
export default function ResendOTPButton({ 
  onResend, 
  cooldownSeconds = 60,
  disabled = false,
  variant = 'button'
}: ResendOTPButtonProps) {
  const [countdown, setCountdown] = useState(cooldownSeconds)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleResend = async () => {
    if (countdown > 0 || isResending || disabled) return

    setIsResending(true)
    try {
      await onResend()
      setCountdown(cooldownSeconds)
    } catch (error) {
      // Error handling is done by parent component
    } finally {
      setIsResending(false)
    }
  }

  const canResend = countdown === 0 && !isResending && !disabled

  if (variant === 'link') {
    return countdown > 0 ? (
      <span className="text-primary-600 font-medium">
        Resend in {countdown}s
      </span>
    ) : (
      <button
        type="button"
        onClick={handleResend}
        disabled={!canResend}
        className="text-primary-600 font-medium hover:text-primary-700 disabled:opacity-60"
      >
        Send again
      </button>
    )
  }

  return (
    <div className="text-center">
      {countdown > 0 ? (
        <p className="text-sm text-gray-600">
          Resend code in <span className="font-semibold text-primary-600">{countdown}s</span>
        </p>
      ) : (
        <Button
          type="button"
          variant="ghost"
          onClick={handleResend}
          disabled={!canResend}
          isLoading={isResending}
        >
          Resend Code
        </Button>
      )}
    </div>
  )
}
