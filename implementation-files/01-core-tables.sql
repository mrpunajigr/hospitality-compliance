-- ==========================================
-- JiGR PLATFORM CORE DATABASE SCHEMA
-- Portable PostgreSQL Schema (v1.10.6.023)
-- Vendor: PORTABLE (AWS RDS, Google Cloud SQL, Azure Database, Self-hosted)
-- Multi-Tenant: Secure by Design
-- ==========================================

-- EXTENSIONS REQUIRED
-- Note: All extensions are standard PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Alternative for providers without uuid-ossp: Use gen_random_uuid() (PostgreSQL 13+)

-- ==========================================
-- CORE AUTHENTICATION & TENANT TABLES
-- ==========================================

-- 1. CLIENT ORGANIZATIONS (Multi-Tenant Root)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    business_type TEXT DEFAULT 'hospitality',
    license_number TEXT, -- NZ alcohol license number
    business_email TEXT NOT NULL,
    phone TEXT,
    address JSONB, -- {street, city, country, postal_code}
    
    -- Subscription Management
    subscription_status TEXT DEFAULT 'trial' 
        CHECK (subscription_status IN ('trial', 'active', 'past_due', 'cancelled')),
    subscription_tier TEXT DEFAULT 'basic' 
        CHECK (subscription_tier IN ('basic', 'professional', 'enterprise')),
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT,
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    last_payment_date TIMESTAMP WITH TIME ZONE,
    
    -- Usage Limits
    document_limit INTEGER DEFAULT 500,
    estimated_monthly_deliveries INTEGER,
    
    -- Onboarding Flow
    onboarding_status TEXT DEFAULT 'started',
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    first_document_processed BOOLEAN DEFAULT FALSE,
    selected_plan TEXT,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. USER PROFILES (Authentication Extension)
-- Note: For non-Supabase providers, this replaces auth.users
CREATE TABLE profiles (
    id UUID PRIMARY KEY, -- References auth system user ID
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    is_super_admin BOOLEAN DEFAULT FALSE, -- Platform admin access
    
    -- For non-Supabase implementations
    encrypted_password TEXT, -- Only used when not using external auth
    email_confirmed_at TIMESTAMP WITH TIME ZONE,
    last_sign_in_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CLIENT-USER RELATIONSHIPS (Multi-Tenant Access Control)
CREATE TABLE client_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('STAFF', 'SUPERVISOR', 'MANAGER', 'OWNER')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    
    -- Invitation Tracking
    invited_by UUID REFERENCES profiles(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE,
    
    -- Role Permissions (JSONB for flexibility)
    permissions JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one relationship per user-client pair
    UNIQUE(user_id, client_id)
);

-- 4. TEAM INVITATIONS
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('STAFF', 'SUPERVISOR', 'MANAGER')),
    invited_by UUID REFERENCES profiles(id),
    token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    status TEXT DEFAULT 'pending' 
        CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- SUPPLIER & DELIVERY MANAGEMENT
-- ==========================================

-- 5. SUPPLIER MASTER DATA
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    address JSONB, -- {street, city, country, postal_code}
    
    -- Delivery Patterns
    delivery_schedule JSONB, -- ['monday', 'wednesday', 'friday']
    product_types JSONB, -- ['dairy', 'meat', 'frozen', 'dry_goods']
    temperature_requirements JSONB, -- {frozen: {min: -18, max: -15}, chilled: {min: 2, max: 5}}
    
    -- Performance Tracking
    compliance_rating DECIMAL(3,2) DEFAULT 0.00,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. DELIVERY RECORDS (Core Business Entity) - SIMPLIFIED v1.10.6
CREATE TABLE delivery_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    -- CORE 3 FEATURES (Back to Basics Approach)
    supplier_name TEXT NOT NULL, -- Simple text extraction with fallback
    delivery_date TIMESTAMP WITH TIME ZONE, -- Extracted date or current date
    image_path TEXT NOT NULL, -- Filename for storage system
    
    -- Processing Status
    processing_status TEXT DEFAULT 'completed' 
        CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    confidence_score DECIMAL(3,2) DEFAULT 0.95,
    
    -- OCR Text for Audit  
    raw_extracted_text TEXT, -- Google Cloud Document AI output
    
    -- Legacy Fields (Available but not actively used in simplified approach)
    user_id UUID REFERENCES profiles(id),
    supplier_id UUID REFERENCES suppliers(id),
    docket_number TEXT,
    products JSONB,
    extracted_line_items JSONB,
    product_classification JSONB,
    confidence_scores JSONB,
    compliance_analysis JSONB,
    estimated_value DECIMAL(10,2),
    item_count INTEGER DEFAULT 0,
    processing_metadata JSONB,
    error_message TEXT,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TEMPERATURE READINGS (Extracted Temperature Data)
CREATE TABLE temperature_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_record_id UUID REFERENCES delivery_records(id) ON DELETE CASCADE,
    
    -- Temperature Data
    temperature_value DECIMAL(5,2) NOT NULL,
    temperature_unit CHAR(1) DEFAULT 'C' CHECK (temperature_unit IN ('C', 'F')),
    product_type TEXT, -- 'chilled', 'frozen', 'ambient'
    
    -- Compliance Analysis
    is_compliant BOOLEAN,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    safe_min_temp DECIMAL(5,2),
    safe_max_temp DECIMAL(5,2),
    
    -- Context
    context TEXT, -- Surrounding text context from OCR
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- COMPLIANCE & ALERTING SYSTEM
-- ==========================================

-- 8. COMPLIANCE ALERTS (Violation Detection)
CREATE TABLE compliance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_record_id UUID REFERENCES delivery_records(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Alert Details
    alert_type TEXT NOT NULL, -- 'temperature_violation', 'missing_data', 'suspicious_reading'
    severity TEXT CHECK (severity IN ('warning', 'critical')),
    temperature_value DECIMAL(5,2),
    supplier_name TEXT,
    message TEXT NOT NULL,
    
    -- Workflow Management
    requires_acknowledgment BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES profiles(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    corrective_actions TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. COMPLIANCE SETTINGS (Client-Specific Rules)
CREATE TABLE compliance_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Configuration
    rules JSONB NOT NULL, -- Temperature thresholds, alert rules
    alert_preferences JSONB, -- Email, SMS, dashboard preferences
    notification_emails JSONB, -- Array of email addresses
    retention_policy JSONB, -- Data retention rules
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- REPORTING & AUDIT SYSTEM
-- ==========================================

-- 10. COMPLIANCE REPORTS (Generated Reports)
CREATE TABLE compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Report Details
    report_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'audit', 'inspector'
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    generated_by UUID REFERENCES profiles(id),
    
    -- File Management
    format TEXT CHECK (format IN ('pdf', 'csv')),
    file_path TEXT,
    download_count INTEGER DEFAULT 0,
    
    -- Lifecycle
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- 11. INSPECTOR ACCESS (Health Inspector Portal)
CREATE TABLE inspector_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Inspector Details
    inspector_name TEXT NOT NULL,
    inspector_official_id TEXT NOT NULL,
    inspector_email TEXT NOT NULL,
    inspector_department TEXT,
    
    -- Access Control
    access_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    granted_by UUID REFERENCES profiles(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Usage Tracking
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. AUDIT LOGS (System Audit Trail)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    
    -- Event Details
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'export'
    resource_type TEXT, -- 'delivery_record', 'user', 'settings'
    resource_id TEXT,
    details JSONB, -- Additional context
    
    -- Technical Context
    ip_address INET,
    user_agent TEXT,
    session_id TEXT
);

-- ==========================================
-- BUSINESS INTELLIGENCE & ANALYTICS
-- ==========================================

-- 13. CLIENT DISPLAY CONFIGURATIONS (Phase 3a Feature)
CREATE TABLE client_display_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    config_name TEXT DEFAULT 'default',
    is_active BOOLEAN DEFAULT true,
    
    -- Mandatory Fields (Always Shown)
    show_supplier BOOLEAN DEFAULT true,
    show_delivery_date BOOLEAN DEFAULT true,
    show_signed_by BOOLEAN DEFAULT true,
    show_temperature_data BOOLEAN DEFAULT true,
    show_product_classification BOOLEAN DEFAULT true,
    
    -- Optional Fields (Configurable)
    show_invoice_number BOOLEAN DEFAULT false,
    show_items BOOLEAN DEFAULT false,
    show_unit_size BOOLEAN DEFAULT false,
    show_unit_price BOOLEAN DEFAULT false,
    show_sku_code BOOLEAN DEFAULT false,
    show_tax BOOLEAN DEFAULT false,
    show_estimated_value BOOLEAN DEFAULT false,
    show_item_count BOOLEAN DEFAULT false,
    
    -- Display Preferences
    results_card_layout TEXT DEFAULT 'compact' 
        CHECK (results_card_layout IN ('compact', 'detailed', 'minimal')),
    group_by_temperature_category BOOLEAN DEFAULT true,
    show_confidence_scores BOOLEAN DEFAULT false,
    
    -- Business-Specific Settings
    currency_symbol TEXT DEFAULT '$',
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    temperature_unit TEXT DEFAULT 'C',
    
    -- Industry Preset Reference
    industry_preset TEXT CHECK (industry_preset IN ('restaurant', 'hotel', 'cafe', 'catering', 'custom')) 
        DEFAULT 'restaurant',
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. ENHANCED EXTRACTION ANALYTICS (Phase 3a Feature)
CREATE TABLE enhanced_extraction_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    delivery_record_id UUID REFERENCES delivery_records(id) ON DELETE CASCADE,
    
    -- Extraction Quality Metrics
    overall_confidence DECIMAL(3,2),
    supplier_confidence DECIMAL(3,2),
    date_confidence DECIMAL(3,2),
    temperature_confidence DECIMAL(3,2),
    classification_confidence DECIMAL(3,2),
    
    -- Product Analysis
    total_products INTEGER DEFAULT 0,
    frozen_products INTEGER DEFAULT 0,
    chilled_products INTEGER DEFAULT 0,
    ambient_products INTEGER DEFAULT 0,
    unclassified_products INTEGER DEFAULT 0,
    
    -- Value Analysis
    estimated_total_value DECIMAL(10,2),
    average_item_value DECIMAL(8,2),
    
    -- Compliance Insights
    temperature_violations INTEGER DEFAULT 0,
    compliance_score DECIMAL(3,2),
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    
    -- Processing Metadata
    processing_time_ms INTEGER,
    extraction_method TEXT,
    ai_model_version TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- USAGE & BILLING TRACKING
-- ==========================================

-- 15. DOCUMENT USAGE (Processing Billing)
CREATE TABLE document_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    delivery_record_id UUID REFERENCES delivery_records(id) ON DELETE CASCADE,
    
    -- Billing Details
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    billing_period TEXT, -- 'YYYY-MM' format
    cost_cents INTEGER DEFAULT 0 -- Cost in cents for precise billing
);

-- 16. DATA EXPORTS (Export Tracking)
CREATE TABLE data_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Export Details
    export_type TEXT NOT NULL, -- 'compliance_report', 'delivery_data', 'temperature_logs'
    requested_by UUID REFERENCES profiles(id),
    purpose TEXT, -- 'audit', 'inspector', 'backup'
    
    -- Processing Status
    status TEXT DEFAULT 'pending' 
        CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    download_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    -- Lifecycle
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 17. WEBHOOK LOGS (Stripe Integration)
CREATE TABLE webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Webhook Details
    event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL, -- 'invoice.payment_succeeded', 'customer.subscription.updated'
    stripe_customer_id TEXT,
    
    -- Processing Results
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0
);

