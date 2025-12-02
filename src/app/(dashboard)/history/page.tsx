'use client'

import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getExecutions } from '@/lib/api/executions'
import { ToolUsage, UsageStatus } from '@/types'
import { formatDistanceToNow, format } from 'date-fns'
import {
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Timer,
  ChevronLeft,
  ChevronRight,
  History as HistoryIcon
} from 'lucide-react'
import Link from 'next/link'

const statusConfig: Record<UsageStatus, { label: string; icon: React.ElementType; color: string }> = {
  PENDING: {
    label: 'Pending',
    icon: Loader2,
    color: 'bg-yellow-100 text-yellow-700',
  },
  SUCCESS: {
    label: 'Success',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-700',
  },
  FAILED: {
    label: 'Failed',
    icon: XCircle,
    color: 'bg-red-100 text-red-700',
  },
  TIMEOUT: {
    label: 'Timeout',
    icon: Timer,
    color: 'bg-orange-100 text-orange-700',
  },
}

function ExecutionTableSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  )
}

export default function HistoryPage() {
  const [executions, setExecutions] = useState<ToolUsage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  useEffect(() => {
    async function fetchExecutions() {
      try {
        setIsLoading(true)
        const response = await getExecutions({
          page,
          pageSize,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        })
        setExecutions(response.data || [])
        setTotalPages(response.totalPages || 1)
        setTotal(response.total || 0)
      } catch (err) {
        console.error('Failed to fetch executions:', err)
        setExecutions([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchExecutions()
  }, [page, statusFilter])

  const formatDuration = (ms: number | null) => {
    if (!ms) return '-'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Execution History</h1>
            <p className="text-muted-foreground">
              View all your tool executions and their results
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="SUCCESS">Success</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="TIMEOUT">Timeout</SelectItem>
            </SelectContent>
          </Select>

          <span className="text-sm text-muted-foreground">
            {total} total executions
          </span>
        </div>

        {/* Executions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HistoryIcon className="h-5 w-5 text-pink-500" />
              Recent Executions
            </CardTitle>
            <CardDescription>
              A list of all tool executions in your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ExecutionTableSkeleton />
            ) : executions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center mb-4">
                  <HistoryIcon className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Executions Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Run a tool to see your execution history here.
                </p>
                <Link href="/tools">
                  <Button className="bg-pink-500 hover:bg-pink-600">
                    Browse Tools
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tool</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {executions.map((execution) => {
                      const status = statusConfig[execution.status]
                      const StatusIcon = status.icon

                      return (
                        <TableRow key={execution.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-100 to-fuchsia-100 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-pink-600" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {execution.tool?.name || 'Unknown Tool'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {execution.tool?.type || 'FORM'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={status.color}>
                              <StatusIcon className={`h-3 w-3 mr-1 ${execution.status === 'PENDING' ? 'animate-spin' : ''}`} />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{execution.creditsUsed}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">
                              {formatDuration(execution.executionTimeMs)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">
                                {format(new Date(execution.createdAt), 'MMM d, yyyy')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(execution.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
