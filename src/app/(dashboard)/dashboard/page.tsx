import { DashboardHeader } from "@/components/layout/dashboard-header"
import { StatsCards, UsageChart, RecentExecutions, QuickActions } from "@/components/dashboard"

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Stats Cards */}
        <StatsCards />

        {/* Charts and Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <UsageChart />
          <RecentExecutions />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </>
  )
}
