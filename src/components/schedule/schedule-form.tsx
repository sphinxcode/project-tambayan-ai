'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Tool, ScheduleConfigEntry } from '@/types'
import { createSchedule, updateSchedule } from '@/lib/api/schedules'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CronBuilder } from './cron-builder'
import { ArrowLeft, Loader2 } from 'lucide-react'

interface ScheduleFormProps {
  tool: Tool
  schedule: ScheduleConfigEntry | null
  onSubmit: (schedule: ScheduleConfigEntry) => void
  onCancel: () => void
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  cronExpression: z.string().min(1, 'Schedule is required'),
  timezone: z.string().min(1, 'Timezone is required'),
})

// Common timezones
const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Manila', label: 'Manila (PHT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
]

export function ScheduleForm({
  tool,
  schedule,
  onSubmit,
  onCancel,
}: ScheduleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: schedule?.name || '',
      description: schedule?.description || '',
      cronExpression: schedule?.cronExpression || '0 9 * * MON-FRI',
      timezone: schedule?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    },
  })

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)

    try {
      let result: ScheduleConfigEntry

      if (schedule) {
        // Update existing schedule
        result = await updateSchedule(schedule.id, {
          name: data.name,
          description: data.description,
          cronExpression: data.cronExpression,
        })
      } else {
        // Create new schedule
        result = await createSchedule({
          toolId: tool.id,
          name: data.name,
          description: data.description,
          cronExpression: data.cronExpression,
          inputData: {},
        })
      }

      onSubmit(result)
    } catch (err) {
      console.error('Failed to save schedule:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h3 className="text-lg font-medium">
          {schedule ? 'Edit Schedule' : 'Create Schedule'}
        </h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Schedule Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Daily Report Generation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what this schedule does..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Timezone */}
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Schedule will run based on this timezone
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* CRON Builder */}
          <FormField
            control={form.control}
            name="cronExpression"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Schedule</FormLabel>
                <FormControl>
                  <CronBuilder
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Each run uses <span className="font-medium">{tool.creditCost} credits</span>
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-pink-500 hover:bg-pink-600"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {schedule ? 'Update Schedule' : 'Create Schedule'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
