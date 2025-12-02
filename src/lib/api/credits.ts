import { api } from '../api'
import { UserCredit, Subscription, DashboardStats, UsageStats, CreditTransaction } from '@/types'

// Get current credit balance (PUBLIC ROUTE)
export async function getCredits(): Promise<UserCredit> {
  try {
    const response = await api.get<{ success: boolean; data: UserCredit }>('/api/public/credits/balance')
    console.log('[getCredits] Raw API response:', response)

    if (!response || !response.data) {
      throw new Error('Invalid response from credits API')
    }

    return response.data
  } catch (error) {
    console.error('[getCredits] Error fetching credits:', error)
    throw error
  }
}

// Get credit transaction history
export async function getCreditHistory(
  params?: {
    page?: number
    pageSize?: number
  }
): Promise<{ data: CreditTransaction[]; total: number }> {
  return api.get('/api/credits/history', { params })
}

// Purchase credit pack
export async function purchaseCredits(
  packId: string
): Promise<{ checkoutUrl: string }> {
  return api.post('/api/credits/purchase', { packId })
}

// Get current subscription
export async function getSubscription(): Promise<Subscription | null> {
  const response = await api.get<{ success: boolean; data: Subscription | null }>('/api/public/subscription')
  return response.data
}

// Get usage statistics
export async function getUsageStats(): Promise<UsageStats> {
  const response = await api.get<{ success: boolean; data: UsageStats }>('/api/public/usage/stats')
  return response.data || {
    daily: [],
    weekly: [],
    monthly: []
  }
}

// Get dashboard statistics (PUBLIC ROUTE)
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<{ success: boolean; data: DashboardStats }>('/api/public/stats')
  return response.data
}
