-- Clear all stale test delivery records 
DELETE FROM delivery_records 
WHERE 
  supplier_name IN ('Unknown Supplier', 'TEST_DEFAULT', 'Extraction Failed') 
  OR raw_extracted_text LIKE '%AWS processing attempted%'
  OR image_path LIKE '%test20%'
  OR processing_status = 'processed';

-- Show remaining records
SELECT id, supplier_name, image_path, processing_status, created_at 
FROM delivery_records 
ORDER BY created_at DESC;