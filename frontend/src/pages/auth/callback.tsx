import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (session) {
          // Store token
          localStorage.setItem('access_token', session.access_token)
          const userType = session.user?.user_metadata?.user_type || 'buyer'
          localStorage.setItem('user_type', userType)

          // Redirect based on user type
          if (userType === 'buyer') {
            router.push('/dashboard/buyer')
          } else {
            router.push('/dashboard/supplier')
          }
        } else {
          // No session, redirect to login
          router.push('/auth/login')
        }
      } catch (err: any) {
        console.error('Auth callback error:', err)
        setError(err.message || 'Authentication failed')
        setTimeout(() => router.push('/auth/login'), 3000)
      }
    }

    handleCallback()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <p className="text-secondary-500">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-secondary-600">Completing authentication...</p>
      </div>
    </div>
  )
}
