import { useState, useEffect, useCallback } from 'react'
import { useCreditStore } from '@/stores'
import {
  getCredits,
  getSubscription,
  getCreditHistory,
  getUsageStats,
} from '@/lib/api/credits'
import { CreditTransaction, UsageStats } from '@/types'

export function useCredits() {
  const {
    credits,
    subscription,
    isLoading,
    error,
    setCredits,
    setSubscription,
    deductCredits,
    addCredits,
    setLoading,
    setError,
    hasEnoughCredits,
    getTotalCredits,
  } = useCreditStore()

  // Fetch credits and subscription on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch credits (required)
        const creditsData = await getCredits()
        setCredits(creditsData)

        // Fetch subscription (optional - may not be implemented yet)
        try {
          const subscriptionData = await getSubscription()
          if (subscriptionData) {
            setSubscription(subscriptionData)
          }
        } catch (subError) {
          // Silently ignore subscription errors - feature may not be implemented
          console.warn('Subscription endpoint not available:', subError)
        }

        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch credits')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [setCredits, setSubscription, setLoading, setError])

  // Refresh credits
  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const creditsData = await getCredits()
      setCredits(creditsData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh credits')
    } finally {
      setLoading(false)
    }
  }, [setCredits, setLoading, setError])

  // Get total available credits
  const totalCredits = getTotalCredits()

  return {
    credits,
    subscription,
    totalCredits,
    isLoading,
    error,
    hasEnoughCredits,
    deductCredits,
    addCredits,
    refresh,
  }
}

// Hook for credit history
export function useCreditHistory() {
  const [history, setHistory] = useState<CreditTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getCreditHistory()
      setHistory(data.data)
      setError(null)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch credit history'
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { history, isLoading, error, refresh: fetchHistory }
}

// Hook for usage statistics
export function useUsageStats() {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getUsageStats()
      setStats(data)
      setError(null)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch usage stats'
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, isLoading, error, refresh: fetchStats }
}
