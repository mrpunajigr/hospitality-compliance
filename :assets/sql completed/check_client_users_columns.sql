-- Check the actual columns in the client_users table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'client_users'
ORDER BY ordinal_position;