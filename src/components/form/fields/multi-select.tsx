'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface MultiSelectFieldProps {
  options: Option[]
  value: string[] | unknown
  onChange: (value: string[]) => void
  placeholder?: string
}

export function MultiSelectField({
  options,
  value,
  onChange,
  placeholder = 'Select options...',
}: MultiSelectFieldProps) {
  // Ensure value is always an array
  const safeValue: string[] = (() => {
    if (Array.isArray(value)) return value
    if (value === null || value === undefined) return []
    if (typeof value === 'string') return value ? [value] : []
    return []
  })()

  const [selectedValues, setSelectedValues] = useState<string[]>(safeValue)

  // Sync with external value changes
  useEffect(() => {
    setSelectedValues(safeValue)
  }, [JSON.stringify(safeValue)])

  const handleToggle = (optionValue: string) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((v) => v !== optionValue)
      : [...selectedValues, optionValue]

    setSelectedValues(newValues)
    onChange(newValues)
  }

  const isChecked = (optionValue: string) => selectedValues.includes(optionValue)

  // Ensure options is an array
  const safeOptions = Array.isArray(options) ? options : []

  return (
    <div className="space-y-3">
      {/* Options */}
      <div className="space-y-2">
        {safeOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{placeholder}</p>
        ) : (
          safeOptions.map((option) => {
            const checked = isChecked(option.value)

            return (
              <label
                key={option.value}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border cursor-pointer',
                  'transition-all duration-200',
                  option.disabled
                    ? 'bg-muted border-muted cursor-not-allowed opacity-60'
                    : checked
                    ? 'bg-pink-50 border-pink-300 hover:border-pink-400 dark:bg-pink-950 dark:border-pink-800'
                    : 'bg-background border-border hover:border-pink-300'
                )}
              >
                {/* Hidden checkbox for accessibility */}
                <input
                  type="checkbox"
                  value={option.value}
                  checked={checked}
                  onChange={() => !option.disabled && handleToggle(option.value)}
                  disabled={option.disabled}
                  className="sr-only"
                />

                {/* Custom checkbox */}
                <div
                  className={cn(
                    'w-5 h-5 rounded border-2 flex items-center justify-center',
                    'transition-all duration-200',
                    option.disabled
                      ? 'border-muted-foreground/30 bg-muted'
                      : checked
                      ? 'border-pink-500 bg-pink-500'
                      : 'border-muted-foreground/30 bg-background'
                  )}
                >
                  {checked && (
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  )}
                </div>

                {/* Option label */}
                <span
                  className={cn(
                    'flex-1 text-sm',
                    option.disabled ? 'text-muted-foreground' : 'text-foreground'
                  )}
                >
                  {option.label}
                </span>
              </label>
            )
          })
        )}
      </div>

      {/* Selected count */}
      {selectedValues.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {selectedValues.length} {selectedValues.length === 1 ? 'option' : 'options'} selected
        </p>
      )}
    </div>
  )
}