-- 18. ASSETS TABLE (File Management)
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Asset Details
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    storage_path TEXT NOT NULL,
    
    -- Categorization
    asset_type TEXT CHECK (asset_type IN ('logo', 'document', 'image', 'other')),
    category TEXT,
    
    -- Upload Details
    uploaded_by UUID REFERENCES profiles(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Usage
    is_active BOOLEAN DEFAULT true,
    last_accessed_at TIMESTAMP WITH TIME ZONE
);

-- 19. ASSET USAGE TRACKING
CREATE TABLE asset_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Usage Context
    used_in TEXT, -- 'email_template', 'report_header', 'dashboard'
    usage_context JSONB,
    
    -- Tracking
    used_by UUID REFERENCES profiles(id),
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ONBOARDING & USER EXPERIENCE
-- ==========================================

-- 20. ONBOARDING PROGRESS (User onboarding workflow tracking)
CREATE TABLE onboarding_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    step VARCHAR(50) NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, client_id, step)
);

-- ==========================================
-- EMAIL VERIFICATION & NOTIFICATIONS
-- ==========================================

-- 21. EMAIL VERIFICATION TOKENS (Custom email verification system)
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    verification_type TEXT DEFAULT 'signup' CHECK (verification_type IN ('signup', 'email_change', 'password_reset')),
    ip_address INET,
    user_agent TEXT
);

-- ==========================================
-- ADD UPDATE TIMESTAMP TRIGGERS
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at 
    BEFORE UPDATE ON suppliers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_records_updated_at 
    BEFORE UPDATE ON delivery_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_settings_updated_at 
    BEFORE UPDATE ON compliance_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_display_configurations_updated_at 
    BEFORE UPDATE ON client_display_configurations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_progress_updated_at 
    BEFORE UPDATE ON onboarding_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '✅ JiGR Platform Core Schema Created Successfully';
    RAISE NOTICE '📊 Tables: 21 core tables with full multi-tenant support';
    RAISE NOTICE '🔧 Features: RBAC, audit logging, compliance tracking, analytics';
    RAISE NOTICE '⚡ Next: Run 02-compliance-module.sql for temperature compliance features';
END $$;