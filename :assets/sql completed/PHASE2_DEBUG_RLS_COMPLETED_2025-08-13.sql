-- =====================================================
-- PHASE 2: DEBUG RLS POLICIES FOR client_users TABLE
-- =====================================================

-- Check current policies on client_users table
SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'client_users'
ORDER BY policyname;

-- Check if RLS is enabled on client_users
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'client_users';

-- Test service role permissions on client_users table
-- This should work if our service role policies are correct

-- Let's see what happens when we try to insert directly
-- (This simulates what our API is doing)
INSERT INTO client_users (user_id, client_id, role, status, joined_at) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',  -- Use an existing user ID from seed data
  '550e8400-e29b-41d4-a716-446655440001',  -- Use an existing client ID from seed data
  'owner', 
  'active', 
  NOW()
);

-- If that fails, let's check what service role policies we actually have
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'client_users' 
AND policyname LIKE '%Service%';