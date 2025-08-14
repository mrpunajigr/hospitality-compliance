-- =====================================================
-- PHASE 3: EMERGENCY RLS FIX - REMOVE ALL RECURSIVE POLICIES
-- =====================================================

-- Temporarily disable RLS to remove all policies cleanly
ALTER TABLE client_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- DROP ALL EXISTING POLICIES on client_users
DROP POLICY IF EXISTS "service_role_full_access" ON client_users;
DROP POLICY IF EXISTS "users_own_records" ON client_users;
DROP POLICY IF EXISTS "Service role full access client_users" ON client_users;
DROP POLICY IF EXISTS "Users can view own client_users" ON client_users;
DROP POLICY IF EXISTS "Enable client_users creation during signup" ON client_users;
DROP POLICY IF EXISTS "Company admins can manage team" ON client_users;
DROP POLICY IF EXISTS "Company members can view team" ON client_users;

-- DROP ALL EXISTING POLICIES on clients  
DROP POLICY IF EXISTS "service_role_full_access" ON clients;
DROP POLICY IF EXISTS "users_associated_clients" ON clients;
DROP POLICY IF EXISTS "Service role full access clients" ON clients;
DROP POLICY IF EXISTS "Users can view associated clients" ON clients;
DROP POLICY IF EXISTS "Company owners can manage clients" ON clients;

-- RE-ENABLE RLS
ALTER TABLE client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- CREATE ULTRA-SIMPLE POLICIES
-- Only service role access initially (most permissive for functionality)
CREATE POLICY "service_role_only" ON client_users
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "service_role_only" ON clients
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Verify clean slate
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'client_users')
ORDER BY tablename, policyname;