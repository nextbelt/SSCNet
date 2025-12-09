import React, { useState, useEffect } from 'react';
import { Building2, Save, ArrowLeft, Package, Factory, CheckCircle, Search, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { dashboardTheme } from '@/styles/dashboardTheme';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

interface CompanySettings {
  company_type: string;
  business_categories: string[];
  raw_materials_focus: string[];
}

const COMPANY_TYPES = [
  { value: 'manufacturer', label: 'Manufacturer', description: 'Produce goods from raw materials' },
  { value: 'distributor', label: 'Distributor', description: 'Distribute products to buyers' },
  { value: 'service_provider', label: 'Service Provider', description: 'Provide manufacturing services' },
  { value: 'both', label: 'Both Mfg. & Dist.', description: 'Manufacture and distribute' }
];

const BUSINESS_CATEGORIES = [
  'Metals & Alloys',
  'Plastics & Polymers',
  'Electronics Materials',
  'Chemicals & Resins',
  'Textiles & Fabrics',
  'Composites',
  'Raw Materials',
  'Components & Parts',
  'Automotive',
  'Aerospace',
  'Medical Devices',
  'Industrial Equipment',
  'Consumer Products',
  'Construction Materials',
  'Food & Beverage',
  'Packaging'
];

const RAW_MATERIALS = [
  'Stainless Steel',
  'Aluminum',
  'Copper',
  'Titanium',
  'Brass',
  'Carbon Steel',
  'Polycarbonate',
  'ABS Plastic',
  'PEEK',
  'Nylon',
  'Silicone',
  'Rubber',
  'Epoxy Resins',
  'Acrylic',
  'Fiberglass',
  'Carbon Fiber',
  'Cotton',
  'Polyester',
  'Leather',
  'Wood',
  'Concrete',
  'Glass',
  'Ceramic',
  'Adhesives',
  'Coatings'
];

export default function CompanySettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchMaterial, setSearchMaterial] = useState('');
  const [settings, setSettings] = useState<CompanySettings>({
    company_type: '',
    business_categories: [],
    raw_materials_focus: []
  });

  useEffect(() => {
    fetchCompanySettings();
  }, []);

  const fetchCompanySettings = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await axios.get(`${API_URL}/api/v1/companies/me/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data) {
        setSettings(response.data);
      } else {
        // Initialize with empty settings if none exist
        setSettings({
          company_type: '',
          business_categories: [],
          raw_materials_focus: []
        });
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Failed to fetch settings:', err);
      // Initialize with empty settings on error
      setSettings({
        company_type: '',
        business_categories: [],
        raw_materials_focus: []
      });
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('access_token');

      await axios.put(`${API_URL}/api/v1/companies/me/settings`, settings, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setSuccess('Company settings saved successfully! RFQs will now be filtered based on your preferences.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (category: string) => {
    setSettings(prev => ({
      ...prev,
      business_categories: prev.business_categories.includes(category)
        ? prev.business_categories.filter(c => c !== category)
        : [...prev.business_categories, category]
    }));
  };

  const toggleMaterial = (material: string) => {
    setSettings(prev => ({
      ...prev,
      raw_materials_focus: prev.raw_materials_focus.includes(material)
        ? prev.raw_materials_focus.filter(m => m !== material)
        : [...prev.raw_materials_focus, material]
    }));
  };

  const goBack = () => {
    const userType = localStorage.getItem('user_type');
    router.push(`/dashboard/${userType || 'supplier'}`);
  };

  const filteredCategories = BUSINESS_CATEGORIES.filter(cat =>
    cat.toLowerCase().includes(searchCategory.toLowerCase())
  );

  const filteredMaterials = RAW_MATERIALS.filter(mat =>
    mat.toLowerCase().includes(searchMaterial.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className={`${dashboardTheme.loading.spinner} h-12 w-12 border-4 border-t-primary-600`}></div>
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
      <nav className="bg-white/80 border-b border-secondary-200 shadow-sm backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={goBack}
                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors text-secondary-600"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <span className="text-white font-bold text-sm">LP</span>
                </div>
                <div className="flex flex-col">
                  <h1 className={dashboardTheme.typography.heading3 + ' text-lg leading-tight'}>Company Settings</h1>
                  <span className="text-xs text-secondary-500 font-medium">LinkedProcurement</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="mb-8 text-center">
          <h2 className={dashboardTheme.typography.heading2}>Customize Your RFQ Experience</h2>
          <p className={dashboardTheme.typography.bodyLarge + ' max-w-2xl mx-auto mt-2'}>
            Configure your business type and materials to receive relevant RFQ opportunities. You can always search manually for other opportunities.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 shadow-sm">
              <CheckCircle size={20} className="flex-shrink-0" />
              <p className="text-sm font-medium">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 shadow-sm">
              <AlertCircle size={20} className="flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Company Type */}
          <div className={dashboardTheme.cards.primary + ' ' + dashboardTheme.cards.padding.large}>
            <div className="flex items-center gap-3 mb-6 border-b border-secondary-100 pb-4">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Factory className="text-primary-600" size={24} />
              </div>
              <div>
                <h3 className={dashboardTheme.typography.heading3}>Company Type</h3>
                <p className="text-sm text-secondary-500">Select what best describes your business</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {COMPANY_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`relative flex items-start p-5 border rounded-xl cursor-pointer transition-all duration-200 ${settings.company_type === type.value
                      ? 'bg-primary-50 border-primary-200 shadow-md ring-1 ring-primary-200'
                      : 'bg-white border-secondary-200 hover:border-primary-300 hover:shadow-sm'
                    }`}
                >
                  <input
                    type="radio"
                    name="company_type"
                    value={type.value}
                    checked={settings.company_type === type.value}
                    onChange={(e) => setSettings(prev => ({ ...prev, company_type: e.target.value }))}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${settings.company_type === type.value
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-secondary-300'
                        }`}>
                        {settings.company_type === type.value && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="font-semibold text-secondary-900">{type.label}</span>
                    </div>
                    <p className="text-sm text-secondary-500 mt-2 ml-8">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Business Categories */}
          <div className={dashboardTheme.cards.primary + ' ' + dashboardTheme.cards.padding.large}>
            <div className="flex items-center gap-3 mb-6 border-b border-secondary-100 pb-4">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Package className="text-primary-600" size={24} />
              </div>
              <div>
                <h3 className={dashboardTheme.typography.heading3}>Business Categories</h3>
                <p className="text-sm text-secondary-500">Select all categories your business operates in</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={20} />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className={dashboardTheme.forms.input + ' pl-10'}
              />
            </div>

            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-4 rounded-xl bg-secondary-50 border border-secondary-100 custom-scrollbar">
              {filteredCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${settings.business_categories.includes(category)
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20 transform scale-105'
                      : 'bg-white text-secondary-600 border border-secondary-200 hover:border-primary-300 hover:text-primary-600'
                    }`}
                >
                  {settings.business_categories.includes(category) && <CheckCircle size={14} className="text-white" />}
                  {category}
                </button>
              ))}
            </div>
            <div className="mt-3 text-sm text-secondary-500 font-medium">
              {settings.business_categories.length} categories selected
            </div>
          </div>

          {/* Raw Materials */}
          <div className={dashboardTheme.cards.primary + ' ' + dashboardTheme.cards.padding.large}>
            <div className="flex items-center gap-3 mb-6 border-b border-secondary-100 pb-4">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Package className="text-primary-600" size={24} />
              </div>
              <div>
                <h3 className={dashboardTheme.typography.heading3}>Raw Materials Focus</h3>
                <p className="text-sm text-secondary-500">Select materials you work with</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" size={20} />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchMaterial}
                onChange={(e) => setSearchMaterial(e.target.value)}
                className={dashboardTheme.forms.input + ' pl-10'}
              />
            </div>

            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-4 rounded-xl bg-secondary-50 border border-secondary-100 custom-scrollbar">
              {filteredMaterials.map((material) => (
                <button
                  key={material}
                  type="button"
                  onClick={() => toggleMaterial(material)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${settings.raw_materials_focus.includes(material)
                      ? 'bg-secondary-900 text-white shadow-md transform scale-105'
                      : 'bg-white text-secondary-600 border border-secondary-200 hover:border-secondary-400 hover:text-secondary-900'
                    }`}
                >
                  {settings.raw_materials_focus.includes(material) && <CheckCircle size={14} className="text-white" />}
                  {material}
                </button>
              ))}
            </div>
            <div className="mt-3 text-sm text-secondary-500 font-medium">
              {settings.raw_materials_focus.length} materials selected
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-5 flex items-start gap-3">
            <AlertCircle className="text-primary-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-primary-800 leading-relaxed">
              <strong className="font-semibold text-primary-900">Pro Tip:</strong> These settings filter your main RFQ feed. You can always use the global search to explore opportunities outside your configured preferences and discover new market trends.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4 border-t border-secondary-200">
            <button
              type="button"
              onClick={goBack}
              className={dashboardTheme.buttons.secondary + " px-8 py-3 text-lg"}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !settings.company_type}
              className={dashboardTheme.buttons.primary + ' flex-1 flex items-center justify-center gap-2 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed'}
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
