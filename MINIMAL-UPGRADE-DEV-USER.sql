-- 👤 MINIMAL UPGRADE DEV USER - Using only essential columns

-- Step 1: Check what columns actually exist in clients table
\d clients;

-- OR use this if \d doesn't work:
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'clients' AND table_schema = 'public';

-- Step 2: Create/update client with MINIMAL required columns only
INSERT INTO clients (
  id,
  name
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'JiGR Development Company'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name;

-- Step 3: Update dev user metadata (this should work regardless of clients table structure)
UPDATE auth.users 
SET 
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{client_id}',
    '"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"'
  )
WHERE email = 'dev@jigr.app';

-- Step 4: Simple verification
SELECT 
  u.email,
  u.raw_user_meta_data->>'client_id' as client_id,
  c.name as company_name
FROM auth.users u
LEFT JOIN clients c ON c.id::text = u.raw_user_meta_data->>'client_id'
WHERE u.email = 'dev@jigr.app';