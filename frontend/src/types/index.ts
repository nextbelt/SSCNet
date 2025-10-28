export interface User {
  id: string;
  email: string;
  name: string;
  profile_picture_url?: string;
  linkedin_profile_url?: string;
  is_verified: boolean;
  verification_status: string;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  domain?: string;
  linkedin_company_id?: string;
  industry?: string;
  headquarters_location?: string;
  employee_count?: string;
  founded_year?: number;
  description?: string;
  logo_url?: string;
  website_url?: string;
  duns_number?: string;
  is_verified: boolean;
  verification_source?: string;
  certifications?: string;
  capabilities?: string;
  materials?: string;
  naics_codes?: string;
  response_rate: number;
  avg_response_time_hours?: number;
  total_rfqs_received: number;
  total_rfqs_responded: number;
  created_at: string;
  updated_at: string;
}

export interface POC {
  id: string;
  company_id: string;
  user_id: string;
  role?: string;
  is_primary: boolean;
  is_on_call: boolean;
  availability_status: string;
  avg_response_time_hours?: number;
  response_rate: number;
  total_rfqs_handled: number;
  last_active_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  company?: Company;
}

export interface RFQ {
  id: string;
  buyer_id: string;
  buyer_company_id: string;
  title: string;
  material_category?: string;
  quantity?: string;
  target_price?: string;
  specifications?: string;
  delivery_deadline?: string;
  delivery_location?: string;
  required_certifications?: string;
  preferred_suppliers?: string;
  attachments?: string;
  status: 'active' | 'closed' | 'expired' | 'cancelled';
  visibility: 'public' | 'private' | 'invited_only';
  expires_at?: string;
  view_count: number;
  response_count: number;
  created_at: string;
  updated_at: string;
  buyer_company_name?: string;
}

export interface RFQResponse {
  id: string;
  rfq_id: string;
  supplier_company_id: string;
  responding_poc_id: string;
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected';
  price_quote?: string;
  lead_time_days?: number;
  minimum_order_quantity?: string;
  message?: string;
  attachments?: string;
  certifications_provided?: string;
  is_competitive?: boolean;
  buyer_rating?: number;
  created_at: string;
  responded_at?: string;
  updated_at: string;
  supplier_company_name?: string;
  responding_poc_name?: string;
}

export interface Message {
  id: string;
  rfq_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: 'text' | 'system' | 'attachment';
  attachments?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  sender?: User;
  recipient?: User;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LinkedInAuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthUser extends User {
  token: string;
  refresh_token: string;
}

// Form types
export interface RFQFormData {
  title: string;
  material_category?: string;
  quantity?: string;
  target_price?: string;
  specifications?: string;
  delivery_deadline?: Date;
  delivery_location?: string;
  required_certifications?: string[];
  preferred_suppliers?: string[];
  visibility: 'public' | 'private' | 'invited_only';
  expires_at?: Date;
}

export interface RFQResponseFormData {
  price_quote?: string;
  lead_time_days?: number;
  minimum_order_quantity?: string;
  message?: string;
  certifications_provided?: string[];
}

export interface CompanyFormData {
  name: string;
  domain?: string;
  industry?: string;
  headquarters_location?: string;
  employee_count?: string;
  founded_year?: number;
  description?: string;
  website_url?: string;
  certifications?: string[];
  capabilities?: string[];
  materials?: string[];
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  material_category?: string;
  industry?: string;
  location?: string;
  certifications?: string[];
  response_rate_min?: number;
  employee_count?: string;
  founded_year_min?: number;
  founded_year_max?: number;
}

export interface RFQFilters {
  status?: string;
  material_category?: string;
  search?: string;
  delivery_deadline_from?: Date;
  delivery_deadline_to?: Date;
  target_price_min?: number;
  target_price_max?: number;
}

// Notification types
export interface Notification {
  id: string;
  type: 'rfq_response' | 'message' | 'rfq_update' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

// Analytics types
export interface DashboardMetrics {
  total_rfqs: number;
  active_rfqs: number;
  total_responses: number;
  avg_response_time: number;
  response_rate: number;
  total_companies: number;
  verified_companies: number;
}

export interface RFQMetrics {
  id: string;
  title: string;
  view_count: number;
  response_count: number;
  avg_response_time: number;
  competitive_responses: number;
  status: string;
  created_at: string;
}

// File upload types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}