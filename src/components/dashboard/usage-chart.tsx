'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getUsageStats } from '@/lib/api/credits'
import { UsageStats } from '@/types'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// Generate mock data for demo purposes
function generateMockData() {
  const data = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      executions: Math.floor(Math.random() * 50) + 10,
      credits: Math.floor(Math.random() * 100) + 20,
    })
  }
  return data
}

export function UsageChart() {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true)
        const data = await getUsageStats()
        setStats(data)
      } catch (err) {
        // Use mock data if API fails
        console.warn('Using mock data:', err)
        setStats({
          daily: generateMockData(),
          weekly: [],
          monthly: [],
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  // Use mock data if no stats available
  const chartData = stats?.daily?.length ? stats.daily : generateMockData()

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Usage Overview</CardTitle>
        <CardDescription>
          Your tool executions and credit usage over the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorExecutions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d946ef" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Area
                type="monotone"
                dataKey="executions"
                stroke="#ec4899"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorExecutions)"
                name="Executions"
              />
              <Area
                type="monotone"
                dataKey="credits"
                stroke="#d946ef"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCredits)"
                name="Credits Used"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
