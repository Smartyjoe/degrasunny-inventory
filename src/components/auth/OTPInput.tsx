import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  autoFocus?: boolean
}

export default function OTPInput({ 
  length = 6, 
  value, 
  onChange, 
  disabled = false,
  autoFocus = true
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [otpValues, setOtpValues] = useState<string[]>(Array(length).fill(''))

  useEffect(() => {
    const digits = value.split('').slice(0, length)
    const padded = [...digits, ...Array(length).fill('')].slice(0, length)
    setOtpValues(padded)
  }, [value, length])

  useEffect(() => {
    if (autoFocus) {
      inputRefs.current[0]?.focus()
    }
  }, [autoFocus])

  const focusIndex = (index: number) => {
    const input = inputRefs.current[index]
    if (input) {
      input.focus()
      input.select()
    }
  }

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const digit = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...otpValues]
    next[index] = digit
    setOtpValues(next)
    onChange(next.join(''))

    if (digit && index < length - 1) {
      focusIndex(index + 1)
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const next = [...otpValues]
      if (next[index]) {
        next[index] = ''
        setOtpValues(next)
        onChange(next.join(''))
      } else if (index > 0) {
        next[index - 1] = ''
        setOtpValues(next)
        onChange(next.join(''))
        focusIndex(index - 1)
      }
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      focusIndex(index - 1)
    }

    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault()
      focusIndex(index + 1)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return

    const next = [...pasted.split(''), ...Array(length).fill('')].slice(0, length)
    setOtpValues(next)
    onChange(next.join(''))

    const nextEmpty = next.findIndex((d) => d === '')
    focusIndex(nextEmpty === -1 ? length - 1 : nextEmpty)
  }

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4">
      {otpValues.map((digit, index) => {
        const isFilled = Boolean(digit)

        return (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            pattern="\d*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            aria-label={`Digit ${index + 1} of ${length}`}
            className={
              `w-11 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16 ` +
              `rounded-xl border bg-white text-center ` +
              `text-2xl sm:text-3xl font-bold text-gray-900 ` +
              `placeholder:text-gray-300 transition-all duration-150 ` +
              `${isFilled ? 'border-primary-500' : 'border-gray-300'} ` +
              `focus:border-primary-500 focus:ring-2 focus:ring-primary-200 ` +
              `focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100`
            }
            placeholder="•"
          />
        )
      })}
    </div>
  )
}
