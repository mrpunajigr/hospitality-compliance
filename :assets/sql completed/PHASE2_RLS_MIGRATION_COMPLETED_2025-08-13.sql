-- =====================================================
-- PHASE 2: COMPANY DATA STRUCTURE - RLS MIGRATION
-- =====================================================
-- This migration fixes company creation and enables multi-tenant functionality
-- Run this in Supabase SQL Editor to enable Phase 2 features

-- =====================================================
-- 1. FIX COMPANY CREATION POLICIES
-- =====================================================

-- Allow service role to create companies during registration
CREATE POLICY "Service role can create companies" ON clients
    FOR INSERT WITH CHECK (true);

-- Allow service role to create client_users relationships during registration  
CREATE POLICY "Service role can create client_users" ON client_users
    FOR INSERT WITH CHECK (true);

-- Allow service role to manage compliance settings during company setup
CREATE POLICY "Service role can create compliance_settings" ON compliance_settings
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- 2. COMPANY MANAGEMENT POLICIES
-- =====================================================

-- Allow users to update their own client company details (for company profile management)
CREATE POLICY "Company owners can update client details" ON clients
    FOR UPDATE USING (
        id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin') 
            AND status = 'active'
        )
    );

-- =====================================================
-- 3. STAFF MANAGEMENT POLICIES
-- =====================================================

-- Allow company admins to manage client_users (for staff management)
CREATE POLICY "Company admins can manage team" ON client_users
    FOR ALL USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin') 
            AND status = 'active'
        )
    );

-- Allow viewing client_users for company members (needed for team display)
CREATE POLICY "Company members can view team" ON client_users
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND status = 'active'
        )
    );

-- =====================================================
-- 4. INVITATION MANAGEMENT POLICIES
-- =====================================================

-- Allow company admins to create invitations
CREATE POLICY "Company admins can create invitations" ON invitations
    FOR INSERT WITH CHECK (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin') 
            AND status = 'active'
        )
    );

-- Allow company admins to view invitations
CREATE POLICY "Company admins can view invitations" ON invitations
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin') 
            AND status = 'active'
        )
    );

-- Allow company admins to update invitations (cancel, etc.)
CREATE POLICY "Company admins can manage invitations" ON invitations
    FOR UPDATE USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin') 
            AND status = 'active'
        )
    );

-- =====================================================
-- 5. DATA ISOLATION POLICIES (for future phases)
-- =====================================================

-- Ensure delivery records are filtered by company
-- (These will be used in Phase 3)
CREATE POLICY "Company data isolation - delivery records" ON delivery_records
    FOR ALL USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND status = 'active'
        )
    );

-- Ensure compliance alerts are filtered by company
CREATE POLICY "Company data isolation - compliance alerts" ON compliance_alerts
    FOR ALL USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND status = 'active'
        )
    );

-- Ensure compliance reports are filtered by company
CREATE POLICY "Company data isolation - compliance reports" ON compliance_reports
    FOR ALL USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND status = 'active'
        )
    );

-- =====================================================
-- 6. VERIFICATION QUERIES
-- =====================================================

-- Run these queries after the migration to verify everything worked:

-- Check if policies were created successfully
-- SELECT schemaname, tablename, policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('clients', 'client_users', 'invitations')
-- ORDER BY tablename, policyname;

-- Test company creation access
-- SELECT COUNT(*) FROM clients; -- Should work for authenticated users

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- After running this migration, you should be able to:
-- 1. Create companies during registration
-- 2. Manage company profiles
-- 3. Invite and manage staff members
-- 4. Have proper multi-tenant data isolation
-- 
-- Next steps:
-- 1. Test registration with company creation
-- 2. Implement company profile management UI
-- 3. Add staff management features
-- =====================================================