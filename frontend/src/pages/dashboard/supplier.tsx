import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Building2, Package, MessageSquare, Star, CheckCircle, Clock, MapPin, Award, Send, Filter, Menu, X, Phone, Mail, Linkedin, AlertCircle, Upload, FileText, Eye, Trash2, Edit, TrendingUp, BarChart3, Calendar, DollarSign } from 'lucide-react';
import axios from 'axios';

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
}

interface ResponseFormData {
  price_quote: string;
  lead_time_days: number | '';
  minimum_order_quantity: string;
  message: string;
  certifications_provided: string[];
  attachments: string;
}

const SupplierDashboard = () => {
  const [activeView, setActiveView] = useState('browse-rfqs');
  const [rfqOpportunities, setRFQOpportunities] = useState<RFQOpportunity[]>([]);
  const [myResponses, setMyResponses] = useState<MyResponse[]>([]);
  const [selectedRFQ, setSelectedRFQ] = useState<RFQOpportunity | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
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
    attachments: ''
  });

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
      // Mock data for demo
      setRFQOpportunities([
        {
          id: '1',
          title: 'Stainless Steel Grade 304 for Manufacturing',
          buyer_company_name: 'AeroTech Industries',
          material_category: 'Metals & Alloys',
          quantity: '5000 kg',
          target_price: '$15-20/kg',
          specifications: 'Grade 304 stainless steel sheets, 2mm thickness, mirror finish required. Must meet ASTM A240 standards.',
          delivery_deadline: '2024-02-15',
          delivery_location: 'Houston, TX',
          required_certifications: 'ISO 9001, AS9100',
          status: 'active',
          view_count: 34,
          response_count: 12,
          created_at: '2 days ago',
          expires_at: '5 days remaining',
          match_score: 95,
          distance: '45 miles'
        },
        {
          id: '2',
          title: 'Aluminum 6061-T6 Extrusions',
          buyer_company_name: 'BuildRight Construction',
          material_category: 'Metals & Alloys',
          quantity: '2000 linear feet',
          target_price: '$8-12/ft',
          specifications: 'Custom T-slot extrusions for structural framework. Anodized finish preferred.',
          delivery_deadline: '2024-02-20',
          delivery_location: 'Dallas, TX',
          required_certifications: 'ISO 9001',
          status: 'active',
          view_count: 28,
          response_count: 8,
          created_at: '4 days ago',
          expires_at: '8 days remaining',
          match_score: 88,
          distance: '120 miles'
        },
        {
          id: '3',
          title: 'Engineering Grade Plastics - Bulk Order',
          buyer_company_name: 'MedDevice Solutions',
          material_category: 'Plastics & Polymers',
          quantity: '10,000 units',
          target_price: '$2.50-4.00/unit',
          specifications: 'PEEK plastic components for medical devices. FDA compliant materials required.',
          delivery_deadline: '2024-03-01',
          delivery_location: 'Austin, TX',
          required_certifications: 'FDA, ISO 13485',
          status: 'active',
          view_count: 42,
          response_count: 15,
          created_at: '1 day ago',
          expires_at: '12 days remaining',
          match_score: 72,
          distance: '85 miles'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadMyResponses = async () => {
    try {
      setLoading(true);
      // This would be an endpoint to get supplier's submitted responses
      // const response = await axios.get('/api/supplier/responses', {
      //   headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
      // });
      // setMyResponses(response.data || []);
      
      // Mock data for demo
      setMyResponses([
        {
          id: '1',
          rfq_id: '1',
          rfq_title: 'Stainless Steel Grade 304 for Manufacturing',
          buyer_company_name: 'AeroTech Industries',
          status: 'submitted',
          price_quote: '$18.50/kg',
          lead_time_days: 25,
          message: 'We can meet your specifications with our premium Grade 304 steel. Immediate availability.',
          responded_at: '2 hours ago',
          is_competitive: true
        },
        {
          id: '2',
          rfq_id: '4',
          rfq_title: 'Titanium Alloy Components',
          buyer_company_name: 'Aerospace Dynamics',
          status: 'under_review',
          price_quote: '$85/kg',
          lead_time_days: 35,
          message: 'Specialized titanium processing capabilities. Can provide full traceability.',
          responded_at: '1 day ago',
          is_competitive: true
        },
        {
          id: '3',
          rfq_id: '5',
          rfq_title: 'Custom Aluminum Castings',
          buyer_company_name: 'AutoParts Inc',
          status: 'accepted',
          price_quote: '$12.75/unit',
          lead_time_days: 21,
          message: 'Our precision casting capabilities are perfect for this application.',
          responded_at: '5 days ago',
          is_competitive: true
        }
      ]);
    } catch (error) {
      console.error('Error loading responses:', error);
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
        attachments: responseForm.attachments
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
          attachments: ''
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
      case 'submitted': return 'bg-blue-100 text-blue-700';
      case 'under_review': return 'bg-yellow-100 text-yellow-700';
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const renderBrowseRFQs = () => (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">🎯 RFQ Opportunities</h1>
        <p className="text-green-100 text-lg">Find and respond to requirements that match your capabilities</p>
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{rfqOpportunities.length}</div>
            <div className="text-sm text-green-100">Available RFQs</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{rfqOpportunities.filter(r => r.match_score && r.match_score >= 80).length}</div>
            <div className="text-sm text-green-100">High Match RFQs</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{myResponses.length}</div>
            <div className="text-sm text-green-100">Your Responses</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">89%</div>
            <div className="text-sm text-green-100">Response Rate</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search RFQs by material, company, specifications..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select 
            value={filters.material_category}
            onChange={(e) => setFilters(prev => ({ ...prev, material_category: e.target.value }))}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Categories</option>
            {materialCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <button 
            onClick={loadRFQOpportunities}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Search
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Near Houston, TX</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Metals & Alloys</span>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">Active RFQs</span>
        </div>
      </div>

      {/* RFQ Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading opportunities...</p>
          </div>
        ) : rfqOpportunities.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">No RFQ opportunities found. Try adjusting your search criteria.</p>
          </div>
        ) : (
          rfqOpportunities.map(rfq => (
            <div key={rfq.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{rfq.title}</h3>
                    {rfq.match_score && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getMatchScoreColor(rfq.match_score)}`}>
                        {rfq.match_score}% Match
                      </span>
                    )}
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Building2 size={16} />
                      <span className="font-semibold">{rfq.buyer_company_name}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      <span>{rfq.delivery_location}</span>
                      {rfq.distance && <span className="text-green-600">({rfq.distance})</span>}
                    </div>
                    <span>•</span>
                    <span>Posted {formatTimeAgo(rfq.created_at)}</span>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Quantity</div>
                      <div className="font-semibold text-gray-800">{rfq.quantity}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Target Price</div>
                      <div className="font-semibold text-green-600">{rfq.target_price}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Delivery Deadline</div>
                      <div className="font-semibold text-orange-600">{rfq.delivery_deadline}</div>
                    </div>
                  </div>

                  {rfq.specifications && (
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-gray-700 mb-1">Specifications:</div>
                      <p className="text-sm text-gray-600 line-clamp-2">{rfq.specifications}</p>
                    </div>
                  )}

                  {rfq.required_certifications && (
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Required Certifications:</div>
                      <div className="flex gap-2 flex-wrap">
                        {rfq.required_certifications.split(',').map((cert, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                            {cert.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye size={16} />
                      <span>{rfq.view_count} views</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <MessageSquare size={16} />
                      <span>{rfq.response_count} responses</span>
                    </div>
                    <span>•</span>
                    <span className="text-orange-600">{rfq.expires_at}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-6">
                  <button
                    onClick={() => { setSelectedRFQ(rfq); setShowResponseModal(true); }}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2"
                  >
                    <Send size={18} />
                    Submit Quote
                  </button>
                  <button className="px-6 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-2">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">📊 My RFQ Responses</h1>
        <p className="text-blue-100 text-lg">Track your submitted quotes and performance</p>
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{myResponses.length}</div>
            <div className="text-sm text-blue-100">Total Responses</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{myResponses.filter(r => r.status === 'accepted').length}</div>
            <div className="text-sm text-blue-100">Accepted</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{myResponses.filter(r => r.status === 'under_review').length}</div>
            <div className="text-sm text-blue-100">Under Review</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">
              {myResponses.length > 0 ? Math.round((myResponses.filter(r => r.status === 'accepted').length / myResponses.length) * 100) : 0}%
            </div>
            <div className="text-sm text-blue-100">Win Rate</div>
          </div>
        </div>
      </div>

      {/* Response List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading responses...</p>
          </div>
        ) : myResponses.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">No responses submitted yet. Browse RFQs to get started!</p>
            <button 
              onClick={() => setActiveView('browse-rfqs')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse RFQ Opportunities
            </button>
          </div>
        ) : (
          myResponses.map(response => (
            <div key={response.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{response.rfq_title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(response.status)}`}>
                      {response.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    {response.is_competitive && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        🏆 Competitive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Building2 size={16} />
                      <span>{response.buyer_company_name}</span>
                    </div>
                    <span>•</span>
                    <span>Responded {formatTimeAgo(response.responded_at)}</span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Your Quote</div>
                      <div className="font-bold text-green-600 text-lg">{response.price_quote}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Lead Time</div>
                      <div className="font-semibold text-gray-800">{response.lead_time_days} days</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Status</div>
                      <div className={`font-semibold ${
                        response.status === 'accepted' ? 'text-green-600' :
                        response.status === 'under_review' ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        {response.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                    </div>
                  </div>

                  {response.message && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-semibold text-gray-700 mb-1">Your Message:</div>
                      <p className="text-sm text-gray-600">{response.message}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-6">
                  <button className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm">
                    View RFQ
                  </button>
                  {response.status === 'accepted' && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
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
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-600 rounded flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">SSCN</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Supplier Portal
                </span>
              </div>
              
              <div className="hidden md:flex gap-6">
                <button
                  onClick={() => setActiveView('browse-rfqs')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeView === 'browse-rfqs'
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  🎯 Browse RFQs
                </button>
                <button
                  onClick={() => setActiveView('my-responses')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeView === 'my-responses'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  📊 My Responses
                </button>
                <a 
                  href="/dashboard/supplier-profile"
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                >
                  🏢 My Profile
                </a>
                <a 
                  href="/dashboard/supplier-analytics"
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                >
                  📊 Analytics
                </a>
                <button className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">
                  💬 Messages
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-800">
                <Bell size={24} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="flex items-center gap-2 p-2 text-gray-600 hover:text-gray-800">
                <User size={24} />
                <span className="hidden md:inline font-medium">Account</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeView === 'browse-rfqs' && renderBrowseRFQs()}
        {activeView === 'my-responses' && renderMyResponses()}
      </main>

      {/* Response Submission Modal */}
      {showResponseModal && selectedRFQ && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">Submit Quote</h3>
              <button onClick={() => setShowResponseModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              {/* RFQ Summary */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-bold text-gray-800 mb-2">{selectedRFQ.title}</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Buyer:</span>
                    <span className="ml-2 font-semibold">{selectedRFQ.buyer_company_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Quantity:</span>
                    <span className="ml-2 font-semibold">{selectedRFQ.quantity}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Target Price:</span>
                    <span className="ml-2 font-semibold text-green-600">{selectedRFQ.target_price}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitResponse} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Price Quote *
                    </label>
                    <input
                      type="text"
                      required
                      value={responseForm.price_quote}
                      onChange={(e) => setResponseForm(prev => ({ ...prev, price_quote: e.target.value }))}
                      placeholder="e.g., $18.50/kg"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Lead Time (days)
                    </label>
                    <input
                      type="number"
                      value={responseForm.lead_time_days}
                      onChange={(e) => setResponseForm(prev => ({ ...prev, lead_time_days: parseInt(e.target.value) || '' }))}
                      placeholder="e.g., 25"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Minimum Order Quantity
                  </label>
                  <input
                    type="text"
                    value={responseForm.minimum_order_quantity}
                    onChange={(e) => setResponseForm(prev => ({ ...prev, minimum_order_quantity: e.target.value }))}
                    placeholder="e.g., 1000 kg"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Certifications You Can Provide
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {certificationOptions.map((cert) => (
                      <label 
                        key={cert} 
                        className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                          responseForm.certifications_provided.includes(cert)
                            ? 'bg-green-50 border-green-300 text-green-700'
                            : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={responseForm.certifications_provided.includes(cert)}
                          onChange={() => toggleCertification(cert)}
                          className="rounded" 
                        />
                        <span className="text-sm">{cert}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message to Buyer *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={responseForm.message}
                    onChange={(e) => setResponseForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Explain why you're the best fit for this requirement. Include relevant experience, capabilities, and any additional value you provide..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Supporting Documents
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer">
                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-gray-600 text-sm">
                      Upload certifications, capabilities sheets, or samples
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-green-600 mt-0.5" size={20} />
                    <div className="text-sm">
                      <div className="font-semibold text-green-900 mb-1">Your response will be sent to:</div>
                      <ul className="text-green-800 space-y-1">
                        <li>• {selectedRFQ.buyer_company_name}</li>
                        <li>• Your company profile and contact info will be shared</li>
                        <li>• Buyer can respond directly or start a conversation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowResponseModal(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send size={20} />
                    {loading ? 'Submitting...' : 'Submit Quote'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierDashboard;