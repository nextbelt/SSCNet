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

interface LineItem {
  id: string;
  part_number: string;
  description: string;
  quantity: string;
  uom: string;
  target_price?: string;
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
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', part_number: '', description: '', quantity: '', uom: '', target_price: '' }
  ]);
  const [rfqSettings, setRfqSettings] = useState({
    is_sealed_bid: false,
    requires_nda: false,
    partial_bidding_allowed: true
  });
  const [responseViewMode, setResponseViewMode] = useState<'cards' | 'table' | 'qa'>('cards');
  const [qaMessages, setQaMessages] = useState([
    { id: 1, user: 'TechCorp Industries', message: 'Is the delivery deadline flexible by 1-2 weeks?', type: 'question', timestamp: '2 hours ago', replies: [] },
    { id: 2, user: 'You', message: 'We can extend up to 5 days, but no more due to production schedule.', type: 'answer', timestamp: '1 hour ago', replies: [] }
  ]);
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
    commodity: '',
    payment_terms: '',
    contract_duration: '',
    alternative_parts_allowed: false,
    inspection_requirements: ''
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

  const addLineItem = () => {
    setLineItems([...lineItems, { 
      id: Math.random().toString(36).substr(2, 9), 
      part_number: '', description: '', quantity: '', uom: '', target_price: '' 
    }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      const newItems = [...lineItems];
      newItems.splice(index, 1);
      setLineItems(newItems);
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setLineItems(newItems);
  };

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
        commodity: formData.commodity || undefined,
        payment_terms: formData.payment_terms || undefined,
        contract_duration: formData.contract_duration || undefined,
        alternative_parts_allowed: formData.alternative_parts_allowed,
        inspection_requirements: formData.inspection_requirements || undefined,
        line_items: lineItems,
        settings: rfqSettings
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
          commodity: '',
          payment_terms: '',
          contract_duration: '',
          alternative_parts_allowed: false,
          inspection_requirements: ''
        });
        setLineItems([{ id: '1', part_number: '', description: '', quantity: '', uom: '', target_price: '' }]);
        setRfqSettings({ is_sealed_bid: false, requires_nda: false, partial_bidding_allowed: true });
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
            <div className="p-6 transition-all border shadow-sm bg-white/60 backdrop-blur-md rounded-xl border-white/50 hover:shadow-md">
              <div className="text-3xl font-bold text-secondary-900">95%</div>
              <div className="mt-1 text-sm font-medium text-secondary-500">Average Response Rate</div>
            </div>
            <div className="p-6 transition-all border shadow-sm bg-white/60 backdrop-blur-md rounded-xl border-white/50 hover:shadow-md">
              <div className="text-3xl font-bold text-secondary-900">8-12</div>
              <div className="mt-1 text-sm font-medium text-secondary-500">Avg Quotes Received</div>
            </div>
            <div className="p-6 transition-all border shadow-sm bg-white/60 backdrop-blur-md rounded-xl border-white/50 hover:shadow-md">
              <div className="text-3xl font-bold text-secondary-900">24h</div>
              <div className="mt-1 text-sm font-medium text-secondary-500">First Response Time</div>
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

          <div className="grid gap-6 md:grid-cols-2">
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

          <div className="grid gap-6 md:grid-cols-2">
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
                Delivery Deadline
              </label>
              <input
                type="date"
                value={formData.delivery_deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_deadline: e.target.value }))}
                className={dashboardTheme.forms.input}
              />
            </div>
          </div>

          {/* Enhanced RFQ Fields Section - Replaced with Line Items */}
          <div className="pt-6 mt-6 border-t border-secondary-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className={dashboardTheme.typography.heading4}>Line Items</h3>
              <button type="button" onClick={addLineItem} className="flex items-center gap-1 px-3 py-1 text-sm font-semibold transition-colors rounded-lg text-primary-600 hover:bg-primary-50">
                <Package size={16} /> Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={item.id} className="relative p-4 transition-colors bg-white border shadow-sm rounded-xl border-secondary-200 group hover:border-primary-200">
                  <div className="absolute transition-opacity opacity-0 top-2 right-2 group-hover:opacity-100">
                     <button type="button" onClick={() => removeLineItem(index)} className="p-1 text-red-500 rounded hover:text-red-700 hover:bg-red-50"><X size={16}/></button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-12">
                     <div className="md:col-span-3">
                       <label className="block mb-1 text-xs font-medium text-secondary-500">Part Number</label>
                       <input 
                         placeholder="e.g. PN-123" 
                         value={item.part_number}
                         onChange={(e) => updateLineItem(index, 'part_number', e.target.value)}
                         className={dashboardTheme.forms.input + " text-sm"} 
                       />
                     </div>
                     <div className="md:col-span-4">
                       <label className="block mb-1 text-xs font-medium text-secondary-500">Description</label>
                       <input 
                         placeholder="Description" 
                         value={item.description}
                         onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                         className={dashboardTheme.forms.input + " text-sm"} 
                       />
                     </div>
                     <div className="md:col-span-2">
                       <label className="block mb-1 text-xs font-medium text-secondary-500">Quantity</label>
                       <input 
                         placeholder="Qty" 
                         value={item.quantity}
                         onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                         className={dashboardTheme.forms.input + " text-sm"} 
                       />
                     </div>
                     <div className="md:col-span-2">
                       <label className="block mb-1 text-xs font-medium text-secondary-500">UOM</label>
                       <select
                          value={item.uom}
                          onChange={(e) => updateLineItem(index, 'uom', e.target.value)}
                          className={dashboardTheme.forms.select + " text-sm py-2"}
                        >
                          <option value="">Unit</option>
                          {unitOfMeasureOptions.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                     </div>
                     <div className="md:col-span-1">
                        <label className="block mb-1 text-xs font-medium text-secondary-500">Target</label>
                        <input 
                          placeholder="$" 
                          value={item.target_price}
                          onChange={(e) => updateLineItem(index, 'target_price', e.target.value)}
                          className={dashboardTheme.forms.input + " text-sm"} 
                        />
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity & Pricing Section */}
          <div className="pt-6 border-t border-secondary-200">
            <h3 className={dashboardTheme.typography.heading4 + " mb-4"}>Contract & Terms</h3>
            
            <div className="grid gap-6 md:grid-cols-3">
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
                  Payment Terms
                </label>
                <select
                  value={formData.payment_terms}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
                  className={dashboardTheme.forms.select}
                >
                  <option value="">Select terms...</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                  <option value="Net 90">Net 90</option>
                  <option value="COD">COD</option>
                  <option value="Advance">Advance Payment</option>
                </select>
              </div>
              <div>
                <label className={dashboardTheme.forms.label}>
                  Contract Duration
                </label>
                <select
                  value={formData.contract_duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, contract_duration: e.target.value }))}
                  className={dashboardTheme.forms.select}
                >
                  <option value="">Select duration...</option>
                  <option value="Spot Buy">Spot Buy (One-time)</option>
                  <option value="6 Months">6 Months</option>
                  <option value="1 Year">1 Year</option>
                  <option value="2 Years">2 Years</option>
                  <option value="Long Term">Long Term Agreement</option>
                </select>
              </div>
            </div>

            <div className="grid gap-6 mt-4 md:grid-cols-3">
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
              <div className="flex items-end pb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.alternative_parts_allowed}
                    onChange={(e) => setFormData(prev => ({ ...prev, alternative_parts_allowed: e.target.checked }))}
                    className={dashboardTheme.forms.checkbox}
                  />
                  <span className="text-sm font-medium text-secondary-700">Alternative Parts Allowed?</span>
                </label>
              </div>
            </div>
          </div>

          {/* Delivery Section */}
          <div className="pt-6 border-t border-secondary-200">
            <h3 className={dashboardTheme.typography.heading4 + " mb-4"}>Delivery Information</h3>
            
            <div className="grid gap-6 md:grid-cols-2">
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
                    className="w-4 h-4 rounded text-primary-600 border-secondary-300 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium">{cert}</span>
                </label>
              ))}
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

          {/* Bidding Logic & Privacy */}
          <div className="p-4 space-y-3 border bg-secondary-50 rounded-xl border-secondary-200">
            <h4 className="mb-2 text-sm font-semibold tracking-wide uppercase text-secondary-900">Bidding Logic & Privacy</h4>
            
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex items-center justify-between p-3 transition-all bg-white border rounded-lg cursor-pointer border-secondary-200 hover:border-primary-300">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-6 rounded-full p-1 transition-colors ${rfqSettings.is_sealed_bid ? 'bg-primary-600' : 'bg-secondary-300'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${rfqSettings.is_sealed_bid ? 'translate-x-4' : ''}`} />
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={rfqSettings.is_sealed_bid}
                    onChange={() => setRfqSettings(prev => ({ ...prev, is_sealed_bid: !prev.is_sealed_bid }))}
                  />
                  <div>
                    <div className="text-sm font-medium text-secondary-900">Sealed Bid</div>
                    <div className="text-xs text-secondary-500">Target price is hidden from suppliers</div>
                  </div>
                </div>
              </label>

              <label className="flex items-center justify-between p-3 transition-all bg-white border rounded-lg cursor-pointer border-secondary-200 hover:border-primary-300">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-6 rounded-full p-1 transition-colors ${rfqSettings.requires_nda ? 'bg-primary-600' : 'bg-secondary-300'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${rfqSettings.requires_nda ? 'translate-x-4' : ''}`} />
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={rfqSettings.requires_nda}
                    onChange={() => setRfqSettings(prev => ({ ...prev, requires_nda: !prev.requires_nda }))}
                  />
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-secondary-900">
                      NDA Required <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full">Secure</span>
                    </div>
                    <div className="text-xs text-secondary-500">Suppliers must sign NDA to view docs</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className={dashboardTheme.forms.label}>
              Upload Supporting Documents
            </label>
            <div className="p-8 text-center transition-all border-2 border-dashed cursor-pointer border-secondary-200 rounded-xl hover:border-primary-500 hover:bg-primary-50/30 group">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 transition-colors rounded-full bg-secondary-50 group-hover:bg-primary-100">
                <Upload className="transition-colors text-secondary-400 group-hover:text-primary-600" size={24} />
              </div>
              <p className="mb-2 font-medium text-secondary-600">
                <span className="text-primary-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-secondary-400">Technical drawings, specifications, CAD files (PDF, DWG, STEP)</p>
            </div>
          </div>

          <div className="p-4 border bg-primary-50/50 border-primary-100 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-primary-600 mt-0.5" size={20} />
              <div className="text-sm">
                <div className="mb-1 font-semibold text-primary-900">Your RFQ will be visible to:</div>
                <ul className="space-y-1 text-primary-800">
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
        <div className="flex items-center justify-between mb-6">
          <h2 className={dashboardTheme.typography.heading3}>My Posted RFQs</h2>
          <span className="px-3 py-1 text-sm font-medium rounded-full text-secondary-500 bg-secondary-100">{myRFQs.length} total</span>
        </div>

        {loading ? (
          <div className="py-12 text-center border bg-white/50 backdrop-blur-sm border-secondary-200 rounded-2xl">
            <div className={`${dashboardTheme.loading.spinner} h-12 w-12 border-4 border-t-primary-600 mx-auto`}></div>
            <p className="mt-4 text-secondary-500">Loading RFQs...</p>
          </div>
        ) : myRFQs.length === 0 ? (
          <div className="py-12 text-center border bg-white/50 backdrop-blur-sm border-secondary-200 rounded-2xl">
            <FileText size={48} className="mx-auto mb-4 text-secondary-300" />
            <p className="font-medium text-secondary-500">No RFQs posted yet. Create your first RFQ above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myRFQs.map(rfq => (
              <div key={rfq.id} className={`border rounded-xl p-6 hover:shadow-md transition-all ${rfq.status === 'active' ? 'border-green-200 bg-green-50/30' : 'border-secondary-200 bg-secondary-50/30'
                }`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-secondary-900">{rfq.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(rfq.status)}`}>
                        {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-secondary-500">
                      <span className="flex items-center gap-1"><Clock size={14} /> Posted {formatTimeAgo(rfq.created_at)}</span>
                      <span className="flex items-center gap-1"><Eye size={14} /> {rfq.view_count} views</span>
                      <span className="flex items-center gap-1"><MessageSquare size={14} /> {rfq.response_count} responses</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedRFQ(rfq);
                        setActiveView('view-responses');
                      }}
                      className="p-2 transition-colors rounded-lg text-primary-600 hover:bg-primary-50"
                      title="View Responses"
                    >
                      <MessageSquare size={20} />
                    </button>
                    <button className="p-2 transition-colors rounded-lg text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100">
                      <Edit size={20} />
                    </button>
                    <button className="p-2 text-red-400 transition-colors rounded-lg hover:text-red-600 hover:bg-red-50">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderQABoard = () => (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 border border-blue-100 bg-blue-50 rounded-xl">
        <AlertCircle className="text-blue-600 mt-0.5" size={20} />
        <div>
          <h4 className="text-sm font-semibold text-blue-900">Public Q&A Board</h4>
          <p className="mt-1 text-sm text-blue-700">Questions asked here are visible to all participating suppliers. Use this to clarify requirements without repeating yourself.</p>
        </div>
      </div>

      <div className="space-y-4">
        {qaMessages.map((msg) => (
          <div key={msg.id} className={`p-4 rounded-xl border ${msg.type === 'question' ? 'bg-white border-secondary-200' : 'bg-primary-50 border-primary-100 ml-8'}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-secondary-900">{msg.user}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${msg.type === 'question' ? 'bg-secondary-100 text-secondary-600' : 'bg-primary-100 text-primary-700'}`}>
                  {msg.type}
                </span>
              </div>
              <span className="text-xs text-secondary-400">{msg.timestamp}</span>
            </div>
            <p className="text-sm text-secondary-700">{msg.message}</p>
            {msg.type === 'question' && (
              <button className="mt-3 text-xs font-semibold text-primary-600 hover:underline">Reply Publicly</button>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 mt-6 border bg-secondary-50 rounded-xl border-secondary-200">
        <h4 className="mb-2 text-sm font-medium text-secondary-900">Post a Public Clarification</h4>
        <textarea 
          className={dashboardTheme.forms.textarea + " bg-white mb-3"} 
          rows={3}
          placeholder="Type a message to all suppliers..."
        ></textarea>
        <div className="flex justify-end">
          <button className={dashboardTheme.buttons.primary + " px-4 py-2 text-sm"}>Post Message</button>
        </div>
      </div>
    </div>
  );

  const renderComparisonTable = () => (
    <div className="overflow-x-auto bg-white border shadow-sm border-secondary-200 rounded-xl">
      <table className="w-full text-sm text-left">
        <thead className="text-xs font-semibold uppercase bg-secondary-50 text-secondary-600">
          <tr>
            <th className="sticky left-0 z-10 px-6 py-4 border-r bg-secondary-50">Metric</th>
            {rfqResponses.map(r => (
              <th key={r.id} className="px-6 py-4 min-w-[200px]">
                {r.supplier_company_name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary-100">
          <tr className="bg-white">
            <td className="sticky left-0 px-6 py-4 font-medium bg-white border-r text-secondary-900">Price Quote</td>
            {rfqResponses.map(r => (
               <td key={r.id} className={`px-6 py-4 font-bold ${
                  // Simple logic to highlight if it's the lowest (assuming string comparison for now, ideally parse float)
                  'text-secondary-900'
               }`}>
                 {r.price_quote || '-'}
               </td>
            ))}
          </tr>
          <tr className="bg-white">
            <td className="sticky left-0 px-6 py-4 font-medium bg-white border-r text-secondary-900">Lead Time</td>
            {rfqResponses.map(r => (
               <td key={r.id} className="px-6 py-4">
                 {r.lead_time_days ? `${r.lead_time_days} days` : '-'}
               </td>
            ))}
          </tr>
          <tr className="bg-white">
            <td className="sticky left-0 px-6 py-4 font-medium bg-white border-r text-secondary-900">MOQ</td>
            {rfqResponses.map(r => (
               <td key={r.id} className="px-6 py-4">
                 {r.minimum_order_quantity || 'Flexible'}
               </td>
            ))}
          </tr>
          <tr className="bg-white">
            <td className="sticky left-0 px-6 py-4 font-medium bg-white border-r text-secondary-900">Certifications</td>
            {rfqResponses.map(r => (
               <td key={r.id} className="px-6 py-4">
                 <div className="flex flex-wrap gap-1">
                   {r.certifications_provided ? r.certifications_provided.split(',').map((c, i) => (
                     <span key={i} className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-100">{c.trim()}</span>
                   )) : '-'}
                 </div>
               </td>
            ))}
          </tr>
          <tr className="bg-white">
            <td className="sticky left-0 px-6 py-4 font-medium bg-white border-r text-secondary-900">Status</td>
            {rfqResponses.map(r => (
               <td key={r.id} className="px-6 py-4">
                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                   r.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-secondary-100 text-secondary-600'
                 }`}>
                   {r.status.replace('_', ' ')}
                 </span>
               </td>
            ))}
          </tr>
          <tr className="bg-white">
            <td className="sticky left-0 px-6 py-4 font-medium bg-white border-r text-secondary-900">Action</td>
            {rfqResponses.map(r => (
               <td key={r.id} className="px-6 py-4">
                 <button className="text-xs font-medium text-primary-600 hover:text-primary-800">View Details</button>
               </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderViewResponses = () => (
    <div className="space-y-8">
      {/* RFQ Header */}
      <div className={dashboardTheme.cards.primary + " " + dashboardTheme.cards.padding.large}>
        <button
          onClick={() => setActiveView('post-rfq')}
          className="flex items-center gap-2 mb-6 font-medium transition-colors text-primary-600 hover:text-primary-700"
        >
          ← Back to My RFQs
        </button>
        {selectedRFQ && (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h1 className={dashboardTheme.typography.heading2 + " mb-2"}>{selectedRFQ.title}</h1>
                <div className="flex items-center gap-4 font-medium text-secondary-500">
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
              <div className="px-6 py-3 text-right border bg-primary-50 rounded-xl border-primary-100">
                <div className="text-3xl font-bold text-primary-600">{rfqResponses.length}</div>
                <div className="text-sm font-medium text-secondary-600">Supplier Responses</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-6 pt-8 mt-8 border-t border-secondary-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary-900">{selectedRFQ.view_count}</div>
                <div className="mt-1 text-sm font-medium text-secondary-500">Total Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{selectedRFQ.response_count}</div>
                <div className="mt-1 text-sm font-medium text-secondary-500">Responses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{rfqResponses.filter(r => r.price_quote).length}</div>
                <div className="mt-1 text-sm font-medium text-secondary-500">Quotes Received</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{selectedRFQ.expires_at || 'Open'}</div>
                <div className="mt-1 text-sm font-medium text-secondary-500">Deadline</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Responses */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className={dashboardTheme.typography.heading3}>Supplier Responses</h2>
          <div className="flex gap-3">
            <div className="flex p-1 bg-white border rounded-lg border-secondary-200">
              <button 
                onClick={() => setResponseViewMode('cards')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${responseViewMode === 'cards' ? 'bg-primary-50 text-primary-700' : 'text-secondary-500 hover:text-secondary-900'}`}
              >
                Cards
              </button>
              <button 
                onClick={() => setResponseViewMode('table')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${responseViewMode === 'table' ? 'bg-primary-50 text-primary-700' : 'text-secondary-500 hover:text-secondary-900'}`}
              >
                Compare Table
              </button>
            </div>
            <select className={dashboardTheme.forms.select + " w-auto"}>
              <option>Sort by: Most Recent</option>
              <option>Sort by: Lowest Price</option>
              <option>Sort by: Highest Rating</option>
              <option>Sort by: Fastest Response</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center border bg-white/50 backdrop-blur-sm border-secondary-200 rounded-2xl">
            <div className={`${dashboardTheme.loading.spinner} h-12 w-12 border-4 border-t-primary-600 mx-auto`}></div>
            <p className="mt-4 text-secondary-500">Loading responses...</p>
          </div>
        ) : rfqResponses.length === 0 ? (
          <div className="py-12 text-center border bg-white/50 backdrop-blur-sm border-secondary-200 rounded-2xl">
            <MessageSquare size={48} className="mx-auto mb-4 text-secondary-300" />
            <p className="font-medium text-secondary-500">No responses yet. Suppliers will respond soon!</p>
          </div>
        ) : responseViewMode === 'table' ? (
          renderComparisonTable()
        ) : responseViewMode === 'qa' ? (
          renderQABoard()
        ) : (
          rfqResponses.map(response => (
            <div key={response.id} className={dashboardTheme.cards.primary + " " + dashboardTheme.cards.padding.medium + " " + dashboardTheme.cards.hover}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-16 h-16 text-xl font-bold text-white shadow-lg bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-primary-500/20">
                    {response.supplier_company_name.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={dashboardTheme.typography.heading4}>{response.supplier_company_name}</h3>
                      <div className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-blue-600 border border-blue-100 rounded bg-blue-50">
                        <Linkedin size={14} />
                        Verified
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-secondary-500">Responded {formatTimeAgo(response.responded_at)}</span>
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
                <div className="p-6 mb-6 border bg-gradient-to-br from-primary-50/50 to-indigo-50/30 rounded-xl border-primary-100/50">
                  <div className="grid grid-cols-4 gap-6">
                    <div>
                      <div className="mb-1 text-xs font-medium tracking-wider uppercase text-secondary-500">Price per Unit</div>
                      <div className="text-2xl font-bold text-primary-600">{response.price_quote}</div>
                    </div>
                    <div>
                      <div className="mb-1 text-xs font-medium tracking-wider uppercase text-secondary-500">Lead Time</div>
                      <div className="text-lg font-semibold text-secondary-900">
                        {response.lead_time_days ? `${response.lead_time_days} days` : 'TBD'}
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 text-xs font-medium tracking-wider uppercase text-secondary-500">Min Order Qty</div>
                      <div className="text-lg font-semibold text-secondary-900">
                        {response.minimum_order_quantity || 'Flexible'}
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 text-xs font-medium tracking-wider uppercase text-secondary-500">Certifications</div>
                      <div className="flex flex-wrap gap-1">
                        {response.certifications_provided ?
                          response.certifications_provided.split(',').map((cert, idx) => (
                            <span key={idx} className={dashboardTheme.badges.success}>
                              {cert.trim()}
                            </span>
                          )) :
                          <span className="text-xs italic text-secondary-400">None specified</span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              {response.message && (
                <div className="p-4 mb-6 border bg-secondary-50/50 border-secondary-100 rounded-xl">
                  <div className="mb-2 text-sm font-semibold text-secondary-900">Message from Supplier:</div>
                  <p className="leading-relaxed text-secondary-600">{response.message}</p>
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
    <div className="relative min-h-screen overflow-hidden bg-secondary-50">
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
              <div className="hidden gap-2 md:flex">
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
                  <span className="hidden font-medium md:inline">Account</span>
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
