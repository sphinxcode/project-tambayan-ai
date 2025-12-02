import { api } from '../api'
import { UserCredit, Subscription, DashboardStats, UsageStats, CreditTransaction } from '@/types'
import { createClient } from '@/lib/supabase/client'

// Get current credit balance - Query Supabase directly
export async function getCredits(): Promise<UserCredit> {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Query user_credits table
  const { data, error } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch credits: ${error.message}`)
  }

  if (!data) {
    throw new Error('No credit data found for user')
  }

  // Map database fields to UserCredit type
  return {
    id: data.id,
    userId: data.user_id,
    balance: data.balance || 0,
    bonusCredits: 0, // Database doesn't have this field yet
    updatedAt: data.updated_at,
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

// Get dashboard statistics - Query Supabase directly
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Get current month start
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // Query tool_usage for this month's stats
  const { data: usageData, error: usageError } = await supabase
    .from('tool_usage')
    .select('id, credits_used')
    .eq('user_id', user.id)
    .gte('created_at', monthStart.toISOString())

  if (usageError) {
    console.error('Error fetching usage stats:', usageError)
  }

  // Query total active tools count
  const { count: toolsCount, error: toolsError } = await supabase
    .from('tools')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  if (toolsError) {
    console.error('Error fetching tools count:', toolsError)
  }

  const toolsRunThisMonth = usageData?.length || 0
  const creditsUsedThisMonth = usageData?.reduce((sum, item) => sum + (item.credits_used || 0), 0) || 0

  return {
    toolsRunThisMonth,
    creditsUsedThisMonth,
    availableTools: toolsCount || 0,
  }
}
