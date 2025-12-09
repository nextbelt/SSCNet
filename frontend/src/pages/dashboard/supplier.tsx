import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Users, Building2, Package, MessageSquare, Star, CheckCircle, Clock, MapPin, Award, Send, Filter, Menu, X, Phone, Mail, Linkedin, AlertCircle, Upload, FileText, Eye, Trash2, Edit, TrendingUp, BarChart3, Calendar, DollarSign, LogOut, ChevronDown, Settings, CreditCard } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { dashboardTheme } from '@/styles/dashboardTheme';

interface RFQOpportunity {
  id: string;
  title: string;
  buyer_company_name?: string;
  material_category?: string;
  quantity?: string;
  target_price?: string;
  specifications?: string;
  delivery_deadline?: string;
  delivery_location?: string;
  required_certifications?: string;
  status: 'active' | 'closed' | 'expired';
  view_count: number;
  response_count: number;
  created_at: string;
  expires_at?: string;
  match_score?: number;
  distance?: string;
}

interface MyResponse {
  id: string;
  rfq_id: string;
  rfq_title: string;
  buyer_company_name?: string;
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected';
  price_quote?: string;
  lead_time_days?: number;
  message?: string;
  responded_at: string;
  is_competitive?: boolean;
  buyer_company_id?: string;
}

interface BuyerCompanyProfile {
  id: string;
  name: string;
  industry?: string;
  headquarters_location?: string;
  website_url?: string;
  description?: string;
  logo_url?: string;
  pocs: {
    id: string;
    name: string;
    role: string;
    email: string;
    phone?: string;
    linkedin_url?: string;
    profile_picture?: string;
    is_primary: boolean;
  }[];
}

interface ResponseFormData {
  price_quote: string;
  lead_time_days: number | '';
  minimum_order_quantity: string;
  message: string;
  certifications_provided: string[];
  attachments: string;
  // Enhanced Supplier Response fields
  supplier_part_number: string;
  production_batch_size: string;
  supplier_moq: string;
  supplier_unit_of_measure: string;
  production_lead_time_days: number | '';
  raw_material_type: string;
  raw_material_cost: string;
}

