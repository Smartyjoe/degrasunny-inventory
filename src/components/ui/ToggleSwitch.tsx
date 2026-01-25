import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface ToggleSwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

const ToggleSwitch = forwardRef<HTMLInputElement, ToggleSwitchProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className={cn('flex items-start', className)}>
        <div className="flex items-center h-6">
          <input
            ref={ref}
            type="checkbox"
            id={toggleId}
            className="sr-only peer"
            {...props}
          />
          <label
            htmlFor={toggleId}
            className={cn(
              'relative w-11 h-6 rounded-full cursor-pointer transition-colors',
              'bg-gray-300 dark:bg-gray-600 peer-checked:bg-primary-600 dark:peer-checked:bg-primary-500',
              'peer-focus:ring-2 peer-focus:ring-primary-500 peer-focus:ring-offset-2 dark:peer-focus:ring-offset-gray-900',
              'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
              'after:content-[""] after:absolute after:top-0.5 after:left-0.5',
              'after:bg-white after:rounded-full after:h-5 after:w-5',
              'after:transition-transform after:duration-200',
              'peer-checked:after:translate-x-5'
            )}
          />
        </div>
        
        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label
                htmlFor={toggleId}
                className="block text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

ToggleSwitch.displayName = 'ToggleSwitch'

export default ToggleSwitch
