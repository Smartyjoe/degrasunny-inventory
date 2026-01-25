import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info'
  size?: 'sm' | 'md'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-gray-100 text-gray-700',
      success: 'bg-success-100 text-success-700',
      danger: 'bg-danger-100 text-danger-700',
      warning: 'bg-warning-100 text-warning-700',
      info: 'bg-primary-100 text-primary-700',
    }
    
    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
    }
    
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-full',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export default Badge
