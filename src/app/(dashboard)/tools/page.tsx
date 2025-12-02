'use client'

import { useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { ToolGrid, SearchBar, CategoryPills, Pagination } from '@/components/tools'
import { useToolStore } from '@/stores'
import { getTools, getCategories } from '@/lib/api/tools'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function ToolsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const {
    tools,
    categories,
    isLoading,
    pagination,
    filters,
    setTools,
    setCategories,
    setLoading,
    setError,
    setFilters,
    setPage,
  } = useToolStore()

  // Initialize filters from URL params
  useEffect(() => {
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || 'all'
    const sortBy = (searchParams.get('sortBy') as 'popular' | 'newest' | 'rating' | 'uses') || 'popular'
    const page = parseInt(searchParams.get('page') || '1', 10)

    setFilters({ search, category, sortBy })
    setPage(page)
  }, [searchParams, setFilters, setPage])

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const cats = await getCategories()
        setCategories(cats)
      } catch (err) {
        console.error('Failed to fetch categories:', err)
        // Set empty array as fallback to prevent crashes
        setCategories([])
      }
    }
    fetchCategories()
  }, [setCategories])

  // Fetch tools when filters change
  useEffect(() => {
    async function fetchTools() {
      setLoading(true)
      try {
        const response = await getTools({
          page: pagination.page,
          pageSize: pagination.pageSize,
          search: filters.search || undefined,
          category: filters.category !== 'all' ? filters.category : undefined,
          sortBy: filters.sortBy,
        })
        setTools(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tools')
      }
    }
    fetchTools()
  }, [filters, pagination.page, pagination.pageSize, setTools, setLoading, setError])

  // Update URL when filters change
  const updateUrl = useCallback(
    (newFilters: Partial<typeof filters & { page?: number }>) => {
      const params = new URLSearchParams()
      const search = newFilters.search ?? filters.search
      const category = newFilters.category ?? filters.category
      const sortBy = newFilters.sortBy ?? filters.sortBy
      const page = newFilters.page ?? pagination.page

      if (search) params.set('search', search)
      if (category && category !== 'all') params.set('category', category)
      if (sortBy && sortBy !== 'popular') params.set('sortBy', sortBy)
      if (page > 1) params.set('page', page.toString())

      const queryString = params.toString()
      router.push(`/tools${queryString ? `?${queryString}` : ''}`, { scroll: false })
    },
    [filters, pagination.page, router]
  )

  const handleSearchChange = (search: string) => {
    setFilters({ search })
    updateUrl({ search, page: 1 })
  }

  const handleCategoryChange = (category: string) => {
    setFilters({ category })
    updateUrl({ category, page: 1 })
  }

  const handleSortChange = (sortBy: 'popular' | 'newest' | 'rating' | 'uses') => {
    setFilters({ sortBy })
    updateUrl({ sortBy, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setPage(page)
    updateUrl({ page })
  }

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Tools</h1>
          <p className="text-muted-foreground">
            Browse and run our collection of AI-powered automation tools
          </p>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col gap-4">
          {/* Search and Sort Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchBar
              value={filters.search}
              onChange={handleSearchChange}
              className="flex-1"
              placeholder="Search tools by name or description..."
            />
            <Select value={filters.sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="uses">Most Used</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Pills */}
          <CategoryPills
            categories={categories}
            selectedCategory={filters.category}
            onCategoryChange={handleCategoryChange}
          />
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {isLoading
              ? 'Loading tools...'
              : `Showing ${tools.length} of ${pagination.total} tools`}
          </span>
          {filters.search && (
            <span>
              Results for &quot;{filters.search}&quot;
            </span>
          )}
        </div>

        {/* Tool Grid */}
        <ToolGrid tools={tools} isLoading={isLoading} />

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          className="mt-4"
        />
      </div>
    </>
  )
}

export default function ToolsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ToolsPageContent />
    </Suspense>
  )
}
