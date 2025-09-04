-- Clear old delivery records so console shows fresh data
DELETE FROM delivery_records WHERE supplier_name = 'Unknown Supplier' OR supplier_name IS NULL;

-- Show remaining records
SELECT id, supplier_name, created_at FROM delivery_records ORDER BY created_at DESC;