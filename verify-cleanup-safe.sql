-- =====================================================
-- SAFE POST-CLEANUP VERIFICATION QUERIES
-- =====================================================
-- 
-- This version checks table existence before querying
-- =====================================================

-- First, see what tables actually exist
SELECT 
    '📋 AVAILABLE TABLES' as info,
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =====================================================
-- SAFE VERIFICATION - ONLY EXISTING TABLES
-- =====================================================

-- Check delivery_records (should exist and be empty)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'delivery_records') THEN
        RAISE NOTICE '📊 Checking delivery_records...';
        PERFORM (SELECT COUNT(*) FROM delivery_records);
        IF (SELECT COUNT(*) FROM delivery_records) = 0 THEN
            RAISE NOTICE '✅ delivery_records: CLEAN (0 records)';
        ELSE
            RAISE NOTICE '❌ delivery_records: % records remaining', (SELECT COUNT(*) FROM delivery_records);
        END IF;
    ELSE
        RAISE NOTICE '⏭️  delivery_records: Table does not exist';
    END IF;
END $$;

-- Check temperature_readings 
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'temperature_readings') THEN
        RAISE NOTICE '📊 Checking temperature_readings...';
        IF (SELECT COUNT(*) FROM temperature_readings) = 0 THEN
            RAISE NOTICE '✅ temperature_readings: CLEAN (0 records)';
        ELSE
            RAISE NOTICE '❌ temperature_readings: % records remaining', (SELECT COUNT(*) FROM temperature_readings);
        END IF;
    ELSE
        RAISE NOTICE '⏭️  temperature_readings: Table does not exist';
    END IF;
END $$;

-- Check compliance_alerts
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'compliance_alerts') THEN
        RAISE NOTICE '📊 Checking compliance_alerts...';
        IF (SELECT COUNT(*) FROM compliance_alerts) = 0 THEN
            RAISE NOTICE '✅ compliance_alerts: CLEAN (0 records)';
        ELSE
            RAISE NOTICE '❌ compliance_alerts: % records remaining', (SELECT COUNT(*) FROM compliance_alerts);
        END IF;
    ELSE
        RAISE NOTICE '⏭️  compliance_alerts: Table does not exist';
    END IF;
END $$;

-- Check violation_alerts
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'violation_alerts') THEN
        RAISE NOTICE '📊 Checking violation_alerts...';
        IF (SELECT COUNT(*) FROM violation_alerts) = 0 THEN
            RAISE NOTICE '✅ violation_alerts: CLEAN (0 records)';
        ELSE
            RAISE NOTICE '❌ violation_alerts: % records remaining', (SELECT COUNT(*) FROM violation_alerts);
        END IF;
    ELSE
        RAISE NOTICE '⏭️  violation_alerts: Table does not exist';
    END IF;
END $$;

-- Check audit_logs
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        RAISE NOTICE '📊 Checking audit_logs...';
        IF (SELECT COUNT(*) FROM audit_logs) = 0 THEN
            RAISE NOTICE '✅ audit_logs: CLEAN (0 records)';
        ELSE
            RAISE NOTICE '❌ audit_logs: % records remaining', (SELECT COUNT(*) FROM audit_logs);
        END IF;
    ELSE
        RAISE NOTICE '⏭️  audit_logs: Table does not exist';
    END IF;
END $$;

-- =====================================================
-- VERIFY CORE SETUP DATA IS PRESERVED
-- =====================================================

RAISE NOTICE '';
RAISE NOTICE '🏢 CORE SETUP DATA VERIFICATION';
RAISE NOTICE '=================================';

-- Check clients
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        RAISE NOTICE '📊 Checking clients...';
        IF (SELECT COUNT(*) FROM clients) > 0 THEN
            RAISE NOTICE '✅ clients: % records PRESERVED', (SELECT COUNT(*) FROM clients);
        ELSE
            RAISE NOTICE '⚠️  clients: 0 records (should have test company)';
        END IF;
    ELSE
        RAISE NOTICE '❌ clients: Table does not exist';
    END IF;
END $$;

-- Check profiles
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE NOTICE '📊 Checking profiles...';
        IF (SELECT COUNT(*) FROM profiles) > 0 THEN
            RAISE NOTICE '✅ profiles: % records PRESERVED', (SELECT COUNT(*) FROM profiles);
        ELSE
            RAISE NOTICE '⚠️  profiles: 0 records (should have test user)';
        END IF;
    ELSE
        RAISE NOTICE '❌ profiles: Table does not exist';
    END IF;
END $$;

