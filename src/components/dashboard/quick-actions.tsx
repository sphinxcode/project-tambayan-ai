'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Sparkles,
  MessageSquare,
  Calendar,
  History,
  CreditCard,
  Settings,
} from 'lucide-react'

interface QuickAction {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  color: string
}

const quickActions: QuickAction[] = [
  {
    title: 'Browse Tools',
    description: 'Explore available AI tools',
    href: '/tools',
    icon: <Sparkles className="h-5 w-5" />,
    color: 'bg-pink-100 text-pink-600 hover:bg-pink-200',
  },
  {
    title: 'Chat Tools',
    description: 'Start a conversation',
    href: '/tools?type=CHAT',
    icon: <MessageSquare className="h-5 w-5" />,
    color: 'bg-fuchsia-100 text-fuchsia-600 hover:bg-fuchsia-200',
  },
  {
    title: 'Schedules',
    description: 'Manage automated tasks',
    href: '/schedules',
    icon: <Calendar className="h-5 w-5" />,
    color: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
  },
  {
    title: 'History',
    description: 'View past executions',
    href: '/history',
    icon: <History className="h-5 w-5" />,
    color: 'bg-violet-100 text-violet-600 hover:bg-violet-200',
  },
  {
    title: 'Buy Credits',
    description: 'Top up your balance',
    href: '/credits',
    icon: <CreditCard className="h-5 w-5" />,
    color: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200',
  },
  {
    title: 'Settings',
    description: 'Manage your account',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />,
    color: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Jump to frequently used features</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Button
                variant="outline"
                className="w-full h-auto flex flex-col items-center gap-2 p-4 hover:border-pink-300"
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  {action.icon}
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
