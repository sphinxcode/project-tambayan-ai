"use client"

import { Sparkles } from "lucide-react"
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function AppSidebarHeader() {
  const { state } = useSidebar()

  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <Link href="/dashboard">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </div>
              {state === "expanded" && (
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Tambayan PH</span>
                  <span className="text-xs text-muted-foreground">AI Tools</span>
                </div>
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}
