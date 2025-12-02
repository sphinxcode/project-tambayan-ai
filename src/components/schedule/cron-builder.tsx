'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface CronBuilderProps {
  value: string
  onChange: (value: string) => void
}

// Preset schedules
const presets = [
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day at 9 AM', value: '0 9 * * *' },
  { label: 'Every weekday at 9 AM', value: '0 9 * * MON-FRI' },
  { label: 'Every Monday at 9 AM', value: '0 9 * * MON' },
  { label: 'Every week (Sunday midnight)', value: '0 0 * * SUN' },
  { label: 'Every month (1st at midnight)', value: '0 0 1 * *' },
]

const days = [
  { value: 'MON', label: 'Mon' },
  { value: 'TUE', label: 'Tue' },
  { value: 'WED', label: 'Wed' },
  { value: 'THU', label: 'Thu' },
  { value: 'FRI', label: 'Fri' },
  { value: 'SAT', label: 'Sat' },
  { value: 'SUN', label: 'Sun' },
]

const hours = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString(),
  label: i.toString().padStart(2, '0') + ':00',
}))

const minutes = Array.from({ length: 60 }, (_, i) => ({
  value: i.toString(),
  label: i.toString().padStart(2, '0'),
}))

// Parse cron expression to get human-readable description
function describeCron(cron: string): string {
  const parts = cron.split(' ')
  if (parts.length !== 5) return 'Invalid expression'

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts

  // Common patterns
  if (cron === '0 * * * *') return 'Every hour at minute 0'
  if (cron === '0 0 * * *') return 'Every day at midnight'
  if (minute === '0' && hour !== '*' && dayOfMonth === '*' && month === '*') {
    if (dayOfWeek === '*') return `Every day at ${hour.padStart(2, '0')}:00`
    if (dayOfWeek === 'MON-FRI') return `Every weekday at ${hour.padStart(2, '0')}:00`
    return `Every ${dayOfWeek} at ${hour.padStart(2, '0')}:00`
  }

  return `At ${minute} minutes past ${hour === '*' ? 'every hour' : `${hour}:00`}`
}

export function CronBuilder({ value, onChange }: CronBuilderProps) {
  const [mode, setMode] = useState<'preset' | 'custom'>('preset')
  const [selectedDays, setSelectedDays] = useState<string[]>(['MON', 'TUE', 'WED', 'THU', 'FRI'])
  const [selectedHour, setSelectedHour] = useState('9')
  const [selectedMinute, setSelectedMinute] = useState('0')
  const [customCron, setCustomCron] = useState(value)

  // Parse initial value
  useEffect(() => {
    if (presets.some((p) => p.value === value)) {
      setMode('preset')
    } else {
      setMode('custom')
      setCustomCron(value)
    }

    // Try to parse the cron expression
    const parts = value.split(' ')
    if (parts.length === 5) {
      setSelectedMinute(parts[0] === '*' ? '0' : parts[0])
      setSelectedHour(parts[1] === '*' ? '0' : parts[1])

      // Parse days
      const dow = parts[4]
      if (dow === '*') {
        setSelectedDays(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])
      } else if (dow === 'MON-FRI') {
        setSelectedDays(['MON', 'TUE', 'WED', 'THU', 'FRI'])
      } else {
        setSelectedDays(dow.split(','))
      }
    }
  }, [value])

  // Build cron from selections
  const buildCronFromSelection = () => {
    const minute = selectedMinute
    const hour = selectedHour
    const dayOfMonth = '*'
    const month = '*'
    let dayOfWeek = '*'

    if (selectedDays.length === 7 || selectedDays.length === 0) {
      dayOfWeek = '*'
    } else if (
      selectedDays.length === 5 &&
      ['MON', 'TUE', 'WED', 'THU', 'FRI'].every((d) => selectedDays.includes(d))
    ) {
      dayOfWeek = 'MON-FRI'
    } else {
      dayOfWeek = selectedDays.join(',')
    }

    return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`
  }

  // Update parent when selections change
  const handleDayToggle = (day: string) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day]
    setSelectedDays(newDays)
  }

  useEffect(() => {
    if (mode === 'custom') return
    const newCron = buildCronFromSelection()
    if (newCron !== value) {
      onChange(newCron)
    }
  }, [selectedDays, selectedHour, selectedMinute, mode])

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'preset' | 'custom')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preset">Quick Select</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="preset" className="space-y-4">
          {/* Presets */}
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.value}
                type="button"
                variant={value === preset.value ? 'default' : 'outline'}
                className={cn(
                  'h-auto py-2 px-3 text-left justify-start',
                  value === preset.value && 'bg-pink-500 hover:bg-pink-600'
                )}
                onClick={() => onChange(preset.value)}
              >
                <span className="text-sm">{preset.label}</span>
              </Button>
            ))}
          </div>

          {/* Custom time selection */}
          <div className="space-y-4 pt-4 border-t">
            <Label>Or customize:</Label>

            {/* Time Selection */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Hour</Label>
                <Select value={selectedHour} onValueChange={setSelectedHour}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((h) => (
                      <SelectItem key={h.value} value={h.value}>
                        {h.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Minute</Label>
                <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Day Selection */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Days</Label>
              <div className="flex flex-wrap gap-2">
                {days.map((day) => (
                  <Button
                    key={day.value}
                    type="button"
                    variant={selectedDays.includes(day.value) ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      selectedDays.includes(day.value) && 'bg-pink-500 hover:bg-pink-600'
                    )}
                    onClick={() => handleDayToggle(day.value)}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div>
            <Label>Cron Expression</Label>
            <Input
              value={customCron}
              onChange={(e) => {
                setCustomCron(e.target.value)
                onChange(e.target.value)
              }}
              placeholder="0 9 * * MON-FRI"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Format: minute hour day-of-month month day-of-week
            </p>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-mono">{customCron}</p>
            <p className="text-xs text-muted-foreground mt-1">
              = {describeCron(customCron)}
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Current Schedule Display */}
      <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-pink-100 text-pink-700">
            Schedule
          </Badge>
          <span className="text-sm font-medium">{describeCron(value)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-mono">{value}</p>
      </div>
    </div>
  )
}
