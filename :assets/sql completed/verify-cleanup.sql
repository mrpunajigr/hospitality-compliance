-- =====================================================
-- POST-CLEANUP VERIFICATION QUERIES
-- =====================================================
-- 
-- Run these queries after executing PURGE_ALL_DATA.sql
-- and storage-cleanup.js to verify complete cleanup
-- 
-- Expected Results:
-- - All transactional data should be 0
-- - Core setup data should remain intact
-- - Ready for fresh Google Cloud AI testing
-- =====================================================

-- =====================================================
-- 1. VERIFY ALL PROCESSING DATA IS DELETED
-- =====================================================

SELECT 
    '🧹 PROCESSING DATA CLEANUP VERIFICATION' as verification_type,
    NOW() as verified_at;

SELECT 
    'delivery_records' as table_name,
    COUNT(*) as remaining_records,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ CLEAN'
        ELSE '❌ NEEDS ATTENTION'
    END as status
FROM delivery_records
UNION ALL
SELECT 
    'violation_alerts' as table_name,
    COUNT(*) as remaining_records,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ CLEAN'
        ELSE '❌ NEEDS ATTENTION'
    END as status
FROM violation_alerts
UNION ALL
SELECT 
    'temperature_readings' as table_name,
    COUNT(*) as remaining_records,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ CLEAN'
        ELSE '❌ NEEDS ATTENTION'
    END as status
FROM temperature_readings
UNION ALL
SELECT 
    'compliance_alerts' as table_name,
    COUNT(*) as remaining_records,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ CLEAN'
        ELSE '❌ NEEDS ATTENTION'
    END as status
FROM compliance_alerts
UNION ALL
SELECT 
    'audit_logs' as table_name,
    COUNT(*) as remaining_records,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ CLEAN'
        ELSE '❌ NEEDS ATTENTION'
    END as status
FROM audit_logs;

-- =====================================================
-- 2. VERIFY CORE SETUP DATA IS PRESERVED
-- =====================================================

SELECT 
    '🏢 CORE SETUP DATA VERIFICATION' as verification_type,
    NOW() as verified_at;

SELECT 
    'clients' as table_name,
    COUNT(*) as record_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PRESERVED'
        ELSE '⚠️  MISSING'
    END as status
FROM clients
UNION ALL
SELECT 
    'profiles' as table_name,
    COUNT(*) as record_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PRESERVED'
        ELSE '⚠️  MISSING'
    END as status
FROM profiles
UNION ALL
SELECT 
    'client_users' as table_name,
    COUNT(*) as record_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PRESERVED'
        ELSE '⚠️  MISSING'
    END as status
FROM client_users
UNION ALL
SELECT 
    'suppliers' as table_name,
    COUNT(*) as record_count,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ PRESERVED'
        ELSE '⚠️  ERROR'
    END as status
FROM suppliers;

-- =====================================================
-- 3. DETAILED USER AND COMPANY VERIFICATION
-- =====================================================

SELECT 
    '👤 USER AND COMPANY DETAILS' as verification_type,
    NOW() as verified_at;

-- Check test company exists
SELECT 
    c.id,
    c.name,
    c.business_email,
    c.subscription_status,
    c.subscription_tier,
    c.onboarding_status,
    '✅ Test Company Found' as status
FROM clients c
WHERE c.business_email = 'dev@jigr.app'
   OR c.name ILIKE '%development%'
   OR c.name ILIKE '%test%'
   OR c.name ILIKE '%jigr%';

-- Check user profiles exist
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.created_at,
    '✅ User Profile Found' as status
FROM profiles p
WHERE p.email = 'dev@jigr.app'
   OR p.email ILIKE '%jigr%'
   OR p.full_name ILIKE '%development%';

-- Check user-company relationships
SELECT 
    cu.id,
    cu.role,
    cu.status,
    p.email,
    c.name as company_name,
    '✅ User-Company Link Found' as status
FROM client_users cu
JOIN profiles p ON cu.user_id = p.id
JOIN clients c ON cu.client_id = c.id
WHERE p.email = 'dev@jigr.app'
   OR c.business_email = 'dev@jigr.app';

-- =====================================================
-- 4. DATABASE SIZE AND PERFORMANCE CHECK
-- =====================================================

SELECT 
    '📊 DATABASE SIZE VERIFICATION' as verification_type,
    NOW() as verified_at;

-- Check table sizes after cleanup
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (
    'delivery_records', 
    'violation_alerts', 
    'temperature_readings', 
    'compliance_alerts',
    'clients',
    'profiles',
    'client_users'
  )
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================
-- 5. READINESS CHECK FOR GOOGLE CLOUD AI TESTING
-- =====================================================

