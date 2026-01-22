'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleCallback = async () => {
      // With implicit flow, the session is automatically detected
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Auth error:', error)
        router.push('/login?error=' + encodeURIComponent(error.message))
      } else if (session) {
        router.push('/app')
      } else {
        router.push('/login')
      }
    }

    handleCallback()
  }, [router, supabase.auth])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold">מתחבר...</h2>
        <p className="text-gray-600 mt-2">אנא המתן</p>
      </div>
    </div>
  )
}
