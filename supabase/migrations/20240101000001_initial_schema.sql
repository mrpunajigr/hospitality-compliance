-- Hospitality Compliance SaaS - Initial Multi-Tenant Schema
-- This migration creates all tables needed for the MVP

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE BUSINESS TABLES
-- =====================================================

-- 1. Clients (Organizations/Businesses)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    business_type TEXT DEFAULT 'hospitality',
    license_number TEXT, -- NZ alcohol license number
    business_email TEXT NOT NULL,
    phone TEXT,
    address JSONB,
    subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'past_due', 'cancelled')),
    subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'professional', 'enterprise')),
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT,
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    last_payment_date TIMESTAMP WITH TIME ZONE,
    document_limit INTEGER DEFAULT 500,
    estimated_monthly_deliveries INTEGER,
    onboarding_status TEXT DEFAULT 'started',
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    first_document_processed BOOLEAN DEFAULT FALSE,
    selected_plan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Profiles (User Profiles - extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    is_super_admin BOOLEAN DEFAULT FALSE, -- Platform admin access
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Client Users (User-Client Relationships)  
CREATE TABLE client_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('staff', 'manager', 'admin', 'owner')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    invited_by UUID REFERENCES profiles(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, client_id)
);

-- 4. Invitations (Team Invitations)
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    invited_by UUID REFERENCES profiles(id),
    token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DELIVERY & COMPLIANCE TABLES
-- =====================================================

-- 5. Suppliers (Supplier Master List)
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT,
    address JSONB,
    delivery_schedule JSONB, -- ['monday', 'wednesday', 'friday']
    product_types JSONB, -- ['dairy', 'meat', 'frozen', 'dry_goods']
    temperature_requirements JSONB,
    compliance_rating DECIMAL(3,2) DEFAULT 0.00,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Delivery Records (Main Delivery Documents)
CREATE TABLE delivery_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    supplier_id UUID REFERENCES suppliers(id),
    supplier_name TEXT, -- Fallback if supplier not in master list
    image_path TEXT NOT NULL, -- Path in Supabase storage
    docket_number TEXT,
    delivery_date TIMESTAMP WITH TIME ZONE,
    products JSONB, -- Extracted product list
    raw_extracted_text TEXT, -- Full OCR text for audit
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    confidence_score DECIMAL(3,2), -- Document AI confidence
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Temperature Readings (Extracted Temperature Data)
CREATE TABLE temperature_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_record_id UUID REFERENCES delivery_records(id) ON DELETE CASCADE,
    temperature_value DECIMAL(5,2) NOT NULL,
    temperature_unit CHAR(1) DEFAULT 'C' CHECK (temperature_unit IN ('C', 'F')),
    product_type TEXT, -- 'chilled', 'frozen', 'ambient'
    is_compliant BOOLEAN,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    safe_min_temp DECIMAL(5,2),
    safe_max_temp DECIMAL(5,2),
    context TEXT, -- Surrounding text context
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Compliance Alerts (Violation Alerts)
CREATE TABLE compliance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_record_id UUID REFERENCES delivery_records(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('warning', 'critical')),
    temperature_value DECIMAL(5,2),
    supplier_name TEXT,
    message TEXT NOT NULL,
    requires_acknowledgment BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES profiles(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    corrective_actions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REPORTING & AUDIT TABLES  
-- =====================================================

-- 9. Compliance Reports (Generated Reports)
CREATE TABLE compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    generated_by UUID REFERENCES profiles(id),
    format TEXT CHECK (format IN ('pdf', 'csv')),
    file_path TEXT,
    download_count INTEGER DEFAULT 0,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- 10. Inspector Access (Health Inspector Portal Access)
CREATE TABLE inspector_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    inspector_name TEXT NOT NULL,
    inspector_official_id TEXT NOT NULL,
    inspector_email TEXT NOT NULL,
    inspector_department TEXT,
    access_token TEXT UNIQUE NOT NULL,
    granted_by UUID REFERENCES profiles(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Audit Logs (System Audit Trail)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT
);

-- 12. Data Exports (Export Tracking)
CREATE TABLE data_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    export_type TEXT NOT NULL,
    requested_by UUID REFERENCES profiles(id),
    purpose TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    download_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- USAGE & BILLING TABLES
-- =====================================================

-- 13. Document Usage (Document Processing Tracking)
CREATE TABLE document_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    delivery_record_id UUID REFERENCES delivery_records(id) ON DELETE CASCADE,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    billing_period TEXT, -- 'YYYY-MM' format
    cost_cents INTEGER DEFAULT 0
);

-- 14. Webhook Logs (Stripe Webhook Processing)
CREATE TABLE webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    stripe_customer_id TEXT,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0
);

-- 15. Compliance Settings (Client-Specific Rules)
CREATE TABLE compliance_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    rules JSONB NOT NULL,
    alert_preferences JSONB,
    notification_emails JSONB,
    retention_policy JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Client-based queries (most common)
CREATE INDEX idx_delivery_records_client_id ON delivery_records(client_id);
CREATE INDEX idx_temperature_readings_delivery_record_id ON temperature_readings(delivery_record_id);
CREATE INDEX idx_compliance_alerts_client_id ON compliance_alerts(client_id);
CREATE INDEX idx_suppliers_client_id ON suppliers(client_id);
CREATE INDEX idx_client_users_client_id ON client_users(client_id);
CREATE INDEX idx_client_users_user_id ON client_users(user_id);

-- Time-based queries
CREATE INDEX idx_delivery_records_created_at ON delivery_records(created_at);
CREATE INDEX idx_compliance_alerts_created_at ON compliance_alerts(created_at);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Stripe integration
CREATE INDEX idx_clients_stripe_customer_id ON clients(stripe_customer_id);
CREATE INDEX idx_webhook_logs_event_id ON webhook_logs(event_id);

-- Status queries
CREATE INDEX idx_delivery_records_processing_status ON delivery_records(processing_status);
CREATE INDEX idx_compliance_alerts_severity ON compliance_alerts(severity);
CREATE INDEX idx_invitations_status ON invitations(status);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_records_updated_at BEFORE UPDATE ON delivery_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_settings_updated_at BEFORE UPDATE ON compliance_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();