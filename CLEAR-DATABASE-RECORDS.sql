-- 🧹 COMPLETE DATABASE CLEANUP - Clear all delivery records and related data
-- This will help isolate if the persistent modal is data-driven

-- Step 1: Clear delivery records table
DELETE FROM delivery_records;

-- Step 2: Verify table is empty
SELECT COUNT(*) as remaining_records FROM delivery_records;

-- Step 3: Reset any auto-increment sequences (if applicable)
-- Note: UUIDs don't typically need sequence reset, but including for completeness
-- ALTER SEQUENCE delivery_records_id_seq RESTART WITH 1;

-- Step 4: Clear any related audit or log tables (if they exist)
-- DELETE FROM delivery_audit WHERE table_name = 'delivery_records';
-- DELETE FROM processing_logs WHERE record_type = 'delivery_record';

-- Step 5: Verification queries
SELECT 
  'delivery_records' as table_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ CLEARED'
    ELSE '🚨 RECORDS REMAINING'
  END as status
FROM delivery_records;

-- Optional: Check if there are any foreign key references that need cleanup
-- SELECT 
--   table_name,
--   column_name,
--   constraint_name
-- FROM information_schema.key_column_usage
-- WHERE referenced_table_name = 'delivery_records';

-- Success confirmation
SELECT 
  '🎯 DATABASE CLEANUP COMPLETE' as message,
  NOW() as timestamp,
  'All delivery records cleared - ready for modal isolation test' as note;