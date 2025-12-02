'use client'

import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-pink-500" />
              Coming Soon
            </CardTitle>
            <CardDescription>
              Settings page is under development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Profile settings, preferences, and account management features will be available here soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
