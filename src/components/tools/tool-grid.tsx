'use client'

import { Tool } from '@/types'
import { ToolCard } from './tool-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { PackageSearch } from 'lucide-react'

interface ToolGridProps {
  tools: Tool[]
  isLoading?: boolean
}

function ToolCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <Skeleton className="h-12 w-12 rounded-lg mb-2" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full mt-1" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2 mb-3">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ToolGrid({ tools, isLoading }: ToolGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ToolCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (tools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-16 w-16 rounded-full bg-pink-100 flex items-center justify-center mb-4">
          <PackageSearch className="h-8 w-8 text-pink-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No tools found</h3>
        <p className="text-muted-foreground max-w-md">
          We couldn&apos;t find any tools matching your criteria. Try adjusting your search or filters.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  )
}
