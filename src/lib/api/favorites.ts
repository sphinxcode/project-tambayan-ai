import { api } from '../api'
import { Favorite } from '@/types'

// Get user's favorites
export async function getFavorites(): Promise<Favorite[]> {
  const response = await api.get<{ success: boolean; data: Favorite[] }>('/api/favorites')
  return response.data || []
}

// Add tool to favorites
export async function addFavorite(toolId: string): Promise<Favorite> {
  const response = await api.post<{ success: boolean; data: Favorite }>(`/api/favorites/${toolId}`)
  return response.data
}

// Remove tool from favorites
export async function removeFavorite(toolId: string): Promise<void> {
  await api.delete<void>(`/api/favorites/${toolId}`)
}

// Check if tool is favorited (can be done locally, but useful for initial load)
export async function isFavorited(toolId: string): Promise<boolean> {
  try {
    const favorites = await getFavorites()
    return favorites.some((fav) => fav.toolId === toolId)
  } catch {
    return false
  }
}
