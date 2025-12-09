import React, { useState, useEffect } from 'react';
import {
  Building2, Users, Award, MapPin, Globe, Mail, Phone,
  Plus, Edit3, Trash2, CheckCircle, AlertTriangle, Clock,
  Linkedin, Shield, RefreshCw, UserCheck, Settings, Search,
  FileText, BarChart3, MessageSquare, Bell, User, ChevronDown, LogOut
} from 'lucide-react';
import { useRouter } from 'next/router';
import { dashboardTheme } from '@/styles/dashboardTheme';

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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'pocs' | 'verification'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddPOC, setShowAddPOC] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<POCDepartment | 'all'>('all');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [originalProfile, setOriginalProfile] = useState<CompanyProfile | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_type');
    router.push('/auth/login');
  };

  const handleEditProfile = () => {
    // Save original profile before editing
    setOriginalProfile(JSON.parse(JSON.stringify(companyProfile)));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Restore original profile
    if (originalProfile) {
      setCompanyProfile(originalProfile);
    }
    setIsEditing(false);
    setOriginalProfile(null);
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/companies/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyProfile)
      });

      if (response.ok) {
        setIsEditing(false);
        setOriginalProfile(null);
        alert('Profile saved successfully!');
      } else {
        throw new Error('Failed to save profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  // Company profile state - loaded from API
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    id: '',
    name: '',
    description: '',
    industry: '',
    website: '',
    headquarters: '',
    founded: '',
    employeeCount: '',
    logo: '',
    coverImage: '',
    certifications: [],
    capabilities: [],
    materials: [],
    qualityStandards: []
  });

  const [pocs, setPOCs] = useState<POC[]>([]);

  // Load company profile from API
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/companies/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.company) {
            setCompanyProfile(data.company);
          }
          if (data.pocs) {
            setPOCs(data.pocs);
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };
    loadProfile();
  }, []);

  const getVerificationIcon = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case VerificationStatus.PENDING:
        return <Clock className="w-5 h-5 text-primary-400" />;
      case VerificationStatus.EXPIRED:
      case VerificationStatus.FAILED:
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case VerificationStatus.REQUIRES_REAUTH:
        return <RefreshCw className="w-5 h-5 text-primary-600" />;
      default:
        return <Clock className="w-5 h-5 text-secondary-400" />;
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
        <div className="h-48 bg-gradient-to-r from-secondary-50 to-white rounded-xl overflow-hidden border border-secondary-200 shadow-sm">
          {companyProfile.coverImage && (
            <img
              src={companyProfile.coverImage}
              alt="Company Cover"
              className="w-full h-full object-cover opacity-50"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/10 to-transparent"></div>
          {isEditing && (
            <button className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm text-primary-600 px-3 py-1.5 rounded-lg border border-secondary-200 hover:bg-white transition-all flex items-center gap-2 text-sm font-medium shadow-sm">
              <Plus className="w-4 h-4" />
              Change Cover
            </button>
          )}
        </div>
        <div className="absolute -bottom-16 left-8">
          <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg border-4 border-white relative group">
            {companyProfile.logo ? (
              <img
                src={companyProfile.logo}
                alt={companyProfile.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                <Building2 className="w-12 h-12 text-primary-600" />
              </div>
            )}
            {isEditing && (
              <button className="absolute inset-0 bg-white/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit3 className="w-6 h-6 text-secondary-900" />
              </button>
            )}
          </div>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          {isEditing && (
            <button
              onClick={handleCancelEdit}
              className={dashboardTheme.buttons.secondary}
            >
              Cancel
            </button>
          )}
          <button
            onClick={() => isEditing ? handleSaveProfile() : handleEditProfile()}
            className={dashboardTheme.buttons.primary + " flex items-center gap-2"}
          >
            <Edit3 className="w-4 h-4" />
            {isEditing ? 'Save Profile' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Company Info */}
      <div className="pt-16 space-y-8">
        <div>
          {isEditing ? (
            <input
              type="text"
              value={companyProfile.name}
              onChange={(e) => setCompanyProfile({ ...companyProfile, name: e.target.value })}
              className="text-3xl font-bold text-secondary-900 bg-secondary-50 border border-secondary-200 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Company Name"
            />
          ) : (
            <h1 className="text-3xl font-bold text-secondary-900">{companyProfile.name}</h1>
          )}
          {isEditing ? (
            <input
              type="text"
              value={companyProfile.industry}
              onChange={(e) => setCompanyProfile({ ...companyProfile, industry: e.target.value })}
              className="mt-2 text-lg text-secondary-500 bg-secondary-50 border border-secondary-200 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Industry"
            />
          ) : (
            <p className="text-lg text-secondary-500 font-medium">{companyProfile.industry}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3 text-secondary-600 bg-secondary-50 p-3 rounded-lg border border-secondary-100">
            <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0" />
            {isEditing ? (
              <input
                type="text"
                value={companyProfile.headquarters}
                onChange={(e) => setCompanyProfile({ ...companyProfile, headquarters: e.target.value })}
                className="flex-1 bg-white border border-secondary-200 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Headquarters"
              />
            ) : (
              <span className="font-medium">{companyProfile.headquarters}</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-secondary-600 bg-secondary-50 p-3 rounded-lg border border-secondary-100">
            <Globe className="w-5 h-5 text-primary-600 flex-shrink-0" />
            {isEditing ? (
              <input
                type="url"
                value={companyProfile.website}
                onChange={(e) => setCompanyProfile({ ...companyProfile, website: e.target.value })}
                className="flex-1 bg-white border border-secondary-200 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Website URL"
              />
            ) : (
              <a href={companyProfile.website} className="text-primary-600 hover:text-primary-700 transition-colors font-medium" target="_blank" rel="noopener noreferrer">
                {companyProfile.website}
              </a>
            )}
          </div>
          <div className="flex items-center gap-3 text-secondary-600 bg-secondary-50 p-3 rounded-lg border border-secondary-100">
            <Users className="w-5 h-5 text-primary-600 flex-shrink-0" />
            {isEditing ? (
              <select
                value={companyProfile.employeeCount}
                onChange={(e) => setCompanyProfile({ ...companyProfile, employeeCount: e.target.value })}
                className="flex-1 bg-white border border-secondary-200 rounded px-3 py-1.5 text-sm text-secondary-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-150">51-150 employees</option>
                <option value="150-500">150-500 employees</option>
                <option value="500-1000">500-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            ) : (
              <span className="font-medium">{companyProfile.employeeCount} employees</span>
            )}
          </div>
        </div>

        <div className="bg-white border border-secondary-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-secondary-900 mb-4">About</h3>
          {isEditing ? (
            <textarea
              value={companyProfile.description}
              onChange={(e) => setCompanyProfile({ ...companyProfile, description: e.target.value })}
              rows={4}
              className="w-full bg-secondary-50 border border-secondary-200 rounded-lg px-4 py-3 text-secondary-600 leading-relaxed focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Company description..."
            />
          ) : (
            <p className="text-secondary-600 leading-relaxed">{companyProfile.description}</p>
          )}
        </div>

        {/* Capabilities */}
        <div className="bg-white border border-secondary-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-secondary-900">Core Capabilities</h3>
            {isEditing && (
              <button
                onClick={() => {
                  const newCapability = prompt('Enter new capability:');
                  if (newCapability) {
                    setCompanyProfile({
                      ...companyProfile,
                      capabilities: [...companyProfile.capabilities, newCapability]
                    });
                  }
                }}
                className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Capability
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {companyProfile.capabilities.map((capability, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium border border-primary-100 flex items-center gap-2 group hover:bg-primary-100 transition-colors"
              >
                {capability}
                {isEditing && (
                  <button
                    onClick={() => {
                      setCompanyProfile({
                        ...companyProfile,
                        capabilities: companyProfile.capabilities.filter((_, i) => i !== index)
                      });
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500 hover:text-red-600" />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Materials */}
        <div className="bg-white border border-secondary-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-secondary-900">Materials & Components</h3>
            {isEditing && (
              <button
                onClick={() => {
                  const newMaterial = prompt('Enter new material:');
                  if (newMaterial) {
                    setCompanyProfile({
                      ...companyProfile,
                      materials: [...companyProfile.materials, newMaterial]
                    });
                  }
                }}
                className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Material
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {companyProfile.materials.map((material, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg text-sm font-medium border border-secondary-200 flex items-center gap-2 group hover:bg-secondary-200 transition-colors"
              >
                {material}
                {isEditing && (
                  <button
                    onClick={() => {
                      setCompanyProfile({
                        ...companyProfile,
                        materials: companyProfile.materials.filter((_, i) => i !== index)
                      });
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500 hover:text-red-600" />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white border border-secondary-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-secondary-900">Certifications & Standards</h3>
            {isEditing && (
              <button
                onClick={() => {
                  const newCert = prompt('Enter new certification:');
                  if (newCert) {
                    setCompanyProfile({
                      ...companyProfile,
                      certifications: [...companyProfile.certifications, newCert]
                    });
                  }
                }}
                className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Certification
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companyProfile.certifications.map((cert, index) => (
              <div key={index} className="flex items-center justify-between gap-3 p-4 border border-secondary-200 rounded-xl bg-white hover:shadow-md transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Award className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="font-medium text-secondary-900">{cert}</span>
                </div>
                {isEditing && (
                  <button
                    onClick={() => {
                      setCompanyProfile({
                        ...companyProfile,
                        certifications: companyProfile.certifications.filter((_, i) => i !== index)
                      });
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
                  </button>
                )}
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
          <h2 className="text-2xl font-bold text-secondary-900">Points of Contact</h2>
          <p className="text-secondary-500 mt-1">Manage your LinkedIn-verified team contacts</p>
        </div>
        <button
          onClick={() => setShowAddPOC(true)}
          className={dashboardTheme.buttons.primary + " flex items-center gap-2"}
        >
          <Plus className="w-4 h-4" />
          Add POC
        </button>
      </div>

      {/* Department Filter */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-xl border border-secondary-200 shadow-sm">
        <button
          onClick={() => setSelectedDepartment('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedDepartment === 'all'
              ? 'bg-primary-50 text-primary-700 shadow-sm'
              : 'text-secondary-600 hover:bg-secondary-50'
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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedDepartment === dept
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-secondary-600 hover:bg-secondary-50'
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
          <div key={poc.id} className="bg-white border border-secondary-200 rounded-xl p-6 hover:shadow-lg hover:border-primary-200 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {poc.profilePicture ? (
                  <img
                    src={poc.profilePicture}
                    alt={poc.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-secondary-900">{poc.name}</h3>
                  <p className="text-sm text-secondary-500 font-medium">{poc.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-secondary-50 px-2 py-1 rounded-lg border border-secondary-100">
                {getVerificationIcon(poc.verificationStatus)}
                {poc.isAdmin && <Shield className="w-4 h-4 text-primary-600" />}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-secondary-600 bg-secondary-50/50 p-2 rounded-lg">
                <Mail className="w-4 h-4 text-primary-600" />
                <span className="truncate">{poc.email}</span>
              </div>
              {poc.phone && (
                <div className="flex items-center gap-3 text-sm text-secondary-600 bg-secondary-50/50 p-2 rounded-lg">
                  <Phone className="w-4 h-4 text-primary-600" />
                  <span>{poc.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-secondary-600 bg-secondary-50/50 p-2 rounded-lg group-hover:bg-primary-50/30 transition-colors">
                <Linkedin className="w-4 h-4 text-[#0077b5]" />
                <a href={poc.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[#0077b5] hover:underline font-medium">
                  LinkedIn Profile
                </a>
              </div>
            </div>

            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full border border-primary-100">
                {DEPARTMENT_LABELS[poc.department]}
              </span>
            </div>

            <div className="pt-4 border-t border-secondary-100 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-500 font-medium">Status:</span>
                <div className="flex items-center gap-1.5">
                  {getVerificationIcon(poc.verificationStatus)}
                  <span className={`text-xs font-semibold ${poc.verificationStatus === VerificationStatus.VERIFIED ? 'text-green-600' :
                      poc.verificationStatus === VerificationStatus.PENDING ? 'text-primary-600' :
                        poc.verificationStatus === VerificationStatus.REQUIRES_REAUTH ? 'text-primary-600' :
                          'text-red-500'
                    }`}>
                    {getVerificationStatusText(poc.verificationStatus)}
                  </span>
                </div>
              </div>

              {poc.verificationStatus === VerificationStatus.VERIFIED && (
                <div className="text-xs text-secondary-400 font-medium text-right">
                  Last verified: {new Date(poc.lastVerified).toLocaleDateString()}
                </div>
              )}

              {poc.verificationStatus === VerificationStatus.REQUIRES_REAUTH && (
                <button
                  onClick={() => handleLinkedInAuth(poc.id)}
                  className="w-full text-xs bg-primary-50 text-primary-700 py-2 rounded-lg border border-primary-200 hover:bg-primary-100 transition-colors font-bold flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Re-authenticate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add POC Modal */}
      {showAddPOC && (
        <div className="fixed inset-0 bg-secondary-900/50 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-secondary-200 rounded-2xl p-8 w-full max-w-md shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-secondary-900 mb-6">Add New Point of Contact</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2">
                  Department
                </label>
                <div className="relative">
                  <select className="w-full bg-secondary-50 border border-secondary-200 text-secondary-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none">
                    {Object.entries(DEPARTMENT_LABELS).map(([dept, label]) => (
                      <option key={dept} value={dept}>{label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary-400 pointer-events-none w-5 h-5" />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm text-blue-800 leading-relaxed">
                  The new POC will need to authenticate with LinkedIn to verify their employment and access.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleLinkedInAuth()}
                  className="flex-1 bg-[#0077b5] text-white py-3 px-4 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-[#006396] transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  <Linkedin className="w-5 h-5" />
                  Authenticate
                </button>
                <button
                  onClick={() => setShowAddPOC(false)}
                  className="px-6 py-3 border border-secondary-200 rounded-xl hover:bg-secondary-50 text-secondary-600 font-medium transition-colors"
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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900">LinkedIn Verification Management</h2>
        <p className="text-secondary-500 mt-1">Automated verification system to ensure POC authenticity</p>
      </div>

      {/* Verification Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-green-50 border border-green-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="font-bold text-green-800">Verified</span>
          </div>
          <div className="text-3xl font-bold text-green-700">
            {pocs.filter(poc => poc.verificationStatus === VerificationStatus.VERIFIED).length}
          </div>
        </div>

        <div className="bg-primary-50 border border-primary-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Clock className="w-5 h-5 text-primary-600" />
            </div>
            <span className="font-bold text-primary-800">Pending</span>
          </div>
          <div className="text-3xl font-bold text-primary-700">
            {pocs.filter(poc => poc.verificationStatus === VerificationStatus.PENDING).length}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-bold text-blue-800">Requires Re-auth</span>
          </div>
          <div className="text-3xl font-bold text-blue-700">
            {pocs.filter(poc => poc.verificationStatus === VerificationStatus.REQUIRES_REAUTH).length}
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <span className="font-bold text-red-800">Failed/Expired</span>
          </div>
          <div className="text-3xl font-bold text-red-700">
            {pocs.filter(poc =>
              poc.verificationStatus === VerificationStatus.FAILED ||
              poc.verificationStatus === VerificationStatus.EXPIRED
            ).length}
          </div>
        </div>
      </div>

      {/* Verification Settings */}
      <div className="bg-white border border-secondary-200 rounded-xl p-8 shadow-sm">
        <h3 className="text-lg font-bold text-secondary-900 mb-6">Verification Settings</h3>

        <div className="space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-secondary-100">
            <div>
              <h4 className="font-semibold text-secondary-900">Auto-verification Frequency</h4>
              <p className="text-sm text-secondary-500 mt-1">How often to automatically check POC employment status</p>
            </div>
            <div className="relative">
              <select className="bg-secondary-50 border border-secondary-200 text-secondary-900 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none font-medium">
                <option value="30">Every 30 days</option>
                <option value="60">Every 60 days</option>
                <option value="90">Every 90 days</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 pointer-events-none w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center justify-between pb-6 border-b border-secondary-100">
            <div>
              <h4 className="font-semibold text-secondary-900">Email Verification Reminders</h4>
              <p className="text-sm text-secondary-500 mt-1">Send email reminders for verification updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-12 h-7 bg-secondary-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600 shadow-inner"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-secondary-900">LinkedIn API Integration</h4>
              <p className="text-sm text-secondary-500 mt-1">Automatically verify employment through LinkedIn API</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-12 h-7 bg-secondary-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600 shadow-inner"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Verification Log */}
      <div className="bg-white border border-secondary-200 rounded-xl p-8 shadow-sm">
        <h3 className="text-lg font-bold text-secondary-900 mb-6">Recent Verification Activity</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50/50 rounded-xl border border-green-100">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-secondary-900">Sarah Johnson verified successfully</p>
                <p className="text-sm text-secondary-500">LinkedIn profile and employment confirmed</p>
              </div>
            </div>
            <span className="text-sm text-secondary-400 font-medium">2 hours ago</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <RefreshCw className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-secondary-900">Emily Rodriguez requires re-authentication</p>
                <p className="text-sm text-secondary-500">LinkedIn API returned authentication expired</p>
              </div>
            </div>
            <span className="text-sm text-secondary-400 font-medium">1 day ago</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl border border-secondary-100">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-secondary-900">Dr. Michael Chen verified successfully</p>
                <p className="text-sm text-secondary-500">Automatic verification completed</p>
              </div>
            </div>
            <span className="text-sm text-secondary-400 font-medium">3 days ago</span>
          </div>
        </div>
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
            {/* Logo */}
            <div className={dashboardTheme.navigation.logoSection}>
              <a href="/dashboard/supplier" className={dashboardTheme.navigation.logoButton}>
                <div className={dashboardTheme.navigation.logoBox}>
                  <span className={dashboardTheme.navigation.logoText}>LP</span>
                </div>
                <span className={dashboardTheme.navigation.brandText}>
                  LinkedProcurement
                </span>
              </a>
            </div>

            {/* Center Navigation Menu */}
            <div className={dashboardTheme.navigation.navButtonsContainer}>
              <div className="hidden md:flex gap-2">
                <a
                  href="/dashboard/supplier"
                  className={dashboardTheme.navigation.navButton}
                >
                  AI-Match RFQs
                </a>
                <a
                  href="/dashboard/supplier#responses"
                  className={dashboardTheme.navigation.navButton}
                >
                  My Responses
                </a>
                <a
                  href="/dashboard/supplier-profile"
                  className={dashboardTheme.navigation.navButtonActive}
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

            {/* Right Side */}
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

      <div className={dashboardTheme.mainContent.container}>
        {/* Navigation Tabs */}
        <div className="border-b border-secondary-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-all ${activeTab === 'profile'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-900 hover:border-secondary-300'
                }`}
            >
              Company Profile
            </button>
            <button
              onClick={() => setActiveTab('pocs')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-all ${activeTab === 'pocs'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-900 hover:border-secondary-300'
                }`}
            >
              Points of Contact ({pocs.length})
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-all ${activeTab === 'verification'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-900 hover:border-secondary-300'
                }`}
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                LinkedIn Verification
              </div>
            </button>
            <a
              href="/dashboard/supplier-analytics"
              className="py-4 px-2 border-b-2 border-transparent text-secondary-500 hover:text-secondary-900 hover:border-secondary-300 font-medium text-sm transition-all"
            >
              <div className="flex items-center gap-2">
                AI Performance Analytics
              </div>
            </a>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'pocs' && renderPOCsTab()}
          {activeTab === 'verification' && renderVerificationTab()}
        </div>
      </div>
    </div>
  );
};

export default SupplierProfile;
