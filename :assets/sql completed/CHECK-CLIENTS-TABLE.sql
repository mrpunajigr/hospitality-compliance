-- Check the actual structure of the clients table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- See what client records exist (if any)
SELECT * FROM clients LIMIT 5;