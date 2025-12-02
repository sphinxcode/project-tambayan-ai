'use client'

import { ScheduleConfigEntry } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { MoreVertical, Edit2, Trash2, Clock, CheckCircle2, XCircle, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScheduleListProps {
  schedules: ScheduleConfigEntry[]
  onToggle: (schedule: ScheduleConfigEntry) => void
  onEdit: (schedule: ScheduleConfigEntry) => void
  onDelete: (schedule: ScheduleConfigEntry) => void
}

function describeCron(cron: string): string {
  const parts = cron.split(' ')
  if (parts.length !== 5) return cron

  const [minute, hour, , , dayOfWeek] = parts

  if (cron === '0 * * * *') return 'Every hour'
  if (cron === '0 0 * * *') return 'Daily at midnight'
  if (minute === '0' && hour !== '*') {
    if (dayOfWeek === '*') return `Daily at ${hour.padStart(2, '0')}:00`
    if (dayOfWeek === 'MON-FRI') return `Weekdays at ${hour.padStart(2, '0')}:00`
    return `${dayOfWeek} at ${hour.padStart(2, '0')}:00`
  }

  return cron
}

export function ScheduleList({
  schedules,
  onToggle,
  onEdit,
  onDelete,
}: ScheduleListProps) {
  return (
    <div className="space-y-3">
      {schedules.map((schedule) => (
        <Card
          key={schedule.id}
          className={cn(
            'transition-colors',
            !schedule.isActive && 'opacity-60'
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              {/* Schedule Info */}
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{schedule.name}</h4>
                  <Badge
                    variant={schedule.isActive ? 'default' : 'secondary'}
                    className={cn(
                      schedule.isActive && 'bg-green-500 hover:bg-green-600'
                    )}
                  >
                    {schedule.isActive ? 'Active' : 'Paused'}
                  </Badge>
                </div>

                {schedule.description && (
                  <p className="text-sm text-muted-foreground">
                    {schedule.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{describeCron(schedule.cronExpression)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{schedule.timezone}</span>
                  </div>
                </div>

                {/* Execution Info */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                  {schedule.lastRunAt && (
                    <div className="flex items-center gap-1">
                      {schedule.lastRunStatus === 'SUCCESS' ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span>
                        Last run:{' '}
                        {formatDistanceToNow(new Date(schedule.lastRunAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  )}
                  {schedule.nextRunAt && schedule.isActive && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        Next run:{' '}
                        {formatDistanceToNow(new Date(schedule.nextRunAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={schedule.isActive}
                  onCheckedChange={() => onToggle(schedule)}
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(schedule)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete(schedule)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
