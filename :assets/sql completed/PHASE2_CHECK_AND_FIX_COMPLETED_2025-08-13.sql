-- =====================================================
-- PHASE 2: CHECK EXISTING POLICIES AND ADD MISSING ONES
-- =====================================================

-- First, let's see what policies already exist:
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'client_users', 'invitations', 'compliance_settings')
ORDER BY tablename, policyname;

-- =====================================================
-- DROP AND RECREATE APPROACH (if needed)
-- =====================================================
-- If you want to start fresh, uncomment these lines:

-- DROP POLICY IF EXISTS "Service role can create companies" ON clients;
-- DROP POLICY IF EXISTS "Service role can create client_users" ON client_users;
-- DROP POLICY IF EXISTS "Service role can create compliance_settings" ON compliance_settings;

-- =====================================================
-- CREATE MISSING POLICIES ONLY
-- =====================================================

-- Try to create each policy with DROP IF EXISTS first:

DROP POLICY IF EXISTS "Service role can create companies" ON clients;
CREATE POLICY "Service role can create companies" ON clients
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can create client_users" ON client_users;
CREATE POLICY "Service role can create client_users" ON client_users
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can create compliance_settings" ON compliance_settings;
CREATE POLICY "Service role can create compliance_settings" ON compliance_settings
    FOR INSERT WITH CHECK (true);

-- Company management policies
DROP POLICY IF EXISTS "Company owners can update client details" ON clients;
CREATE POLICY "Company owners can update client details" ON clients
    FOR UPDATE USING (
        id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin') 
            AND status = 'active'
        )
    );

-- Staff management policies
DROP POLICY IF EXISTS "Company admins can manage team" ON client_users;
CREATE POLICY "Company admins can manage team" ON client_users
    FOR ALL USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin') 
            AND status = 'active'
        )
    );

DROP POLICY IF EXISTS "Company members can view team" ON client_users;
CREATE POLICY "Company members can view team" ON client_users
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() 
            AND status = 'active'
        )
    );

-- =====================================================
-- VERIFY POLICIES WERE CREATED
-- =====================================================

-- Check the policies again:
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'client_users', 'compliance_settings')
AND policyname LIKE '%Service role%' OR policyname LIKE '%Company%'
ORDER BY tablename, policyname;