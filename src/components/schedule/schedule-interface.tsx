'use client'

import { useState, useEffect } from 'react'
import { Tool, ScheduleConfig, ScheduleConfigEntry } from '@/types'
import { getUserSchedules, createSchedule, toggleSchedule, deleteSchedule } from '@/lib/api/schedules'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { ScheduleForm } from './schedule-form'
import { ScheduleList } from './schedule-list'
import { Plus, Calendar, Clock, AlertCircle } from 'lucide-react'

interface ScheduleInterfaceProps {
  tool: Tool
  config: ScheduleConfig | null
}

export function ScheduleInterface({ tool, config }: ScheduleInterfaceProps) {
  const [schedules, setSchedules] = useState<ScheduleConfigEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<ScheduleConfigEntry | null>(null)

  // Fetch schedules
  useEffect(() => {
    async function fetchSchedules() {
      try {
        setIsLoading(true)
        const data = await getUserSchedules(tool.id)
        setSchedules(data)
      } catch (err) {
        console.error('Failed to fetch schedules:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSchedules()
  }, [tool.id])

  // Handle schedule toggle
  const handleToggle = async (schedule: ScheduleConfigEntry) => {
    try {
      const updated = await toggleSchedule(schedule.id, !schedule.isActive)
      setSchedules((prev) =>
        prev.map((s) => (s.id === schedule.id ? updated : s))
      )
    } catch (err) {
      console.error('Failed to toggle schedule:', err)
    }
  }

  // Handle schedule delete
  const handleDelete = async (schedule: ScheduleConfigEntry) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return

    try {
      await deleteSchedule(schedule.id)
      setSchedules((prev) => prev.filter((s) => s.id !== schedule.id))
    } catch (err) {
      console.error('Failed to delete schedule:', err)
    }
  }

  // Handle form submit
  const handleFormSubmit = (newSchedule: ScheduleConfigEntry) => {
    if (editingSchedule) {
      setSchedules((prev) =>
        prev.map((s) => (s.id === newSchedule.id ? newSchedule : s))
      )
    } else {
      setSchedules((prev) => [newSchedule, ...prev])
    }
    setShowForm(false)
    setEditingSchedule(null)
  }

  // Handle edit
  const handleEdit = (schedule: ScheduleConfigEntry) => {
    setEditingSchedule(schedule)
    setShowForm(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (showForm) {
    return (
      <ScheduleForm
        tool={tool}
        schedule={editingSchedule}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false)
          setEditingSchedule(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Scheduled Runs</h3>
          <p className="text-sm text-muted-foreground">
            Set up automated executions for this tool
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-pink-500 hover:bg-pink-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Schedule
        </Button>
      </div>

      {/* Schedule List */}
      {schedules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-pink-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Schedules Yet</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Create a schedule to automatically run this tool at specific times.
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-pink-500 hover:bg-pink-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Schedule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ScheduleList
          schedules={schedules}
          onToggle={handleToggle}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
