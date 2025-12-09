import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Building2, Package, MessageSquare, Star, CheckCircle, Clock, MapPin, Award, Send, Filter, Menu, X, Phone, Mail, Linkedin, AlertCircle, Upload, FileText, Eye, Trash2, Edit, ChevronDown, Settings, LogOut } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { dashboardTheme } from '@/styles/dashboardTheme';

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
  const router = useRouter();
  const [activeView, setActiveView] = useState('post-rfq');
  const [myRFQs, setMyRFQs] = useState<MyRFQ[]>([]);
  const [selectedRFQ, setSelectedRFQ] = useState<MyRFQ | null>(null);
  const [rfqResponses, setRFQResponses] = useState<SupplierResponse[]>([]);
  const [viewingSupplierProfile, setViewingSupplierProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    material_category: '',
    quantity: '',
    target_price: '',
    specifications: '',
    delivery_deadline: '',
    delivery_location: '',
    required_certifications: [] as string[],
    notes: '',
    // Enhanced RFQ fields
    part_number: '',
    part_number_description: '',
    delivery_plant: '',
    yearly_quantity: '',
    moq_required: '',
    price_unit: '',
    unit_of_measure: '',
    currency: '',
    incoterm: '',
    commodity: ''
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

  const certificationOptions = ['ISO 9001', 'AS9100', 'ISO 14001', 'ITAR', 'FDA', 'RoHS', 'REACH', 'UL Listed'];

  const incotermOptions = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'];
  
  const currencyOptions = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CAD', 'AUD', 'CHF', 'INR', 'MXN'];
  
  const unitOfMeasureOptions = ['kg', 'g', 'lb', 'oz', 'units', 'pieces', 'meters', 'feet', 'liters', 'gallons', 'sheets', 'rolls'];
  
  const priceUnitOptions = ['per piece', 'per kg', 'per lb', 'per unit', 'per meter', 'per foot', 'per liter', 'per sheet', 'per roll', 'per 1000 pieces'];

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
      // Show empty state on error
      setMyRFQs([]);
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
      // Show empty state on error
      setRFQResponses([]);
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
        visibility: 'public',
        // Enhanced RFQ fields
        part_number: formData.part_number || undefined,
        part_number_description: formData.part_number_description || undefined,
        delivery_plant: formData.delivery_plant || undefined,
        yearly_quantity: formData.yearly_quantity || undefined,
        moq_required: formData.moq_required || undefined,
        price_unit: formData.price_unit || undefined,
        unit_of_measure: formData.unit_of_measure || undefined,
        currency: formData.currency || undefined,
        incoterm: formData.incoterm || undefined,
        commodity: formData.commodity || undefined
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
          notes: '',
          part_number: '',
          part_number_description: '',
          delivery_plant: '',
          yearly_quantity: '',
          moq_required: '',
          price_unit: '',
          unit_of_measure: '',
          currency: '',
          incoterm: '',
          commodity: ''
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
      case 'active': return 'bg-green-50 text-green-700 border border-green-100';
      case 'closed': return 'bg-secondary-50 text-secondary-600 border border-secondary-200';
      case 'expired': return 'bg-red-50 text-red-700 border border-red-100';
      case 'cancelled': return 'bg-primary-50 text-primary-600 border border-primary-100';
      default: return 'bg-secondary-50 text-secondary-600 border border-secondary-200';
    }
  };

  const renderPostRFQ = () => (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className={dashboardTheme.hero.container}>
        {/* Animated background elements */}
        <div className={dashboardTheme.decorativeBackground.orb1}></div>
        <div className={dashboardTheme.decorativeBackground.orb2}></div>

        <div className="relative z-10">
          <h1 className={dashboardTheme.typography.heading2}>Post Your Requirements</h1>
          <p className={dashboardTheme.typography.bodyLarge + " mb-8"}>Let verified suppliers come to you with competitive quotes</p>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white/60 backdrop-blur-md rounded-xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all">
              <div className="text-3xl font-bold text-secondary-900">95%</div>
              <div className="text-sm text-secondary-500 mt-1 font-medium">Average Response Rate</div>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all">
              <div className="text-3xl font-bold text-secondary-900">8-12</div>
              <div className="text-sm text-secondary-500 mt-1 font-medium">Avg Quotes Received</div>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all">
              <div className="text-3xl font-bold text-secondary-900">24h</div>
              <div className="text-sm text-secondary-500 mt-1 font-medium">First Response Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* RFQ Creation Form */}
      <div className={dashboardTheme.cards.primary + " " + dashboardTheme.cards.padding.large}>
        <h2 className={dashboardTheme.typography.heading3 + " mb-6"}>Create New RFQ</h2>

        <form onSubmit={handleCreateRFQ} className="space-y-6">
          <div>
            <label className={dashboardTheme.forms.label}>
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Stainless Steel Grade 304 for Manufacturing"
              className={dashboardTheme.forms.input}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className={dashboardTheme.forms.label}>
                Material/Product Category *
              </label>
              <select
                required
                value={formData.material_category}
                onChange={(e) => setFormData(prev => ({ ...prev, material_category: e.target.value }))}
                className={dashboardTheme.forms.select}
              >
                <option value="">Select category...</option>
                {materialCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={dashboardTheme.forms.label}>
                Quantity Required *
              </label>
              <input
                type="text"
                required
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="e.g., 5000 kg or 3000 units"
                className={dashboardTheme.forms.input}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className={dashboardTheme.forms.label}>
                Target Price Range
              </label>
              <input
                type="text"
                value={formData.target_price}
                onChange={(e) => setFormData(prev => ({ ...prev, target_price: e.target.value }))}
                placeholder="e.g., $15-20/kg"
                className={dashboardTheme.forms.input}
              />
            </div>
            <div>
              <label className={dashboardTheme.forms.label}>
                Required Delivery Date
              </label>
              <input
                type="date"
                value={formData.delivery_deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_deadline: e.target.value }))}
                className={dashboardTheme.forms.input}
              />
            </div>
          </div>

          {/* Enhanced RFQ Fields Section */}
          <div className="border-t border-secondary-200 pt-6 mt-6">
            <h3 className={dashboardTheme.typography.heading4 + " mb-4"}>Part Details</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={dashboardTheme.forms.label}>
                  Part Number
                </label>
                <input
                  type="text"
                  value={formData.part_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, part_number: e.target.value }))}
                  placeholder="e.g., PN-12345-A"
                  className={dashboardTheme.forms.input}
                />
              </div>
              <div>
                <label className={dashboardTheme.forms.label}>
                  Commodity
                </label>
                <input
                  type="text"
                  value={formData.commodity}
                  onChange={(e) => setFormData(prev => ({ ...prev, commodity: e.target.value }))}
                  placeholder="e.g., Steel Fasteners, Electronic Components"
                  className={dashboardTheme.forms.input}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className={dashboardTheme.forms.label}>
                Part Number Description
              </label>
              <textarea
                rows={2}
                value={formData.part_number_description}
                onChange={(e) => setFormData(prev => ({ ...prev, part_number_description: e.target.value }))}
                placeholder="Detailed description of the part requirements"
                className={dashboardTheme.forms.textarea}
              ></textarea>
            </div>
          </div>

          {/* Quantity & Pricing Section */}
          <div className="border-t border-secondary-200 pt-6">
            <h3 className={dashboardTheme.typography.heading4 + " mb-4"}>Quantity & Pricing</h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className={dashboardTheme.forms.label}>
                  Yearly Quantity
                </label>
                <input
                  type="text"
                  value={formData.yearly_quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, yearly_quantity: e.target.value }))}
                  placeholder="e.g., 50,000 units/year"
                  className={dashboardTheme.forms.input}
                />
              </div>
              <div>
                <label className={dashboardTheme.forms.label}>
                  MOQ Required
                </label>
                <input
                  type="text"
                  value={formData.moq_required}
                  onChange={(e) => setFormData(prev => ({ ...prev, moq_required: e.target.value }))}
                  placeholder="e.g., 1000 units"
                  className={dashboardTheme.forms.input}
                />
              </div>
              <div>
                <label className={dashboardTheme.forms.label}>
                  Unit of Measure
                </label>
                <select
                  value={formData.unit_of_measure}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit_of_measure: e.target.value }))}
                  className={dashboardTheme.forms.select}
                >
                  <option value="">Select unit...</option>
                  {unitOfMeasureOptions.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-4">
              <div>
                <label className={dashboardTheme.forms.label}>
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className={dashboardTheme.forms.select}
                >
                  <option value="">Select currency...</option>
                  {currencyOptions.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={dashboardTheme.forms.label}>
                  Price Unit
                </label>
                <select
                  value={formData.price_unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_unit: e.target.value }))}
                  className={dashboardTheme.forms.select}
                >
                  <option value="">Select price unit...</option>
                  {priceUnitOptions.map(pu => (
                    <option key={pu} value={pu}>{pu}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={dashboardTheme.forms.label}>
                  Incoterm
                </label>
                <select
                  value={formData.incoterm}
                  onChange={(e) => setFormData(prev => ({ ...prev, incoterm: e.target.value }))}
                  className={dashboardTheme.forms.select}
                >
                  <option value="">Select incoterm...</option>
                  {incotermOptions.map(term => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Delivery Section */}
          <div className="border-t border-secondary-200 pt-6">
            <h3 className={dashboardTheme.typography.heading4 + " mb-4"}>Delivery Information</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={dashboardTheme.forms.label}>
                  Delivery Plant
                </label>
                <input
                  type="text"
                  value={formData.delivery_plant}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_plant: e.target.value }))}
                  placeholder="e.g., Plant A - Houston, TX"
                  className={dashboardTheme.forms.input}
                />
              </div>
              <div>
                <label className={dashboardTheme.forms.label}>
                  Delivery Location
                </label>
                <input
                  type="text"
                  value={formData.delivery_location}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_location: e.target.value }))}
                  placeholder="e.g., Houston, TX or Multiple locations"
                  className={dashboardTheme.forms.input}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={dashboardTheme.forms.label}>
              Detailed Specifications *
            </label>
            <textarea
              required
              rows={5}
              value={formData.specifications}
              onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
              placeholder="Describe your requirements in detail:&#10;- Material grade and specifications&#10;- Quality standards needed&#10;- Certifications required&#10;- Special processing requirements&#10;- Testing/inspection requirements"
              className={dashboardTheme.forms.textarea}
            ></textarea>
          </div>

          <div>
            <label className={dashboardTheme.forms.label}>
              Required Certifications
            </label>
            <div className="flex flex-wrap gap-3 mb-3">
              {certificationOptions.map((cert) => (
                <label
                  key={cert}
                  className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl cursor-pointer transition-all ${formData.required_certifications.includes(cert)
                    ? 'bg-primary-50 border-primary-200 text-primary-700 shadow-sm'
                    : 'bg-white border-secondary-200 text-secondary-600 hover:bg-secondary-50'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.required_certifications.includes(cert)}
                    onChange={() => toggleCertification(cert)}
                    className={dashboardTheme.forms.checkbox}
                  />
                  <span className="text-sm font-medium">{cert}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={dashboardTheme.forms.label}>
              Upload Supporting Documents
            </label>
            <div className="border-2 border-dashed border-secondary-200 rounded-xl p-8 text-center hover:border-primary-500 hover:bg-primary-50/30 transition-all cursor-pointer group">
              <div className="w-16 h-16 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-colors">
                <Upload className="text-secondary-400 group-hover:text-primary-600 transition-colors" size={24} />
              </div>
              <p className="text-secondary-600 mb-2 font-medium">
                <span className="text-primary-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-secondary-400">Technical drawings, specifications, CAD files (PDF, DWG, STEP)</p>
            </div>
          </div>

          <div>
            <label className={dashboardTheme.forms.label}>
              Additional Information
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any other details suppliers should know (payment terms, inspection requirements, etc.)"
              className={dashboardTheme.forms.textarea}
            ></textarea>
          </div>

          <div className="bg-primary-50/50 border border-primary-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-primary-600 mt-0.5" size={20} />
              <div className="text-sm">
                <div className="font-semibold text-primary-900 mb-1">Your RFQ will be visible to:</div>
                <ul className="text-primary-800 space-y-1">
                  <li>• All verified suppliers matching your requirements</li>
                  <li>• Suppliers will see your company name and basic contact info</li>
                  <li>• You'll receive quotes directly from interested suppliers</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-secondary-100">
            <button
              type="submit"
              disabled={loading}
              className={dashboardTheme.buttons.primary + " flex-1 justify-center text-lg py-3 disabled:opacity-50"}
            >
              <Send size={20} className="mr-2" />
              {loading ? 'Posting...' : 'Post RFQ'}
            </button>
            <button
              type="button"
              className={dashboardTheme.buttons.secondary + " px-8 text-lg py-3"}
            >
              Save as Draft
            </button>
          </div>
        </form>
      </div>

      {/* My Posted RFQs */}
      <div className={dashboardTheme.cards.primary + " " + dashboardTheme.cards.padding.large}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={dashboardTheme.typography.heading3}>My Posted RFQs</h2>
          <span className="text-sm font-medium text-secondary-500 bg-secondary-100 px-3 py-1 rounded-full">{myRFQs.length} total</span>
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white/50 backdrop-blur-sm border border-secondary-200 rounded-2xl">
            <div className={`${dashboardTheme.loading.spinner} h-12 w-12 border-4 border-t-primary-600 mx-auto`}></div>
            <p className="mt-4 text-secondary-500">Loading RFQs...</p>
          </div>
        ) : myRFQs.length === 0 ? (
          <div className="text-center py-12 bg-white/50 backdrop-blur-sm border border-secondary-200 rounded-2xl">
            <FileText size={48} className="mx-auto mb-4 text-secondary-300" />
            <p className="text-secondary-500 font-medium">No RFQs posted yet. Create your first RFQ above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myRFQs.map(rfq => (
              <div key={rfq.id} className={`border rounded-xl p-6 hover:shadow-md transition-all ${rfq.status === 'active' ? 'border-green-200 bg-green-50/30' : 'border-secondary-200 bg-secondary-50/30'
                }`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={dashboardTheme.typography.heading4}>{rfq.title}</h3>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(rfq.status)}`}>
                        {rfq.status === 'active' ? '● Active' : rfq.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-secondary-500 font-medium">
                      {rfq.quantity && <span>Qty: {rfq.quantity}</span>}
                      {rfq.target_price && (
                        <>
                          <span className="text-secondary-300">•</span>
                          <span>Target: {rfq.target_price}</span>
                        </>
                      )}
                      <span className="text-secondary-300">•</span>
                      <span>Posted {formatTimeAgo(rfq.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-secondary-400 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors">
                      <Eye size={18} />
                    </button>
                    {rfq.status === 'active' && (
                      <>
                        <button className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors">
                          <Edit size={18} />
                        </button>
                        <button className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-white p-4 rounded-xl border border-secondary-100 shadow-sm">
                    <div className="text-2xl font-bold text-primary-600">{rfq.response_count}</div>
                    <div className="text-xs text-secondary-500 font-medium uppercase tracking-wider mt-1">Responses Received</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-secondary-100 shadow-sm">
                    <div className="text-2xl font-bold text-purple-600">{rfq.view_count}</div>
                    <div className="text-xs text-secondary-500 font-medium uppercase tracking-wider mt-1">Supplier Views</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-secondary-100 shadow-sm">
                    <div className={`text-lg font-bold ${rfq.status === 'active' ? 'text-green-600' : 'text-secondary-500'
                      }`}>
                      {rfq.expires_at || 'Open'}
                    </div>
                    <div className="text-xs text-secondary-500 font-medium uppercase tracking-wider mt-1">Deadline</div>
                  </div>
                </div>

                {rfq.status === 'active' && rfq.response_count > 0 && (
                  <button
                    onClick={() => {
                      setSelectedRFQ(rfq);
                      setActiveView('view-responses');
                      loadRFQResponses(rfq.id);
                    }}
                    className={dashboardTheme.buttons.primary + " w-full mt-6 justify-center"}
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
    <div className="space-y-8">
      {/* RFQ Header */}
      <div className={dashboardTheme.cards.primary + " " + dashboardTheme.cards.padding.large}>
        <button
          onClick={() => setActiveView('post-rfq')}
          className="text-primary-600 hover:text-primary-700 mb-6 flex items-center gap-2 font-medium transition-colors"
        >
          ← Back to My RFQs
        </button>
        {selectedRFQ && (
          <>
            <div className="flex justify-between items-start">
              <div>
                <h1 className={dashboardTheme.typography.heading2 + " mb-2"}>{selectedRFQ.title}</h1>
                <div className="flex items-center gap-4 text-secondary-500 font-medium">
                  {selectedRFQ.quantity && <span>Quantity: {selectedRFQ.quantity}</span>}
                  {selectedRFQ.target_price && (
                    <>
                      <span className="text-secondary-300">•</span>
                      <span>Target: {selectedRFQ.target_price}</span>
                    </>
                  )}
                  <span className="text-secondary-300">•</span>
                  <span>Posted {formatTimeAgo(selectedRFQ.created_at)}</span>
                </div>
              </div>
              <div className="text-right bg-primary-50 px-6 py-3 rounded-xl border border-primary-100">
                <div className="text-3xl font-bold text-primary-600">{rfqResponses.length}</div>
                <div className="text-sm text-secondary-600 font-medium">Supplier Responses</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6 mt-8 pt-8 border-t border-secondary-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary-900">{selectedRFQ.view_count}</div>
                <div className="text-sm text-secondary-500 font-medium mt-1">Total Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{selectedRFQ.response_count}</div>
                <div className="text-sm text-secondary-500 font-medium mt-1">Responses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{rfqResponses.filter(r => r.price_quote).length}</div>
                <div className="text-sm text-secondary-500 font-medium mt-1">Quotes Received</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{selectedRFQ.expires_at || 'Open'}</div>
                <div className="text-sm text-secondary-500 font-medium mt-1">Deadline</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Responses */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className={dashboardTheme.typography.heading3}>Supplier Responses</h2>
          <select className={dashboardTheme.forms.select + " w-auto"}>
            <option>Sort by: Most Recent</option>
            <option>Sort by: Lowest Price</option>
            <option>Sort by: Highest Rating</option>
            <option>Sort by: Fastest Response</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white/50 backdrop-blur-sm border border-secondary-200 rounded-2xl">
            <div className={`${dashboardTheme.loading.spinner} h-12 w-12 border-4 border-t-primary-600 mx-auto`}></div>
            <p className="mt-4 text-secondary-500">Loading responses...</p>
          </div>
        ) : rfqResponses.length === 0 ? (
          <div className="text-center py-12 bg-white/50 backdrop-blur-sm border border-secondary-200 rounded-2xl">
            <MessageSquare size={48} className="mx-auto mb-4 text-secondary-300" />
            <p className="text-secondary-500 font-medium">No responses yet. Suppliers will respond soon!</p>
          </div>
        ) : (
          rfqResponses.map(response => (
            <div key={response.id} className={dashboardTheme.cards.primary + " " + dashboardTheme.cards.padding.medium + " " + dashboardTheme.cards.hover}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary-500/20">
                    {response.supplier_company_name.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={dashboardTheme.typography.heading4}>{response.supplier_company_name}</h3>
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-100 rounded text-xs font-semibold text-blue-600">
                        <Linkedin size={14} />
                        Verified
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-secondary-500 text-sm">Responded {formatTimeAgo(response.responded_at)}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${response.price_quote
                  ? 'bg-green-50 text-green-700 border border-green-100'
                  : 'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}>
                  {response.price_quote ? '✓ Quote Provided' : 'Interested'}
                </span>
              </div>

              {/* Quote Details */}
              {response.price_quote && (
                <div className="bg-gradient-to-br from-primary-50/50 to-indigo-50/30 rounded-xl p-6 mb-6 border border-primary-100/50">
                  <div className="grid grid-cols-4 gap-6">
                    <div>
                      <div className="text-xs text-secondary-500 mb-1 font-medium uppercase tracking-wider">Price per Unit</div>
                      <div className="text-2xl font-bold text-primary-600">{response.price_quote}</div>
                    </div>
                    <div>
                      <div className="text-xs text-secondary-500 mb-1 font-medium uppercase tracking-wider">Lead Time</div>
                      <div className="text-lg font-semibold text-secondary-900">
                        {response.lead_time_days ? `${response.lead_time_days} days` : 'TBD'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-secondary-500 mb-1 font-medium uppercase tracking-wider">Min Order Qty</div>
                      <div className="text-lg font-semibold text-secondary-900">
                        {response.minimum_order_quantity || 'Flexible'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-secondary-500 mb-1 font-medium uppercase tracking-wider">Certifications</div>
                      <div className="flex gap-1 flex-wrap">
                        {response.certifications_provided ?
                          response.certifications_provided.split(',').map((cert, idx) => (
                            <span key={idx} className={dashboardTheme.badges.success}>
                              {cert.trim()}
                            </span>
                          )) :
                          <span className="text-xs text-secondary-400 italic">None specified</span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              {response.message && (
                <div className="bg-secondary-50/50 border border-secondary-100 rounded-xl p-4 mb-6">
                  <div className="text-sm font-semibold text-secondary-900 mb-2">Message from Supplier:</div>
                  <p className="text-secondary-600 leading-relaxed">{response.message}</p>
                </div>
              )}

              {/* Actions */}
              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-secondary-100">
                <button className={dashboardTheme.buttons.primary + " flex-1 justify-center flex items-center gap-2"}>
                  <MessageSquare size={18} />
                  Start Conversation
                </button>
                <button
                  className={dashboardTheme.buttons.outlined + " flex items-center gap-2"}
                  onClick={() => {
                    // This would load the supplier profile
                    console.log('View supplier profile:', response.supplier_company_id);
                  }}
                >
                  <Linkedin size={18} />
                  View Company Profile
                </button>
                <button className={dashboardTheme.buttons.secondary + " px-3"}>
                  <Star size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div >
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
                <a
                  href="/dashboard/buyer"
                  className={dashboardTheme.navigation.navButton}
                >
                  AI-Discover Suppliers
                </a>
                <button
                  onClick={() => setActiveView('post-rfq')}
                  className={activeView === 'post-rfq' || activeView === 'view-responses'
                    ? dashboardTheme.navigation.navButtonActive
                    : dashboardTheme.navigation.navButton}
                >
                  Post RFQ
                </button>
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
        {activeView === 'post-rfq' ? renderPostRFQ() : renderViewResponses()}
      </main>
    </div>
  );
};

export default PostRFQPlatform;
