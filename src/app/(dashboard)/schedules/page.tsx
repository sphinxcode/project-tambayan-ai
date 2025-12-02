'use client'

import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

export default function SchedulesPage() {
  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schedules</h1>
          <p className="text-muted-foreground">
            Manage your scheduled tool executions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-pink-500" />
              Coming Soon
            </CardTitle>
            <CardDescription>
              Schedule management page is under development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Create, edit, and manage scheduled tool executions here soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
