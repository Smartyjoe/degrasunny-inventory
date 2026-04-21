import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react'
import { cn } from '@/utils/cn'

export type AlertVariant = 'error' | 'warning' | 'success' | 'info'

interface AlertProps {
  title?: string
  description?: string
  variant?: AlertVariant
  className?: string
  dismissible?: boolean
  onDismiss?: () => void
}

const variantStyles: Record<AlertVariant, string> = {
  error: 'bg-danger-50 border-danger-200 text-danger-800',
  warning: 'bg-warning-50 border-warning-200 text-warning-800',
  success: 'bg-success-50 border-success-200 text-success-800',
  info: 'bg-primary-50 border-primary-200 text-primary-800',
}

const iconMap: Record<AlertVariant, React.ElementType> = {
  error: XCircle,
  warning: AlertCircle,
  success: CheckCircle,
  info: Info,
}

export function Alert({
  title,
  description,
  variant = 'info',
  className,
  dismissible = false,
  onDismiss,
}: AlertProps) {
  const Icon = iconMap[variant]

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg border',
        variantStyles[variant],
        className
      )}
      role="alert"
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <p className="font-medium">{title}</p>}
        {description && (
          <p className={cn('text-sm', title && 'mt-1 opacity-90')}>{description}</p>
        )}
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="hover:opacity-70 transition-opacity self-start"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
