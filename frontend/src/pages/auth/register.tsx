import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ArrowRight, Loader2, Building2, User } from 'lucide-react'
import { signUp } from '@/lib/supabase'

export default function Register() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    company_name: '',
    user_type: 'buyer' as 'buyer' | 'supplier'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: signUpError } = await signUp(formData.email, formData.password, {
        full_name: formData.full_name,
        company_name: formData.company_name,
        user_type: formData.user_type
      })

      if (signUpError) {
        throw new Error(signUpError.message)
      }

      if (data.session) {
        // User was auto-confirmed, store token and redirect
        localStorage.setItem('access_token', data.session.access_token)
        localStorage.setItem('user_type', formData.user_type)

        if (formData.user_type === 'buyer') {
          router.push('/dashboard/buyer')
        } else {
          router.push('/dashboard/supplier')
        }
      } else if (data.user) {
        // Email confirmation required
        router.push('/auth/verify-email?email=' + encodeURIComponent(formData.email))
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration')
    } finally {
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
            Create your account
          </h2>
          <p className="mt-2 text-sm text-secondary-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-700 transition-colors">
              Sign in
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
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                I am a:
              </label>
              <div className="flex space-x-4">
                <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl cursor-pointer transition-all border ${formData.user_type === 'buyer'
                  ? 'bg-primary-50 border-primary-500 text-primary-700 ring-1 ring-primary-500'
                  : 'bg-secondary-50 border-secondary-200 text-secondary-600 hover:bg-secondary-100'
                  }`}>
                  <input
                    type="radio"
                    value="buyer"
                    checked={formData.user_type === 'buyer'}
                    onChange={(e) => setFormData({ ...formData, user_type: 'buyer' })}
                    className="sr-only"
                  />
                  <User className={`w-4 h-4 ${formData.user_type === 'buyer' ? 'text-primary-600' : 'text-secondary-400'}`} />
                  <span className="font-medium">Buyer</span>
                </label>
                <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl cursor-pointer transition-all border ${formData.user_type === 'supplier'
                  ? 'bg-primary-50 border-primary-500 text-primary-700 ring-1 ring-primary-500'
                  : 'bg-secondary-50 border-secondary-200 text-secondary-600 hover:bg-secondary-100'
                  }`}>
                  <input
                    type="radio"
                    value="supplier"
                    checked={formData.user_type === 'supplier'}
                    onChange={(e) => setFormData({ ...formData, user_type: 'supplier' })}
                    className="sr-only"
                  />
                  <Building2 className={`w-4 h-4 ${formData.user_type === 'supplier' ? 'text-primary-600' : 'text-secondary-400'}`} />
                  <span className="font-medium">Supplier</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-secondary-700 mb-1.5">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="appearance-none block w-full px-4 py-3 bg-secondary-50 border border-secondary-200 text-secondary-900 rounded-xl placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                placeholder="John Doe"
              />
            </div>

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
              <label htmlFor="company_name" className="block text-sm font-medium text-secondary-700 mb-1.5">
                Company Name
              </label>
              <input
                id="company_name"
                name="company_name"
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="appearance-none block w-full px-4 py-3 bg-secondary-50 border border-secondary-200 text-secondary-900 rounded-xl placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                placeholder="Acme Inc."
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
                autoComplete="new-password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="appearance-none block w-full px-4 py-3 bg-secondary-50 border border-secondary-200 text-secondary-900 rounded-xl placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                placeholder="••••••••"
              />
              <p className="mt-1.5 text-xs text-secondary-500">At least 8 characters</p>
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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
