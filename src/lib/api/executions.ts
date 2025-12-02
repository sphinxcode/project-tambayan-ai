import { api } from '../api'
import { ToolUsage, PaginatedResponse } from '@/types'

// Get execution history
export async function getExecutions(params?: {
  page?: number
  pageSize?: number
  toolId?: string
  status?: string
}): Promise<PaginatedResponse<ToolUsage>> {
  const response = await api.get<PaginatedResponse<ToolUsage>>('/api/public/executions', {
    params: {
      page: params?.page || 1,
      pageSize: params?.pageSize || 10,
      toolId: params?.toolId,
      status: params?.status,
    },
  })
  return response
}

// Get single execution details
export async function getExecution(id: string): Promise<ToolUsage> {
  const response = await api.get<{ success: boolean; data: ToolUsage }>(`/api/public/executions/${id}`)
  return response.data
}
