import React, { useState, useEffect } from 'react';
import { User, Mail, Building2, Save, ArrowLeft, Camera, Linkedin, Briefcase, Phone, MapPin, Globe, CheckCircle, AlertCircle, Star } from 'lucide-react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { dashboardTheme } from '@/styles/dashboardTheme';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  profile_picture_url?: string;
  user_type: string;
  is_verified: boolean;
  created_at: string;
  linkedin_profile_url?: string;
  linkedin_id?: string;
  last_linkedin_verification?: string;
}

interface POCProfile {
  role?: string;
  is_primary?: boolean;
  is_on_call?: boolean;
  availability_status?: string;
  company_name?: string;
  response_rate?: number;
  avg_response_time_hours?: number;
  total_rfqs_handled?: number;
}

export default function AccountSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pocProfile, setPOCProfile] = useState<POCProfile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    linkedin_profile_url: '',
    role: '',
    phone: '',
    availability_status: 'available'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const response = await axios.get(`${API_URL}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        linkedin_profile_url: response.data.linkedin_profile_url || '',
        role: '',
        phone: '',
        availability_status: 'available'
      });
      setPreviewUrl(response.data.profile_picture_url || '');

      // Fetch POC info if user is a supplier
      if (response.data.user_type === 'supplier') {
        try {
          const pocResponse = await axios.get(`${API_URL}/api/v1/pocs/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (pocResponse.data) {
            setPOCProfile(pocResponse.data);
            setFormData(prev => ({
              ...prev,
              role: pocResponse.data.role || '',
              availability_status: pocResponse.data.availability_status || 'available'
            }));
          }
        } catch (pocErr) {
          console.log('No POC profile found');
        }
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile information');
      setLoading(false);

      if (err.response?.status === 401) {
        router.push('/auth/login');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async () => {
    if (!selectedFile) return null;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${API_URL}/api/v1/auth/upload-profile-picture`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data.profile_picture_url;
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      throw new Error('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      // Upload image if selected
      let profile_picture_url = profile?.profile_picture_url;
      if (selectedFile) {
        profile_picture_url = await uploadProfilePicture();
      }

      const response = await axios.patch(
        `${API_URL}/api/v1/auth/profile`,
        {
          name: formData.name,
          linkedin_profile_url: formData.linkedin_profile_url,
          ...(profile_picture_url && { profile_picture_url })
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setProfile(response.data);
      setSelectedFile(null);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const goBack = () => {
    const userType = localStorage.getItem('user_type');
    router.push(`/dashboard/${userType || 'buyer'}`);
  };

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

      {/* Header */}
      <header className="bg-white/80 border-b border-secondary-200 shadow-sm backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
              <div>
                <h1 className={dashboardTheme.typography.heading3}>
                  Account Settings</h1>
                <p className="text-sm text-secondary-500">Manage your profile information</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className={dashboardTheme.cards.primary + " " + dashboardTheme.cards.padding.large}>
          {/* Profile Picture Section */}
          <div className="flex items-center gap-6 pb-8 border-b border-secondary-100">
            <div className="relative group">
              <input
                type="file"
                id="profile-picture-upload"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="profile-picture-upload"
                className="cursor-pointer block"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-primary-100 group-hover:ring-primary-200 transition-all shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center ring-4 ring-white shadow-lg group-hover:ring-primary-50 transition-all">
                    <User size={40} className="text-primary-600" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 p-2 bg-primary-600 rounded-full shadow-lg hover:bg-primary-700 transition-colors group-hover:scale-110 transform border-2 border-white">
                  <Camera size={16} className="text-white" />
                </div>
              </label>
            </div>
            <div>
              <h2 className={dashboardTheme.typography.heading3}>{profile?.name || 'User'}</h2>
              <p className="text-sm text-secondary-500 mb-2">{profile?.email}</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${profile?.is_verified
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-secondary-50 text-secondary-600 border-secondary-200'
                }`}>
                {profile?.is_verified ? 'Verified Account' : 'Not Verified'}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700">
                <CheckCircle size={20} />
                <p className="text-sm font-medium">{success}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                <AlertCircle size={20} />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {selectedFile && (
              <div className="p-4 bg-primary-50 border border-primary-100 rounded-xl flex items-center gap-2 text-primary-700">
                <Camera size={20} />
                <p className="text-sm font-medium">
                  New profile picture selected: {selectedFile.name}
                </p>
              </div>
            )}

            {/* Personal Information Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-secondary-900 border-b border-secondary-100 pb-2 flex items-center gap-2">
                <User size={20} className="text-primary-600" />
                Personal Information
              </h3>

              {/* Email (Read-only) */}
              <div>
                <label className={dashboardTheme.forms.label}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-3 text-secondary-400" />
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className={dashboardTheme.forms.input + " pl-10 bg-secondary-50 cursor-not-allowed text-secondary-500"}
                  />
                </div>
                <p className="text-xs text-secondary-400 mt-1 ml-1">Email cannot be changed</p>
              </div>

              {/* Name */}
              <div>
                <label className={dashboardTheme.forms.label}>
                  Full Name
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3 text-secondary-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={dashboardTheme.forms.input + " pl-10"}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              {/* LinkedIn Profile */}
              <div>
                <label className={dashboardTheme.forms.label}>
                  LinkedIn Profile URL
                </label>
                <div className="relative">
                  <Linkedin size={18} className="absolute left-3 top-3 text-secondary-400" />
                  <input
                    type="url"
                    name="linkedin_profile_url"
                    value={formData.linkedin_profile_url}
                    onChange={handleChange}
                    className={dashboardTheme.forms.input + " pl-10"}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                {profile?.linkedin_id && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-medium">
                    <Linkedin size={12} />
                    LinkedIn Connected
                    {profile.last_linkedin_verification && (
                      <span className="text-secondary-400 font-normal">
                        • Last verified: {new Date(profile.last_linkedin_verification).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Professional Information Section (for Suppliers) */}
            {profile?.user_type === 'supplier' && (
              <div className="space-y-6 pt-2">
                <h3 className="text-lg font-semibold text-secondary-900 border-b border-secondary-100 pb-2 flex items-center gap-2">
                  <Briefcase size={20} className="text-primary-600" />
                  Professional Information
                </h3>

                {/* Role/Title */}
                <div>
                  <label className={dashboardTheme.forms.label}>
                    Job Title / Role
                  </label>
                  <div className="relative">
                    <Briefcase size={18} className="absolute left-3 top-3 text-secondary-400" />
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={dashboardTheme.forms.input + " pl-10"}
                      placeholder="e.g., Sales Manager, Engineering Director"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className={dashboardTheme.forms.label}>
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-3 text-secondary-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={dashboardTheme.forms.input + " pl-10"}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                {/* Availability Status */}
                <div>
                  <label className={dashboardTheme.forms.label}>
                    Availability Status
                  </label>
                  <div className="relative">
                    <Globe size={18} className="absolute left-3 top-3 text-secondary-400" />
                    <select
                      name="availability_status"
                      value={formData.availability_status}
                      onChange={handleChange}
                      className={dashboardTheme.forms.select + " pl-10"}
                    >
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="on-call">On-Call</option>
                      <option value="away">Away</option>
                    </select>
                  </div>
                  <p className="text-xs text-secondary-400 mt-1 ml-1">
                    This helps buyers know when to expect a response
                  </p>
                </div>

                {/* POC Stats (if available) */}
                {pocProfile && (
                  <div className="p-5 bg-secondary-50 rounded-xl border border-secondary-200">
                    <h4 className="text-sm font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                      <Building2 size={16} className="text-secondary-500" />
                      Your Performance Metrics
                    </h4>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      {pocProfile.response_rate !== undefined && (
                        <div>
                          <span className="text-secondary-500 text-xs uppercase tracking-wider font-medium">Response Rate</span>
                          <p className="text-primary-600 font-bold text-lg mt-1">{pocProfile.response_rate}%</p>
                        </div>
                      )}
                      {pocProfile.avg_response_time_hours !== undefined && (
                        <div>
                          <span className="text-secondary-500 text-xs uppercase tracking-wider font-medium">Avg Response Time</span>
                          <p className="text-primary-600 font-bold text-lg mt-1">{pocProfile.avg_response_time_hours}h</p>
                        </div>
                      )}
                      {pocProfile.total_rfqs_handled !== undefined && (
                        <div>
                          <span className="text-secondary-500 text-xs uppercase tracking-wider font-medium">RFQs Handled</span>
                          <p className="text-secondary-900 font-bold text-lg mt-1">{pocProfile.total_rfqs_handled}</p>
                        </div>
                      )}
                      {pocProfile.company_name && (
                        <div>
                          <span className="text-secondary-500 text-xs uppercase tracking-wider font-medium">Company</span>
                          <p className="text-secondary-900 font-bold text-lg mt-1 truncate">{pocProfile.company_name}</p>
                        </div>
                      )}
                    </div>
                    {pocProfile.is_primary && (
                      <div className="mt-4 pt-4 border-t border-secondary-200">
                        <span className={dashboardTheme.badges.primary + " inline-flex items-center gap-1"}>
                          <Star size={12} fill="currentColor" />
                          Primary Contact
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Account Info */}
            <div className="pt-6 border-t border-secondary-100">
              <h3 className="text-sm font-medium text-secondary-500 mb-4 uppercase tracking-wider">Account Information</h3>
              <div className="space-y-3 text-sm bg-secondary-50 p-4 rounded-xl border border-secondary-100">
                <div className="flex justify-between items-center">
                  <span className="text-secondary-600">Account Type</span>
                  <span className="font-semibold text-secondary-900 capitalize px-3 py-1 bg-white rounded-lg border border-secondary-200 shadow-sm">
                    {profile?.user_type}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary-600">Member Since</span>
                  <span className="font-medium text-secondary-900">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving || uploading}
                className={dashboardTheme.buttons.primary + " flex-1 justify-center py-3 text-lg disabled:opacity-50"}
              >
                {saving || uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {uploading ? 'Uploading...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save size={20} className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={goBack}
                className={dashboardTheme.buttons.secondary + " px-8 py-3 text-lg"}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
