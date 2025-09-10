-- RBAC Enhancement Migration - Client Onboarding Strategy Implementation
-- This migration aligns the existing schema with the comprehensive RBAC strategy
-- Date: 2025-09-10

-- =====================================================
-- PHASE 1: ROLE ALIGNMENT AND ORGANIZATIONS
-- =====================================================

-- Update existing roles to match strategy specification
-- Current: staff, manager, admin, owner
-- Target: STAFF, SUPERVISOR, MANAGER, OWNER

-- First, let's add the SUPERVISOR role to the constraint
ALTER TABLE client_users DROP CONSTRAINT IF EXISTS client_users_role_check;
ALTER TABLE client_users ADD CONSTRAINT client_users_role_check 
    CHECK (role IN ('STAFF', 'SUPERVISOR', 'MANAGER', 'OWNER', 'staff', 'manager', 'admin', 'owner'));

-- Update existing role values to new format
UPDATE client_users SET role = 'STAFF' WHERE role = 'staff';
UPDATE client_users SET role = 'MANAGER' WHERE role = 'manager';
UPDATE client_users SET role = 'OWNER' WHERE role = 'admin';
UPDATE client_users SET role = 'OWNER' WHERE role = 'owner';

-- Update invitations table role constraint
ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_role_check;
ALTER TABLE invitations ADD CONSTRAINT invitations_role_check 
    CHECK (role IN ('STAFF', 'SUPERVISOR', 'MANAGER', 'OWNER'));

-- Update existing invitation roles
UPDATE invitations SET role = 'STAFF' WHERE role = 'staff';
UPDATE invitations SET role = 'MANAGER' WHERE role = 'manager';  
UPDATE invitations SET role = 'OWNER' WHERE role = 'admin';
UPDATE invitations SET role = 'OWNER' WHERE role = 'owner';

-- Now enforce only new role values
ALTER TABLE client_users DROP CONSTRAINT client_users_role_check;
ALTER TABLE client_users ADD CONSTRAINT client_users_role_check 
    CHECK (role IN ('STAFF', 'SUPERVISOR', 'MANAGER', 'OWNER'));

-- =====================================================
-- ENHANCED USER INVITATIONS TABLE
-- =====================================================

-- Add enhanced fields to existing invitations table
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS invitation_message TEXT;
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS accepted_by UUID REFERENCES profiles(id);

-- Add index for faster invitation token lookups
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email_status ON invitations(email, status);

-- =====================================================
-- ORGANIZATIONS TABLE ALIGNMENT
-- =====================================================

