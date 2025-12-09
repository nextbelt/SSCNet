import { useRouter } from 'next/router'
import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'

export default function VerifyEmail() {
  const router = useRouter()
  const { email } = router.query

  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
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
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 py-8 px-4 shadow-glass rounded-3xl sm:px-10 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Check your email</h2>
          <p className="text-secondary-600 mb-6">
            We've sent a verification link to{' '}
            {email && <strong>{email}</strong>}
          </p>
          <p className="text-sm text-secondary-500 mb-6">
            Click the link in the email to verify your account and complete registration.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
