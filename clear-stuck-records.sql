-- Clear stuck processing records to clean up database
-- This removes test uploads that are stuck in 'processing' status

-- First check what records are stuck
SELECT 'Current stuck processing records:' as info;
SELECT 
  id, 
  supplier_name, 
  processing_status, 
  created_at,
  image_path
FROM delivery_records 
WHERE processing_status = 'processing'
ORDER BY created_at DESC;

-- Delete stuck processing records (likely test uploads)
DELETE FROM delivery_records 
WHERE processing_status = 'processing'
  AND created_at < NOW() - INTERVAL '1 hour'; -- Only delete records older than 1 hour

-- Verify cleanup
SELECT 'Records remaining after cleanup:' as info;
SELECT 
  COUNT(*) as total_records,
  processing_status,
  COUNT(*) as count_by_status
FROM delivery_records 
GROUP BY processing_status;

-- Show recent successful records
SELECT 'Recent completed records:' as info;
SELECT 
  id,
  supplier_name,
  processing_status,
  confidence_score,
  created_at
FROM delivery_records 
WHERE processing_status = 'completed'
ORDER BY created_at DESC 
LIMIT 3;