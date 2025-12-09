import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ArrowRight, Loader2 } from 'lucide-react'
import { signIn, signInWithLinkedIn } from '@/lib/supabase'

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: signInError } = await signIn(formData.email, formData.password)

      if (signInError) {
        throw new Error(signInError.message)
      }

      if (data.session) {
        // Store the session token for API calls
        localStorage.setItem('access_token', data.session.access_token)
        localStorage.setItem('user_type', data.user?.user_metadata?.user_type || 'buyer')

        // Redirect based on user type
        const userType = data.user?.user_metadata?.user_type || 'buyer'
        if (userType === 'buyer') {
          router.push('/dashboard/buyer')
        } else {
          router.push('/dashboard/supplier')
        }
      }
    } catch (err: any) {
      console.error('Login exception:', err)
      setError(err.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const handleLinkedInLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const { error: oauthError } = await signInWithLinkedIn()
      if (oauthError) {
        throw new Error(oauthError.message)
      }
      // OAuth will redirect to callback URL
    } catch (err: any) {
      setError(err.message || 'LinkedIn login failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-200/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-200/20 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 cursor-pointer hover:opacity-80 transition-opacity group">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-lg">LP</span>
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">
            LinkedProcurement
          </h1>
        </Link>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-secondary-900 tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-secondary-500">
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-medium text-primary-600 hover:text-primary-700 transition-colors">
              Create one now
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 py-8 px-4 shadow-glass rounded-3xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="appearance-none block w-full px-4 py-3 bg-secondary-50 border border-secondary-200 text-secondary-900 rounded-xl placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="appearance-none block w-full px-4 py-3 bg-secondary-50 border border-secondary-200 text-secondary-900 rounded-xl placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-end">
              <Link href="/auth/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                Forgot your password?
              </Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-600/20 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/50 backdrop-blur-sm text-secondary-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleLinkedInLogin}
                disabled={loading}
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-secondary-200 rounded-xl shadow-sm bg-white text-sm font-medium text-secondary-700 hover:bg-secondary-50 hover:border-secondary-300 transition-all disabled:opacity-50"
              >
                <svg className="w-5 h-5 mr-2 text-[#0077b5]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
