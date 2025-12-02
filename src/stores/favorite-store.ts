import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoriteState {
  // Local favorites (optimistic UI)
  favoriteIds: string[]
  isLoading: boolean
  error: string | null

  // Actions
  addFavorite: (toolId: string) => void
  removeFavorite: (toolId: string) => void
  setFavorites: (toolIds: string[]) => void
  isFavorite: (toolId: string) => boolean
  toggleFavorite: (toolId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      // Initial state
      favoriteIds: [],
      isLoading: false,
      error: null,

      // Actions
      addFavorite: (toolId) =>
        set((state) => {
          const uniqueIds = Array.from(new Set([...state.favoriteIds, toolId]))
          return { favoriteIds: uniqueIds }
        }),

      removeFavorite: (toolId) =>
        set((state) => ({
          favoriteIds: state.favoriteIds.filter((id) => id !== toolId),
        })),

      setFavorites: (toolIds) => set({ favoriteIds: toolIds }),

      isFavorite: (toolId) => get().favoriteIds.includes(toolId),

      toggleFavorite: (toolId) => {
        const { isFavorite, addFavorite, removeFavorite } = get()
        if (isFavorite(toolId)) {
          removeFavorite(toolId)
        } else {
          addFavorite(toolId)
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error, isLoading: false }),
    }),
    {
      name: 'tambayan-favorites', // localStorage key
      partialize: (state) => ({ favoriteIds: state.favoriteIds }), // Only persist favoriteIds
    }
  )
)
