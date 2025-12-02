'use client'

import { useCredits } from '@/hooks'

/**
 * Client component that initializes the credit store
 * by fetching credits from the API on mount.
 *
 * This must be used within the dashboard layout to ensure
 * the credit store is populated before tools try to check credits.
 */
export function CreditProvider({ children }: { children: React.ReactNode }) {
  // This hook automatically fetches and initializes the credit store
  useCredits()

  return <>{children}</>
}