SELECT 
    '🤖 GOOGLE CLOUD AI READINESS CHECK' as verification_type,
    NOW() as verified_at;

-- Simulate dashboard query to ensure it returns empty
SELECT 
    'Dashboard Query Test' as test_name,
    COUNT(*) as delivery_records_found,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ READY - Dashboard will show empty state'
        ELSE '❌ NOT READY - Old data still present'
    END as readiness_status
FROM delivery_records
ORDER BY created_at DESC
LIMIT 1;

-- Check for any analysis or extraction_data remnants
SELECT 
    'Analysis Data Test' as test_name,
    COUNT(*) as records_with_analysis,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ READY - No old analysis data'
        ELSE '❌ NOT READY - Analysis data still present'
    END as readiness_status
FROM delivery_records 
WHERE analysis IS NOT NULL 
   OR extraction_data IS NOT NULL;

-- =====================================================
-- 6. FINAL CLEANUP SUMMARY
-- =====================================================

DO $$
DECLARE
    delivery_count INTEGER;
    violation_count INTEGER;
    temp_count INTEGER;
    client_count INTEGER;
    profile_count INTEGER;
    ready_for_testing BOOLEAN := TRUE;
BEGIN
    -- Get counts
    SELECT COUNT(*) INTO delivery_count FROM delivery_records;
    SELECT COUNT(*) INTO violation_count FROM violation_alerts;
    SELECT COUNT(*) INTO temp_count FROM temperature_readings;
    SELECT COUNT(*) INTO client_count FROM clients;
    SELECT COUNT(*) INTO profile_count FROM profiles;
    
    -- Check readiness
    IF delivery_count > 0 OR violation_count > 0 OR temp_count > 0 THEN
        ready_for_testing := FALSE;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '====================================';
    RAISE NOTICE '🎯 CLEANUP VERIFICATION SUMMARY';
    RAISE NOTICE '====================================';
    RAISE NOTICE '';
    
    -- Processing data status
    RAISE NOTICE '📊 Processing Data Status:';
    RAISE NOTICE '   Delivery Records: % (should be 0)', delivery_count;
    RAISE NOTICE '   Violation Alerts: % (should be 0)', violation_count;
    RAISE NOTICE '   Temperature Readings: % (should be 0)', temp_count;
    RAISE NOTICE '';
    
    -- Core data status
    RAISE NOTICE '🏢 Core Setup Status:';
    RAISE NOTICE '   Clients: % (should be > 0)', client_count;
    RAISE NOTICE '   Profiles: % (should be > 0)', profile_count;
    RAISE NOTICE '';
    
    -- Overall status
    IF ready_for_testing THEN
        RAISE NOTICE '✅ SUCCESS: Database is clean and ready';
        RAISE NOTICE '';
        RAISE NOTICE '🚀 NEXT STEPS:';
        RAISE NOTICE '1. Verify storage buckets are empty';
        RAISE NOTICE '2. Go to https://compliance.jigr.app';
        RAISE NOTICE '3. Login with dev@jigr.app';
        RAISE NOTICE '4. Upload a delivery docket';
        RAISE NOTICE '5. Test Google Cloud AI processing';
        RAISE NOTICE '6. Verify results display on dashboard';
    ELSE
        RAISE NOTICE '❌ WARNING: Cleanup incomplete';
        RAISE NOTICE '   Some processing data still remains';
        RAISE NOTICE '   Re-run PURGE_ALL_DATA.sql if needed';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '====================================';
END $$;

-- =====================================================
-- 7. USEFUL QUERIES FOR ONGOING MONITORING
-- =====================================================

-- Quick status check (bookmark this query)
/*
SELECT 
    (SELECT COUNT(*) FROM delivery_records) as deliveries,
    (SELECT COUNT(*) FROM violation_alerts) as violations,
    (SELECT COUNT(*) FROM temperature_readings) as temperatures,
    (SELECT COUNT(*) FROM clients) as clients,
    (SELECT COUNT(*) FROM profiles) as users,
    NOW() as checked_at;
*/

-- Latest processing activity check
/*
SELECT 
    dr.id,
    dr.supplier_name,
    dr.created_at,
    dr.processing_status,
    CASE 
        WHEN dr.analysis IS NOT NULL THEN 'Has Analysis'
        WHEN dr.extraction_data IS NOT NULL THEN 'Has Extraction'
        ELSE 'No Processing Data'
    END as data_status
FROM delivery_records dr
ORDER BY dr.created_at DESC
LIMIT 5;
*/