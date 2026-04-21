import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'
import { CheckCircle, XCircle } from 'lucide-react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  success?: string
  helperText?: string
  icon?: React.ReactNode
  showValidState?: boolean
  required?: boolean
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, success, helperText, icon, showValidState, required, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const hasError = !!error
    const hasSuccess = !!success && !error && showValidState
    
    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
          {required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-4 py-3 text-base border rounded-lg transition-colors focus-ring',
              'placeholder:text-gray-400',
              icon && 'pl-10',
              hasError
                ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500'
                : hasSuccess
                ? 'border-success-500 focus:border-success-500 focus:ring-success-500'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
              props.disabled && 'bg-gray-100 cursor-not-allowed',
              props.className
            )}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          
          {hasError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <XCircle className="w-5 h-5 text-danger-500" />
            </div>
          )}
          
          {hasSuccess && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <CheckCircle className="w-5 h-5 text-success-500" />
            </div>
          )}
        </div>
        
        {error && (
          <div 
            id={`${inputId}-error`}
            className="flex items-center gap-1.5 mt-1.5 text-sm text-danger-600"
            role="alert"
          >
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && !error && showValidState && (
          <div 
            id={`${inputId}-success`}
            className="flex items-center gap-1.5 mt-1.5 text-sm text-success-600"
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}
        
        {helperText && !error && !success && (
          <p 
            id={`${inputId}-helper`}
            className="mt-1.5 text-sm text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'

export default FormField
