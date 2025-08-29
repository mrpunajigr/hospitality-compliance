-- =====================================================
-- SIMPLE CLEANUP VERIFICATION 
-- =====================================================
-- Basic SQL queries to verify cleanup was successful
-- =====================================================

-- 1. Show all tables that exist
SELECT 
    'Available Tables' as info,
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Check delivery_records (main processing table)
SELECT 
    'delivery_records' as table_name,
    COUNT(*) as record_count,
    CASE 
        WHEN COUNT(*) = 0 THEN 'CLEAN - Ready for testing'
        ELSE 'HAS DATA - Old records present'
    END as status
FROM delivery_records;

-- 3. Check core setup tables are preserved
SELECT 
    'clients' as table_name,
    COUNT(*) as record_count,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PRESERVED - Setup intact'
        ELSE 'MISSING - Need to recreate'
    END as status
FROM clients
UNION ALL
SELECT 
    'profiles' as table_name,
    COUNT(*) as record_count,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PRESERVED - Setup intact'
        ELSE 'MISSING - Need to recreate'
    END as status
FROM profiles
UNION ALL
SELECT 
    'client_users' as table_name,
    COUNT(*) as record_count,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PRESERVED - Setup intact'
        ELSE 'MISSING - Need to recreate'
    END as status
FROM client_users;

-- 4. Check for test company and user
SELECT 
    'Test Company Check' as verification,
    c.name,
    c.business_email,
    c.subscription_status
FROM clients c
WHERE c.business_email = 'dev@jigr.app' 
   OR c.name ILIKE '%development%' 
   OR c.name ILIKE '%test%' 
   OR c.name ILIKE '%jigr%';

SELECT 
    'Test User Check' as verification,
    p.email,
    p.full_name,
    p.created_at
FROM profiles p
WHERE p.email = 'dev@jigr.app' 
   OR p.email ILIKE '%jigr%';

-- 5. Dashboard readiness check
SELECT 
    'Dashboard Readiness' as check_type,
    COUNT(*) as delivery_records,
    CASE 
        WHEN COUNT(*) = 0 THEN 'READY - Will show empty state'
        ELSE 'NOT READY - Old data will appear'
    END as readiness_status,
    'Upload new docket to test Google Cloud AI' as next_step
FROM delivery_records;

-- 6. Quick summary
SELECT 
    'CLEANUP SUMMARY' as summary_type,
    (SELECT COUNT(*) FROM delivery_records) as deliveries,
    (SELECT COUNT(*) FROM clients) as companies,
    (SELECT COUNT(*) FROM profiles) as users,
    CASE 
        WHEN (SELECT COUNT(*) FROM delivery_records) = 0 AND 
             (SELECT COUNT(*) FROM clients) > 0 AND 
             (SELECT COUNT(*) FROM profiles) > 0 
        THEN 'SUCCESS - Ready for Google Cloud AI testing'
        ELSE 'NEEDS ATTENTION - Check individual results above'
    END as overall_status;