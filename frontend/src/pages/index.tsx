import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle, BarChart3, ShieldCheck, Zap, Globe, Search, MessageSquare } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import CountUp from 'react-countup'

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 200])
  const y2 = useTransform(scrollY, [0, 500], [0, -150])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50 overflow-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-white/20 py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <span className="text-white font-bold text-lg">LP</span>
              </div>
              <h1 className={`text-xl font-bold tracking-tight transition-colors ${
                scrolled ? 'text-secondary-900' : 'text-secondary-900'
              }`}>
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
              <Link href="/auth/register" className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg shadow-primary-600/20 transition-all hover:scale-105 font-medium">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div 
            style={{ y: y1 }}
            className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-primary-200/40 to-purple-200/40 rounded-full blur-3xl opacity-60"
          />
          <motion.div 
            style={{ y: y2 }}
            className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-gradient-to-tr from-accent-200/40 to-orange-100/40 rounded-full blur-3xl opacity-60"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-white/50 backdrop-blur-sm mb-8 shadow-sm hover:shadow-md transition-shadow cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-secondary-600">AI-Powered Supply Chain Intelligence</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-secondary-900 mb-8 tracking-tight leading-[1.1]">
              Sourcing Intelligence <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-purple-600 to-accent-600 animate-gradient-x">
                Reimagined
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="mt-6 text-xl text-secondary-500 max-w-2xl mx-auto leading-relaxed">
              Connect with verified partners through AI-driven insights.
              Streamline your procurement process with real-time collaboration and smart matching.
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/auth/register" className="group px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-xl shadow-primary-600/20 transition-all hover:scale-105 font-semibold text-lg flex items-center justify-center gap-2">
                Start Free Trial 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/pricing" className="px-8 py-4 bg-white hover:bg-secondary-50 text-secondary-900 border border-secondary-200 rounded-full shadow-sm transition-all hover:scale-105 font-semibold text-lg">
                View Pricing
              </Link>
            </motion.div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-24 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {[
              {
                icon: <Zap className="w-6 h-6 text-primary-600" />,
                title: "Instant Matching",
                desc: "AI-driven supplier discovery that learns your preferences.",
                color: "bg-primary-100"
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-green-600" />,
                title: "Verified Partners",
                desc: "Every supplier is vetted through our rigorous 3-step process.",
                color: "bg-green-100"
              },
              {
                icon: <BarChart3 className="w-6 h-6 text-accent-600" />,
                title: "Smart Analytics",
                desc: "Real-time insights into your supply chain performance.",
                color: "bg-accent-100"
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl shadow-glass hover:shadow-glass-sm transition-all hover:-translate-y-2">
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-3">{feature.title}</h3>
                <p className="text-secondary-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-secondary-50/50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "Verified Companies", value: 2500, suffix: "+" },
              { label: "RFQs Processed", value: 10000, suffix: "+" },
              { label: "Verified POCs", value: 5000, suffix: "+" },
              { label: "Avg Response Time", value: 4.2, suffix: "h", decimals: 1 },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-secondary-900 mb-2 tracking-tight font-display">
                  <CountUp
                    end={stat.value}
                    duration={2.5}
                    decimals={stat.decimals || 0}
                    suffix={stat.suffix}
                    enableScrollSpy
                    scrollSpyOnce
                  />
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
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LP</span>
            </div>
            <span className="font-bold text-secondary-900 text-lg">LinkedProcurement</span>
          </div>
          <div className="flex gap-8 text-sm text-secondary-500 font-medium">
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