'use client'

import { useEffect, useState, use } from 'react'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FavoriteButton } from '@/components/tools'
import { FormInterface } from '@/components/form/form-interface'
import { ChatInterface } from '@/components/chat/chat-interface'
import { ScheduleInterface } from '@/components/schedule/schedule-interface'
import { getToolById } from '@/lib/api/tools'
import { Tool, FormConfig, ChatConfig, ScheduleConfig } from '@/types'
import { ArrowLeft, CreditCard, MessageSquare, Calendar, FileText, Star } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ToolDetailPageProps {
  params: Promise<{ id: string }>
}

const toolTypeConfig = {
  FORM: {
    icon: FileText,
    label: 'Form Tool',
    description: 'Fill out the form to run this tool',
    color: 'bg-blue-100 text-blue-700',
  },
  CHAT: {
    icon: MessageSquare,
    label: 'Chat Tool',
    description: 'Start a conversation with this AI assistant',
    color: 'bg-green-100 text-green-700',
  },
  SCHEDULE: {
    icon: Calendar,
    label: 'Schedule Tool',
    description: 'Set up automated runs for this tool',
    color: 'bg-purple-100 text-purple-700',
  },
}

function ToolDetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-16 w-16 rounded-lg mb-4" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-20 rounded-full mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[400px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function ToolDetailPage({ params }: ToolDetailPageProps) {
  const { id } = use(params)
  const [tool, setTool] = useState<Tool | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTool() {
      try {
        setIsLoading(true)
        const data = await getToolById(id)
        setTool(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tool')
      } finally {
        setIsLoading(false)
      }
    }
    fetchTool()
  }, [id])

  if (isLoading) {
    return (
      <>
        <DashboardHeader />
        <ToolDetailSkeleton />
      </>
    )
  }

  if (error || !tool) {
    return (
      <>
        <DashboardHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
          <h1 className="text-2xl font-bold">Tool Not Found</h1>
          <p className="text-muted-foreground">{error || 'The requested tool could not be found.'}</p>
          <Link href="/tools">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tools
            </Button>
          </Link>
        </div>
      </>
    )
  }

  const typeConfig = toolTypeConfig[tool.type]
  const TypeIcon = typeConfig.icon

  // Parse tool config based on type
  const getToolConfig = () => {
    const config = tool.config as Record<string, unknown>
    switch (tool.type) {
      case 'FORM':
        return config as unknown as FormConfig
      case 'CHAT':
        return config as unknown as ChatConfig
      case 'SCHEDULE':
        return config as unknown as ScheduleConfig
      default:
        return null
    }
  }

  const toolConfig = getToolConfig()

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Back Button */}
        <div className="flex items-center gap-2">
          <Link href="/tools">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tools
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Tool Info Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="relative">
                {/* Favorite Button */}
                <div className="absolute top-4 right-4">
                  <FavoriteButton toolId={tool.id} />
                </div>

                {/* Tool Icon */}
                <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-pink-100 to-fuchsia-100 flex items-center justify-center mb-4">
                  <TypeIcon className="h-8 w-8 text-pink-600" />
                </div>

                <CardTitle className="text-xl">{tool.name}</CardTitle>
                <CardDescription className="mt-2">
                  {tool.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Type Badge */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className={typeConfig.color}>
                    <TypeIcon className="h-3 w-3 mr-1" />
                    {typeConfig.label}
                  </Badge>
                  {tool.isFeatured && (
                    <Badge className="bg-pink-500 hover:bg-pink-600">
                      Featured
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{tool.creditCost}</p>
                      <p className="text-xs text-muted-foreground">Credits per run</p>
                    </div>
                  </div>

                  {tool.averageRating && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <div>
                        <p className="text-sm font-medium">{tool.averageRating.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">
                          {tool.reviewCount} reviews
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Categories */}
                {tool.categories && Array.isArray(tool.categories) && tool.categories.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Categories</p>
                    <div className="flex flex-wrap gap-1">
                      {tool.categories.map((cat) => (
                        <Badge key={cat.id} variant="outline" className="text-xs">
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tool Interface */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>{typeConfig.label}</CardTitle>
                <CardDescription>{typeConfig.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                {tool.type === 'FORM' && (
                  <FormInterface
                    tool={tool}
                    config={toolConfig as FormConfig}
                  />
                )}
                {tool.type === 'CHAT' && (
                  <ChatInterface
                    tool={tool}
                    config={toolConfig as ChatConfig}
                  />
                )}
                {tool.type === 'SCHEDULE' && (
                  <ScheduleInterface
                    tool={tool}
                    config={toolConfig as ScheduleConfig}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
