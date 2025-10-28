import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Building2, Package, MessageSquare, Star, CheckCircle, Clock, MapPin, Award, Send, Filter, Menu, X, Phone, Mail, Linkedin, AlertCircle } from 'lucide-react';
import axios from 'axios';

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
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showRFQModal, setShowRFQModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    materials: [],
    certifications: [],
    verified_only: false
  });

  // Common materials and certifications for filters
  const commonMaterials = ['Steel Alloys', 'Aluminum', 'Titanium', 'Engineering Plastics', 'Composites', 'Rare Earth Elements', 'Semiconductors'];
  const commonCertifications = ['ISO 9001', 'AS9100', 'ITAR', 'ISO 14001', 'FDA', 'RoHS', 'REACH'];

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
      // Fallback to mock data for demo
      setSuppliers(getMockSuppliers());
    } finally {
      setLoading(false);
    }
  };

  const getMockSuppliers = (): Supplier[] => [
    {
      id: '1',
      name: 'Advanced Materials Corp',
      location: { city: 'Houston', state: 'TX', country: 'USA' },
      rating: 4.8,
      response_rate: 95,
      materials: ['Steel Alloys', 'Aluminum', 'Titanium'],
      certifications: ['ISO 9001', 'AS9100', 'ITAR'],
      description: 'Leading supplier of aerospace-grade materials with 30+ years experience',
      capabilities: ['Custom Alloys', 'Heat Treatment', 'Material Testing'],
      last_active: '2 hours ago',
      verified: true,
      pocs: [
        {
          id: '1',
          name: 'Sarah Chen',
          role: 'VP of Sales',
          email: 'sarah.chen@advancedmaterials.com',
          phone: '(555) 123-4567',
          linkedin_verified: true,
          is_primary: true,
          status: 'available',
          avg_response_time_hours: 4
        },
        {
          id: '2',
          name: 'Mike Rodriguez',
          role: 'Sales Director',
          email: 'mike.r@advancedmaterials.com',
          phone: '(555) 987-6543',
          linkedin_verified: true,
          is_primary: false,
          status: 'on-call'
        }
      ]
    },
    {
      id: '2',
      name: 'Global Polymers Inc',
      location: { city: 'Atlanta', state: 'GA', country: 'USA' },
      rating: 4.6,
      response_rate: 88,
      materials: ['Engineering Plastics', 'Composites', 'Resins'],
      certifications: ['ISO 9001', 'ISO 14001', 'FDA'],
      description: 'Specialized in high-performance polymer solutions for automotive and medical',
      capabilities: ['Custom Formulation', 'Rapid Prototyping', 'Technical Support'],
      last_active: '1 hour ago',
      verified: true,
      pocs: [
        {
          id: '3',
          name: 'James Liu',
          role: 'Business Development Manager',
          email: 'james.liu@globalpolymers.com',
          linkedin_verified: true,
          is_primary: true,
          status: 'available',
          avg_response_time_hours: 6
        }
      ]
    }
  ];

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
      case 'busy': return 'text-orange-600 bg-orange-500';
      case 'on-call': return 'text-blue-600 bg-blue-500';
      default: return 'text-gray-600 bg-gray-500';
    }
  };

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
                <button className="px-4 py-2 rounded-lg font-medium bg-blue-50 text-blue-600">
                  🔍 Find Suppliers
                </button>
                <a 
                  href="/dashboard/post-rfq"
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  📝 Post RFQ
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
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search materials, capabilities, certifications..."
                  value={filters.query}
                  onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Filter size={20} />
                Filters
              </button>
              <button 
                onClick={handleSearch}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Search
              </button>
            </div>

            {/* Applied Filters */}
            <div className="flex gap-2 flex-wrap">
              {filters.materials.map(material => (
                <span key={material} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1">
                  {material}
                  <X size={14} className="cursor-pointer" onClick={() => removeFilter('materials', material)} />
                </span>
              ))}
              {filters.certifications.map(cert => (
                <span key={cert} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                  {cert}
                  <X size={14} className="cursor-pointer" onClick={() => removeFilter('certifications', cert)} />
                </span>
              ))}
              {filters.verified_only && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1">
                  Verified Only
                  <X size={14} className="cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, verified_only: false }))} />
                </span>
              )}
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Materials</label>
                    <div className="space-y-1">
                      {commonMaterials.filter(m => !filters.materials.includes(m)).map(material => (
                        <button
                          key={material}
                          onClick={() => addFilter('materials', material)}
                          className="block w-full text-left px-3 py-1 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded"
                        >
                          + {material}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Certifications</label>
                    <div className="space-y-1">
                      {commonCertifications.filter(c => !filters.certifications.includes(c)).map(cert => (
                        <button
                          key={cert}
                          onClick={() => addFilter('certifications', cert)}
                          className="block w-full text-left px-3 py-1 text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 rounded"
                        >
                          + {cert}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Min Response Rate (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={filters.min_response_rate || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, min_response_rate: parseInt(e.target.value) || undefined }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.verified_only}
                          onChange={(e) => setFilters(prev => ({ ...prev, verified_only: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-semibold text-gray-700">Verified Only</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center">
            <div className="text-gray-600">
              {loading ? 'Searching...' : `${suppliers.length} suppliers found`}
            </div>
          </div>

          {/* Supplier Cards */}
          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Searching suppliers...</p>
              </div>
            ) : suppliers.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg shadow-md">
                <p className="text-gray-600">No suppliers found. Try adjusting your search criteria.</p>
              </div>
            ) : (
              suppliers.map(supplier => {
                const primaryPOC = getPrimaryPOC(supplier.pocs);
                const onCallPOC = getOnCallPOC(supplier.pocs);
                
                return (
                  <div key={supplier.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                          {supplier.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-gray-800">{supplier.name}</h3>
                            {supplier.verified && (
                              <CheckCircle size={20} className="text-green-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-yellow-500">
                              <Star size={16} fill="currentColor" />
                              <span className="text-gray-700 font-semibold">{supplier.rating}</span>
                            </div>
                            <span className="text-gray-500">•</span>
                            <div className="flex items-center gap-1 text-gray-600">
                              <MapPin size={16} />
                              <span>{formatLocation(supplier.location)}</span>
                            </div>
                            <span className="text-gray-500">•</span>
                            <span className="text-green-600 font-semibold">{supplier.response_rate}% response rate</span>
                          </div>
                          {supplier.description && (
                            <p className="text-gray-600 mt-2">{supplier.description}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => { setSelectedSupplier(supplier); setShowRFQModal(true); }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Send size={18} />
                        Send RFQ
                      </button>
                    </div>

                    {/* Materials */}
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Materials:</div>
                      <div className="flex gap-2 flex-wrap">
                        {supplier.materials.map((material, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                            {material}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Certifications:</div>
                      <div className="flex gap-2 flex-wrap">
                        {supplier.certifications.map((cert, idx) => (
                          <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm flex items-center gap-1">
                            <Award size={14} />
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* POC Information */}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Linkedin size={18} className="text-blue-600" />
                        <span className="text-sm font-semibold text-gray-700">Verified Points of Contact:</span>
                        <span className="text-xs text-green-600 font-semibold">✓ LinkedIn Verified</span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Primary POC */}
                        {primaryPOC && (
                          <div className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-green-300 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-green-700 uppercase flex items-center gap-1">
                                <CheckCircle size={14} />
                                Primary POC
                              </span>
                              <span className={`flex items-center gap-1 text-xs font-semibold ${getStatusColor(primaryPOC.status).split(' ')[0]}`}>
                                <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(primaryPOC.status).split(' ')[1]} ${primaryPOC.status === 'available' ? 'animate-pulse' : ''}`}></div>
                                {primaryPOC.status}
                              </span>
                            </div>
                            <div className="font-bold text-gray-800 flex items-center gap-2">
                              {primaryPOC.name}
                              {primaryPOC.linkedin_verified && (
                                <Linkedin size={14} className="text-blue-600" />
                              )}
                            </div>
                            <div className="text-sm text-gray-600">{primaryPOC.role}</div>
                            {primaryPOC.avg_response_time_hours && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-2 bg-white px-2 py-1 rounded">
                                <Clock size={12} />
                                Avg response: {primaryPOC.avg_response_time_hours} hours
                              </div>
                            )}
                          </div>
                        )}

                        {/* On-Call POC */}
                        {onCallPOC && (
                          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-blue-700 uppercase flex items-center gap-1">
                                <AlertCircle size={14} />
                                On-Call POC (24/7)
                              </span>
                              <span className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
                                {onCallPOC.status}
                              </span>
                            </div>
                            <div className="font-bold text-gray-800 flex items-center gap-2">
                              {onCallPOC.name}
                              {onCallPOC.linkedin_verified && (
                                <Linkedin size={14} className="text-blue-600" />
                              )}
                            </div>
                            <div className="text-sm text-gray-600">{onCallPOC.role}</div>
                            <div className="text-xs text-blue-700 mt-2 bg-white px-2 py-1 rounded font-semibold">
                              ⚡ Urgent requests routed here
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-800">Send RFQ</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="font-semibold text-gray-800">To: {supplier.name}</div>
            {primaryPOC && (
              <div className="text-sm text-gray-600 mt-1">
                Primary POC: {primaryPOC.name} ({primaryPOC.role})
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">RFQ Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Steel Alloy Procurement Request"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Material Type *</label>
            <input
              type="text"
              required
              value={formData.material_category}
              onChange={(e) => setFormData(prev => ({ ...prev, material_category: e.target.value }))}
              placeholder="e.g., Steel Alloy Grade 304"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
              <input
                type="text"
                required
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="e.g., 5000 kg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Target Price</label>
              <input
                type="text"
                value={formData.target_price}
                onChange={(e) => setFormData(prev => ({ ...prev, target_price: e.target.value }))}
                placeholder="e.g., $15/kg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Specifications *</label>
            <textarea
              required
              rows={4}
              value={formData.specifications}
              onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
              placeholder="Describe your requirements, specifications, certifications needed..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Deadline</label>
              <input
                type="date"
                value={formData.delivery_deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_deadline: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Location</label>
              <input
                type="text"
                value={formData.delivery_location}
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_location: e.target.value }))}
                placeholder="e.g., Houston, TX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Required Certifications</label>
            <input
              type="text"
              value={formData.required_certifications}
              onChange={(e) => setFormData(prev => ({ ...prev, required_certifications: e.target.value }))}
              placeholder="e.g., ISO 9001, AS9100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional information..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
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