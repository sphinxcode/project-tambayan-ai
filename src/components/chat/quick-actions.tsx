'use client'

import { QuickAction } from '@/types'
import { Button } from '@/components/ui/button'
import { Sparkles, FileText, HelpCircle, Lightbulb } from 'lucide-react'

interface QuickActionsProps {
  actions: QuickAction[]
  onSelect: (prompt: string) => void
}

// Map icon names to components
function getIcon(iconName?: string) {
  switch (iconName?.toLowerCase()) {
    case 'sparkles':
      return Sparkles
    case 'file':
    case 'filetext':
      return FileText
    case 'help':
    case 'question':
      return HelpCircle
    case 'idea':
    case 'lightbulb':
      return Lightbulb
    default:
      return Sparkles
  }
}

// Map color names to Tailwind classes
function getColorClasses(color?: string) {
  switch (color?.toLowerCase()) {
    case 'blue':
      return 'bg-blue-100 text-blue-700 hover:bg-blue-200'
    case 'green':
      return 'bg-green-100 text-green-700 hover:bg-green-200'
    case 'purple':
      return 'bg-purple-100 text-purple-700 hover:bg-purple-200'
    case 'orange':
      return 'bg-orange-100 text-orange-700 hover:bg-orange-200'
    case 'pink':
    default:
      return 'bg-pink-100 text-pink-700 hover:bg-pink-200'
  }
}

export function QuickActions({ actions, onSelect }: QuickActionsProps) {
  if (actions.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-2 max-w-md">
      {actions.map((action) => {
        const Icon = getIcon(action.icon)
        const colorClasses = getColorClasses(action.color)

        return (
          <Button
            key={action.id}
            variant="outline"
            className={`h-auto py-3 px-4 flex flex-col items-start gap-1 ${colorClasses} border-0`}
            onClick={() => onSelect(action.prompt)}
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{action.label}</span>
          </Button>
        )
      })}
    </div>
  )
}
