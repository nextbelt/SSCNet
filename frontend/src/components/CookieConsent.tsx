'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always required
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already set preferences
    const savedPreferences = localStorage.getItem('cookiePreferences');
    if (!savedPreferences) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Load saved preferences
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookiePreferences', JSON.stringify(prefs));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    
    // Set consent cookie
    document.cookie = `cookieConsent=true; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Strict`;
    
    // Apply preferences
    applyPreferences(prefs);
    
    setShowBanner(false);
    setShowSettings(false);
  };

  const applyPreferences = (prefs: CookiePreferences) => {
    // Analytics cookies (e.g., Google Analytics, Mixpanel)
    if (prefs.analytics) {
      // Initialize analytics
      console.log('Analytics enabled');
      // window.gtag?.('consent', 'update', { analytics_storage: 'granted' });
    } else {
      console.log('Analytics disabled');
      // window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
    }

    // Marketing cookies (e.g., advertising, remarketing)
    if (prefs.marketing) {
      console.log('Marketing enabled');
      // window.gtag?.('consent', 'update', { ad_storage: 'granted' });
    } else {
      console.log('Marketing disabled');
      // window.gtag?.('consent', 'update', { ad_storage: 'denied' });
    }

    // Functional cookies
    if (prefs.functional) {
      console.log('Functional cookies enabled');
    }
  };

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
  };

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    savePreferences(necessaryOnly);
  };

  const handleCustomSave = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />

      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-2xl border border-gray-200">
          {!showSettings ? (
            // Simple Banner
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  🍪 We Value Your Privacy
                </h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                We use cookies to enhance your browsing experience, serve personalized content, 
                and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. 
                You can customize your preferences or decline non-essential cookies.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={acceptAll}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Accept All
                </button>
                <button
                  onClick={acceptNecessary}
                  className="flex-1 bg-gray-200 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Necessary Only
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex-1 border border-gray-300 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Customize
                </button>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Read our{' '}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>
              </div>
            </div>
          ) : (
            // Detailed Settings
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Cookie Preferences
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Choose which cookies you want to accept. You can change these settings at any time.
                  </p>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Necessary Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-gray-900">
                        Necessary Cookies
                      </h4>
                      <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                        Always Active
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    These cookies are essential for the website to function properly. 
                    They enable core functionality such as security, authentication, and session management. 
                    The website cannot function properly without these cookies.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Examples: Authentication tokens, CSRF protection, load balancing
                  </p>
                </div>

                {/* Functional Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">
                      Functional Cookies
                    </h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.functional}
                        onChange={(e) =>
                          setPreferences({ ...preferences, functional: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    These cookies enable enhanced functionality and personalization, such as 
                    remembering your preferences, language settings, and region.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Examples: Language preferences, theme settings, saved filters
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">
                      Analytics Cookies
                    </h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) =>
                          setPreferences({ ...preferences, analytics: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    These cookies help us understand how visitors interact with our website by 
                    collecting and reporting information anonymously. This helps us improve our service.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Examples: Google Analytics, Mixpanel, usage statistics
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">
                      Marketing Cookies
                    </h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) =>
                          setPreferences({ ...preferences, marketing: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    These cookies are used to track visitors across websites to display relevant 
                    advertisements and encourage them to take actions that align with marketing campaigns.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Examples: Retargeting ads, LinkedIn Ads, conversion tracking
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCustomSave}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Save My Preferences
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 border border-gray-300 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Accept All
                </button>
              </div>

              <div className="mt-4 text-sm text-gray-500 text-center">
                Your consent will be stored for 12 months.{' '}
                <a href="/privacy#cookies" className="text-blue-600 hover:underline">
                  Learn more about our cookie policy
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
