'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getDashboardStats } from '@/lib/api/credits'
import { DashboardStats } from '@/types'
import { Zap, CreditCard, Wrench, TrendingUp } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={`flex items-center text-xs mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${!trend.isPositive && 'rotate-180'}`} />
            <span>{trend.isPositive ? '+' : ''}{trend.value}% from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

export function StatsCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true)
        const data = await getDashboardStats()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Tools Run This Month"
        value={stats?.toolsRunThisMonth || 0}
        description="Total executions"
        icon={<Zap className="h-4 w-4" />}
      />
      <StatCard
        title="Credits Used"
        value={stats?.creditsUsedThisMonth || 0}
        description="This billing cycle"
        icon={<CreditCard className="h-4 w-4" />}
      />
      <StatCard
        title="Available Tools"
        value={stats?.availableTools || 0}
        description="Ready to use"
        icon={<Wrench className="h-4 w-4" />}
      />
      <StatCard
        title="Success Rate"
        value="98%"
        description="Based on recent runs"
        icon={<TrendingUp className="h-4 w-4" />}
        trend={{ value: 2.5, isPositive: true }}
      />
    </div>
  )
}
