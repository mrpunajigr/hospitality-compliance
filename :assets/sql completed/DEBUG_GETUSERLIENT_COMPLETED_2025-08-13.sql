-- Debug getUserClient function failure - Supabase Compatible
-- Check the actual clients table schema and data

-- 1. Check what fields actually exist in clients table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clients'
AND table_schema = 'public'
ORDER BY column_name;

-- 2. Check if our test users have client relationships
SELECT cu.user_id, cu.role, cu.status, c.id, c.name, c.business_type
FROM client_users cu
LEFT JOIN clients c ON cu.client_id = c.id
WHERE cu.status = 'active'
ORDER BY cu.created_at DESC
LIMIT 5;

-- 3. Check recent client records
SELECT id, name, business_type, business_email, subscription_status, created_at
FROM clients
ORDER BY created_at DESC
LIMIT 3;

-- 4. Test the basic query that should work
SELECT 
  cu.client_id,
  cu.role,
  cu.status,
  c.id as client_id_check,
  c.name,
  c.business_type
FROM client_users cu
LEFT JOIN clients c ON cu.client_id = c.id
WHERE cu.status = 'active'
ORDER BY cu.created_at DESC
LIMIT 3;