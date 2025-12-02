import { api } from '../api'
import type {
  ScheduleConfigEntry,
  ScheduleExecution,
  ApiResponse,
} from '@/types'

export interface CreateScheduleInput {
  toolId: string
  name: string
  description?: string
  cronExpression: string
  inputData: Record<string, unknown>
}

export interface UpdateScheduleInput {
  name?: string
  description?: string
  cronExpression?: string
  inputData?: Record<string, unknown>
  isActive?: boolean
}

/**
 * Get all user's schedule configurations
 */
export async function getUserSchedules(toolId?: string): Promise<ScheduleConfigEntry[]> {
  const params: Record<string, string> = {}
  if (toolId) {
    params.toolId = toolId
  }

  const response = await api.get<ApiResponse<ScheduleConfigEntry[]>>('/api/public/schedules', { params })
  return response.data || []
}

/**
 * Get a single schedule configuration
 */
export async function getSchedule(id: string): Promise<ScheduleConfigEntry> {
  const response = await api.get<ApiResponse<ScheduleConfigEntry>>(`/api/public/schedules/${id}`)
  if (!response.data) {
    throw new Error('Schedule not found')
  }
  return response.data
}

/**
 * Create a new schedule configuration
 */
export async function createSchedule(input: CreateScheduleInput): Promise<ScheduleConfigEntry> {
  const response = await api.post<ApiResponse<ScheduleConfigEntry>>('/api/public/schedules', input)
  if (!response.data) {
    throw new Error('Failed to create schedule')
  }
  return response.data
}

/**
 * Update a schedule configuration
 */
export async function updateSchedule(id: string, input: UpdateScheduleInput): Promise<ScheduleConfigEntry> {
  const response = await api.patch<ApiResponse<ScheduleConfigEntry>>(`/api/public/schedules/${id}`, input)
  if (!response.data) {
    throw new Error('Failed to update schedule')
  }
  return response.data
}

/**
 * Delete a schedule configuration
 */
export async function deleteSchedule(id: string): Promise<void> {
  await api.delete(`/api/public/schedules/${id}`)
}

/**
 * Toggle schedule active status
 */
export async function toggleSchedule(id: string, isActive: boolean): Promise<ScheduleConfigEntry> {
  const response = await api.patch<ApiResponse<ScheduleConfigEntry>>(
    `/api/public/schedules/${id}/toggle`,
    { isActive }
  )
  if (!response.data) {
    throw new Error('Failed to toggle schedule')
  }
  return response.data
}

/**
 * Get execution history for a schedule
 */
export async function getScheduleExecutions(
  scheduleId: string,
  limit = 20
): Promise<ScheduleExecution[]> {
  const response = await api.get<ApiResponse<ScheduleExecution[]>>(
    `/api/public/schedules/${scheduleId}/executions?limit=${limit}`
  )
  return response.data || []
}
