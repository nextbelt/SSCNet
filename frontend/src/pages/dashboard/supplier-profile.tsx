import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Award, MapPin, Globe, Mail, Phone, 
  Plus, Edit3, Trash2, CheckCircle, AlertTriangle, Clock,
  Linkedin, Shield, RefreshCw, UserCheck, Settings
} from 'lucide-react';

// Types
interface POC {
  id: string;
  name: string;
  title: string;
  department: POCDepartment;
  email: string;
  phone?: string;
  linkedinUrl: string;
  profilePicture?: string;
  verificationStatus: VerificationStatus;
  lastVerified: string;
  nextVerification: string;
  isAdmin: boolean;
  linkedinId: string;
}

enum POCDepartment {
  SALES = 'sales',
  ENGINEERING = 'engineering',
  RND = 'r&d',
  PRIMARY_CONTACT = 'primary_contact',
  ON_CALL = 'on_call',
  QUALITY = 'quality',
  PROCUREMENT = 'procurement',
  OPERATIONS = 'operations'
}

enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  EXPIRED = 'expired',
  FAILED = 'failed',
  REQUIRES_REAUTH = 'requires_reauth'
}

interface CompanyProfile {
  id: string;
  name: string;
  description: string;
  industry: string;
  website: string;
  headquarters: string;
  founded: string;
  employeeCount: string;
  logo?: string;
  coverImage?: string;
  certifications: string[];
  capabilities: string[];
  materials: string[];
  qualityStandards: string[];
}

const DEPARTMENT_LABELS = {
  [POCDepartment.SALES]: 'Sales & Business Development',
  [POCDepartment.ENGINEERING]: 'Engineering & Technical',
  [POCDepartment.RND]: 'Research & Development',
  [POCDepartment.PRIMARY_CONTACT]: 'Primary Contacts',
  [POCDepartment.ON_CALL]: 'On-Call Support',
  [POCDepartment.QUALITY]: 'Quality Assurance',
  [POCDepartment.PROCUREMENT]: 'Procurement',
  [POCDepartment.OPERATIONS]: 'Operations'
};

const SupplierProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'pocs' | 'verification'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddPOC, setShowAddPOC] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<POCDepartment | 'all'>('all');

  // Mock data - would come from API
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    id: '1',
    name: 'TechManu Solutions',
    description: 'Leading manufacturer of precision electronic components and industrial automation systems. Specializing in high-quality semiconductor components, custom PCB assemblies, and IoT-enabled manufacturing solutions.',
    industry: 'Electronics Manufacturing',
    website: 'https://techmanu.com',
    headquarters: 'San Jose, CA, USA',
    founded: '2015',
    employeeCount: '150-500',
    logo: '/api/placeholder/200/200',
    coverImage: '/api/placeholder/800/300',
    certifications: ['ISO 9001:2015', 'ISO 14001', 'IATF 16949', 'RoHS Compliant', 'UL Listed'],
    capabilities: ['PCB Assembly', 'Component Manufacturing', 'Quality Testing', 'Custom Design', 'Rapid Prototyping'],
    materials: ['Silicon Wafers', 'Copper', 'Gold Plating', 'Polymers', 'Ceramics'],
    qualityStandards: ['Six Sigma', 'Lean Manufacturing', 'Statistical Process Control']
  });

  const [pocs, setPOCs] = useState<POC[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      title: 'VP of Sales',
      department: POCDepartment.SALES,
      email: 'sarah.johnson@techmanu.com',
      phone: '+1 (555) 123-4567',
      linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
      profilePicture: '/api/placeholder/60/60',
      verificationStatus: VerificationStatus.VERIFIED,
      lastVerified: '2025-10-15',
      nextVerification: '2025-11-15',
      isAdmin: true,
      linkedinId: 'sarah-johnson-12345'
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      title: 'Chief Technology Officer',
      department: POCDepartment.ENGINEERING,
      email: 'michael.chen@techmanu.com',
      linkedinUrl: 'https://linkedin.com/in/michaelchen',
      profilePicture: '/api/placeholder/60/60',
      verificationStatus: VerificationStatus.VERIFIED,
      lastVerified: '2025-10-20',
      nextVerification: '2025-11-20',
      isAdmin: false,
      linkedinId: 'michael-chen-67890'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      title: 'R&D Manager',
      department: POCDepartment.RND,
      email: 'emily.rodriguez@techmanu.com',
      linkedinUrl: 'https://linkedin.com/in/emilyrodriguez',
      verificationStatus: VerificationStatus.REQUIRES_REAUTH,
      lastVerified: '2025-09-15',
      nextVerification: '2025-10-15',
      isAdmin: false,
      linkedinId: 'emily-rodriguez-11111'
    }
  ]);

  const getVerificationIcon = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case VerificationStatus.PENDING:
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case VerificationStatus.EXPIRED:
      case VerificationStatus.FAILED:
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case VerificationStatus.REQUIRES_REAUTH:
        return <RefreshCw className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getVerificationStatusText = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return 'LinkedIn Verified';
      case VerificationStatus.PENDING:
        return 'Verification Pending';
      case VerificationStatus.EXPIRED:
        return 'Verification Expired';
      case VerificationStatus.FAILED:
        return 'Verification Failed';
      case VerificationStatus.REQUIRES_REAUTH:
        return 'Requires Re-authentication';
      default:
        return 'Unknown Status';
    }
  };

  const handleLinkedInAuth = async (pocId?: string) => {
    // LinkedIn OAuth flow
    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/linkedin/callback`);
    const scope = encodeURIComponent('r_liteprofile r_emailaddress w_member_social');
    const state = encodeURIComponent(JSON.stringify({ 
      type: 'poc_verification', 
      pocId: pocId || 'new',
      companyId: companyProfile.id 
    }));

    const linkedinAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
    
    window.location.href = linkedinAuthUrl;
  };

  const handleReVerifyPOC = async (pocId: string) => {
    try {
      // Call backend API to re-verify POC
      const response = await fetch(`/api/pocs/${pocId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update POC status
        setPOCs(prev => prev.map(poc => 
          poc.id === pocId 
            ? { ...poc, verificationStatus: VerificationStatus.PENDING }
            : poc
        ));
      }
    } catch (error) {
      console.error('Failed to re-verify POC:', error);
    }
  };

  const filteredPOCs = selectedDepartment === 'all' 
    ? pocs 
    : pocs.filter(poc => poc.department === selectedDepartment);

  const renderProfileTab = () => (
    <div className="space-y-8">
      {/* Company Header */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg overflow-hidden">
          {companyProfile.coverImage && (
            <img 
              src={companyProfile.coverImage} 
              alt="Company Cover" 
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="absolute -bottom-16 left-8">
          <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
            {companyProfile.logo ? (
              <img 
                src={companyProfile.logo} 
                alt={companyProfile.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                <Building2 className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="absolute top-4 right-4 bg-white text-gray-600 px-4 py-2 rounded-lg shadow hover:bg-gray-50 flex items-center gap-2"
        >
          <Edit3 className="w-4 h-4" />
          {isEditing ? 'Save Profile' : 'Edit Profile'}
        </button>
      </div>

      {/* Company Info */}
      <div className="pt-16 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{companyProfile.name}</h1>
          <p className="text-lg text-gray-600">{companyProfile.industry}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-5 h-5" />
            <span>{companyProfile.headquarters}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Globe className="w-5 h-5" />
            <a href={companyProfile.website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              {companyProfile.website}
            </a>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-5 h-5" />
            <span>{companyProfile.employeeCount} employees</span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
          <p className="text-gray-600 leading-relaxed">{companyProfile.description}</p>
        </div>

        {/* Capabilities */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Capabilities</h3>
          <div className="flex flex-wrap gap-2">
            {companyProfile.capabilities.map((capability, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
              >
                {capability}
              </span>
            ))}
          </div>
        </div>

        {/* Materials */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Materials & Components</h3>
          <div className="flex flex-wrap gap-2">
            {companyProfile.materials.map((material, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
              >
                {material}
              </span>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications & Standards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companyProfile.certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <Award className="w-6 h-6 text-yellow-500" />
                <span className="font-medium text-gray-900">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPOCsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Points of Contact</h2>
          <p className="text-gray-600">Manage your LinkedIn-verified team contacts</p>
        </div>
        <button 
          onClick={() => setShowAddPOC(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add POC
        </button>
      </div>

      {/* Department Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedDepartment('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedDepartment === 'all' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Departments ({pocs.length})
        </button>
        {Object.entries(DEPARTMENT_LABELS).map(([dept, label]) => {
          const count = pocs.filter(poc => poc.department === dept).length;
          return (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept as POCDepartment)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDepartment === dept 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* POCs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPOCs.map((poc) => (
          <div key={poc.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {poc.profilePicture ? (
                  <img 
                    src={poc.profilePicture} 
                    alt={poc.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{poc.name}</h3>
                  <p className="text-sm text-gray-600">{poc.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {getVerificationIcon(poc.verificationStatus)}
                {poc.isAdmin && <Shield className="w-4 h-4 text-blue-500" />}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{poc.email}</span>
              </div>
              {poc.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{poc.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Linkedin className="w-4 h-4" />
                <a href={poc.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  LinkedIn Profile
                </a>
              </div>
            </div>

            <div className="mb-4">
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {DEPARTMENT_LABELS[poc.department]}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <div className="flex items-center gap-1">
                  {getVerificationIcon(poc.verificationStatus)}
                  <span className={`text-xs ${
                    poc.verificationStatus === VerificationStatus.VERIFIED ? 'text-green-600' :
                    poc.verificationStatus === VerificationStatus.PENDING ? 'text-yellow-600' :
                    poc.verificationStatus === VerificationStatus.REQUIRES_REAUTH ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {getVerificationStatusText(poc.verificationStatus)}
                  </span>
                </div>
              </div>
              
              {poc.verificationStatus === VerificationStatus.VERIFIED && (
                <div className="text-xs text-gray-500">
                  Last verified: {new Date(poc.lastVerified).toLocaleDateString()}
                </div>
              )}

              {poc.verificationStatus === VerificationStatus.REQUIRES_REAUTH && (
                <button
                  onClick={() => handleLinkedInAuth(poc.id)}
                  className="w-full text-xs bg-orange-100 text-orange-700 py-2 rounded hover:bg-orange-200 transition-colors"
                >
                  Re-authenticate with LinkedIn
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add POC Modal */}
      {showAddPOC && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Point of Contact</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  {Object.entries(DEPARTMENT_LABELS).map(([dept, label]) => (
                    <option key={dept} value={dept}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-gray-600">
                The new POC will need to authenticate with LinkedIn to verify their employment and access.
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleLinkedInAuth()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Linkedin className="w-4 h-4" />
                  Authenticate with LinkedIn
                </button>
                <button
                  onClick={() => setShowAddPOC(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderVerificationTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">LinkedIn Verification Management</h2>
        <p className="text-gray-600">Automated verification system to ensure POC authenticity</p>
      </div>

      {/* Verification Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium text-green-700">Verified</span>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {pocs.filter(poc => poc.verificationStatus === VerificationStatus.VERIFIED).length}
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className="font-medium text-yellow-700">Pending</span>
          </div>
          <div className="text-2xl font-bold text-yellow-700">
            {pocs.filter(poc => poc.verificationStatus === VerificationStatus.PENDING).length}
          </div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-orange-500" />
            <span className="font-medium text-orange-700">Requires Re-auth</span>
          </div>
          <div className="text-2xl font-bold text-orange-700">
            {pocs.filter(poc => poc.verificationStatus === VerificationStatus.REQUIRES_REAUTH).length}
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="font-medium text-red-700">Failed/Expired</span>
          </div>
          <div className="text-2xl font-bold text-red-700">
            {pocs.filter(poc => 
              poc.verificationStatus === VerificationStatus.FAILED || 
              poc.verificationStatus === VerificationStatus.EXPIRED
            ).length}
          </div>
        </div>
      </div>

      {/* Verification Settings */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Verification Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto-verification Frequency</h4>
              <p className="text-sm text-gray-600">How often to automatically check POC employment status</p>
            </div>
            <select className="border border-gray-300 rounded-lg px-3 py-2">
              <option value="30">Every 30 days</option>
              <option value="60">Every 60 days</option>
              <option value="90">Every 90 days</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email Verification Reminders</h4>
              <p className="text-sm text-gray-600">Send email reminders for verification updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">LinkedIn API Integration</h4>
              <p className="text-sm text-gray-600">Automatically verify employment through LinkedIn API</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Verification Log */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Verification Activity</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">Sarah Johnson verified successfully</p>
                <p className="text-sm text-gray-600">LinkedIn profile and employment confirmed</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium">Emily Rodriguez requires re-authentication</p>
                <p className="text-sm text-gray-600">LinkedIn API returned authentication expired</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">1 day ago</span>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium">Dr. Michael Chen verified successfully</p>
                <p className="text-sm text-gray-600">Automatic verification completed</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">3 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Company Profile
            </button>
            <button
              onClick={() => setActiveTab('pocs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pocs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Points of Contact ({pocs.length})
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'verification'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                LinkedIn Verification
              </div>
            </button>
            <a 
              href="/dashboard/supplier-analytics"
              className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
            >
              <div className="flex items-center gap-2">
                📊 Performance Analytics
              </div>
            </a>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'pocs' && renderPOCsTab()}
        {activeTab === 'verification' && renderVerificationTab()}
      </div>
    </div>
  );
};

export default SupplierProfile;