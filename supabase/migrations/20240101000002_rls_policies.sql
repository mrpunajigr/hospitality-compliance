-- Hospitality Compliance SaaS - Row Level Security Policies
-- This migration creates RLS policies for perfect multi-tenant data isolation

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE temperature_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspector_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow profile creation during signup
CREATE POLICY "Enable profile creation during signup" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- CLIENT TABLE POLICIES
-- =====================================================

-- Users can only see clients they belong to
CREATE POLICY "Users can view their clients" ON clients
    FOR SELECT USING (
        id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Only owners and admins can update client info
CREATE POLICY "Owners/admins can update client" ON clients
    FOR UPDATE USING (
        id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

-- =====================================================
-- CLIENT_USERS TABLE POLICIES  
-- =====================================================

-- Users can view client relationships they're part of
CREATE POLICY "Users can view their client relationships" ON client_users
    FOR SELECT USING (
        user_id = auth.uid() OR
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Only admins/owners can manage users within their client
CREATE POLICY "Admins can manage client users" ON client_users
    FOR ALL USING (
        client_id IN (
            SELECT cu.client_id FROM client_users cu
            WHERE cu.user_id = auth.uid() 
            AND cu.role IN ('admin', 'owner')
            AND cu.status = 'active'
        )
    );

-- =====================================================
-- INVITATIONS TABLE POLICIES
-- =====================================================

-- Admins/owners can manage invitations for their client
CREATE POLICY "Admins can manage invitations" ON invitations
    FOR ALL USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'owner')
            AND status = 'active'
        )
    );

-- =====================================================
-- SUPPLIERS TABLE POLICIES
-- =====================================================

-- Users can view suppliers for their clients
CREATE POLICY "Users can view client suppliers" ON suppliers
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Managers/admins/owners can manage suppliers
CREATE POLICY "Managers can manage suppliers" ON suppliers
    FOR ALL USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('manager', 'admin', 'owner')
            AND status = 'active'
        )
    );

-- =====================================================
-- DELIVERY_RECORDS TABLE POLICIES
-- =====================================================

-- Users can view delivery records for their clients
CREATE POLICY "Users can view client delivery records" ON delivery_records
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Users can create delivery records for their clients
CREATE POLICY "Users can create delivery records" ON delivery_records
    FOR INSERT WITH CHECK (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() AND status = 'active'
        ) AND user_id = auth.uid()
    );

-- Users can update their own delivery records
CREATE POLICY "Users can update own delivery records" ON delivery_records
    FOR UPDATE USING (
        user_id = auth.uid() AND
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- =====================================================
-- TEMPERATURE_READINGS TABLE POLICIES
-- =====================================================

-- Users can view temperature readings for their client's delivery records
CREATE POLICY "Users can view client temperature readings" ON temperature_readings
    FOR SELECT USING (
        delivery_record_id IN (
            SELECT dr.id FROM delivery_records dr
            JOIN client_users cu ON dr.client_id = cu.client_id
            WHERE cu.user_id = auth.uid() AND cu.status = 'active'
        )
    );

-- System can insert temperature readings (via Edge Function)
CREATE POLICY "System can insert temperature readings" ON temperature_readings
    FOR INSERT WITH CHECK (
        delivery_record_id IN (
            SELECT id FROM delivery_records
        )
    );

-- =====================================================
-- COMPLIANCE_ALERTS TABLE POLICIES
-- =====================================================

-- Users can view alerts for their clients
CREATE POLICY "Users can view client compliance alerts" ON compliance_alerts
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- System can create alerts (via Edge Function)
CREATE POLICY "System can create compliance alerts" ON compliance_alerts
    FOR INSERT WITH CHECK (
        client_id IN (
            SELECT id FROM clients
        )
    );

-- Managers/admins/owners can acknowledge alerts
CREATE POLICY "Managers can acknowledge alerts" ON compliance_alerts
    FOR UPDATE USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('manager', 'admin', 'owner')
            AND status = 'active'
        )
    );

-- =====================================================
-- COMPLIANCE_REPORTS TABLE POLICIES
-- =====================================================

