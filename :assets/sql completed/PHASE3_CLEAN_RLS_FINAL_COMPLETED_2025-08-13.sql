-- =====================================================
-- PHASE 3: FINAL RLS CLEANUP - HANDLE EXISTING POLICIES
-- =====================================================

-- Disable RLS to clean up safely
ALTER TABLE client_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- DROP ALL POSSIBLE POLICIES (including the ones we just created)
DROP POLICY IF EXISTS "service_role_full_access" ON client_users;
DROP POLICY IF EXISTS "users_associated_clients" ON clients;
DROP POLICY IF EXISTS "service_role_full_access" ON clients;
DROP POLICY IF EXISTS "users_own_records" ON client_users;
DROP POLICY IF EXISTS "service_role_only" ON client_users;
DROP POLICY IF EXISTS "service_role_only" ON clients;
DROP POLICY IF EXISTS "Service role full access client_users" ON client_users;
DROP POLICY IF EXISTS "Service role full access clients" ON clients;
DROP POLICY IF EXISTS "Users can view own client_users" ON client_users;

-- RE-ENABLE RLS
ALTER TABLE client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- CREATE SINGLE, SIMPLE POLICIES WITH UNIQUE NAMES
CREATE POLICY "api_service_access" ON client_users
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "api_service_access" ON clients
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Verify final state
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('clients', 'client_users')
ORDER BY tablename, policyname;