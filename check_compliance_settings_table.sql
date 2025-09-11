-- Check if compliance_settings table exists and its structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'compliance_settings'
ORDER BY ordinal_position;