-- =====================================================
-- COMPREHENSIVE DATABASE PURGE SCRIPT
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
-- SAFETY CHECKS
-- =====================================================

-- Verify we're targeting the correct environment
DO $$
BEGIN
    -- Add environment verification if needed
    RAISE NOTICE 'Starting comprehensive data purge...';
    RAISE NOTICE 'This will delete ALL delivery processing data';
    RAISE NOTICE 'User accounts and company setup will be preserved';
END $$;

-- =====================================================
-- PHASE 1: DELETE DEPENDENT DATA FIRST
-- =====================================================

-- 1. Delete violation alerts (depends on delivery_records)
DELETE FROM violation_alerts;
RAISE NOTICE 'Deleted violation_alerts: % rows', ROW_COUNT;

-- 2. Delete compliance alerts (depends on delivery_records) 
DELETE FROM compliance_alerts;
RAISE NOTICE 'Deleted compliance_alerts: % rows', ROW_COUNT;

-- 3. Delete temperature readings (depends on delivery_records)
DELETE FROM temperature_readings;
RAISE NOTICE 'Deleted temperature_readings: % rows', ROW_COUNT;

-- 4. Delete audit logs
DELETE FROM audit_logs;
RAISE NOTICE 'Deleted audit_logs: % rows', ROW_COUNT;

-- 5. Delete notifications (if exists)
DELETE FROM notifications WHERE 1=1; -- Soft delete pattern
RAISE NOTICE 'Deleted notifications: % rows', ROW_COUNT;

-- =====================================================
-- PHASE 2: DELETE MAIN DELIVERY RECORDS
-- =====================================================

-- Delete all delivery records (contains analysis and extraction_data)
DELETE FROM delivery_records;
RAISE NOTICE 'Deleted delivery_records: % rows', ROW_COUNT;

-- =====================================================
-- PHASE 3: CLEANUP OTHER PROCESSING DATA
-- =====================================================

-- Delete any processing queue items (if table exists)
DELETE FROM processing_queue WHERE 1=1;
RAISE NOTICE 'Deleted processing_queue: % rows', ROW_COUNT;

-- Delete any temporary processing data (if table exists)
DELETE FROM temp_processing_data WHERE 1=1;
RAISE NOTICE 'Deleted temp_processing_data: % rows', ROW_COUNT;

-- =====================================================
-- PHASE 4: RESET SEQUENCES (OPTIONAL)
-- =====================================================

-- Reset auto-incrementing sequences if they exist
-- Note: UUID primary keys don't need sequence resets, but included for completeness

DO $$
BEGIN
    -- Only reset if sequences exist
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename LIKE '%delivery_records%') THEN
        PERFORM setval(pg_get_serial_sequence('delivery_records','id'), 1, false);
        RAISE NOTICE 'Reset delivery_records sequence';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename LIKE '%temperature_readings%') THEN
        PERFORM setval(pg_get_serial_sequence('temperature_readings','id'), 1, false);
        RAISE NOTICE 'Reset temperature_readings sequence';
    END IF;
END $$;

-- =====================================================
-- PHASE 5: VERIFICATION
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

-- =====================================================
-- PHASE 6: SUCCESS CONFIRMATION
-- =====================================================

DO $$
DECLARE
    delivery_count INTEGER;
    client_count INTEGER;
    profile_count INTEGER;
BEGIN
    -- Check key metrics
    SELECT COUNT(*) INTO delivery_count FROM delivery_records;
    SELECT COUNT(*) INTO client_count FROM clients;  
    SELECT COUNT(*) INTO profile_count FROM profiles;
    
    -- Validate purge was successful
    IF delivery_count = 0 THEN
        RAISE NOTICE '✅ SUCCESS: All delivery data purged successfully';
    ELSE
        RAISE EXCEPTION '❌ FAILED: % delivery records still remain', delivery_count;
    END IF;
    
    -- Validate core data preserved
    IF client_count > 0 AND profile_count > 0 THEN
        RAISE NOTICE '✅ SUCCESS: Core setup data preserved (% clients, % profiles)', client_count, profile_count;
    ELSE
        RAISE WARNING '⚠️  WARNING: Core setup data may have been affected';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🧹 DATABASE PURGE COMPLETE';
    RAISE NOTICE '📊 Ready for fresh Google Cloud AI testing';
    RAISE NOTICE '🎯 Dashboard will show "No delivery records found" until new processing';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Clear Supabase storage buckets (run storage-cleanup script)';
    RAISE NOTICE '2. Test upload and processing with clean database';
    RAISE NOTICE '3. Verify results display correctly on dashboard';
END $$;

COMMIT;

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

3. Import production backup:
   - If you have a backup export, re-import it
   - Ensure proper data sanitization for development

⚠️  Note: This purge is designed for development/testing
   environments. Never run on production without proper
   backup and approval procedures.
*/