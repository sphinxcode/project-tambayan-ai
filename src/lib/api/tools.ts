import { api } from '../api'
import { Tool, PaginatedResponse, ToolCategory, ToolUsage } from '@/types'
import { createClient } from '@/lib/supabase/client'

export interface GetToolsParams extends Record<string, string | number | boolean | undefined> {
  page?: number
  pageSize?: number
  search?: string
  category?: string
  sortBy?: string
}

export interface ExecuteToolParams {
  inputs: Record<string, unknown>
}

export interface ExecuteToolResponse {
  success: boolean
  result: unknown
  creditsUsed: number
  executionId: string
}

// Get paginated tools (PUBLIC ROUTE)
export async function getTools(
  params: GetToolsParams = {}
): Promise<PaginatedResponse<Tool>> {
  // Backend returns { success: true, data: Tool[] } without pagination
  // We need to transform it into a PaginatedResponse
  const response = await api.get<{ success: boolean; data: Tool[] }>(
    '/api/public/tools',
    { params }
  )

  // Transform to paginated format (client-side pagination)
  const page = params.page || 1
  const pageSize = params.pageSize || 12
  const allTools = response.data || []
  const total = allTools.length
  const totalPages = Math.ceil(total / pageSize)

  // Client-side filtering and sorting
  let filteredTools = [...allTools]

  // Filter by search
  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filteredTools = filteredTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(searchLower) ||
        tool.description.toLowerCase().includes(searchLower)
    )
  }

  // Filter by category
  if (params.category && params.category !== 'all') {
    filteredTools = filteredTools.filter((tool) =>
      tool.categories?.some((cat) => cat.slug === params.category)
    )
  }

  // Sort
  if (params.sortBy) {
    switch (params.sortBy) {
      case 'newest':
        filteredTools.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
      case 'popular':
        filteredTools.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
        break
      case 'rating':
        filteredTools.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
        break
      case 'uses':
        filteredTools.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
        break
    }
  }

  // Paginate
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedTools = filteredTools.slice(startIndex, endIndex)

  return {
    data: paginatedTools,
    page,
    pageSize,
    total: filteredTools.length,
    totalPages: Math.ceil(filteredTools.length / pageSize),
  }
}

// Get single tool by ID (PUBLIC ROUTE)
export async function getToolById(id: string): Promise<Tool> {
  // Backend returns { success: true, data: Tool }
  const response = await api.get<{ success: boolean; data: Tool }>(
    `/api/public/tools/${id}`
  )
  return response.data
}

// Get tool categories (PUBLIC ROUTE)
export async function getCategories(): Promise<ToolCategory[]> {
  const response = await api.get<{ success: boolean; data: ToolCategory[] }>('/api/public/tools/categories')
  return response.data || []
}

// Search tools (PUBLIC ROUTE)
export async function searchTools(query: string): Promise<Tool[]> {
  const response = await api.get<{ success: boolean; data: Tool[] }>('/api/public/tools/search', {
    params: { q: query },
  })
  return response.data || []
}

// Execute a tool (PUBLIC ROUTE - form-based)
export async function executeTool(
  toolId: string,
  params: ExecuteToolParams
): Promise<ExecuteToolResponse> {
  return api.post<ExecuteToolResponse>(`/api/public/tools/${toolId}/execute`, params)
}

// Get tool ratings/reviews (PUBLIC ROUTE)
export async function getToolRatings(toolId: string) {
  return api.get(`/api/public/tools/${toolId}/ratings`)
}

// Get recent executions - Query Supabase directly
export async function getRecentExecutions(limit: number = 10): Promise<ToolUsage[]> {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Query tool_usage with tools joined
  const { data, error } = await supabase
    .from('tool_usage')
    .select(`
      id,
      user_id,
      tool_id,
      credits_used,
      status,
      request_payload,
      response_data,
      execution_time_ms,
      created_at,
      tools (
        id,
        name,
        description,
        type,
        credit_cost,
        is_active,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch recent executions: ${error.message}`)
  }

  // Map database results to ToolUsage type
  return (data || []).map((item: any) => ({
    id: item.id,
    userId: item.user_id,
    toolId: item.tool_id,
    tool: item.tools ? {
      id: item.tools.id,
      name: item.tools.name,
      description: item.tools.description || '',
      creditCost: item.tools.credit_cost || 0,
      type: item.tools.type,
      isActive: item.tools.is_active,
      createdAt: item.tools.created_at,
    } : undefined,
    creditsUsed: item.credits_used,
    status: item.status,
    requestPayload: item.request_payload,
    responseData: item.response_data,
    executionTimeMs: item.execution_time_ms,
    createdAt: item.created_at,
  }))
}
