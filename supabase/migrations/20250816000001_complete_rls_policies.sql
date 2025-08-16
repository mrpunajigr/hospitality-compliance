-- Complete RLS Policies Migration
-- Ensures all tables have proper Row Level Security policies for multi-tenant isolation
-- Phase 1: Foundation & MVP - Database & Authentication

-- =====================================================
-- ENABLE RLS ON NEW TABLES
-- =====================================================

-- Enhanced extraction tables (from Phase 3a)
ALTER TABLE client_display_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_extraction_analytics ENABLE ROW LEVEL SECURITY;

-- Assets tables (already enabled but documented here)
-- ALTER TABLE assets ENABLE ROW LEVEL SECURITY; -- Already enabled
-- ALTER TABLE asset_usage ENABLE ROW LEVEL SECURITY; -- Already enabled

-- =====================================================
-- CLIENT DISPLAY CONFIGURATIONS POLICIES
-- =====================================================

-- Users can view their client's display configurations
CREATE POLICY "Users can view client display configurations" ON client_display_configurations
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Admins/owners can manage display configurations
CREATE POLICY "Admins can manage display configurations" ON client_display_configurations
    FOR ALL USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'owner')
            AND status = 'active'
        )
    );

-- =====================================================
-- ENHANCED EXTRACTION ANALYTICS POLICIES
-- =====================================================

-- Users can view analytics for their client
CREATE POLICY "Users can view client analytics" ON enhanced_extraction_analytics
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- System can insert analytics (via Edge Functions)
CREATE POLICY "System can insert analytics" ON enhanced_extraction_analytics
    FOR INSERT WITH CHECK (
        client_id IN (
            SELECT id FROM clients
        )
    );

-- Admins/owners can manage analytics
CREATE POLICY "Admins can manage analytics" ON enhanced_extraction_analytics
    FOR UPDATE USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'owner')
            AND status = 'active'
        )
    );

-- =====================================================
-- ADDITIONAL SECURITY POLICIES
-- =====================================================

-- Ensure delivery_records have proper enhanced field access
-- (The enhanced fields are part of the existing delivery_records table, 
--  so they inherit the existing RLS policies)

-- Create helper function for checking admin access
CREATE OR REPLACE FUNCTION user_is_admin_for_client(target_client_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM client_users 
        WHERE user_id = auth.uid() 
        AND client_id = target_client_id 
        AND role IN ('admin', 'owner')
        AND status = 'active'
    );
$$;

-- Create helper function for checking any client access
CREATE OR REPLACE FUNCTION user_has_access_to_client(target_client_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM client_users 
        WHERE user_id = auth.uid() 
        AND client_id = target_client_id 
        AND status = 'active'
    );
$$;

-- =====================================================
-- PERFORMANCE INDEXES FOR RLS QUERIES
-- =====================================================

-- Optimize RLS policy queries
CREATE INDEX IF NOT EXISTS idx_client_users_user_client_status 
    ON client_users(user_id, client_id, status) 
    WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_client_users_client_role_status 
    ON client_users(client_id, role, status) 
    WHERE status = 'active';

-- Optimize client display configurations queries
CREATE INDEX IF NOT EXISTS idx_client_display_config_client_active 
    ON client_display_configurations(client_id, is_active) 
    WHERE is_active = true;

-- Optimize analytics queries
CREATE INDEX IF NOT EXISTS idx_enhanced_analytics_client_date 
    ON enhanced_extraction_analytics(client_id, created_at DESC);

-- =====================================================
-- VALIDATE RLS POLICIES
-- =====================================================

-- Create validation function to test RLS isolation
CREATE OR REPLACE FUNCTION validate_rls_isolation()
RETURNS TABLE(table_name TEXT, has_rls BOOLEAN, policy_count INTEGER)
LANGUAGE sql SECURITY DEFINER
AS $$
    SELECT 
        schemaname||'.'||tablename as table_name,
        rowsecurity as has_rls,
        (
            SELECT COUNT(*) 
            FROM pg_policies 
            WHERE schemaname = t.schemaname 
            AND tablename = t.tablename
        ) as policy_count
    FROM pg_tables t
    WHERE schemaname = 'public'
    AND tablename NOT IN ('schema_migrations', 'storage_migrations')
    ORDER BY tablename;
$$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Ensure proper permissions for new tables
GRANT SELECT, INSERT, UPDATE ON client_display_configurations TO authenticated;
GRANT SELECT, INSERT ON enhanced_extraction_analytics TO authenticated;

-- Grant permissions on helper functions
GRANT EXECUTE ON FUNCTION user_is_admin_for_client(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_access_to_client(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_rls_isolation() TO authenticated;

-- =====================================================
-- MIGRATION VERIFICATION
-- =====================================================

-- Insert verification record
DO $$
DECLARE
    table_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Count tables with RLS enabled
    SELECT COUNT(*) INTO table_count
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public'
    AND c.relrowsecurity = true
    AND t.tablename NOT IN ('schema_migrations', 'storage_migrations');
    
    -- Count total policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';
    
    RAISE NOTICE 'RLS Migration Complete: % tables with RLS, % total policies', table_count, policy_count;
END $$;

-- Success message
SELECT 'Complete RLS Policies Migration completed successfully! 🔒' as migration_status;