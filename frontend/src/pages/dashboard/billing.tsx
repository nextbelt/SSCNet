import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Calendar,
  TrendingUp,
  Download,
  AlertCircle,
  Check,
  ArrowRight,
  Zap,
  Crown,
  Sparkles,
  Bell,
  User,
  ChevronDown,
  Settings,
  Building2,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { dashboardTheme } from '@/styles/dashboardTheme';

interface Subscription {
  id: string;
  tier: 'free' | 'pro' | 'premium';
  status: 'active' | 'cancelled' | 'past_due';
  billing_cycle: 'monthly' | 'annual';
  price_amount: number;
  current_period_start: string;
  current_period_end: string;
  cancelled_at?: string;
  rfq_limit: number | null;
  rfqs_posted_this_month: number;
  response_limit: number | null;
  responses_sent_this_month: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  period_start: string;
  period_end: string;
  paid_at?: string;
  invoice_pdf_url?: string;
}

interface PaymentMethod {
  id: string;
  type: 'card';
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
}

export default function BillingPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_type');
    router.push('/auth/login');
  };

  const fetchBillingData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Fetch subscription data
      const subResponse = await fetch('/api/billing/subscription', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (subResponse.ok) {
        const subData = await subResponse.json();
        setSubscription(subData);
      }

      // Fetch invoices
      const invResponse = await fetch('/api/billing/invoices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (invResponse.ok) {
        const invData = await invResponse.json();
        setInvoices(invData || []);
      }

      // Fetch payment method
      const pmResponse = await fetch('/api/billing/payment-method', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (pmResponse.ok) {
        const pmData = await pmResponse.json();
        setPaymentMethod(pmData);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      setIsLoading(false);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'free':
        return <Sparkles className="w-6 h-6 text-secondary-500" />;
      case 'pro':
        return <Zap className="w-6 h-6 text-white" />;
      case 'premium':
        return <Crown className="w-6 h-6 text-white" />;
      default:
        return <Sparkles className="w-6 h-6 text-secondary-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'free':
        return 'bg-secondary-100';
      case 'pro':
        return 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30';
      case 'premium':
        return 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/30';
      default:
        return 'bg-secondary-100';
    }
  };

  const handleCancelSubscription = async () => {
    // TODO: Implement actual cancellation
    console.log('Cancelling subscription...');
    setShowCancelModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className={dashboardTheme.decorativeBackground.container}>
        <div
          className={dashboardTheme.decorativeBackground.dotPattern.className}
          style={dashboardTheme.decorativeBackground.dotPattern.style}
        />
        <div className={dashboardTheme.decorativeBackground.orb1} />
        <div className={dashboardTheme.decorativeBackground.orb2} />
      </div>

      {/* Top Navigation */}
      <nav className={dashboardTheme.navigation.container}>
        <div className={dashboardTheme.navigation.innerContainer}>
          <div className={dashboardTheme.navigation.flexContainer}>
            {/* Logo */}
            <div className={dashboardTheme.navigation.logoSection}>
              <Link href="/dashboard/supplier" className={dashboardTheme.navigation.logoButton}>
                <div className={dashboardTheme.navigation.logoBox}>
                  <span className={dashboardTheme.navigation.logoText}>LP</span>
                </div>
                <span className={dashboardTheme.navigation.brandText}>
                  LinkedProcurement
                </span>
              </Link>
            </div>

            {/* Center Navigation Menu */}
            <div className={dashboardTheme.navigation.navButtonsContainer}>
              <div className="hidden md:flex gap-2">
                <Link
                  href="/dashboard/supplier"
                  className={dashboardTheme.navigation.navButton}
                >
                  AI-Match RFQs
                </Link>
                <Link
                  href="/dashboard/supplier#responses"
                  className={dashboardTheme.navigation.navButton}
                >
                  My Responses
                </Link>
                <Link
                  href="/dashboard/supplier-profile"
                  className={dashboardTheme.navigation.navButton}
                >
                  My Profile
                </Link>
                <Link
                  href="/dashboard/supplier-analytics"
                  className={dashboardTheme.navigation.navButton}
                >
                  Analytics
                </Link>
                <Link
                  href="/dashboard/messages"
                  className={dashboardTheme.navigation.navButton}
                >
                  Messages
                </Link>
              </div>
            </div>

            {/* Right Side */}
            <div className={dashboardTheme.navigation.rightSection}>
              <button className={dashboardTheme.navigation.bellButton}>
                <Bell size={20} />
                <span className={dashboardTheme.navigation.bellDot}></span>
              </button>

              {/* Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className={dashboardTheme.navigation.accountButton}
                >
                  <User size={20} />
                  <span className="hidden md:inline font-medium">Account</span>
                  <ChevronDown size={16} />
                </button>

                {showAccountMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowAccountMenu(false)}
                    />
                    <div className={dashboardTheme.navigation.accountMenu}>
                      <button
                        onClick={() => router.push('/dashboard/settings')}
                        className={dashboardTheme.navigation.accountMenuItem}
                      >
                        <Settings size={18} />
                        <span>Account Settings</span>
                      </button>
                      <button
                        onClick={() => router.push('/dashboard/company-settings')}
                        className={dashboardTheme.navigation.accountMenuItem}
                      >
                        <Building2 size={18} />
                        <span>Company Settings</span>
                      </button>
                      <div className={dashboardTheme.navigation.accountMenuSeparator}></div>
                      <button
                        onClick={handleLogout}
                        className={dashboardTheme.navigation.accountMenuItemLogout}
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className={dashboardTheme.mainContent.container}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={dashboardTheme.typography.heading2}>Billing & Subscription</h1>
            <p className={dashboardTheme.typography.bodyLarge}>Manage your plan, payment methods, and invoices</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Plan */}
            {subscription && (
              <div className={`${dashboardTheme.cards.primary} ${dashboardTheme.cards.padding.large}`}>
                <h2 className={`${dashboardTheme.typography.heading4} mb-6`}>Current Plan</h2>

                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-xl ${getTierColor(subscription.tier)}`}>
                      {getTierIcon(subscription.tier)}
                    </div>
                    <div>
                      <h3 className={`${dashboardTheme.typography.heading3} capitalize mb-1`}>{subscription.tier} Plan</h3>
                      <p className="text-secondary-500 font-medium">
                        ${subscription.price_amount}/{subscription.billing_cycle === 'monthly' ? 'month' : 'year'}
                      </p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${subscription.status === 'active'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : subscription.status === 'cancelled'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                </div>

                {/* Usage Stats */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className={`${dashboardTheme.cards.secondary} ${dashboardTheme.cards.padding.medium}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-secondary-600">RFQs Posted</span>
                      <TrendingUp className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold text-secondary-900">{subscription.rfqs_posted_this_month}</span>
                      <span className="text-sm text-secondary-500 font-medium">/ {subscription.rfq_limit || '∞'}</span>
                    </div>
                    <div className="w-full bg-secondary-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: subscription.rfq_limit
                            ? `${(subscription.rfqs_posted_this_month / subscription.rfq_limit) * 100}%`
                            : '0%'
                        }}
                      />
                    </div>
                  </div>

                  <div className={`${dashboardTheme.cards.secondary} ${dashboardTheme.cards.padding.medium}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-secondary-600">Responses Sent</span>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold text-secondary-900">{subscription.responses_sent_this_month}</span>
                      <span className="text-sm text-secondary-500 font-medium">/ {subscription.response_limit || '∞'}</span>
                    </div>
                    <div className="w-full bg-secondary-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: subscription.response_limit ? `${Math.min((subscription.responses_sent_this_month / subscription.response_limit) * 100, 100)}%` : '100%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Period */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-secondary-100">
                  <div>
                    <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-1">Current Billing Period</p>
                    <p className="text-secondary-900 font-medium">
                      {new Date(subscription.current_period_start).toLocaleDateString()} - {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  </div>
                  {subscription.status === 'active' && (
                    <Link
                      href="/pricing"
                      className={dashboardTheme.buttons.primary + " flex items-center gap-2"}
                    >
                      <span>Upgrade Plan</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className={`${dashboardTheme.cards.primary} ${dashboardTheme.cards.padding.large}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={dashboardTheme.typography.heading4}>Payment Method</h2>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-semibold transition-colors">
                  Update
                </button>
              </div>

              {paymentMethod ? (
                <div className={`${dashboardTheme.cards.secondary} p-4 flex items-center gap-4`}>
                  <div className="p-3 bg-white rounded-lg border border-secondary-200 shadow-sm">
                    <CreditCard className="w-6 h-6 text-secondary-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-secondary-900">{paymentMethod.brand} ending in {paymentMethod.last4}</p>
                    <p className="text-sm text-secondary-500 font-medium">Expires {paymentMethod.exp_month}/{paymentMethod.exp_year}</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium border border-green-100">
                    <Check className="w-4 h-4" />
                    <span>Active</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center bg-secondary-50 rounded-xl p-8 border-2 border-dashed border-secondary-200">
                  <div className="text-center">
                    <CreditCard className="w-10 h-10 mx-auto mb-3 text-secondary-400" />
                    <p className="text-secondary-600 font-medium mb-4">No payment method on file</p>
                    <button className={dashboardTheme.buttons.secondary}>
                      Add Payment Method
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Invoice History */}
            <div className={`${dashboardTheme.cards.primary} ${dashboardTheme.cards.padding.large}`}>
              <h2 className={`${dashboardTheme.typography.heading4} mb-6`}>Invoice History</h2>

              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className={`${dashboardTheme.cards.secondary} ${dashboardTheme.cards.padding.medium} flex items-center justify-between hover:border-primary-200 transition-colors group`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-secondary-100 rounded-lg text-secondary-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-secondary-900">{invoice.invoice_number}</p>
                        <p className="text-sm text-secondary-500 font-medium">
                          {new Date(invoice.period_start).toLocaleDateString()} - {new Date(invoice.period_end).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold text-secondary-900">${invoice.amount.toFixed(2)}</p>
                        <span className={`text-xs font-bold uppercase ${invoice.status === 'paid'
                            ? 'text-green-600'
                            : invoice.status === 'pending'
                              ? 'text-blue-600'
                              : 'text-red-600'
                          }`}>
                          {invoice.status}
                        </span>
                      </div>
                      {invoice.invoice_pdf_url && (
                        <button className="p-2 rounded-lg text-secondary-400 hover:text-primary-600 hover:bg-primary-50 transition-all">
                          <Download className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upgrade Prompt */}
            {subscription?.tier === 'free' && (
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-lg shadow-primary-600/20">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-6 h-6 text-yellow-300" />
                  <h3 className="text-xl font-bold">Unlock More Features</h3>
                </div>
                <p className="text-primary-100 mb-6 text-sm leading-relaxed">
                  Upgrade to Pro for unlimited responses, advanced analytics, and priority support.
                </p>
                <Link
                  href="/pricing"
                  className="block w-full py-3 bg-white text-primary-600 rounded-xl font-bold text-center hover:bg-primary-50 transition-colors shadow-sm"
                >
                  View Plans
                </Link>
              </div>
            )}

            {/* Support */}
            <div className={`${dashboardTheme.cards.primary} ${dashboardTheme.cards.padding.large}`}>
              <h3 className={`${dashboardTheme.typography.heading4} mb-3`}>Need Help?</h3>
              <p className="text-secondary-500 text-sm mb-6">
                Have questions about your subscription or billing? Our support team is here to help.
              </p>
              <Link
                href="/support"
                className={dashboardTheme.buttons.secondary + ' block w-full text-center'}
              >
                Contact Support
              </Link>
            </div>

            {/* Cancel Subscription */}
            {subscription?.status === 'active' && subscription.tier !== 'free' && (
              <div className="rounded-2xl border border-red-100 bg-red-50/50 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-red-900 mb-1">Cancel Subscription</h3>
                    <p className="text-sm text-red-700">
                      Your subscription will remain active until the end of the current billing period.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-2 px-4 bg-white border border-red-200 text-red-600 rounded-lg font-semibold hover:bg-red-50 hover:border-red-300 transition-all shadow-sm"
                >
                  Cancel Subscription
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-secondary-900/50 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-secondary-200 rounded-2xl p-8 w-full max-w-md shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-secondary-900">Cancel Subscription?</h2>
            </div>

            <p className="text-secondary-600 mb-6">
              Are you sure you want to cancel your subscription? You'll lose access to:
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-sm text-secondary-700 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                Unlimited RFQ responses
              </li>
              <li className="flex items-center gap-3 text-sm text-secondary-700 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                Advanced analytics dashboard
              </li>
              <li className="flex items-center gap-3 text-sm text-secondary-700 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                Priority support
              </li>
              <li className="flex items-center gap-3 text-sm text-secondary-700 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                Buyer profile access
              </li>
            </ul>

            <p className="text-sm text-secondary-500 mb-6 bg-secondary-50 p-4 rounded-lg border border-secondary-100">
              Your subscription will remain active until <span className="font-bold text-secondary-900">{subscription && new Date(subscription.current_period_end).toLocaleDateString()}</span>.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 px-4 bg-secondary-100 text-secondary-900 rounded-xl font-semibold hover:bg-secondary-200 transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
