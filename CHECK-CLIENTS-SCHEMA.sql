-- 🔍 Check actual clients table schema to fix column error

-- Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check current clients data
SELECT * FROM clients LIMIT 3;