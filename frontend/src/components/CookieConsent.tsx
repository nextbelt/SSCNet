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
      <div className="fixed inset-0 bg-secondary-900/20 backdrop-blur-sm z-40" />

      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-xl rounded-2xl shadow-glass border border-white/20">
          {!showSettings ? (
            // Simple Banner
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-secondary-900">
                  🍪 We Value Your Privacy
                </h3>
              </div>

              <p className="text-secondary-500 mb-6">
                We use cookies to enhance your browsing experience, serve personalized content,
                and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                You can customize your preferences or decline non-essential cookies.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={acceptAll}
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-medium shadow-lg shadow-primary-600/20"
                >
                  Accept All
                </button>
                <button
                  onClick={acceptNecessary}
                  className="flex-1 bg-secondary-100 text-secondary-900 px-6 py-3 rounded-xl hover:bg-secondary-200 transition-colors font-medium"
                >
                  Necessary Only
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex-1 border border-secondary-200 text-secondary-900 px-6 py-3 rounded-xl hover:bg-secondary-50 transition-colors font-medium"
                >
                  Customize
                </button>
              </div>

              <div className="mt-4 text-sm text-secondary-400">
                Read our{' '}
                <a href="/privacy" className="text-primary-600 hover:underline">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="/terms" className="text-primary-600 hover:underline">
                  Terms of Service
                </a>
              </div>
            </div>
          ) : (
            // Detailed Settings
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-secondary-900 mb-2">
                    Cookie Preferences
                  </h3>
                  <p className="text-secondary-500 text-sm">
                    Choose which cookies you want to accept. You can change these settings at any time.
                  </p>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Necessary Cookies */}
                <div className="border border-secondary-200 rounded-xl p-4 bg-secondary-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-secondary-900">
                        Necessary Cookies
                      </h4>
                      <span className="bg-secondary-200 text-secondary-700 text-xs px-2 py-1 rounded">
                        Always Active
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-secondary-500">
                    These cookies are essential for the website to function properly.
                    They enable core functionality such as security, authentication, and session management.
                  </p>
                </div>

                {/* Functional Cookies */}
                <div className="border border-secondary-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-secondary-900">
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
                      <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-secondary-500">
                    These cookies enable enhanced functionality and personalization.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="border border-secondary-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-secondary-900">
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
                      <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-secondary-500">
                    These cookies help us understand how visitors interact with our website.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="border border-secondary-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-secondary-900">
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
                      <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-secondary-500">
                    These cookies are used to track visitors across websites to display relevant advertisements.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCustomSave}
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors font-medium shadow-lg shadow-primary-600/20"
                >
                  Save Preferences
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 border border-secondary-200 text-secondary-900 px-6 py-3 rounded-xl hover:bg-secondary-50 transition-colors font-medium"
                >
                  Accept All
                </button>
              </div>

              <div className="mt-4 text-sm text-secondary-400 text-center">
                Your consent will be stored for 12 months.{' '}
                <a href="/privacy#cookies" className="text-primary-600 hover:underline">
                  Learn more
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
