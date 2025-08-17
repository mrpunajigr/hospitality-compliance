-- =====================================================
-- SIMPLIFIED DATABASE PURGE SCRIPT
-- =====================================================
-- 
-- ⚠️  WARNING: THIS WILL DELETE ALL PROCESSED DATA ⚠️
-- 
-- This script removes all delivery records, processing results,
-- and related data to create a clean slate for Google Cloud AI testing.
-- 
-- PRESERVES:
-- - User accounts (profiles, auth.users)
-- - Company setup (clients, client_users) 
-- - Supplier master data
-- - System configuration
--
-- DELETES:
-- - All delivery records and analysis results
-- - All temperature readings and compliance alerts
-- - All audit logs and notifications
-- - All processing artifacts
--
-- Usage: Execute in Supabase SQL Editor
-- =====================================================

BEGIN;

-- =====================================================
-- PHASE 1: DELETE DEPENDENT DATA FIRST
-- =====================================================

-- 1. Delete violation alerts (depends on delivery_records)
DELETE FROM violation_alerts;

-- 2. Delete compliance alerts (depends on delivery_records) 
DELETE FROM compliance_alerts;

-- 3. Delete temperature readings (depends on delivery_records)
DELETE FROM temperature_readings;

-- 4. Delete audit logs
DELETE FROM audit_logs;

-- 5. Delete notifications (if table exists)
DELETE FROM notifications WHERE 1=1;

-- =====================================================
-- PHASE 2: DELETE MAIN DELIVERY RECORDS
-- =====================================================

-- Delete all delivery records (contains analysis and extraction_data)
DELETE FROM delivery_records;

-- =====================================================
-- PHASE 3: CLEANUP OTHER PROCESSING DATA
-- =====================================================

-- Delete any processing queue items (if table exists)
DELETE FROM processing_queue WHERE 1=1;

-- Delete any temporary processing data (if table exists)
DELETE FROM temp_processing_data WHERE 1=1;

-- =====================================================
-- PHASE 4: VERIFICATION
-- =====================================================

-- Verify all transactional data is deleted
SELECT 
    'DATA_PURGE_VERIFICATION' as check_type,
    (SELECT COUNT(*) FROM delivery_records) as delivery_records,
    (SELECT COUNT(*) FROM violation_alerts) as violation_alerts,
    (SELECT COUNT(*) FROM temperature_readings) as temperature_readings,
    (SELECT COUNT(*) FROM compliance_alerts) as compliance_alerts,
    (SELECT COUNT(*) FROM audit_logs) as audit_logs;

-- Verify core setup data remains
SELECT 
    'PRESERVED_DATA_VERIFICATION' as check_type,
    (SELECT COUNT(*) FROM clients) as clients,
    (SELECT COUNT(*) FROM profiles) as profiles,
    (SELECT COUNT(*) FROM client_users) as client_users,
    (SELECT COUNT(*) FROM suppliers) as suppliers;

COMMIT;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 
    '🎉 DATABASE PURGE COMPLETED SUCCESSFULLY' as status,
    'Ready for fresh Google Cloud AI testing' as next_step,
    NOW() as completed_at;

-- =====================================================
-- ROLLBACK INFORMATION
-- =====================================================

/*
🔄 ROLLBACK PLAN:

If you need to restore data, you can:

1. Restore from Supabase backup:
   - Go to Supabase Dashboard > Settings > Database
   - Use point-in-time recovery to before this purge

2. Re-run test data generation:
   - Execute CREATE_TEST_COMPANY.sql again
   - Use demo data generation scripts if available

⚠️  Note: This purge is designed for development/testing
   environments. Never run on production without proper
   backup and approval procedures.
*/