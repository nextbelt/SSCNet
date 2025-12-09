import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Building2, Package, MessageSquare, Star, CheckCircle, Clock, MapPin, Award, Send, Filter, Menu, X, Phone, Mail, Linkedin, AlertCircle, LogOut, ChevronDown, Settings } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { dashboardTheme } from '@/styles/dashboardTheme';

interface POC {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  linkedin_verified: boolean;
  is_primary: boolean;
  status: 'available' | 'busy' | 'on-call';
  avg_response_time_hours?: number;
}

interface Supplier {
  id: string;
  name: string;
  location: {
    city?: string;
    state?: string;
    country?: string;
  };
  rating: number;
  response_rate: number;
  materials: string[];
  certifications: string[];
  description?: string;
  capabilities: string[];
  last_active?: string;
  pocs: POC[];
  verified: boolean;
}

interface SearchFilters {
  query: string;
  materials: string[];
  certifications: string[];
  location?: string;
  min_response_rate?: number;
  max_response_time_hours?: number;
  min_rating?: number;
  verified_only: boolean;
}

const BuyerDashboard = () => {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showRFQModal, setShowRFQModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    materials: [],
    certifications: [],
    verified_only: false
  });

  // Common materials and certifications for filters
  const commonMaterials = ['Steel Alloys', 'Aluminum', 'Titanium', 'Engineering Plastics', 'Composites', 'Rare Earth Elements', 'Semiconductors'];
  const commonCertifications = ['ISO 9001', 'AS9100', 'ITAR', 'ISO 14001', 'FDA', 'RoHS', 'REACH'];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_type');
    router.push('/auth/login');
  };

  useEffect(() => {
    searchSuppliers();
  }, []);

  const searchSuppliers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.query) params.append('query', filters.query);
      if (filters.materials.length > 0) {
        filters.materials.forEach(material => params.append('materials', material));
      }
      if (filters.certifications.length > 0) {
        filters.certifications.forEach(cert => params.append('certifications', cert));
      }
      if (filters.location) params.append('location', filters.location);
      if (filters.min_response_rate) params.append('min_response_rate', filters.min_response_rate.toString());
      if (filters.max_response_time_hours) params.append('max_response_time_hours', filters.max_response_time_hours.toString());
      if (filters.min_rating) params.append('min_rating', filters.min_rating.toString());
      if (filters.verified_only) params.append('verified_only', 'true');

      const response = await axios.get(`/api/search/suppliers?${params.toString()}`);
      setSuppliers(response.data.suppliers || []);
    } catch (error) {
      console.error('Error searching suppliers:', error);
      // Show empty state on error
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    searchSuppliers();
  };

  const addFilter = (type: 'materials' | 'certifications', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: [...prev[type], value]
    }));
  };

  const removeFilter = (type: 'materials' | 'certifications', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== value)
    }));
  };

  const formatLocation = (location: Supplier['location']) => {
    const parts = [location.city, location.state].filter(Boolean);
    return parts.join(', ');
  };

  const getPrimaryPOC = (pocs: POC[]) => {
    return pocs.find(poc => poc.is_primary) || pocs[0];
  };

  const getOnCallPOC = (pocs: POC[]) => {
    return pocs.find(poc => poc.status === 'on-call' && !poc.is_primary);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-500';
      case 'busy': return 'text-primary-600 bg-primary-500';
      case 'on-call': return 'text-primary-600 bg-primary-500';
      default: return 'text-secondary-500 bg-secondary-500';
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 relative">
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
            {/* Logo - Fixed Width */}
            <div className={dashboardTheme.navigation.logoSection}>
              <a href="/" className={dashboardTheme.navigation.logoButton}>
                <div className={dashboardTheme.navigation.logoBox}>
                  <span className={dashboardTheme.navigation.logoText}>LP</span>
                </div>
                <span className={dashboardTheme.navigation.brandText}>
                  LinkedProcurement
                </span>
              </a>
            </div>

            {/* Center Navigation Menu - Fixed Width */}
            <div className={dashboardTheme.navigation.navButtonsContainer}>
              <div className="hidden md:flex gap-2">
                <button className={dashboardTheme.navigation.navButtonActive}>
                  AI-Discover Suppliers
                </button>
                <a
                  href="/dashboard/post-rfq"
                  className={dashboardTheme.navigation.navButton}
                >
                  Post RFQ
                </a>
                <a
                  href="/dashboard/settings"
                  className={dashboardTheme.navigation.navButton}
                >
                  My Profile
                </a>
                <a
                  href="/dashboard/messages"
                  className={dashboardTheme.navigation.navButton}
                >
                  Messages
                </a>
              </div>
            </div>

            {/* Right Side - Fixed Width */}
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

      {/* Main Content */}
      <main className={dashboardTheme.mainContent.container}>
        <div className={dashboardTheme.mainContent.spacingContainer}>
          {/* Search Bar */}
          <div className={`${dashboardTheme.cards.primary} ${dashboardTheme.cards.padding.medium}`}>
            <div className={dashboardTheme.search.container}>
              <div className={dashboardTheme.search.inputWrapper}>
                <Search className={dashboardTheme.search.icon} size={20} />
                <input
                  type="text"
                  placeholder="Search materials, capabilities, certifications..."
                  value={filters.query}
                  onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className={dashboardTheme.search.input}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={dashboardTheme.search.button}
              >
                <Filter size={20} />
                Filters
              </button>
              <button
                onClick={handleSearch}
                className={dashboardTheme.search.filterButton}
              >
                Search
              </button>
            </div>

            {/* Applied Filters */}
            <div className="flex gap-2 flex-wrap">
              {filters.materials.map(material => (
                <span key={material} className={dashboardTheme.badges.primary + " flex items-center gap-1"}>
                  {material}
                  <X size={14} className="cursor-pointer hover:text-primary-800" onClick={() => removeFilter('materials', material)} />
                </span>
              ))}
              {filters.certifications.map(cert => (
                <span key={cert} className={dashboardTheme.badges.success + " flex items-center gap-1"}>
                  {cert}
                  <X size={14} className="cursor-pointer hover:text-green-800" onClick={() => removeFilter('certifications', cert)} />
                </span>
              ))}
              {filters.verified_only && (
                <span className={dashboardTheme.badges.info + " flex items-center gap-1"}>
                  Verified Only
                  <X size={14} className="cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, verified_only: false }))} />
                </span>
              )}
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className={`mt-6 ${dashboardTheme.cards.secondary} ${dashboardTheme.cards.padding.medium}`}>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className={dashboardTheme.forms.label}>Materials</label>
                    <div className="space-y-2">
                      {commonMaterials.filter(m => !filters.materials.includes(m)).map(material => (
                        <button
                          key={material}
                          onClick={() => addFilter('materials', material)}
                          className={`${dashboardTheme.buttons.secondary} ${dashboardTheme.buttons.small} w-full text-left`}
                        >
                          + {material}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={dashboardTheme.forms.label}>Certifications</label>
                    <div className="space-y-2">
                      {commonCertifications.filter(c => !filters.certifications.includes(c)).map(cert => (
                        <button
                          key={cert}
                          onClick={() => addFilter('certifications', cert)}
                          className={`${dashboardTheme.buttons.secondary} ${dashboardTheme.buttons.small} w-full text-left`}
                        >
                          + {cert}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={dashboardTheme.forms.label}>Min Response Rate (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={filters.min_response_rate || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, min_response_rate: parseInt(e.target.value) || undefined }))}
                        className={dashboardTheme.forms.input}
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.verified_only}
                          onChange={(e) => setFilters(prev => ({ ...prev, verified_only: e.target.checked }))}
                          className={dashboardTheme.forms.checkbox}
                        />
                        <span className="text-sm font-medium text-secondary-700">Verified Only</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center px-2">
            <div className={dashboardTheme.typography.bodySmall}>
              {loading ? 'Searching...' : `${suppliers.length} suppliers found`}
            </div>
          </div>

          {/* Supplier Cards */}
          <div className="grid gap-6">
            {loading ? (
              <div className="text-center py-12 bg-white/50 backdrop-blur-sm border border-secondary-200 rounded-2xl">
                <div className={`${dashboardTheme.loading.spinner} h-12 w-12 border-4 border-t-primary-600 mx-auto`}></div>
                <p className="mt-4 text-secondary-500">Searching suppliers...</p>
              </div>
            ) : suppliers.length === 0 ? (
              <div className="text-center py-12 bg-white/50 backdrop-blur-sm border border-secondary-200 rounded-2xl">
                <p className="text-secondary-500">No suppliers found. Try adjusting your search criteria.</p>
              </div>
            ) : (
              suppliers.map(supplier => {
                const primaryPOC = getPrimaryPOC(supplier.pocs);
                const onCallPOC = getOnCallPOC(supplier.pocs);

                return (
                  <div key={supplier.id} className={`${dashboardTheme.cards.primary} ${dashboardTheme.cards.padding.medium} ${dashboardTheme.cards.hover}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-start gap-4">
                        <div className={`${dashboardTheme.navigation.logoBox} w-16 h-16 text-2xl`}>
                          {supplier.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={dashboardTheme.typography.heading4}>{supplier.name}</h3>
                            {supplier.verified && (
                              <CheckCircle size={20} className="text-green-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-primary-600">
                              <Star size={16} fill="currentColor" />
                              <span className={`${dashboardTheme.typography.body} font-semibold`}>{supplier.rating}</span>
                            </div>
                            <span className={dashboardTheme.typography.body}>•</span>
                            <div className="flex items-center gap-1 text-secondary-500">
                              <MapPin size={16} />
                              <span>{formatLocation(supplier.location)}</span>
                            </div>
                            <span className="text-secondary-300">•</span>
                            <span className="text-green-600 font-medium">{supplier.response_rate}% response rate</span>
                          </div>
                          {supplier.description && (
                            <p className="text-secondary-600 mt-2 max-w-2xl">{supplier.description}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => { setSelectedSupplier(supplier); setShowRFQModal(true); }}
                        className={dashboardTheme.buttons.primary + " flex items-center gap-2"}
                      >
                        <Send size={18} />
                        Send RFQ
                      </button>
                    </div>

                    {/* Materials */}
                    <div className="mb-6">
                      <div className={dashboardTheme.forms.label}>Materials:</div>
                      <div className="flex gap-2 flex-wrap">
                        {supplier.materials.map((material, idx) => (
                          <span key={idx} className={dashboardTheme.badges.primary}>
                            {material}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="mb-6">
                      <div className={dashboardTheme.forms.label}>Certifications:</div>
                      <div className="flex gap-2 flex-wrap">
                        {supplier.certifications.map((cert, idx) => (
                          <span key={idx} className={dashboardTheme.badges.success + " flex items-center gap-1"}>
                            <Award size={14} />
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* POC Information */}
                    <div className="border-t border-secondary-100 pt-6 mt-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Linkedin size={18} className="text-primary-600" />
                        <span className="text-sm font-semibold text-secondary-700">Verified Points of Contact:</span>
                        <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                          <CheckCircle size={12} /> LinkedIn Verified
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Primary POC */}
                        {primaryPOC && (
                          <div className="p-4 bg-gradient-to-br from-green-50/50 to-primary-50/30 rounded-xl border border-green-200/50 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-green-700 uppercase flex items-center gap-1">
                                <CheckCircle size={14} />
                                Primary POC
                              </span>
                              <span className={`flex items-center gap-1 text-xs font-semibold ${getStatusColor(primaryPOC.status).split(' ')[0]}`}>
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(primaryPOC.status).split(' ')[1]} ${primaryPOC.status === 'available' ? 'animate-pulse' : ''}`}></div>
                                {primaryPOC.status}
                              </span>
                            </div>
                            <div className="font-bold text-secondary-900 flex items-center gap-2">
                              {primaryPOC.name}
                              {primaryPOC.linkedin_verified && (
                                <Linkedin size={14} className="text-primary-600" />
                              )}
                            </div>
                            <div className="text-sm text-secondary-500">{primaryPOC.role}</div>
                            {primaryPOC.avg_response_time_hours && (
                              <div className="flex items-center gap-1 text-xs text-secondary-500 mt-3 bg-white/50 px-2 py-1 rounded-lg w-fit">
                                <Clock size={12} />
                                Avg response: {primaryPOC.avg_response_time_hours} hours
                              </div>
                            )}
                          </div>
                        )}

                        {/* On-Call POC */}
                        {onCallPOC && (
                          <div className="p-4 bg-gradient-to-br from-primary-50/50 to-indigo-50/30 rounded-xl border border-primary-200/50 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-primary-700 uppercase flex items-center gap-1">
                                <AlertCircle size={14} />
                                On-Call POC (24/7)
                              </span>
                              <span className="flex items-center gap-1 text-xs text-primary-600 font-semibold">
                                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                                {onCallPOC.status}
                              </span>
                            </div>
                            <div className="font-bold text-secondary-900 flex items-center gap-2">
                              {onCallPOC.name}
                              {onCallPOC.linkedin_verified && (
                                <Linkedin size={14} className="text-primary-600" />
                              )}
                            </div>
                            <div className="text-sm text-secondary-500">{onCallPOC.role}</div>
                            <div className="text-xs text-primary-700 mt-3 bg-white/50 px-2 py-1 rounded-lg inline-flex font-medium">
                              Urgent requests routed here
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* RFQ Modal */}
      {showRFQModal && selectedSupplier && (
        <RFQModal
          supplier={selectedSupplier}
          onClose={() => setShowRFQModal(false)}
        />
      )}
    </div>
  );
};

// RFQ Modal Component
interface RFQModalProps {
  supplier: Supplier;
  onClose: () => void;
}

const RFQModal: React.FC<RFQModalProps> = ({ supplier, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    material_category: '',
    quantity: '',
    target_price: '',
    specifications: '',
    delivery_deadline: '',
    delivery_location: '',
    required_certifications: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const rfqData = {
        ...formData,
        title: formData.title || `RFQ for ${formData.material_category}`,
        visibility: 'private',
        preferred_suppliers: JSON.stringify([supplier.id])
      };

      const response = await axios.post('/api/rfqs', rfqData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.status === 200 || response.status === 201) {
        alert('RFQ sent successfully!');
        onClose();
      }
    } catch (error) {
      console.error('Error sending RFQ:', error);
      alert('Error sending RFQ. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const primaryPOC = supplier.pocs.find(poc => poc.is_primary) || supplier.pocs[0];

  return (
    <div className={dashboardTheme.modals.overlay}>
      <div className={dashboardTheme.modals.container}>
        <div className={dashboardTheme.modals.header + " flex justify-between items-center"}>
          <h3 className={dashboardTheme.typography.heading3}>Send RFQ</h3>
          <button onClick={onClose} className="text-secondary-400 hover:text-secondary-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={dashboardTheme.modals.body + " space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar"}>
            <div className="bg-primary-50 border border-primary-100 p-4 rounded-xl">
              <div className="font-semibold text-secondary-900">To: {supplier.name}</div>
              {primaryPOC && (
                <div className="text-sm text-secondary-600 mt-1 flex items-center gap-2">
                  <User size={14} />
                  Primary POC: {primaryPOC.name} ({primaryPOC.role})
                </div>
              )}
            </div>

            <div>
              <label className={dashboardTheme.forms.label}>RFQ Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Steel Alloy Procurement Request"
                className={dashboardTheme.forms.input}
              />
            </div>

            <div>
              <label className={dashboardTheme.forms.label}>Material Type *</label>
              <input
                type="text"
                required
                value={formData.material_category}
                onChange={(e) => setFormData(prev => ({ ...prev, material_category: e.target.value }))}
                placeholder="e.g., Steel Alloy Grade 304"
                className={dashboardTheme.forms.input}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={dashboardTheme.forms.label}>Quantity *</label>
                <input
                  type="text"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="e.g., 5000 kg"
                  className={dashboardTheme.forms.input}
                />
              </div>
              <div>
                <label className={dashboardTheme.forms.label}>Target Price</label>
                <input
                  type="text"
                  value={formData.target_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_price: e.target.value }))}
                  placeholder="e.g., $15/kg"
                  className={dashboardTheme.forms.input}
                />
              </div>
            </div>

            <div>
              <label className={dashboardTheme.forms.label}>Specifications *</label>
              <textarea
                required
                rows={4}
                value={formData.specifications}
                onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
                placeholder="Describe your requirements, specifications, certifications needed..."
                className={dashboardTheme.forms.textarea}
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={dashboardTheme.forms.label}>Delivery Deadline</label>
                <input
                  type="date"
                  value={formData.delivery_deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_deadline: e.target.value }))}
                  className={dashboardTheme.forms.input}
                />
              </div>
              <div>
                <label className={dashboardTheme.forms.label}>Delivery Location</label>
                <input
                  type="text"
                  value={formData.delivery_location}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_location: e.target.value }))}
                  placeholder="e.g., Houston, TX"
                  className={dashboardTheme.forms.input}
                />
              </div>
            </div>

            <div>
              <label className={dashboardTheme.forms.label}>Required Certifications</label>
              <input
                type="text"
                value={formData.required_certifications}
                onChange={(e) => setFormData(prev => ({ ...prev, required_certifications: e.target.value }))}
                placeholder="e.g., ISO 9001, AS9100"
                className={dashboardTheme.forms.input}
              />
            </div>

            <div>
              <label className={dashboardTheme.forms.label}>Additional Notes</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional information..."
                className={dashboardTheme.forms.textarea}
              ></textarea>
            </div>
          </div>

          <div className={dashboardTheme.modals.footer}>
            <button
              type="button"
              onClick={onClose}
              className={dashboardTheme.buttons.secondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={dashboardTheme.buttons.primary + " flex items-center gap-2 disabled:opacity-50"}
            >
              <Send size={18} />
              {submitting ? 'Sending...' : 'Send RFQ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyerDashboard;
