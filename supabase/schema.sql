-- Supabase Database Schema for LinkedProcurement
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE (extends auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    profile_picture_url TEXT,
    
    -- LinkedIn specific fields
    linkedin_id TEXT UNIQUE,
    linkedin_profile_url TEXT,
    last_linkedin_verification TIMESTAMPTZ,
    
    -- Account status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_status TEXT DEFAULT 'pending', -- pending, verified, rejected
    user_type TEXT DEFAULT 'buyer', -- buyer, supplier
    deletion_scheduled_at TIMESTAMPTZ,
    
    -- Account security
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    last_login_ip TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COMPANIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    domain TEXT,
    
    -- LinkedIn specific
    linkedin_company_id TEXT UNIQUE,
    
    -- Company details
    industry TEXT,
    headquarters_location TEXT,
    employee_count TEXT,
    founded_year INTEGER,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    
    -- Company type and business focus
    company_type TEXT, -- manufacturer, distributor, service_provider, both
    business_categories JSONB DEFAULT '[]',
    raw_materials_focus JSONB DEFAULT '[]',
    
    -- Business verification
    duns_number TEXT,
    is_verified BOOLEAN DEFAULT false,
    verification_source TEXT,
    
    -- Capabilities and certifications
    certifications JSONB DEFAULT '[]',
    capabilities JSONB DEFAULT '[]',
    materials JSONB DEFAULT '[]',
    naics_codes JSONB DEFAULT '[]',
    
    -- Performance metrics
    response_rate INTEGER DEFAULT 0,
    avg_response_time_hours INTEGER,
    total_rfqs_received INTEGER DEFAULT 0,
    total_rfqs_responded INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- POCS (Points of Contact) TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pocs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Role and status
    role TEXT,
    is_primary BOOLEAN DEFAULT false,
    is_on_call BOOLEAN DEFAULT false,
    availability_status TEXT DEFAULT 'available',
    
    -- Performance metrics
    avg_response_time_hours INTEGER,
    response_rate INTEGER DEFAULT 0,
    total_rfqs_handled INTEGER DEFAULT 0,
    
    -- Timestamps
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RFQS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.rfqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    buyer_company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    
    -- RFQ details
    title TEXT NOT NULL,
    material_category TEXT,
    quantity TEXT,
    target_price TEXT,
    specifications TEXT,
    delivery_deadline TIMESTAMPTZ,
    delivery_location TEXT,
    
    -- Enhanced RFQ fields
    part_number TEXT,
    part_number_description TEXT,
    delivery_plant TEXT,
    yearly_quantity TEXT,
    moq_required TEXT,
    price_unit TEXT,
    unit_of_measure TEXT,
    currency TEXT DEFAULT 'USD',
    incoterm TEXT,
    commodity TEXT,
    
    -- Requirements
    required_certifications JSONB DEFAULT '[]',
    preferred_suppliers JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    
    -- Status and lifecycle
    status TEXT DEFAULT 'active', -- active, closed, expired, cancelled
    visibility TEXT DEFAULT 'public', -- public, private, invited_only
    expires_at TIMESTAMPTZ,
    
    -- Metrics
    view_count INTEGER DEFAULT 0,
    response_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RFQ_RESPONSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.rfq_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_id UUID NOT NULL REFERENCES public.rfqs(id) ON DELETE CASCADE,
    supplier_company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    responding_poc_id UUID REFERENCES public.pocs(id) ON DELETE SET NULL,
    responder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Response details
    status TEXT DEFAULT 'submitted', -- submitted, under_review, accepted, rejected
    price_quote TEXT,
    lead_time_days INTEGER,
    minimum_order_quantity TEXT,
    message TEXT,
    
    -- Enhanced supplier response fields
    supplier_part_number TEXT,
    production_batch_size TEXT,
    supplier_moq TEXT,
    supplier_unit_of_measure TEXT,
    production_lead_time_days INTEGER,
    raw_material_type TEXT,
    raw_material_cost TEXT,
    
    -- Attachments and additional info
    attachments JSONB DEFAULT '[]',
    certifications_provided JSONB DEFAULT '[]',
    
    -- Response metrics
    is_competitive BOOLEAN,
    buyer_rating INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfq_id UUID REFERENCES public.rfqs(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Message content
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    attachments JSONB DEFAULT '[]',
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Subscription details
    tier TEXT DEFAULT 'free' NOT NULL, -- free, pro, premium
    status TEXT DEFAULT 'active' NOT NULL, -- active, cancelled, past_due, paused
    billing_cycle TEXT DEFAULT 'monthly',
    
    -- Pricing
    price_amount DECIMAL(10, 2),
    currency TEXT DEFAULT 'USD',
    
    -- Stripe integration
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_payment_method_id TEXT,
    
    -- Billing dates
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    
    -- Usage limits
    rfq_limit INTEGER,
    rfqs_posted_this_month INTEGER DEFAULT 0,
    response_limit INTEGER,
    responses_sent_this_month INTEGER DEFAULT 0,
    
    -- Features
    features_enabled JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INVOICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    
    -- Invoice details
    invoice_number TEXT UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' NOT NULL,
    
    -- Stripe integration
    stripe_invoice_id TEXT UNIQUE,
    stripe_payment_intent_id TEXT,
    
    -- Billing period
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Payment details
    paid_at TIMESTAMPTZ,
    payment_method TEXT,
    invoice_pdf_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_linkedin_id ON public.profiles(linkedin_id);
CREATE INDEX IF NOT EXISTS idx_companies_name ON public.companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_domain ON public.companies(domain);
CREATE INDEX IF NOT EXISTS idx_pocs_company_id ON public.pocs(company_id);
CREATE INDEX IF NOT EXISTS idx_pocs_user_id ON public.pocs(user_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_buyer_id ON public.rfqs(buyer_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON public.rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_material_category ON public.rfqs(material_category);
CREATE INDEX IF NOT EXISTS idx_rfq_responses_rfq_id ON public.rfq_responses(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_responses_responder_id ON public.rfq_responses(responder_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_rfq_id ON public.messages(rfq_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tier ON public.subscriptions(tier);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pocs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- Companies policies
CREATE POLICY "Companies are viewable by everyone" ON public.companies
    FOR SELECT USING (true);

CREATE POLICY "Users can create companies" ON public.companies
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Company POCs can update company" ON public.companies
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.pocs 
            WHERE pocs.company_id = companies.id 
            AND pocs.user_id = auth.uid()
        )
    );

-- POCs policies
CREATE POLICY "POCs are viewable by everyone" ON public.pocs
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own POC records" ON public.pocs
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own POC records" ON public.pocs
    FOR UPDATE USING (user_id = auth.uid());

-- RFQs policies
CREATE POLICY "Public RFQs are viewable by everyone" ON public.rfqs
    FOR SELECT USING (visibility = 'public' OR buyer_id = auth.uid());

CREATE POLICY "Users can create RFQs" ON public.rfqs
    FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Users can update their own RFQs" ON public.rfqs
    FOR UPDATE USING (buyer_id = auth.uid());

CREATE POLICY "Users can delete their own RFQs" ON public.rfqs
    FOR DELETE USING (buyer_id = auth.uid());

-- RFQ Responses policies
CREATE POLICY "Users can view responses to their RFQs" ON public.rfq_responses
    FOR SELECT USING (
        responder_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.rfqs WHERE rfqs.id = rfq_responses.rfq_id AND rfqs.buyer_id = auth.uid())
    );

CREATE POLICY "Users can create responses" ON public.rfq_responses
    FOR INSERT WITH CHECK (responder_id = auth.uid());

CREATE POLICY "Users can update their own responses" ON public.rfq_responses
    FOR UPDATE USING (responder_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view their messages" ON public.messages
    FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription" ON public.subscriptions
    FOR UPDATE USING (user_id = auth.uid());

-- Invoices policies
CREATE POLICY "Users can view their own invoices" ON public.invoices
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.subscriptions WHERE subscriptions.id = invoices.subscription_id AND subscriptions.user_id = auth.uid())
    );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, user_type)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'buyer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_pocs_updated_at BEFORE UPDATE ON public.pocs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_rfqs_updated_at BEFORE UPDATE ON public.rfqs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_rfq_responses_updated_at BEFORE UPDATE ON public.rfq_responses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- GRANT PERMISSIONS (for service role)
-- =====================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
