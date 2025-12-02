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

// Generate mock data for demo purposes
function generateMockExecutions(): ToolUsage[] {
  const tools = [
    { id: '1', name: 'AI Writer', icon: 'pen' },
    { id: '2', name: 'Image Generator', icon: 'image' },
    { id: '3', name: 'Code Assistant', icon: 'code' },
    { id: '4', name: 'Data Analyzer', icon: 'chart' },
    { id: '5', name: 'Email Composer', icon: 'mail' },
  ]
  const statuses: UsageStatus[] = ['SUCCESS', 'SUCCESS', 'SUCCESS', 'FAILED', 'PENDING']

  return Array.from({ length: 5 }, (_, i) => {
    const tool = tools[i % tools.length]
    const hoursAgo = Math.floor(Math.random() * 48)
    return {
      id: `exec-${i}`,
      userId: 'user-1',
      toolId: tool.id,
      tool: {
        id: tool.id,
        name: tool.name,
        description: '',
        creditCost: Math.floor(Math.random() * 5) + 1,
        type: 'FORM' as const,
        createdAt: new Date().toISOString(),
      },
      creditsUsed: Math.floor(Math.random() * 5) + 1,
      status: statuses[i % statuses.length],
      requestPayload: null,
      responseData: null,
      executionTimeMs: Math.floor(Math.random() * 5000) + 500,
      createdAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
    }
  })
}

export function RecentExecutions() {
  const [executions, setExecutions] = useState<ToolUsage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchExecutions() {
      try {
        setIsLoading(true)
        const data = await getRecentExecutions(5)
        setExecutions(data.length > 0 ? data : generateMockExecutions())
      } catch (err) {
        console.warn('Using mock executions:', err)
        setExecutions(generateMockExecutions())
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

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Executions</CardTitle>
        <CardDescription>Your latest tool runs and their status</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
