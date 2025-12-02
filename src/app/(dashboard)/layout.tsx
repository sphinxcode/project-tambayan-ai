import { cookies } from "next/headers"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { CreditProvider } from "@/components/providers/credit-provider"
import { createClient } from "@/lib/supabase/server"
import { getCreditsServer } from "@/lib/api/credits.server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  // Get user from Supabase
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Format user data for sidebar
  const sidebarUser = user ? {
    name: user.user_metadata?.full_name || user.user_metadata?.name || null,
    email: user.email || "",
    avatarUrl: user.user_metadata?.avatar_url || null,
  } : null

  // Fetch actual credits from API using server-side function
  const credits = await getCreditsServer()

  return (
    <CreditProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar user={sidebarUser} credits={credits} />
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </CreditProvider>
  )
}
