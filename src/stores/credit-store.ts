import { create } from 'zustand'
import { UserCredit, Subscription } from '@/types'

interface CreditState {
  // Data
  credits: UserCredit | null
  subscription: Subscription | null
  isLoading: boolean
  error: string | null

  // Actions
  setCredits: (credits: UserCredit) => void
  setSubscription: (subscription: Subscription) => void
  deductCredits: (amount: number) => void
  addCredits: (amount: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  hasEnoughCredits: (amount: number) => boolean
  getTotalCredits: () => number
}

export const useCreditStore = create<CreditState>((set, get) => ({
  // Initial state
  credits: null,
  subscription: null,
  isLoading: false,
  error: null,

  // Actions
  setCredits: (credits) => set({ credits, isLoading: false, error: null }),

  setSubscription: (subscription) => set({ subscription }),

  deductCredits: (amount) =>
    set((state) => {
      if (!state.credits) return state

      // Deduct from bonus credits first, then from balance
      const bonusCredits = state.credits.bonusCredits || 0
      const newBonusCredits = Math.max(0, bonusCredits - amount)
      const remaining = amount - bonusCredits
      const newBalance = Math.max(
        0,
        state.credits.balance - Math.max(0, remaining)
      )

      return {
        credits: {
          ...state.credits,
          bonusCredits: newBonusCredits,
          balance: newBalance,
        },
      }
    }),

  addCredits: (amount) =>
    set((state) => {
      if (!state.credits) return state

      return {
        credits: {
          ...state.credits,
          bonusCredits: (state.credits.bonusCredits || 0) + amount,
        },
      }
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error, isLoading: false }),

  hasEnoughCredits: (amount) => {
    const total = get().getTotalCredits()
    return total >= amount
  },

  getTotalCredits: () => {
    const { credits } = get()
    if (!credits) return 0
    return credits.balance + (credits.bonusCredits || 0)
  },
}))
