"use client"

import { ChevronsUpDown, LogOut, User, CreditCard } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

interface SidebarUserProps {
  user: {
    name: string | null
    email: string
    avatarUrl: string | null
  } | null
  credits?: number
}

function formatCredits(credits: number): string {
  if (credits >= 1000) {
    return `${(credits / 1000).toFixed(1)}k`
  }
  return credits.toString()
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  return email.slice(0, 2).toUpperCase()
}

export function SidebarUser({ user, credits = 0 }: SidebarUserProps) {
  const router = useRouter()
  const { state, isMobile } = useSidebar()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  if (!user) {
    return null
  }

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatarUrl || undefined} alt={user.name || user.email} />
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                    {getInitials(user.name, user.email)}
                  </AvatarFallback>
                </Avatar>
                {state === "expanded" && (
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name || "User"}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                )}
                {state === "expanded" && (
                  <Badge variant="secondary" className="ml-auto">
                    {formatCredits(credits)} credits
                  </Badge>
                )}
                {state === "expanded" && <ChevronsUpDown className="ml-auto size-4" />}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatarUrl || undefined} alt={user.name || user.email} />
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                      {getInitials(user.name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name || "User"}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <CreditCard className="mr-2 size-4" />
                <span>{formatCredits(credits)} credits</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <User className="mr-2 size-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 size-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  )
}
