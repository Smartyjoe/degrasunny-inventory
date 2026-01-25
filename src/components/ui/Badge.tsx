import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info'
  size?: 'sm' | 'md'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
      success: 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400',
      danger: 'bg-danger-100 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400',
      warning: 'bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400',
      info: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400',
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
