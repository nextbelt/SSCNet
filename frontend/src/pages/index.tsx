import { useState } from 'react'

export default function Home() {
  const [stats] = useState({
    companies: "2,500+",
    rfqs: "10,000+",
    verified_pocs: "5,000+",
    avg_response_time: "4.2 hours"
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gradient">SSCN</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/auth/login" className="text-gray-500 hover:text-gray-700">
                Sign in
              </a>
              <a href="/auth/register" className="btn-primary">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">B2B Supply Chain</span>{' '}
                  <span className="block text-gradient xl:inline">Sourcing Platform</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Connect with verified suppliers through LinkedIn-authenticated points of contact. 
                  Streamline your sourcing process with real-time RFQ management and AI-powered matching.
                </p>
                
                {/* Buyer Section */}
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">For Buyers:</h2>
                  <div className="flex gap-3 mb-6">
                    <div className="rounded-md shadow">
                      <a href="/dashboard/post-rfq" className="btn-primary btn-lg">
                        📝 Post Requirements →
                      </a>
                    </div>
                    <div>
                      <a href="/dashboard/buyer" className="btn-secondary btn-lg">
                        🔍 Find Suppliers
                      </a>
                    </div>
                  </div>
                </div>

                {/* Supplier Section */}
                <div className="mt-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">For Suppliers:</h2>
                  <div className="rounded-md shadow">
                    <a href="/dashboard/supplier" className="btn-primary btn-lg bg-green-600 hover:bg-green-700">
                      🎯 Browse RFQ Opportunities →
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-700" style={{backgroundColor: 'var(--primary-700)'}}>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Trusted by Industry Leaders
            </h2>
            <p className="mt-3 text-xl text-blue-200 sm:mt-4">
              Join thousands of companies streamlining their supply chain operations
            </p>
          </div>
          <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-4 sm:gap-8">
            <div className="flex flex-col">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                Verified Companies
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">
                {stats.companies}
              </dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                RFQs Processed
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">
                {stats.rfqs}
              </dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                Verified POCs
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">
                {stats.verified_pocs}
              </dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-blue-200">
                Avg Response Time
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">
                {stats.avg_response_time}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gradient">SSCN</h3>
            <p className="mt-2 text-gray-500">
              Sourcing Supply Chain Net - Connecting verified suppliers worldwide
            </p>
            <div className="mt-4 space-x-6">
              <a href="/privacy" className="text-gray-400 hover:text-gray-500">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-400 hover:text-gray-500">
                Terms of Service
              </a>
              <a href="/contact" className="text-gray-400 hover:text-gray-500">
                Contact
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              © 2024 Sourcing Supply Chain Net. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}