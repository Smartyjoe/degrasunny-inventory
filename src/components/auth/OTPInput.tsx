import { useRef, useState, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: boolean
}

export default function OTPInput({ 
  length = 6, 
  value, 
  onChange, 
  disabled = false,
  error = false 
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [otpValues, setOtpValues] = useState<string[]>(
    value.split('').concat(Array(length).fill('')).slice(0, length)
  )

  const focusInput = (index: number) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index]?.focus()
    }
  }

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value

    // Only allow digits
    if (val && !/^\d$/.test(val)) {
      return
    }

    const newOtpValues = [...otpValues]
    newOtpValues[index] = val
    setOtpValues(newOtpValues)
    onChange(newOtpValues.join(''))

    // Auto-focus next input
    if (val && index < length - 1) {
      focusInput(index + 1)
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newOtpValues = [...otpValues]
      
      if (otpValues[index]) {
        // Clear current field
        newOtpValues[index] = ''
        setOtpValues(newOtpValues)
        onChange(newOtpValues.join(''))
      } else if (index > 0) {
        // Move to previous field and clear it
        newOtpValues[index - 1] = ''
        setOtpValues(newOtpValues)
        onChange(newOtpValues.join(''))
        focusInput(index - 1)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1)
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      focusInput(index + 1)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').trim()
    
    // Only process if pasted data contains only digits
    if (!/^\d+$/.test(pastedData)) {
      return
    }

    const pastedDigits = pastedData.slice(0, length).split('')
    const newOtpValues = [...pastedDigits, ...Array(length).fill('')].slice(0, length)
    
    setOtpValues(newOtpValues)
    onChange(newOtpValues.join(''))

    // Focus the next empty input or last input
    const nextEmptyIndex = newOtpValues.findIndex(val => !val)
    focusInput(nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex)
  }

  return (
    <div className="flex gap-2 justify-center">
      {otpValues.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`
            w-12 h-14 text-center text-2xl font-semibold
            border-2 rounded-lg
            transition-all duration-200
            ${error 
              ? 'border-red-500 focus:border-red-600 focus:ring-red-500' 
              : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            focus:outline-none focus:ring-2
          `}
        />
      ))}
    </div>
  )
}
