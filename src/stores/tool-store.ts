import { create } from 'zustand'
import { Tool, PaginatedResponse, ToolCategory } from '@/types'

interface ToolFilters {
  search: string
  category: string
  sortBy: 'popular' | 'newest' | 'rating' | 'uses'
}

interface ToolState {
  // Data
  tools: Tool[]
  categories: ToolCategory[]
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }

  // Filters
  filters: ToolFilters

  // Actions
  setTools: (response: PaginatedResponse<Tool>) => void
  setCategories: (categories: ToolCategory[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<ToolFilters>) => void
  setPage: (page: number) => void
  resetFilters: () => void
  getToolById: (id: string) => Tool | undefined
}

const DEFAULT_FILTERS: ToolFilters = {
  search: '',
  category: 'all',
  sortBy: 'popular',
}

export const useToolStore = create<ToolState>((set, get) => ({
  // Initial state
  tools: [],
  categories: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0,
  },
  filters: DEFAULT_FILTERS,

  // Actions
  setTools: (response) =>
    set({
      tools: response.data,
      pagination: {
        page: response.page,
        pageSize: response.pageSize,
        total: response.total,
        totalPages: response.totalPages,
      },
      isLoading: false,
      error: null,
    }),

  setCategories: (categories) => set({ categories }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error, isLoading: false }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 }, // Reset to page 1 when filters change
    })),

  setPage: (page) =>
    set((state) => ({
      pagination: { ...state.pagination, page },
    })),

  resetFilters: () =>
    set({
      filters: DEFAULT_FILTERS,
      pagination: { page: 1, pageSize: 12, total: 0, totalPages: 0 },
    }),

  getToolById: (id) => get().tools.find((tool) => tool.id === id),
}))
