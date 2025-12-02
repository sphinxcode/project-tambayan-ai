import { ApiResponse, PaginatedResponse } from '@/types'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options

  // Build URL with query parameters
  let url = `${API_BASE_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  // Set default headers
  const headers = new Headers(fetchOptions.headers)
  if (!headers.has('Content-Type') && fetchOptions.body) {
    headers.set('Content-Type', 'application/json')
  }

  // Add Supabase user ID header if user is authenticated
  if (typeof window !== 'undefined') {
    try {
      const { createClient } = await import('./supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        headers.set('X-User-ID', user.id)
      }
    } catch (error) {
      // Silently fail if Supabase client is not available
      console.warn('Failed to get Supabase user for API request:', error)
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include', // Include cookies for auth
    })

    // Parse response
    const data = await response.json()

    // Handle errors
    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.error || data.message || 'Request failed',
        data
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // Network or parsing errors
    throw new ApiError(
      0,
      error instanceof Error ? error.message : 'Network error occurred'
    )
  }
}

// HTTP method helpers
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
}

// Response unwrappers
export function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Request failed')
  }
  return response.data
}

export function unwrapPaginatedResponse<T>(
  response: PaginatedResponse<T>
): PaginatedResponse<T> {
  return response
}
