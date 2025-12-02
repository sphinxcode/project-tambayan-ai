"use client"

import {
  Sidebar,
  SidebarRail,
} from "@/components/ui/sidebar"
import { AppSidebarHeader } from "./sidebar-header"
import { AppSidebarNav } from "./sidebar-nav"
import { SidebarUser } from "./sidebar-user"

interface AppSidebarProps {
  user: {
    name: string | null
    email: string
    avatarUrl: string | null
  } | null
  credits?: number
}

export function AppSidebar({ user, credits }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <AppSidebarHeader />
      <AppSidebarNav />
      <SidebarUser user={user} credits={credits} />
      <SidebarRail />
    </Sidebar>
  )
}
