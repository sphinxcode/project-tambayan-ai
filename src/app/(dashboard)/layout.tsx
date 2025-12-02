import { cookies } from "next/headers"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { createClient } from "@/lib/supabase/server"

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

  // TODO: Fetch credits from API in Phase 2
  const credits = 500

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar user={sidebarUser} credits={credits} />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
