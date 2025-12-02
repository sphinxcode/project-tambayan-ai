'use client'

import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { ToolCategory } from '@/types'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CategoryPillsProps {
  categories: ToolCategory[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryPills({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryPillsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    const container = scrollRef.current
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0)
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      )
    }
  }

  useEffect(() => {
    checkScrollPosition()
    window.addEventListener('resize', checkScrollPosition)
    return () => window.removeEventListener('resize', checkScrollPosition)
  }, [categories])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current
    if (container) {
      const scrollAmount = 200
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
      setTimeout(checkScrollPosition, 300)
    }
  }

  const allCategories = [
    { id: 'all', name: 'All Tools', slug: 'all', description: null, icon: null, sortOrder: 0, isActive: true },
    ...categories,
  ]

  return (
    <div className="relative">
      {/* Left Arrow */}
      {showLeftArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-sm"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Category Pills */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div
          ref={scrollRef}
          className="flex gap-2 py-1 px-1"
          onScroll={checkScrollPosition}
        >
          {allCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'rounded-full shrink-0 transition-all',
                selectedCategory === category.slug
                  ? 'bg-pink-500 hover:bg-pink-600 text-white'
                  : 'hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300'
              )}
              onClick={() => onCategoryChange(category.slug)}
            >
              {category.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>

      {/* Right Arrow */}
      {showRightArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-sm"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
