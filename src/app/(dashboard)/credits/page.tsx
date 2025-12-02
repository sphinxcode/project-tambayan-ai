'use client'

import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard } from 'lucide-react'

export default function CreditsPage() {
  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Credits</h1>
          <p className="text-muted-foreground">
            Manage your credits and purchase additional credits
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-pink-500" />
              Coming Soon
            </CardTitle>
            <CardDescription>
              Credit management page is under development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Credit purchase, transaction history, and credit management features will be available here soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
