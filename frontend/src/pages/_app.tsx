import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'
import { Inter, Outfit } from 'next/font/google'
import CookieConsent from '../components/CookieConsent'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>LinkedProcurement - B2B Supply Chain Sourcing Platform</title>
        <meta name="description" content="Connect with verified suppliers and streamline your procurement process. B2B supply chain sourcing platform with LinkedIn integration." />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://linkedprocurement.com/" />
        <meta property="og:title" content="LinkedProcurement - B2B Supply Chain Sourcing Platform" />
        <meta property="og:description" content="Connect with verified suppliers and streamline your procurement process. B2B supply chain sourcing platform with LinkedIn integration." />
        <meta property="og:image" content="https://linkedprocurement.com/og-image.png" />
        <meta property="og:site_name" content="LinkedProcurement" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://linkedprocurement.com/" />
        <meta name="twitter:title" content="LinkedProcurement - B2B Supply Chain Sourcing Platform" />
        <meta name="twitter:description" content="Connect with verified suppliers and streamline your procurement process. B2B supply chain sourcing platform with LinkedIn integration." />
        <meta name="twitter:image" content="https://linkedprocurement.com/og-image.png" />
      </Head>
      <main className={`${inter.variable} ${outfit.variable} font-sans`}>
        <Component {...pageProps} />
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.8)',
            color: '#0f172a',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <CookieConsent />
    </QueryClientProvider>
  )
}

export default MyApp