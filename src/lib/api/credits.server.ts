import { UserCredit } from '@/types'
import { createClient } from '@/lib/supabase/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Server-side version of getCredits that properly authenticates
export async function getCreditsServer(): Promise<number> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.log('[getCreditsServer] No user found')
      return 0
    }

    console.log('[getCreditsServer] Fetching credits for user:', user.id)

    const response = await fetch(`${API_BASE_URL}/api/public/credits/balance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-ID': user.id,
      },
      cache: 'no-store', // Don't cache in server components
    })

    console.log('[getCreditsServer] API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[getCreditsServer] API error:', response.status, errorText)
      return 0
    }

    const result = await response.json()
    console.log('[getCreditsServer] API result:', result)

    if (result && result.data && typeof result.data.balance === 'number') {
      return result.data.balance
    }

    return 0
  } catch (error) {
    console.error('[getCreditsServer] Error:', error)
    return 0
  }
}
