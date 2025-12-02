'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface MultiSelectFieldProps {
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
}

export function MultiSelectField({
  options,
  value,
  onChange,
  placeholder = 'Select options...',
}: MultiSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : []

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOption = (optionValue: string) => {
    const newValue = safeValue.includes(optionValue)
      ? safeValue.filter((v) => v !== optionValue)
      : [...safeValue, optionValue]
    onChange(newValue)
  }

  const removeOption = (optionValue: string) => {
    onChange(safeValue.filter((v) => v !== optionValue))
  }

  // Prevent hydration mismatch by not rendering interactive parts until mounted
  if (!isMounted) {
    return (
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          disabled
          className="w-full justify-between h-auto min-h-10"
        >
          <span className="text-muted-foreground">{placeholder}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className="w-full justify-between h-auto min-h-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 py-1" suppressHydrationWarning>
          {safeValue.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            safeValue.map((v) => {
              const label = options.find((o) => o.value === v)?.label
              if (!label) return null
              return (
                <Badge
                  key={v}
                  variant="secondary"
                  className="gap-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeOption(v)
                  }}
                >
                  {label}
                  <X className="h-3 w-3 cursor-pointer" />
                </Badge>
              )
            })
          )}
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 opacity-50 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md">
          <ScrollArea className="max-h-60">
            <div className="p-1">
              {options.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    'flex items-center space-x-2 px-2 py-2 rounded-sm cursor-pointer hover:bg-accent',
                    option.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => !option.disabled && toggleOption(option.value)}
                >
                  <Checkbox
                    checked={safeValue.includes(option.value)}
                    disabled={option.disabled}
                    className="pointer-events-none"
                  />
                  <span className="text-sm">{option.label}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
