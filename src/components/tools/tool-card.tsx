'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tool } from '@/types'
import { FavoriteButton } from './favorite-button'
import Link from 'next/link'
import { CreditCard, Star, Zap, MessageSquare, Calendar, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToolCardProps {
  tool: Tool
}

const toolTypeConfig = {
  FORM: {
    icon: FileText,
    label: 'Form',
    color: 'bg-blue-100 text-blue-700',
  },
  CHAT: {
    icon: MessageSquare,
    label: 'Chat',
    color: 'bg-green-100 text-green-700',
  },
  SCHEDULE: {
    icon: Calendar,
    label: 'Schedule',
    color: 'bg-purple-100 text-purple-700',
  },
}

// Map tool icons to Lucide icons
function getToolIcon(iconName?: string | null) {
  switch (iconName?.toLowerCase()) {
    case 'zap':
      return Zap
    case 'message':
    case 'messagesquare':
      return MessageSquare
    case 'calendar':
      return Calendar
    case 'file':
    case 'filetext':
      return FileText
    default:
      return Zap
  }
}

export function ToolCard({ tool }: ToolCardProps) {
  const typeConfig = toolTypeConfig[tool.type]
  const TypeIcon = typeConfig.icon
  const ToolIcon = getToolIcon(tool.icon)

  return (
    <Link href={`/tools/${tool.id}`}>
      <Card className="group h-full transition-all hover:shadow-lg hover:border-pink-300 cursor-pointer">
        <CardHeader className="relative pb-2">
          {/* Favorite Button */}
          <div className="absolute top-3 right-3 z-10">
            <FavoriteButton toolId={tool.id} />
          </div>

          {/* Tool Icon */}
          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-pink-100 to-fuchsia-100 flex items-center justify-center mb-2 group-hover:from-pink-200 group-hover:to-fuchsia-200 transition-colors">
            <ToolIcon className="h-6 w-6 text-pink-600" />
          </div>

          <div className="flex items-start gap-2 pr-8">
            <CardTitle className="text-lg line-clamp-1">{tool.name}</CardTitle>
          </div>

          <CardDescription className="line-clamp-2 min-h-[40px]">
            {tool.shortDescription || tool.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Tool Type Badge */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className={cn('gap-1', typeConfig.color)}>
              <TypeIcon className="h-3 w-3" />
              {typeConfig.label}
            </Badge>
            {tool.isFeatured && (
              <Badge variant="default" className="bg-pink-500 hover:bg-pink-600">
                Featured
              </Badge>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              <span>{tool.creditCost} credits</span>
            </div>

            {tool.averageRating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{tool.averageRating.toFixed(1)}</span>
                {tool.reviewCount && (
                  <span className="text-xs">({tool.reviewCount})</span>
                )}
              </div>
            )}

            {tool.usageCount !== undefined && (
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                <span>{tool.usageCount} runs</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