-- Rename clients table to organizations to match strategy
-- Note: We'll keep clients table and create a view for backwards compatibility
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL CHECK (business_type IN ('restaurant', 'cafe', 'hotel', 'catering', 'pub', 'other')),
    business_address TEXT NOT NULL,
    business_phone TEXT,
    business_email TEXT NOT NULL,
    food_license_number TEXT,
    alcohol_license_number TEXT,
    council_area TEXT,
    stripe_customer_id TEXT UNIQUE,
    subscription_plan TEXT DEFAULT 'LITE' CHECK (subscription_plan IN ('LITE', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create view for backwards compatibility
CREATE OR REPLACE VIEW clients_view AS
SELECT 
    id,
    business_name as name,
    business_type,
    food_license_number as license_number,
    business_email,
    business_phone as phone,
    jsonb_build_object('address', business_address) as address,
    subscription_status,
    LOWER(subscription_plan) as subscription_tier,
    stripe_customer_id,
    NULL as stripe_subscription_id,
    created_at as subscription_start_date,
    NULL as subscription_end_date,
    NULL as last_payment_date,
    500 as document_limit,
    NULL as estimated_monthly_deliveries,
    'completed' as onboarding_status,
    created_at as onboarding_completed_at,
    true as first_document_processed,
    subscription_plan as selected_plan,
    created_at,
    updated_at
FROM organizations;

-- =====================================================
-- ENHANCED CLIENT_USERS TABLE
-- =====================================================

-- Add permission matrix and additional fields
ALTER TABLE client_users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';
ALTER TABLE client_users ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE client_users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
ALTER TABLE client_users ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add department and title fields for better organization
ALTER TABLE client_users ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE client_users ADD COLUMN IF NOT EXISTS job_title TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_users_role ON client_users(role);
CREATE INDEX IF NOT EXISTS idx_client_users_status ON client_users(status);
CREATE INDEX IF NOT EXISTS idx_client_users_last_active ON client_users(last_active_at);

-- =====================================================
-- AUDIT LOGS ENHANCEMENT
-- =====================================================

-- Enhance audit logs for better tracking
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS category TEXT; -- 'auth', 'user_management', 'data_access', etc.
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS target_user_id UUID REFERENCES profiles(id);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS old_values JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS new_values JSONB;

-- Add indexes for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_category ON audit_logs(category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_user ON audit_logs(target_user_id);

-- =====================================================
-- PERMISSION MATRIX FUNCTIONS
-- =====================================================

-- Function to get user permissions for a specific client
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid UUID, target_client_id UUID)
RETURNS JSONB
LANGUAGE sql SECURITY DEFINER
AS $$
    SELECT COALESCE(cu.permissions, '{}'::jsonb) || 
           jsonb_build_object('role', cu.role) ||
           jsonb_build_object('can_manage_users', cu.role IN ('OWNER', 'MANAGER')) ||
           jsonb_build_object('can_change_roles', cu.role = 'OWNER') ||
           jsonb_build_object('can_view_billing', cu.role = 'OWNER') ||
           jsonb_build_object('can_export_data', cu.role IN ('OWNER', 'MANAGER')) ||
           jsonb_build_object('can_view_all_documents', cu.role IN ('OWNER', 'MANAGER')) ||
           jsonb_build_object('can_view_reports', cu.role IN ('OWNER', 'MANAGER', 'SUPERVISOR'))
    FROM client_users cu
    WHERE cu.user_id = user_uuid 
    AND cu.client_id = target_client_id 
    AND cu.status = 'active'
    LIMIT 1;
$$;

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION user_has_permission(user_uuid UUID, target_client_id UUID, permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER
AS $$
    SELECT COALESCE(
        (get_user_permissions(user_uuid, target_client_id) ->> permission_name)::boolean,
        false
    );
$$;

-- Function to get user role hierarchy level (for comparison)
CREATE OR REPLACE FUNCTION get_role_level(role_name TEXT)
RETURNS INTEGER
LANGUAGE sql IMMUTABLE
AS $$
    SELECT CASE role_name
        WHEN 'STAFF' THEN 1
        WHEN 'SUPERVISOR' THEN 2  
        WHEN 'MANAGER' THEN 3
        WHEN 'OWNER' THEN 4
        ELSE 0
    END;
$$;

-- =====================================================
-- UPDATED TRIGGERS
-- =====================================================

-- Trigger to update last_active_at when user performs actions
CREATE OR REPLACE FUNCTION update_user_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE client_users 
    SET last_active_at = NOW(), 
        login_count = login_count + 1
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply activity trigger to delivery_records (when users upload documents)
DROP TRIGGER IF EXISTS update_user_activity_trigger ON delivery_records;
CREATE TRIGGER update_user_activity_trigger
    AFTER INSERT ON delivery_records
    FOR EACH ROW EXECUTE FUNCTION update_user_activity();

-- Trigger for organizations updated_at
CREATE TRIGGER update_organizations_updated_at 
    BEFORE UPDATE ON organizations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATA MIGRATION HELPERS
-- =====================================================

-- Function to migrate existing clients to organizations (if needed)
CREATE OR REPLACE FUNCTION migrate_clients_to_organizations()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO organizations (
        id, business_name, business_type, business_address, 
        business_phone, business_email, food_license_number, 
        alcohol_license_number, council_area, stripe_customer_id,
        subscription_plan, subscription_status, created_at, updated_at
    )
    SELECT 
        id, 
        name,
        COALESCE(business_type, 'restaurant'),
        COALESCE(address->>'address', 'Address not provided'),
        phone,
        business_email,
        license_number,
        NULL, -- alcohol_license_number
        NULL, -- council_area
        stripe_customer_id,
        CASE UPPER(COALESCE(subscription_tier, 'basic'))
            WHEN 'BASIC' THEN 'BASIC'
            WHEN 'PROFESSIONAL' THEN 'PROFESSIONAL'
            WHEN 'ENTERPRISE' THEN 'ENTERPRISE'
            ELSE 'LITE'
        END,
        COALESCE(subscription_status, 'active'),
        created_at,
        updated_at
    FROM clients
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE organizations.id = clients.id);
END;
$$;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Role-based query optimization
CREATE INDEX IF NOT EXISTS idx_client_users_role_status ON client_users(role, status);
CREATE INDEX IF NOT EXISTS idx_client_users_client_role ON client_users(client_id, role);

-- Invitation system optimization  
CREATE INDEX IF NOT EXISTS idx_invitations_client_status ON invitations(client_id, status);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON invitations(expires_at);

-- Audit trail optimization
CREATE INDEX IF NOT EXISTS idx_audit_logs_client_action ON audit_logs(client_id, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE organizations IS 'Multi-tenant organizations with enhanced RBAC support';
COMMENT ON COLUMN client_users.role IS 'User role: STAFF, SUPERVISOR, MANAGER, or OWNER';
COMMENT ON COLUMN client_users.permissions IS 'Custom permission matrix as JSONB';
COMMENT ON FUNCTION get_user_permissions(UUID, UUID) IS 'Returns complete permission set for user in organization';
COMMENT ON FUNCTION user_has_permission(UUID, UUID, TEXT) IS 'Checks if user has specific permission in organization';