import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

type ErrorVariant = 'error' | 'warning' | 'success' | 'info'

interface ErrorMessageProps {
  message?: string
  variant?: ErrorVariant
  className?: string
  dismissible?: boolean
  onDismiss?: () => void
}

const variantStyles: Record<ErrorVariant, string> = {
  error: 'bg-danger-50 border-danger-200 text-danger-700',
  warning: 'bg-warning-50 border-warning-200 text-warning-700',
  success: 'bg-success-50 border-success-200 text-success-700',
  info: 'bg-primary-50 border-primary-200 text-primary-700',
}

const iconMap: Record<ErrorVariant, React.ElementType> = {
  error: XCircle,
  warning: AlertCircle,
  success: CheckCircle,
  info: Info,
}

export function ErrorMessage({ 
  message, 
  variant = 'error', 
  className,
  dismissible = false,
  onDismiss 
}: ErrorMessageProps) {
  if (!message) return null

  const Icon = iconMap[variant]

  return (
    <div
      className={cn(
        'flex items-start gap-2 p-3 rounded-lg border text-sm',
        variantStyles[variant],
        className
      )}
      role="alert"
    >
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="hover:opacity-70 transition-opacity"
          aria-label="Dismiss"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

interface FieldErrorProps {
  error?: string
  success?: string
}

export function FieldError({ error, success }: FieldErrorProps) {
  if (!error && !success) return null

  const isError = !!error

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 mt-1.5 text-sm',
        isError ? 'text-danger-600' : 'text-success-600'
      )}
    >
      {isError ? (
        <XCircle className="w-4 h-4" />
      ) : (
        <CheckCircle className="w-4 h-4" />
      )}
      <span>{error || success}</span>
    </div>
  )
}
