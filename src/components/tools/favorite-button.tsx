'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { useFavoriteStore } from '@/stores'
import { addFavorite, removeFavorite } from '@/lib/api/favorites'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  toolId: string
  className?: string
  size?: 'sm' | 'default' | 'lg' | 'icon'
}

export function FavoriteButton({ toolId, className, size = 'icon' }: FavoriteButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const { isFavorite, addFavorite: addLocal, removeFavorite: removeLocal } = useFavoriteStore()
  const isFav = isFavorite(toolId)

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isUpdating) return

    setIsUpdating(true)

    // Optimistic update
    if (isFav) {
      removeLocal(toolId)
    } else {
      addLocal(toolId)
    }

    try {
      if (isFav) {
        await removeFavorite(toolId)
      } else {
        await addFavorite(toolId)
      }
    } catch (error) {
      // Rollback on error
      if (isFav) {
        addLocal(toolId)
      } else {
        removeLocal(toolId)
      }
      console.error('Failed to update favorite:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size={size}
      className={cn(
        'hover:bg-transparent',
        isFav && 'text-pink-500',
        className
      )}
      onClick={handleToggle}
      disabled={isUpdating}
    >
      <Heart
        className={cn(
          'h-5 w-5 transition-all',
          isFav && 'fill-pink-500',
          isUpdating && 'animate-pulse'
        )}
      />
      <span className="sr-only">{isFav ? 'Remove from favorites' : 'Add to favorites'}</span>
    </Button>
  )
}
