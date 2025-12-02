'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getRecentExecutions } from '@/lib/api/tools'
import { ToolUsage, UsageStatus } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'

const statusConfig: Record<UsageStatus, { icon: React.ReactNode; variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  SUCCESS: {
    icon: <CheckCircle2 className="h-3 w-3" />,
    variant: 'default',
    label: 'Success',
  },
  FAILED: {
    icon: <XCircle className="h-3 w-3" />,
    variant: 'destructive',
    label: 'Failed',
  },
  PENDING: {
    icon: <Clock className="h-3 w-3" />,
    variant: 'secondary',
    label: 'Pending',
  },
  TIMEOUT: {
    icon: <AlertCircle className="h-3 w-3" />,
    variant: 'outline',
    label: 'Timeout',
  },
}

export function RecentExecutions() {
  const [executions, setExecutions] = useState<ToolUsage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchExecutions() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getRecentExecutions(5)
        setExecutions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load executions')
        console.error('Error fetching executions:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchExecutions()
  }, [])

  if (isLoading) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
          <CardDescription>Your latest tool runs and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Executions</CardTitle>
        <CardDescription>Your latest tool runs and their status</CardDescription>
      </CardHeader>
      <CardContent>
        {executions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No executions yet. Try running a tool to see your history here.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Credits</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {executions.map((execution) => {
                const status = statusConfig[execution.status]
                return (
                  <TableRow key={execution.id}>
                    <TableCell className="font-medium">
                      {execution.tool?.name || 'Unknown Tool'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className="gap-1">
                        {status.icon}
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{execution.creditsUsed}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDistanceToNow(new Date(execution.createdAt), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