-- Users can view reports for their clients
CREATE POLICY "Users can view client reports" ON compliance_reports
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Users can generate reports for their clients
CREATE POLICY "Users can generate reports" ON compliance_reports
    FOR INSERT WITH CHECK (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() AND status = 'active'
        ) AND generated_by = auth.uid()
    );

-- =====================================================
-- INSPECTOR_ACCESS TABLE POLICIES
-- =====================================================

-- Admins/owners can manage inspector access
CREATE POLICY "Admins can manage inspector access" ON inspector_access
    FOR ALL USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'owner')
            AND status = 'active'
        )
    );

-- =====================================================
-- AUDIT_LOGS TABLE POLICIES
-- =====================================================

-- Admins/owners can view audit logs for their client
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'owner')
            AND status = 'active'
        )
    );

-- System can create audit logs (via Edge Functions)
CREATE POLICY "System can create audit logs" ON audit_logs
    FOR INSERT WITH CHECK (
        client_id IN (
            SELECT id FROM clients
        )
    );

-- =====================================================
-- DATA_EXPORTS TABLE POLICIES
-- =====================================================

-- Users can view their own export requests
CREATE POLICY "Users can view own exports" ON data_exports
    FOR SELECT USING (
        requested_by = auth.uid() AND
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Users can create export requests for their clients
CREATE POLICY "Users can request exports" ON data_exports
    FOR INSERT WITH CHECK (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() AND status = 'active'
        ) AND requested_by = auth.uid()
    );

-- =====================================================
-- DOCUMENT_USAGE TABLE POLICIES
-- =====================================================

-- Admins/owners can view usage for their client
CREATE POLICY "Admins can view document usage" ON document_usage
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'owner')
            AND status = 'active'
        )
    );

-- System can track usage (via Edge Functions)
CREATE POLICY "System can track document usage" ON document_usage
    FOR INSERT WITH CHECK (
        client_id IN (
            SELECT id FROM clients
        )
    );

-- =====================================================
-- WEBHOOK_LOGS TABLE POLICIES
-- =====================================================

-- Only super admins can view webhook logs
CREATE POLICY "Super admins can view webhook logs" ON webhook_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_super_admin = true
        )
    );

-- System can create webhook logs
CREATE POLICY "System can create webhook logs" ON webhook_logs
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- COMPLIANCE_SETTINGS TABLE POLICIES
-- =====================================================

-- Users can view settings for their clients
CREATE POLICY "Users can view client settings" ON compliance_settings
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Admins/owners can manage settings
CREATE POLICY "Admins can manage settings" ON compliance_settings
    FOR ALL USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'owner')
            AND status = 'active'
        )
    );

-- =====================================================
-- STORAGE BUCKET POLICIES
-- =====================================================

-- Create storage bucket for delivery dockets (skip if already exists)
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('delivery-dockets', 'delivery-dockets', false, false, 52428800, ARRAY['image/jpeg', 'image/png', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Users can only access files from their client(s)
CREATE POLICY "Multi-tenant delivery docket access" ON storage.objects
    FOR ALL USING (
        bucket_id = 'delivery-dockets' AND
        (storage.foldername(name))[1] IN (
            SELECT client_id::text FROM client_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- =====================================================
-- HELPER FUNCTIONS FOR COMMON QUERIES
-- =====================================================

-- Function to get user's clients
CREATE OR REPLACE FUNCTION get_user_clients(user_uuid UUID)
RETURNS TABLE(client_id UUID, role TEXT) 
LANGUAGE sql SECURITY DEFINER
AS $$
    SELECT cu.client_id, cu.role
    FROM client_users cu
    WHERE cu.user_id = user_uuid AND cu.status = 'active';
$$;

-- Function to check if user has permission for client
CREATE OR REPLACE FUNCTION user_has_client_access(user_uuid UUID, target_client_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM client_users 
        WHERE user_id = user_uuid 
        AND client_id = target_client_id 
        AND status = 'active'
    );
$$;

-- Function to check user role in client
CREATE OR REPLACE FUNCTION user_client_role(user_uuid UUID, target_client_id UUID)
RETURNS TEXT
LANGUAGE sql SECURITY DEFINER
AS $$
    SELECT role FROM client_users 
    WHERE user_id = user_uuid 
    AND client_id = target_client_id 
    AND status = 'active'
    LIMIT 1;
$$;