const SupplierDashboard = () => {
  const router = useRouter();
  const [activeView, setActiveView] = useState('browse-rfqs');
  const [rfqOpportunities, setRFQOpportunities] = useState<RFQOpportunity[]>([]);
  const [myResponses, setMyResponses] = useState<MyResponse[]>([]);
  const [selectedRFQ, setSelectedRFQ] = useState<RFQOpportunity | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showBuyerProfileModal, setShowBuyerProfileModal] = useState(false);
  const [selectedBuyerProfile, setSelectedBuyerProfile] = useState<BuyerCompanyProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    material_category: '',
    location: '',
    max_target_price: '',
    delivery_deadline_from: '',
    has_certifications: false
  });
  const [responseForm, setResponseForm] = useState<ResponseFormData>({
    price_quote: '',
    lead_time_days: '',
    minimum_order_quantity: '',
    message: '',
    certifications_provided: [],
    attachments: '',
    // Enhanced Supplier Response fields
    supplier_part_number: '',
    production_batch_size: '',
    supplier_moq: '',
    supplier_unit_of_measure: '',
    production_lead_time_days: '',
    raw_material_type: '',
    raw_material_cost: ''
  });

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_type');
    router.push('/auth/login');
  };

  const materialCategories = [
    'Metals & Alloys',
    'Plastics & Polymers',
    'Electronics Materials',
    'Chemicals & Resins',
    'Textiles & Fabrics',
    'Composites',
    'Raw Materials',
    'Components & Parts'
  ];

  const unitOfMeasureOptions = ['kg', 'g', 'lb', 'oz', 'units', 'pieces', 'meters', 'feet', 'liters', 'gallons', 'sheets', 'rolls'];
  
  const rawMaterialTypes = [
    'Steel', 'Aluminum', 'Copper', 'Titanium', 'Brass', 'Stainless Steel',
    'ABS Plastic', 'PEEK', 'Nylon', 'Polycarbonate', 'PVC', 'HDPE',
    'Carbon Fiber', 'Fiberglass', 'Kevlar',
    'Silicon', 'Ceramic', 'Rubber',
    'Other'
  ];

  const certificationOptions = ['ISO 9001', 'AS9100', 'ISO 14001', 'ITAR', 'FDA', 'RoHS', 'REACH', 'UL Listed'];

  useEffect(() => {
    if (activeView === 'browse-rfqs') {
      loadRFQOpportunities();
    } else if (activeView === 'my-responses') {
      loadMyResponses();
    }
  }, [activeView]);

  const loadRFQOpportunities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.material_category) params.append('material_category', filters.material_category);

      const response = await axios.get(`/api/rfqs?${params.toString()}`);
      setRFQOpportunities(response.data || []);
    } catch (error) {
      console.error('Error loading RFQ opportunities:', error);
      // Show empty state on error
      setRFQOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMyResponses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/supplier/responses', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      setMyResponses(response.data || []);
    } catch (error) {
      console.error('Error loading responses:', error);
      // Show empty state on error
      setMyResponses([]);
    } finally {
      setLoading(false);
    }
  };

  const loadBuyerProfile = async (companyId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/companies/${companyId}/profile`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      });
      setSelectedBuyerProfile(response.data);
      setShowBuyerProfileModal(true);
    } catch (error) {
      console.error('Error loading buyer profile:', error);
      alert('Unable to load buyer profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRFQ) return;

    try {
      setLoading(true);

      const responseData = {
        price_quote: responseForm.price_quote,
        lead_time_days: responseForm.lead_time_days || undefined,
        minimum_order_quantity: responseForm.minimum_order_quantity,
        message: responseForm.message,
        certifications_provided: JSON.stringify(responseForm.certifications_provided),
        attachments: responseForm.attachments,
        // Enhanced Supplier Response fields
        supplier_part_number: responseForm.supplier_part_number || undefined,
        production_batch_size: responseForm.production_batch_size || undefined,
        supplier_moq: responseForm.supplier_moq || undefined,
        supplier_unit_of_measure: responseForm.supplier_unit_of_measure || undefined,
        production_lead_time_days: responseForm.production_lead_time_days || undefined,
        raw_material_type: responseForm.raw_material_type || undefined,
        raw_material_cost: responseForm.raw_material_cost || undefined
      };

      const response = await axios.post(`/api/rfqs/${selectedRFQ.id}/responses`, responseData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.status === 200 || response.status === 201) {
        alert('Response submitted successfully!');
        setShowResponseModal(false);
        setResponseForm({
          price_quote: '',
          lead_time_days: '',
          minimum_order_quantity: '',
          message: '',
          certifications_provided: [],
          attachments: '',
          supplier_part_number: '',
          production_batch_size: '',
          supplier_moq: '',
          supplier_unit_of_measure: '',
          production_lead_time_days: '',
          raw_material_type: '',
          raw_material_cost: ''
        });
        loadRFQOpportunities();
        loadMyResponses();
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Error submitting response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCertification = (cert: string) => {
    setResponseForm(prev => ({
      ...prev,
      certifications_provided: prev.certifications_provided.includes(cert)
        ? prev.certifications_provided.filter(c => c !== cert)
        : [...prev.certifications_provided, cert]
    }));
  };

  const formatTimeAgo = (dateString: string) => {
    return dateString; // Simple formatting for now
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'under_review': return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'accepted': return 'bg-green-50 text-green-700 border border-green-100';
      case 'rejected': return 'bg-red-50 text-red-700 border border-red-100';
      default: return 'bg-secondary-50 text-secondary-700 border border-secondary-100';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border border-green-100';
    if (score >= 70) return 'text-primary-600 bg-primary-50 border border-primary-100';
    return 'text-red-600 bg-red-50 border border-red-100';
  };

  const renderBrowseRFQs = () => (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className={dashboardTheme.hero.container}>
        {/* Animated background elements */}
        <div className={dashboardTheme.decorativeBackground.orb1}></div>
        <div className={dashboardTheme.decorativeBackground.orb2}></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-primary-200/50">
              <Package className="text-primary-600" size={24} />
            </div>
            <h1 className={dashboardTheme.typography.heading2}>RFQ Opportunities</h1>
          </div>
          <p className={dashboardTheme.typography.bodyLarge + " mb-8"}>Find and respond to requirements that match your capabilities</p>

          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white/60 backdrop-blur-md rounded-xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all">
              <div className="text-3xl font-bold text-secondary-900">{rfqOpportunities.length}</div>
              <div className="text-sm text-secondary-500 mt-1 font-medium">Available RFQs</div>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all">
              <div className="text-3xl font-bold text-primary-600">{rfqOpportunities.filter(r => r.match_score && r.match_score >= 80).length}</div>
              <div className="text-sm text-secondary-500 mt-1 font-medium">High Match RFQs</div>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all">
              <div className="text-3xl font-bold text-secondary-900">{myResponses.length}</div>
              <div className="text-sm text-secondary-500 mt-1 font-medium">Your Responses</div>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all">
              <div className="text-3xl font-bold text-green-600">89%</div>
              <div className="text-sm text-secondary-500 mt-1 font-medium">Response Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={dashboardTheme.cards.primary + " " + dashboardTheme.cards.padding.medium}>
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3.5 text-secondary-400" size={20} />
            <input
              type="text"
              placeholder="Search RFQs by material, company, specifications..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className={dashboardTheme.forms.input + " pl-12"}
            />
          </div>
          <select
            value={filters.material_category}
            onChange={(e) => setFilters(prev => ({ ...prev, material_category: e.target.value }))}
            className={dashboardTheme.forms.select + " w-64"}
          >
            <option value="">All Categories</option>
            {materialCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <button
            onClick={loadRFQOpportunities}
            className={dashboardTheme.buttons.primary + " shadow-lg shadow-primary-500/20"}
          >
            Search
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <span className={dashboardTheme.badges.primary}>Near Houston, TX</span>
          <span className={dashboardTheme.badges.neutral}>Metals & Alloys</span>
          <span className={dashboardTheme.badges.info}>Active RFQs</span>
        </div>
      </div>

      {/* RFQ Cards */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12 bg-white/50 backdrop-blur-sm border border-secondary-200 rounded-2xl">
            <div className={`${dashboardTheme.loading.spinner} h-12 w-12 border-4 border-t-primary-600 mx-auto`}></div>
            <p className="mt-4 text-secondary-500">Loading opportunities...</p>
          </div>
        ) : rfqOpportunities.length === 0 ? (
          <div className="text-center py-12 bg-white/50 backdrop-blur-sm border border-secondary-200 rounded-2xl">
            <Package size={48} className="mx-auto mb-4 text-secondary-400" />
            <p className="text-secondary-500">No RFQ opportunities found. Try adjusting your search criteria.</p>
          </div>
        ) : (
          rfqOpportunities.map(rfq => (
            <div key={rfq.id} className={`${dashboardTheme.cards.primary} ${dashboardTheme.cards.padding.medium} ${dashboardTheme.cards.hover} border-l-4 border-l-primary-500`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={dashboardTheme.typography.heading4}>{rfq.title}</h3>
                    {rfq.match_score && (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getMatchScoreColor(rfq.match_score)}`}>
                        {rfq.match_score}% Match
                      </span>
                    )}
                    <span className={dashboardTheme.badges.success}>
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-secondary-500 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={16} className="text-primary-600" />
                      <span className="font-semibold text-secondary-900">{rfq.buyer_company_name}</span>
                    </div>
                    <span className="text-secondary-300">•</span>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={16} />
                      <span>{rfq.delivery_location}</span>
                      {rfq.distance && <span className="text-primary-600 font-medium">({rfq.distance})</span>}
                    </div>
                    <span className="text-secondary-300">•</span>
                    <span>Posted {formatTimeAgo(rfq.created_at)}</span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-secondary-50/50 border border-secondary-200/50 rounded-xl p-4">
                      <div className="text-xs text-secondary-500 mb-1 font-medium uppercase tracking-wider">Quantity</div>
                      <div className="font-semibold text-secondary-900">{rfq.quantity}</div>
                    </div>
                    <div className="bg-secondary-50/50 border border-secondary-200/50 rounded-xl p-4">
                      <div className="text-xs text-secondary-500 mb-1 font-medium uppercase tracking-wider">Target Price</div>
                      <div className="font-semibold text-primary-600">{rfq.target_price}</div>
                    </div>
                    <div className="bg-secondary-50/50 border border-secondary-200/50 rounded-xl p-4">
                      <div className="text-xs text-secondary-500 mb-1 font-medium uppercase tracking-wider">Delivery Deadline</div>
                      <div className="font-semibold text-secondary-900">{rfq.delivery_deadline}</div>
                    </div>
                  </div>

                  {rfq.specifications && (
                    <div className="mb-6">
                      <div className="text-sm font-semibold text-secondary-900 mb-2">Specifications:</div>
                      <p className="text-sm text-secondary-600 line-clamp-2 leading-relaxed">{rfq.specifications}</p>
                    </div>
                  )}

                  {rfq.required_certifications && (
                    <div className="mb-6">
                      <div className="text-sm font-semibold text-secondary-900 mb-2">Required Certifications:</div>
                      <div className="flex gap-2 flex-wrap">
                        {rfq.required_certifications.split(',').map((cert, idx) => (
                          <span key={idx} className={dashboardTheme.badges.info + " flex items-center gap-1"}>
                            <Award size={14} />
                            {cert.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-secondary-500 pt-4 border-t border-secondary-100">
                    <div className="flex items-center gap-1.5">
                      <Eye size={16} />
                      <span>{rfq.view_count} views</span>
                    </div>
                    <span className="text-secondary-300">•</span>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare size={16} />
                      <span>{rfq.response_count} responses</span>
                    </div>
                    <span className="text-secondary-300">•</span>
                    <span className="text-amber-600 font-medium flex items-center gap-1.5">
                      <Clock size={16} />
                      {rfq.expires_at}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 ml-8">
                  <button
                    onClick={() => { setSelectedRFQ(rfq); setShowResponseModal(true); }}
                    className={dashboardTheme.buttons.primary + " flex items-center gap-2 justify-center w-full"}
                  >
                    <Send size={18} />
                    Submit Quote
                  </button>
                  <button
                    onClick={() => { setSelectedRFQ(rfq); setShowDetailsModal(true); }}
                    className={dashboardTheme.buttons.secondary + " flex items-center gap-2 justify-center w-full"}
                  >
                    <Eye size={18} />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderMyResponses = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className={dashboardTheme.hero.container}>
        {/* Animated background elements */}
        <div className={dashboardTheme.decorativeBackground.orb1}></div>
        <div className={dashboardTheme.decorativeBackground.orb2}></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-primary-200/50">
              <MessageSquare className="text-primary-600" size={24} />
            </div>
            <h1 className={dashboardTheme.typography.heading2}>My RFQ Responses</h1>
          </div>
          <p className={dashboardTheme.typography.bodyLarge + " mb-8"}>Track your submitted quotes and performance</p>

          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white/60 backdrop-blur-md rounded-xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all">
              <div className="text-3xl font-bold text-primary-600">{myResponses.length}</div>
              <div className="text-sm text-secondary-500 mt-1 font-medium">Total Responses</div>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all">
              <div className="text-3xl font-bold text-green-600">{myResponses.filter(r => r.status === 'accepted').length}</div>
              <div className="text-sm text-secondary-500 mt-1 font-medium">Accepted</div>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all">
              <div className="text-3xl font-bold text-blue-600">{myResponses.filter(r => r.status === 'under_review').length}</div>
              <div className="text-sm text-secondary-500 mt-1 font-medium">Under Review</div>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all">
              <div className="text-3xl font-bold text-secondary-900">
                {myResponses.length > 0 ? Math.round((myResponses.filter(r => r.status === 'accepted').length / myResponses.length) * 100) : 0}%
              </div>
              <div className="text-sm text-secondary-500 mt-1 font-medium">Win Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Response List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12 bg-white/50 backdrop-blur-sm border border-secondary-200 rounded-2xl">
            <div className={`${dashboardTheme.loading.spinner} h-12 w-12 border-4 border-t-primary-600 mx-auto`}></div>
            <p className="mt-4 text-secondary-500">Loading responses...</p>
          </div>
        ) : myResponses.length === 0 ? (
          <div className="text-center py-12 bg-white/50 backdrop-blur-sm border border-secondary-200 rounded-2xl">
            <MessageSquare size={48} className="mx-auto mb-4 text-secondary-400" />
            <p className="text-secondary-500 mb-6">No responses submitted yet. AI-Match RFQs to get started!</p>
            <button
              onClick={() => setActiveView('browse-rfqs')}
              className={dashboardTheme.buttons.primary}
            >
              AI-Match RFQ Opportunities
            </button>
          </div>
        ) : (
          myResponses.map(response => (
            <div key={response.id} className={`${dashboardTheme.cards.primary} ${dashboardTheme.cards.padding.medium} ${dashboardTheme.cards.hover}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={dashboardTheme.typography.heading4}>{response.rfq_title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(response.status)}`}>
                      {response.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    {response.is_competitive && (
                      <span className={dashboardTheme.badges.primary}>
                        Competitive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-secondary-500 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={16} className="text-primary-600" />
                      <span className="text-secondary-900 font-medium">{response.buyer_company_name}</span>
                    </div>
                    <span className="text-secondary-300">•</span>
                    <span>Responded {formatTimeAgo(response.responded_at)}</span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-secondary-50/50 border border-secondary-200/50 rounded-xl p-4">
                      <div className="text-xs text-secondary-500 mb-1 font-medium uppercase tracking-wider">Your Quote</div>
                      <div className="font-bold text-primary-600 text-lg">{response.price_quote}</div>
                    </div>
                    <div className="bg-secondary-50/50 border border-secondary-200/50 rounded-xl p-4">
                      <div className="text-xs text-secondary-500 mb-1 font-medium uppercase tracking-wider">Lead Time</div>
                      <div className="font-semibold text-secondary-900">{response.lead_time_days} days</div>
                    </div>
                    <div className="bg-secondary-50/50 border border-secondary-200/50 rounded-xl p-4">
                      <div className="text-xs text-secondary-500 mb-1 font-medium uppercase tracking-wider">Status</div>
                      <div className={`font-semibold ${response.status === 'accepted' ? 'text-green-600' :
                          response.status === 'under_review' ? 'text-blue-600' : 'text-secondary-500'
                        }`}>
                        {response.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                    </div>
                  </div>

                  {response.message && (
                    <div className="bg-secondary-50/50 border border-secondary-200/50 rounded-xl p-4">
                      <div className="text-sm font-semibold text-secondary-900 mb-1">Your Message:</div>
                      <p className="text-sm text-secondary-600">{response.message}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 ml-8">
                  <button className={dashboardTheme.buttons.secondary + " w-full justify-center"}>
                    View RFQ
                  </button>
                  {response.status === 'accepted' && response.buyer_company_id && (
                    <button
                      onClick={() => loadBuyerProfile(response.buyer_company_id!)}
                      className={dashboardTheme.buttons.primary + " w-full justify-center"}
                    >
                      Contact Buyer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

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
                <button
                  onClick={() => setActiveView('browse-rfqs')}
                  className={activeView === 'browse-rfqs'
                    ? dashboardTheme.navigation.navButtonActive
                    : dashboardTheme.navigation.navButton}
                >
                  AI-Match RFQs
                </button>
                <button
                  onClick={() => setActiveView('my-responses')}
                  className={activeView === 'my-responses'
                    ? dashboardTheme.navigation.navButtonActive
                    : dashboardTheme.navigation.navButton}
                >
                  My Responses
                </button>
                <a
                  href="/dashboard/supplier-profile"
                  className={dashboardTheme.navigation.navButton}
                >
                  My Profile
                </a>
                <a
                  href="/dashboard/supplier-analytics"
                  className={dashboardTheme.navigation.navButton}
                >
                  Analytics
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
        {activeView === 'browse-rfqs' ? renderBrowseRFQs() : renderMyResponses()}
      </main>

      {/* Response Modal */}
      {showResponseModal && selectedRFQ && (
        <div className={dashboardTheme.modals.overlay}>
          <div className={dashboardTheme.modals.container + " max-w-3xl"}>
            <div className={dashboardTheme.modals.header + " flex justify-between items-center"}>
              <h3 className={dashboardTheme.typography.heading3}>Submit Quote</h3>
              <button onClick={() => setShowResponseModal(false)} className="text-secondary-400 hover:text-secondary-600 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitResponse}>
              <div className={dashboardTheme.modals.body + " space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar"}>
                <div className="bg-primary-50 border border-primary-100 p-4 rounded-xl">
                  <div className="font-semibold text-secondary-900 mb-1">RFQ: {selectedRFQ.title}</div>
                  <div className="text-sm text-secondary-600 flex items-center gap-2">
                    <Building2 size={14} />
                    {selectedRFQ.buyer_company_name}
                  </div>
                </div>

                {/* Basic Quote Information */}
                <div className="border-b border-secondary-200 pb-4">
                  <h4 className="font-semibold text-secondary-900 mb-4">Quote Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={dashboardTheme.forms.label}>Price Quote *</label>
                      <input
                        type="text"
                        required
                        value={responseForm.price_quote}
                        onChange={(e) => setResponseForm(prev => ({ ...prev, price_quote: e.target.value }))}
                        placeholder="e.g., $15/kg"
                        className={dashboardTheme.forms.input}
                      />
                    </div>
                    <div>
                      <label className={dashboardTheme.forms.label}>Lead Time (Days) *</label>
                      <input
                        type="number"
                        required
                        value={responseForm.lead_time_days}
                        onChange={(e) => setResponseForm(prev => ({ ...prev, lead_time_days: parseInt(e.target.value) || '' }))}
                        placeholder="e.g., 14"
                        className={dashboardTheme.forms.input}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className={dashboardTheme.forms.label}>Minimum Order Quantity</label>
                    <input
                      type="text"
                      value={responseForm.minimum_order_quantity}
                      onChange={(e) => setResponseForm(prev => ({ ...prev, minimum_order_quantity: e.target.value }))}
                      placeholder="e.g., 100 kg"
                      className={dashboardTheme.forms.input}
                    />
                  </div>
                </div>

                {/* Enhanced Supplier Response Fields */}
                <div className="border-b border-secondary-200 pb-4">
                  <h4 className="font-semibold text-secondary-900 mb-4">Supplier Part Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={dashboardTheme.forms.label}>Supplier Part Number</label>
                      <input
                        type="text"
                        value={responseForm.supplier_part_number}
                        onChange={(e) => setResponseForm(prev => ({ ...prev, supplier_part_number: e.target.value }))}
                        placeholder="e.g., SP-45678-B"
                        className={dashboardTheme.forms.input}
                      />
                    </div>
                    <div>
                      <label className={dashboardTheme.forms.label}>Production Batch Size</label>
                      <input
                        type="text"
                        value={responseForm.production_batch_size}
                        onChange={(e) => setResponseForm(prev => ({ ...prev, production_batch_size: e.target.value }))}
                        placeholder="e.g., 500 units"
                        className={dashboardTheme.forms.input}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className={dashboardTheme.forms.label}>Supplier MOQ</label>
                      <input
                        type="text"
                        value={responseForm.supplier_moq}
                        onChange={(e) => setResponseForm(prev => ({ ...prev, supplier_moq: e.target.value }))}
                        placeholder="e.g., 200 units"
                        className={dashboardTheme.forms.input}
                      />
                    </div>
                    <div>
                      <label className={dashboardTheme.forms.label}>Unit of Measure</label>
                      <select
                        value={responseForm.supplier_unit_of_measure}
                        onChange={(e) => setResponseForm(prev => ({ ...prev, supplier_unit_of_measure: e.target.value }))}
                        className={dashboardTheme.forms.select}
                      >
                        <option value="">Select unit...</option>
                        {unitOfMeasureOptions.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={dashboardTheme.forms.label}>Production Lead Time (Days)</label>
                      <input
                        type="number"
                        value={responseForm.production_lead_time_days}
                        onChange={(e) => setResponseForm(prev => ({ ...prev, production_lead_time_days: parseInt(e.target.value) || '' }))}
                        placeholder="e.g., 21"
                        className={dashboardTheme.forms.input}
                      />
                    </div>
                  </div>
                </div>

                {/* Raw Material Information */}
                <div className="border-b border-secondary-200 pb-4">
                  <h4 className="font-semibold text-secondary-900 mb-4">Raw Material Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={dashboardTheme.forms.label}>Raw Material Type</label>
                      <select
                        value={responseForm.raw_material_type}
                        onChange={(e) => setResponseForm(prev => ({ ...prev, raw_material_type: e.target.value }))}
                        className={dashboardTheme.forms.select}
                      >
                        <option value="">Select material type...</option>
                        {rawMaterialTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={dashboardTheme.forms.label}>Raw Material Cost (Currency/kg)</label>
                      <input
                        type="text"
                        value={responseForm.raw_material_cost}
                        onChange={(e) => setResponseForm(prev => ({ ...prev, raw_material_cost: e.target.value }))}
                        placeholder="e.g., $8.50/kg"
                        className={dashboardTheme.forms.input}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={dashboardTheme.forms.label}>Message to Buyer</label>
                  <textarea
                    rows={4}
                    value={responseForm.message}
                    onChange={(e) => setResponseForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Describe your proposal, capabilities, and why you're the best fit..."
                    className={dashboardTheme.forms.textarea}
                  ></textarea>
                </div>

                <div>
                  <label className={dashboardTheme.forms.label}>Certifications to Include</label>
                  <div className="grid grid-cols-2 gap-2">
                    {certificationOptions.map(cert => (
                      <label key={cert} className="flex items-center gap-2 p-3 border border-secondary-200 rounded-xl hover:bg-secondary-50 cursor-pointer transition-all">
                        <input
                          type="checkbox"
                          checked={responseForm.certifications_provided.includes(cert)}
                          onChange={() => toggleCertification(cert)}
                          className={dashboardTheme.forms.checkbox}
                        />
                        <span className="text-sm text-secondary-700">{cert}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className={dashboardTheme.modals.footer}>
                <button
                  type="button"
                  onClick={() => setShowResponseModal(false)}
                  className={dashboardTheme.buttons.secondary}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={dashboardTheme.buttons.primary + " flex items-center gap-2 disabled:opacity-50"}
                >
                  <Send size={18} />
                  {loading ? 'Submitting...' : 'Submit Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDashboard;
