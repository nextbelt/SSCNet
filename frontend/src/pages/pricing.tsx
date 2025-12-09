import React, { useState } from 'react';
import { Check, Zap, Crown, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface PricingTier {
  name: string;
  tier: 'free' | 'pro' | 'premium';
  price: number;
  billing: 'monthly' | 'annual';
  description: string;
  icon: React.ReactNode;
  features: string[];
  limitations?: string[];
  cta: string;
  highlighted?: boolean;
  color: string;
}

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const pricingTiers: PricingTier[] = [
    {
      name: 'Free',
      tier: 'free',
      price: 0,
      billing: 'monthly',
      description: 'Perfect for getting started and testing the platform',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-[#f5f5f7] to-[#fbfbfd]',
      features: [
        'Post up to 3 RFQs per month',
        'Respond to up to 10 RFQs per month',
        'Basic company profile',
        'Standard search functionality',
        'Email notifications',
        'Community support',
        '7-day message history'
      ],
      limitations: [
        'Limited analytics',
        'No priority support',
        'Basic search filters'
      ],
      cta: 'Get Started Free'
    },
    {
      name: 'Pro',
      tier: 'pro',
      price: billingCycle === 'monthly' ? 99 : 948,
      billing: billingCycle,
      description: 'For growing businesses scaling their sourcing operations',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-[#0071e3] to-[#0077ed]',
      highlighted: true,
      features: [
        'Post up to 50 RFQs per month',
        'Unlimited RFQ responses',
        'Enhanced company profile with certifications',
        'Advanced search and filtering',
        'Priority email notifications',
        'Real-time messaging',
        'Advanced analytics dashboard',
        'Buyer profile access on accepted responses',
        'Export data to CSV/Excel',
        'Priority support (24hr response)',
        'Custom company branding',
        'Unlimited message history',
        'API access (coming soon)'
      ],
      cta: 'Start Pro Trial'
    },
    {
      name: 'Premium',
      tier: 'premium',
      price: billingCycle === 'monthly' ? 299 : 2868,
      billing: billingCycle,
      description: 'Enterprise-grade solution for maximum efficiency',
      icon: <Crown className="w-6 h-6" />,
      color: 'from-[#fbfbfd] via-[#0071e3] to-[#0077ed]',
      features: [
        'Unlimited RFQs',
        'Unlimited responses',
        'Premium company showcase profile',
        'AI-powered supplier matching',
        'Dedicated account manager',
        'White-label options',
        'Custom integrations',
        'Advanced analytics & reporting',
        'Market trend insights',
        'RFQ templates and automation',
        'Multi-user team accounts',
        'SSO (Single Sign-On)',
        'Priority support (1hr response)',
        'Onboarding & training sessions',
        'Custom API limits',
        'Early access to new features'
      ],
      cta: 'Contact Sales'
    }
  ];

  const handleSelectPlan = async (tier: 'free' | 'pro' | 'premium') => {
    setIsLoading(tier);
    
    if (tier === 'free') {
      // Redirect to signup with free tier
      router.push('/auth/register?plan=free');
    } else if (tier === 'premium') {
      // Redirect to contact sales
      router.push('/contact-sales');
    } else {
      // Redirect to checkout for pro tier
      try {
        // TODO: Call backend API to create Stripe checkout session
        const response = await fetch('http://localhost:8001/api/v1/billing/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({
            tier: 'pro',
            billing_cycle: billingCycle
          })
        });

        if (response.ok) {
          const { checkout_url } = await response.json();
          window.location.href = checkout_url;
        } else {
          // If not authenticated, redirect to login
          router.push(`/auth/login?redirect=/pricing&plan=pro&cycle=${billingCycle}`);
        }
      } catch (error) {
        console.error('Error creating checkout session:', error);
        // Fallback to login
        router.push(`/auth/login?redirect=/pricing&plan=pro&cycle=${billingCycle}`);
      }
    }
    
    setIsLoading(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-[#d2d2d7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[#0071e3] to-[#0077ed] rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-sm">LP</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#0071e3] to-[#0077ed] bg-clip-text text-transparent">LinkedProcurement</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-[#6e6e73] hover:text-[#0071e3] transition-colors">
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-[#0071e3]/90 backdrop-blur-sm text-white rounded-lg font-medium hover:shadow-md transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-[#1d1d1f] mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-[#6e6e73] mb-8 max-w-2xl mx-auto">
            Choose the perfect plan for your business. All plans include our core features.
            Upgrade, downgrade, or cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white rounded-lg p-1 border border-[#d2d2d7]">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[#0071e3]/90 backdrop-blur-sm text-white shadow-sm'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-md transition-all relative ${
                billingCycle === 'annual'
                  ? 'bg-[#0071e3]/90 backdrop-blur-sm text-white shadow-sm'
                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-[#0071e3]/90 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingTiers.map((tier) => (
            <div
              key={tier.tier}
              className={`relative rounded-2xl bg-white border-2 p-8 transition-all hover:scale-105 ${
                tier.highlighted
                  ? 'border-[#0071e3] shadow-2xl shadow-[#0071e3]/30'
                  : 'border-[#d2d2d7] hover:border-[#0071e3]/50'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#0071e3]/90 backdrop-blur-sm text-white text-sm font-semibold px-4 py-1 rounded-full shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Icon & Name */}
              <div className="mb-6">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${tier.color} mb-4 ${tier.highlighted ? 'shadow-sm' : ''}`}>
                  <div className={tier.highlighted ? 'text-black' : 'text-black'}>
                    {tier.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-[#1d1d1f] mb-2">{tier.name}</h3>
                <p className="text-[#6e6e73] text-sm">{tier.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-[#1d1d1f]">
                    ${tier.price}
                  </span>
                  {tier.price > 0 && (
                    <span className="text-[#6e6e73] ml-2">
                      /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  )}
                </div>
                {tier.price > 0 && billingCycle === 'annual' && (
                  <p className="text-sm text-[#6e6e73] mt-1">
                    ${(tier.price / 12).toFixed(0)}/month billed annually
                  </p>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(tier.tier)}
                disabled={isLoading === tier.tier}
                className={`w-full py-3 rounded-lg font-semibold mb-6 transition-all flex items-center justify-center space-x-2 ${
                  tier.highlighted
                    ? 'bg-[#0071e3]/90 backdrop-blur-sm text-white hover:shadow-md'
                    : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed] border border-[#d2d2d7]'
                }`}
              >
                {isLoading === tier.tier ? (
                  <span>Loading...</span>
                ) : (
                  <>
                    <span>{tier.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Features */}
              <div className="space-y-3">
                {tier.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-[#0071e3] flex-shrink-0 mt-0.5" />
                    <span className="text-[#6e6e73] text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Limitations (for Free tier) */}
              {tier.limitations && (
                <div className="mt-6 pt-6 border-t border-[#d2d2d7]">
                  <p className="text-[#6e6e73] text-xs mb-3">Not included:</p>
                  {tier.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-start space-x-3 mb-2">
                      <span className="text-[#6e6e73]/70 text-sm">• {limitation}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl border border-[#d2d2d7] p-8">
          <h2 className="text-3xl font-bold text-[#1d1d1f] mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">
                Can I switch plans anytime?
              </h3>
              <p className="text-[#6e6e73]">
                Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect at the start of your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-[#6e6e73]">
                We accept all major credit cards (Visa, Mastercard, Amex) and bank transfers for annual plans via Stripe.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">
                Is there a free trial for paid plans?
              </h3>
              <p className="text-[#6e6e73]">
                Yes! Pro plans include a 14-day free trial. No credit card required for the Free plan.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">
                What happens if I exceed my limits?
              </h3>
              <p className="text-[#6e6e73]">
                You'll receive a notification when approaching your limits. Upgrade anytime to unlock more capacity.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-[#6e6e73]">
                We offer a 30-day money-back guarantee on all paid plans. No questions asked.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">
                Need a custom plan?
              </h3>
              <p className="text-[#6e6e73]">
                Contact our sales team for enterprise pricing with custom features, dedicated support, and volume discounts.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="mt-16 text-center">
          <p className="text-[#6e6e73] mb-4">Trusted by leading manufacturers and suppliers worldwide</p>
          <div className="flex items-center justify-center space-x-8 text-[#0071e3]">
            <span>🔒 SOC 2 Compliant</span>
            <span>💳 Secure Payments</span>
            <span>🌐 99.9% Uptime</span>
            <span>🛡GDPR Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
