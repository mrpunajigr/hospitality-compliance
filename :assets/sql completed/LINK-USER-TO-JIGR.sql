-- Link steve@jigr.app to existing JiGR apps client
-- The issue is the table doesn't have user_id column for linking

-- First, check if there's a separate user_clients junction table
SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE '%user%' OR table_name LIKE '%client%';

-- Check what the actual relationship structure is
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('clients', 'user_clients', 'client_users')
ORDER BY table_name, ordinal_position;