-- Check client_users
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_users') THEN
        RAISE NOTICE '📊 Checking client_users...';
        IF (SELECT COUNT(*) FROM client_users) > 0 THEN
            RAISE NOTICE '✅ client_users: % records PRESERVED', (SELECT COUNT(*) FROM client_users);
        ELSE
            RAISE NOTICE '⚠️  client_users: 0 records (should have user-company link)';
        END IF;
    ELSE
        RAISE NOTICE '❌ client_users: Table does not exist';
    END IF;
END $$;

-- =====================================================
-- TEST COMPANY AND USER VERIFICATION
-- =====================================================

RAISE NOTICE '';
RAISE NOTICE '👤 TEST COMPANY AND USER VERIFICATION';
RAISE NOTICE '====================================';

-- Check for test company
DO $$
DECLARE
    company_count INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        SELECT COUNT(*) INTO company_count 
        FROM clients 
        WHERE business_email = 'dev@jigr.app' 
           OR name ILIKE '%development%' 
           OR name ILIKE '%test%' 
           OR name ILIKE '%jigr%';
        
        IF company_count > 0 THEN
            RAISE NOTICE '✅ Test company found: % records', company_count;
        ELSE
            RAISE NOTICE '⚠️  No test company found (should have dev@jigr.app company)';
        END IF;
    END IF;
END $$;

-- Check for test user
DO $$
DECLARE
    user_count INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        SELECT COUNT(*) INTO user_count 
        FROM profiles 
        WHERE email = 'dev@jigr.app' 
           OR email ILIKE '%jigr%';
        
        IF user_count > 0 THEN
            RAISE NOTICE '✅ Test user found: % records', user_count;
        ELSE
            RAISE NOTICE '⚠️  No test user found (should have dev@jigr.app user)';
        END IF;
    END IF;
END $$;

-- =====================================================
-- READINESS CHECK FOR GOOGLE CLOUD AI TESTING
-- =====================================================

RAISE NOTICE '';
RAISE NOTICE '🤖 GOOGLE CLOUD AI READINESS CHECK';
RAISE NOTICE '=================================';

-- Check if dashboard will show empty state
DO $$
DECLARE
    delivery_count INTEGER;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'delivery_records') THEN
        SELECT COUNT(*) INTO delivery_count FROM delivery_records;
        
        IF delivery_count = 0 THEN
            RAISE NOTICE '✅ Dashboard ready: Will show empty state for fresh testing';
        ELSE
            RAISE NOTICE '❌ Dashboard not ready: % old records still present', delivery_count;
        END IF;
    ELSE
        RAISE NOTICE '✅ Dashboard ready: No delivery_records table (will be created on first upload)';
    END IF;
END $$;

-- =====================================================
-- FINAL CLEANUP SUMMARY
-- =====================================================

DO $$
DECLARE
    delivery_count INTEGER := 0;
    client_count INTEGER := 0;
    profile_count INTEGER := 0;
    ready_for_testing BOOLEAN := TRUE;
BEGIN
    -- Get counts safely
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'delivery_records') THEN
        SELECT COUNT(*) INTO delivery_count FROM delivery_records;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        SELECT COUNT(*) INTO client_count FROM clients;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        SELECT COUNT(*) INTO profile_count FROM profiles;
    END IF;
    
    -- Check readiness
    IF delivery_count > 0 THEN
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
    RAISE NOTICE '';
    
    -- Core data status
    RAISE NOTICE '🏢 Core Setup Status:';
    RAISE NOTICE '   Clients: % (should be > 0)', client_count;
    RAISE NOTICE '   Profiles: % (should be > 0)', profile_count;
    RAISE NOTICE '';
    
    -- Overall status
    IF ready_for_testing THEN
        RAISE NOTICE '✅ SUCCESS: Database is clean and ready for testing';
        RAISE NOTICE '';
        RAISE NOTICE '🚀 NEXT STEPS:';
        RAISE NOTICE '1. Go to https://compliance.jigr.app';
        RAISE NOTICE '2. Login with dev@jigr.app';
        RAISE NOTICE '3. Upload a delivery docket';
        RAISE NOTICE '4. Test Google Cloud AI processing';
        RAISE NOTICE '5. Verify fresh results display on dashboard';
        RAISE NOTICE '';
        RAISE NOTICE '📝 EXPECTED BEHAVIOR:';
        RAISE NOTICE '   - Dashboard shows empty state initially';
        RAISE NOTICE '   - Upload creates first delivery record';
        RAISE NOTICE '   - AI processing creates fresh analysis';
        RAISE NOTICE '   - Results appear immediately in dashboard';
    ELSE
        RAISE NOTICE '❌ WARNING: Cleanup incomplete';
        RAISE NOTICE '   Some processing data still remains';
        RAISE NOTICE '   Re-run database purge if needed';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '====================================';
END $$;

SELECT '🎉 VERIFICATION COMPLETED' as result;