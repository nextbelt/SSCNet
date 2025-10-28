import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Building2, Package, MessageSquare, Star, CheckCircle, Clock, MapPin, Award, Send, Filter, Menu, X, Phone, Mail, Linkedin, AlertCircle, Upload, FileText, Eye, Trash2, Edit } from 'lucide-react';
import axios from 'axios';

interface MyRFQ {
  id: string;
  title: string;
  material_category?: string;
  quantity?: string;
  target_price?: string;
  status: 'active' | 'closed' | 'expired' | 'cancelled';
  view_count: number;
  response_count: number;
  created_at: string;
  expires_at?: string;
  delivery_deadline?: string;
}

interface SupplierResponse {
  id: string;
  supplier_company_name: string;
  supplier_company_id: string;
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected';
  price_quote?: string;
  lead_time_days?: number;
  minimum_order_quantity?: string;
  message?: string;
  certifications_provided?: string;
  responded_at: string;
  created_at: string;
}

interface CompanyProfile {
  id: string;
  name: string;
  industry?: string;
  headquarters_location?: string;
  employee_count?: string;
  founded_year?: number;
  description?: string;
  website_url?: string;
  linkedin_url?: string;
  verified: boolean;
  materials: string[];
  certifications: string[];
  capabilities: string[];
  pocs: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    linkedin_verified: boolean;
    is_primary: boolean;
    last_active?: string;
  }>;
  platform_stats: {
    rating: number;
    response_rate: number;
    avg_response_time_hours: number;
    completed_rfqs: number;
  };
}

