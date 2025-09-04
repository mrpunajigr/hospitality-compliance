-- Check delivery_records table schema
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'delivery_records' 
ORDER BY ordinal_position;

-- Show first few records to understand current structure
SELECT * FROM delivery_records LIMIT 3;