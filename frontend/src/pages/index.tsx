import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle, BarChart3, ShieldCheck, Zap } from 'lucide-react'

export default function Home() {
  const [stats] = useState({
    companies: "2,500+",
    rfqs: "10,000+",
    verified_pocs: "5,000+",
    avg_response_time: "4.2 hours"
  })

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/20">
                <span className="text-white font-bold text-sm">LP</span>
              </div>
              <h1 className="text-xl font-bold text-secondary-900 tracking-tight">
                LinkedProcurement
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/pricing" className="text-secondary-600 hover:text-primary-600 transition-colors font-medium">
                Pricing
              </Link>
              <Link href="/auth/login" className="text-secondary-600 hover:text-primary-600 transition-colors font-medium">
                Sign in
              </Link>
              <Link href="/auth/register" className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg shadow-primary-600/20 transition-all hover:scale-105 font-medium">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-200/30 rounded-full blur-3xl opacity-50 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-200/30 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-white/50 backdrop-blur-sm mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-medium text-secondary-600">AI-Powered Supply Chain Intelligence</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold text-secondary-900 mb-6 tracking-tight leading-tight">
            Sourcing Intelligence <br />
            <span className="text-gradient">Reimagined for Growth</span>
          </h1>

          <p className="mt-6 text-xl text-secondary-500 max-w-2xl mx-auto leading-relaxed">
            Connect with verified partners through AI-driven insights.
            Streamline your procurement process with real-time collaboration and smart matching.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth/register" className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-xl shadow-primary-600/20 transition-all hover:scale-105 font-semibold text-lg flex items-center justify-center gap-2">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/pricing" className="px-8 py-4 bg-white hover:bg-secondary-50 text-secondary-900 border border-secondary-200 rounded-full shadow-sm transition-all hover:scale-105 font-semibold text-lg">
              View Pricing
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="mt-20 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="group p-8 bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl shadow-glass hover:shadow-glass-sm transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-secondary-900 mb-3">For Buyers</h3>
              <p className="text-secondary-500 mb-6">Instantly discover verified suppliers with our AI matching engine.</p>
              <Link href="/dashboard/post-rfq" className="text-primary-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                Post Requirements <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="group p-8 bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl shadow-glass hover:shadow-glass-sm transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-accent-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-accent-600" />
              </div>
              <h3 className="text-2xl font-bold text-secondary-900 mb-3">For Suppliers</h3>
              <p className="text-secondary-500 mb-6">Access high-value RFQs and grow your business with smart insights.</p>
              <Link href="/dashboard/supplier" className="text-accent-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                Browse Opportunities <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Verified Companies", value: stats.companies },
              { label: "RFQs Processed", value: stats.rfqs },
              { label: "Verified POCs", value: stats.verified_pocs },
              { label: "Avg Response Time", value: stats.avg_response_time },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-secondary-900 mb-2 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-secondary-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-secondary-50 border-t border-secondary-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">LP</span>
            </div>
            <span className="font-bold text-secondary-900">LinkedProcurement</span>
          </div>
          <div className="flex gap-8 text-sm text-secondary-500">
            <Link href="/privacy" className="hover:text-primary-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary-600 transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-primary-600 transition-colors">Contact</Link>
          </div>
          <div className="text-sm text-secondary-400">
            © 2025 LinkedProcurement.
          </div>
        </div>
      </footer>
    </div>
  )
}