const PostRFQPlatform = () => {
  const [activeView, setActiveView] = useState('post-rfq');
  const [myRFQs, setMyRFQs] = useState<MyRFQ[]>([]);
  const [selectedRFQ, setSelectedRFQ] = useState<MyRFQ | null>(null);
  const [rfqResponses, setRFQResponses] = useState<SupplierResponse[]>([]);
  const [viewingSupplierProfile, setViewingSupplierProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    material_category: '',
    quantity: '',
    target_price: '',
    specifications: '',
    delivery_deadline: '',
    delivery_location: '',
    required_certifications: [] as string[],
    notes: ''
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
    if (activeView === 'post-rfq') {
      loadMyRFQs();
    }
  }, [activeView]);

  const loadMyRFQs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/rfqs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setMyRFQs(response.data || []);
    } catch (error) {
      console.error('Error loading RFQs:', error);
      // Mock data for demo
      setMyRFQs([
        {
          id: '1',
          title: 'Stainless Steel Grade 304',
          material_category: 'Metals & Alloys',
          quantity: '5000 kg',
          target_price: '$15-20/kg',
          status: 'active',
          view_count: 34,
          response_count: 12,
          created_at: '2 days ago',
          expires_at: '5 days remaining'
        },
        {
          id: '2', 
          title: 'Aluminum 6061-T6 Sheet',
          material_category: 'Metals & Alloys',
          quantity: '3000 sheets',
          target_price: '$45/sheet',
          status: 'active',
          view_count: 21,
          response_count: 8,
          created_at: '4 days ago',
          expires_at: '3 days remaining'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadRFQResponses = async (rfqId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/rfqs/${rfqId}/responses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setRFQResponses(response.data || []);
    } catch (error) {
      console.error('Error loading responses:', error);
      // Mock data for demo
      setRFQResponses([
        {
          id: '1',
          supplier_company_name: 'Advanced Materials Corp',
          supplier_company_id: '1',
          status: 'submitted',
          price_quote: '$18.50/kg',
          lead_time_days: 25,
          minimum_order_quantity: '1000 kg',
          message: 'We can meet your specifications for Grade 304 stainless steel. Our facility is ISO certified and we have immediate availability.',
          certifications_provided: 'ISO 9001, AS9100',
          responded_at: '2 hours ago',
          created_at: '2024-01-15T10:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRFQ = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const rfqData = {
        title: formData.title,
        material_category: formData.material_category,
        quantity: formData.quantity,
        target_price: formData.target_price,
        specifications: formData.specifications,
        delivery_deadline: formData.delivery_deadline || undefined,
        delivery_location: formData.delivery_location,
        required_certifications: JSON.stringify(formData.required_certifications),
        visibility: 'public'
      };

      const response = await axios.post('/api/rfqs', rfqData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.status === 200 || response.status === 201) {
        alert('RFQ posted successfully!');
        setFormData({
          title: '',
          material_category: '',
          quantity: '',
          target_price: '',
          specifications: '',
          delivery_deadline: '',
          delivery_location: '',
          required_certifications: [],
          notes: ''
        });
        loadMyRFQs();
      }
    } catch (error) {
      console.error('Error creating RFQ:', error);
      alert('Error posting RFQ. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCertification = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      required_certifications: prev.required_certifications.includes(cert)
        ? prev.required_certifications.filter(c => c !== cert)
        : [...prev.required_certifications, cert]
    }));
  };

  const formatTimeAgo = (dateString: string) => {
    // Simple time formatting - could be enhanced with date-fns
    return dateString;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-200 text-gray-700';
      case 'expired': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderPostRFQ = () => (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">📝 Post Your Requirements</h1>
        <p className="text-blue-100 text-lg">Let verified suppliers come to you with competitive quotes</p>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">95%</div>
            <div className="text-sm text-blue-100">Average Response Rate</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">8-12</div>
            <div className="text-sm text-blue-100">Avg Quotes Received</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">24h</div>
            <div className="text-sm text-blue-100">First Response Time</div>
          </div>
        </div>
      </div>

      {/* RFQ Creation Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New RFQ</h2>
        
        <form onSubmit={handleCreateRFQ} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Stainless Steel Grade 304 for Manufacturing"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Material/Product Category *
              </label>
              <select 
                required
                value={formData.material_category}
                onChange={(e) => setFormData(prev => ({ ...prev, material_category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select category...</option>
                {materialCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity Required *
              </label>
              <input
                type="text"
                required
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="e.g., 5000 kg or 3000 units"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Target Price Range
              </label>
              <input
                type="text"
                value={formData.target_price}
                onChange={(e) => setFormData(prev => ({ ...prev, target_price: e.target.value }))}
                placeholder="e.g., $15-20/kg"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Required Delivery Date
              </label>
              <input
                type="date"
                value={formData.delivery_deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_deadline: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Detailed Specifications *
            </label>
            <textarea
              required
              rows={5}
              value={formData.specifications}
              onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
              placeholder="Describe your requirements in detail:&#10;- Material grade and specifications&#10;- Quality standards needed&#10;- Certifications required&#10;- Special processing requirements&#10;- Testing/inspection requirements"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Required Certifications
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {certificationOptions.map((cert) => (
                <label 
                  key={cert} 
                  className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                    formData.required_certifications.includes(cert)
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={formData.required_certifications.includes(cert)}
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
              Delivery Location
            </label>
            <input
              type="text"
              value={formData.delivery_location}
              onChange={(e) => setFormData(prev => ({ ...prev, delivery_location: e.target.value }))}
              placeholder="e.g., Houston, TX or Multiple locations"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Supporting Documents
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
              <Upload className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600 mb-2">
                <span className="text-blue-600 font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-gray-500">Technical drawings, specifications, CAD files (PDF, DWG, STEP)</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Information
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any other details suppliers should know (payment terms, inspection requirements, etc.)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 mt-0.5" size={20} />
              <div className="text-sm">
                <div className="font-semibold text-blue-900 mb-1">Your RFQ will be visible to:</div>
                <ul className="text-blue-800 space-y-1">
                  <li>• All verified suppliers matching your requirements</li>
                  <li>• Suppliers will see your company name and basic contact info</li>
                  <li>• You'll receive quotes directly from interested suppliers</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send size={20} />
              {loading ? 'Posting...' : 'Post RFQ'}
            </button>
            <button 
              type="button"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Save as Draft
            </button>
          </div>
        </form>
      </div>

      {/* My Posted RFQs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Posted RFQs</h2>
          <span className="text-sm text-gray-500">{myRFQs.length} total</span>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading RFQs...</p>
          </div>
        ) : myRFQs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No RFQs posted yet. Create your first RFQ above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myRFQs.map(rfq => (
              <div key={rfq.id} className={`border rounded-lg p-5 hover:shadow-md transition-shadow ${
                rfq.status === 'active' ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{rfq.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(rfq.status)}`}>
                        {rfq.status === 'active' ? '● Active' : rfq.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {rfq.quantity && <span>Qty: {rfq.quantity}</span>}
                      {rfq.target_price && (
                        <>
                          <span>•</span>
                          <span>Target: {rfq.target_price}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>Posted {formatTimeAgo(rfq.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded">
                      <Eye size={18} />
                    </button>
                    {rfq.status === 'active' && (
                      <>
                        <button className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded">
                          <Edit size={18} />
                        </button>
                        <button className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded">
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-blue-600">{rfq.response_count}</div>
                    <div className="text-xs text-gray-600">Responses Received</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-purple-600">{rfq.view_count}</div>
                    <div className="text-xs text-gray-600">Supplier Views</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className={`text-lg font-bold ${
                      rfq.status === 'active' ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      {rfq.expires_at || 'Open'}
                    </div>
                    <div className="text-xs text-gray-600">Deadline</div>
                  </div>
                </div>

                {rfq.status === 'active' && rfq.response_count > 0 && (
                  <button 
                    onClick={() => {
                      setSelectedRFQ(rfq);
                      setActiveView('view-responses');
                      loadRFQResponses(rfq.id);
                    }}
                    className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    View {rfq.response_count} Responses →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderViewResponses = () => (
    <div className="space-y-6">
      {/* RFQ Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <button 
          onClick={() => setActiveView('post-rfq')}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
        >
          ← Back to My RFQs
        </button>
        {selectedRFQ && (
          <>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{selectedRFQ.title}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  {selectedRFQ.quantity && <span>Quantity: {selectedRFQ.quantity}</span>}
                  {selectedRFQ.target_price && (
                    <>
                      <span>•</span>
                      <span>Target: {selectedRFQ.target_price}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>Posted {formatTimeAgo(selectedRFQ.created_at)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{rfqResponses.length}</div>
                <div className="text-sm text-gray-600">Supplier Responses</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{selectedRFQ.view_count}</div>
                <div className="text-sm text-gray-600">Total Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{selectedRFQ.response_count}</div>
                <div className="text-sm text-gray-600">Responses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{rfqResponses.filter(r => r.price_quote).length}</div>
                <div className="text-sm text-gray-600">Quotes Received</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{selectedRFQ.expires_at || 'Open'}</div>
                <div className="text-sm text-gray-600">Deadline</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Responses */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Supplier Responses</h2>
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>Sort by: Most Recent</option>
            <option>Sort by: Lowest Price</option>
            <option>Sort by: Highest Rating</option>
            <option>Sort by: Fastest Response</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading responses...</p>
          </div>
        ) : rfqResponses.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">No responses yet. Suppliers will respond soon!</p>
          </div>
        ) : (
          rfqResponses.map(response => (
            <div key={response.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                    {response.supplier_company_name.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-800">{response.supplier_company_name}</h3>
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs font-semibold text-blue-700">
                        <Linkedin size={14} />
                        Verified
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-gray-600">Responded {formatTimeAgo(response.responded_at)}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  response.price_quote 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {response.price_quote ? '✓ Quote Provided' : 'Interested'}
                </span>
              </div>

              {/* Quote Details */}
              {response.price_quote && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Price per Unit</div>
                      <div className="text-2xl font-bold text-blue-600">{response.price_quote}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Lead Time</div>
                      <div className="text-lg font-semibold text-gray-800">
                        {response.lead_time_days ? `${response.lead_time_days} days` : 'TBD'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Min Order Qty</div>
                      <div className="text-lg font-semibold text-gray-800">
                        {response.minimum_order_quantity || 'Flexible'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Certifications</div>
                      <div className="flex gap-1 flex-wrap">
                        {response.certifications_provided ? 
                          response.certifications_provided.split(',').map((cert, idx) => (
                            <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                              {cert.trim()}
                            </span>
                          )) : 
                          <span className="text-xs text-gray-500">None specified</span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              {response.message && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">Message from Supplier:</div>
                  <p className="text-gray-700">{response.message}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2">
                  <MessageSquare size={18} />
                  Start Conversation
                </button>
                <button 
                  className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold flex items-center gap-2"
                  onClick={() => {
                    // This would load the supplier profile
                    console.log('View supplier profile:', response.supplier_company_id);
                  }}
                >
                  <Linkedin size={18} />
                  View Company Profile
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">
                  <Star size={18} />
                </button>
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
                <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">SSCN</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Sourcing Supply Chain Net
                </span>
              </div>
              
              <div className="hidden md:flex gap-6">
                <button
                  onClick={() => setActiveView('post-rfq')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeView === 'post-rfq' || activeView === 'view-responses'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  📝 Post RFQ
                </button>
                <a 
                  href="/dashboard/buyer"
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  🔍 Find Suppliers
                </a>
                <button className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">
                  💬 Messages
                </button>
                <button className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">
                  🏢 My Profile
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
        {activeView === 'post-rfq' && renderPostRFQ()}
        {activeView === 'view-responses' && renderViewResponses()}
      </main>
    </div>
  );
};

export default PostRFQPlatform;