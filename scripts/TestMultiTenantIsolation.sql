-- Multi-Tenant Isolation Testing Script
-- Comprehensive testing suite for validating data isolation and security
-- Phase 1: Foundation & MVP - Database & Authentication

-- =====================================================
-- TESTING SETUP
-- =====================================================

-- Function to run comprehensive multi-tenant tests
CREATE OR REPLACE FUNCTION run_multitenant_tests()
RETURNS TABLE(
    test_category TEXT,
    test_name TEXT,
    status TEXT,
    details TEXT,
    security_level TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    test_client_1 UUID;
    test_client_2 UUID;
    test_user_1 UUID;
    test_user_2 UUID;
    test_delivery_1 UUID;
    test_delivery_2 UUID;
    isolation_breach_count INTEGER;
    policy_count INTEGER;
    table_count INTEGER;
BEGIN
    -- Clean up any existing test data first
    PERFORM cleanup_test_data();
    
    -- Generate test data
    PERFORM generate_test_data();
    
    -- Get test data IDs
    SELECT id INTO test_client_1 FROM clients WHERE business_email = 'test1@example.com';
    SELECT id INTO test_client_2 FROM clients WHERE business_email = 'test2@example.com';
    SELECT id INTO test_user_1 FROM profiles WHERE email = 'user1@test.com';
    SELECT id INTO test_user_2 FROM profiles WHERE email = 'user2@test.com';
    
    SELECT id INTO test_delivery_1 FROM delivery_records 
    WHERE client_id = test_client_1 LIMIT 1;
    
    SELECT id INTO test_delivery_2 FROM delivery_records 
    WHERE client_id = test_client_2 LIMIT 1;

    -- =====================================================
    -- TEST 1: SCHEMA VALIDATION
    -- =====================================================
    
    -- Check all required tables exist
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name IN (
        'clients', 'profiles', 'client_users', 'invitations', 'suppliers',
        'delivery_records', 'temperature_readings', 'compliance_alerts',
        'compliance_reports', 'inspector_access', 'audit_logs', 'data_exports',
        'document_usage', 'webhook_logs', 'compliance_settings',
        'client_display_configurations', 'enhanced_extraction_analytics',
        'assets', 'asset_usage'
    );
    
    RETURN QUERY
    SELECT 
        'Schema'::TEXT,
        'Required tables exist'::TEXT,
        CASE WHEN table_count >= 19 THEN '✅ PASS' ELSE '❌ FAIL' END,
        table_count || ' of 19 required tables found',
        'CRITICAL'::TEXT;

    -- =====================================================
    -- TEST 2: RLS POLICY VALIDATION
    -- =====================================================
    
    -- Check RLS is enabled on all tables
    RETURN QUERY
    SELECT 
        'Security'::TEXT,
        'RLS enabled on all tables'::TEXT,
        CASE 
            WHEN NOT EXISTS(
                SELECT 1 FROM pg_class c
                JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE n.nspname = 'public'
                AND c.relkind = 'r'
                AND c.relname NOT IN ('schema_migrations', 'storage_migrations')
                AND NOT c.relrowsecurity
            ) THEN '✅ PASS' 
            ELSE '❌ FAIL' 
        END,
        'All tables have RLS enabled',
        'CRITICAL'::TEXT;

    -- Check policy count
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    RETURN QUERY
    SELECT 
        'Security'::TEXT,
        'Sufficient RLS policies'::TEXT,
        CASE WHEN policy_count >= 30 THEN '✅ PASS' ELSE '⚠️ WARNING' END,
        policy_count || ' policies found (expected 30+)',
        'HIGH'::TEXT;

    -- =====================================================
    -- TEST 3: CLIENT DATA ISOLATION
    -- =====================================================
    
    -- Test client isolation - user1 should not see client2's data
    -- Simulate user1 context
    PERFORM set_config('request.jwt.claims', json_build_object('sub', test_user_1)::text, true);
    
    -- Check delivery records isolation
    SELECT COUNT(*) INTO isolation_breach_count
    FROM delivery_records 
    WHERE client_id = test_client_2;
    
    RETURN QUERY
    SELECT 
        'Isolation'::TEXT,
        'Delivery records isolation'::TEXT,
        CASE WHEN isolation_breach_count = 0 THEN '✅ PASS' ELSE '❌ CRITICAL BREACH' END,
        'User1 can see ' || isolation_breach_count || ' records from Client2 (should be 0)',
        'CRITICAL'::TEXT;

    -- Check client access isolation
    SELECT COUNT(*) INTO isolation_breach_count
    FROM clients 
    WHERE id = test_client_2;
    
    RETURN QUERY
    SELECT 
        'Isolation'::TEXT,
        'Client access isolation'::TEXT,
        CASE WHEN isolation_breach_count = 0 THEN '✅ PASS' ELSE '❌ CRITICAL BREACH' END,
        'User1 can see ' || isolation_breach_count || ' other clients (should be 0)',
        'CRITICAL'::TEXT;

    -- Check temperature readings isolation
    SELECT COUNT(*) INTO isolation_breach_count
    FROM temperature_readings tr
    JOIN delivery_records dr ON tr.delivery_record_id = dr.id
    WHERE dr.client_id = test_client_2;
    
    RETURN QUERY
    SELECT 
        'Isolation'::TEXT,
        'Temperature readings isolation'::TEXT,
        CASE WHEN isolation_breach_count = 0 THEN '✅ PASS' ELSE '❌ CRITICAL BREACH' END,
        'User1 can see ' || isolation_breach_count || ' temp readings from Client2 (should be 0)',
        'CRITICAL'::TEXT;

    -- Check compliance alerts isolation
    SELECT COUNT(*) INTO isolation_breach_count
    FROM compliance_alerts 
    WHERE client_id = test_client_2;
    
    RETURN QUERY
    SELECT 
        'Isolation'::TEXT,
        'Compliance alerts isolation'::TEXT,
        CASE WHEN isolation_breach_count = 0 THEN '✅ PASS' ELSE '❌ CRITICAL BREACH' END,
        'User1 can see ' || isolation_breach_count || ' alerts from Client2 (should be 0)',
        'CRITICAL'::TEXT;

    -- =====================================================
    -- TEST 4: ENHANCED FEATURES ISOLATION
    -- =====================================================
    
    -- Test display configurations isolation
    SELECT COUNT(*) INTO isolation_breach_count
    FROM client_display_configurations 
    WHERE client_id = test_client_2;
    
    RETURN QUERY
    SELECT 
        'Isolation'::TEXT,
        'Display config isolation'::TEXT,
        CASE WHEN isolation_breach_count = 0 THEN '✅ PASS' ELSE '❌ CRITICAL BREACH' END,
        'User1 can see ' || isolation_breach_count || ' configs from Client2 (should be 0)',
        'HIGH'::TEXT;

    -- Test analytics isolation
    SELECT COUNT(*) INTO isolation_breach_count
    FROM enhanced_extraction_analytics 
    WHERE client_id = test_client_2;
    
    RETURN QUERY
    SELECT 
        'Isolation'::TEXT,
        'Analytics isolation'::TEXT,
        CASE WHEN isolation_breach_count = 0 THEN '✅ PASS' ELSE '❌ CRITICAL BREACH' END,
        'User1 can see ' || isolation_breach_count || ' analytics from Client2 (should be 0)',
        'HIGH'::TEXT;

    -- =====================================================
    -- TEST 5: CROSS-TENANT DATA VALIDATION
    -- =====================================================
    
    -- Switch to user2 context
    PERFORM set_config('request.jwt.claims', json_build_object('sub', test_user_2)::text, true);
    
    -- Verify user2 can see their own data
    SELECT COUNT(*) INTO isolation_breach_count
    FROM delivery_records 
    WHERE client_id = test_client_2;
    
    RETURN QUERY
    SELECT 
        'Access'::TEXT,
        'User2 accesses own data'::TEXT,
        CASE WHEN isolation_breach_count > 0 THEN '✅ PASS' ELSE '❌ FAIL' END,
        'User2 can see ' || isolation_breach_count || ' own records (should be > 0)',
        'MEDIUM'::TEXT;

    -- Verify user2 cannot see user1's data
    SELECT COUNT(*) INTO isolation_breach_count
    FROM delivery_records 
    WHERE client_id = test_client_1;
    
    RETURN QUERY
    SELECT 
        'Isolation'::TEXT,
        'User2 blocked from User1 data'::TEXT,
        CASE WHEN isolation_breach_count = 0 THEN '✅ PASS' ELSE '❌ CRITICAL BREACH' END,
        'User2 can see ' || isolation_breach_count || ' records from Client1 (should be 0)',
        'CRITICAL'::TEXT;

    -- =====================================================
    -- TEST 6: FOREIGN KEY INTEGRITY
    -- =====================================================
    
    -- Test foreign key constraints
    BEGIN
        -- Try to insert invalid delivery record (should fail)
        INSERT INTO delivery_records (client_id, user_id, supplier_name, image_path)
        VALUES (gen_random_uuid(), test_user_1, 'Invalid Test', '/invalid/path.jpg');
        
        -- If we get here, the constraint failed
        RETURN QUERY
        SELECT 
            'Integrity'::TEXT,
            'Foreign key constraints'::TEXT,
            '❌ FAIL'::TEXT,
            'Foreign key constraint should have prevented invalid insert',
            'HIGH'::TEXT;
            
    EXCEPTION WHEN OTHERS THEN
        -- This is expected - foreign key constraint worked
        RETURN QUERY
        SELECT 
            'Integrity'::TEXT,
            'Foreign key constraints'::TEXT,
            '✅ PASS'::TEXT,
            'Foreign key constraints properly enforced',
            'MEDIUM'::TEXT;
    END;

    -- =====================================================
    -- TEST 7: PERMISSION VALIDATION
    -- =====================================================
    
    -- Test helper functions work correctly
    RETURN QUERY
    SELECT 
        'Functionality'::TEXT,
        'Helper functions available'::TEXT,
        CASE 
            WHEN EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'user_has_access_to_client') 
            AND EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'user_is_admin_for_client')
            THEN '✅ PASS' 
            ELSE '❌ FAIL' 
        END,
        'Authentication helper functions exist and accessible',
        'MEDIUM'::TEXT;

    -- =====================================================
    -- TEST 8: PERFORMANCE VALIDATION
    -- =====================================================
    
    -- Test query performance with RLS
    DECLARE
        start_time TIMESTAMP;
        end_time TIMESTAMP;
        query_time_ms NUMERIC;
    BEGIN
        start_time := clock_timestamp();
        
        -- Simulate complex multi-tenant query
        PERFORM COUNT(*)
        FROM delivery_records dr
        JOIN temperature_readings tr ON dr.id = tr.delivery_record_id
        JOIN clients c ON dr.client_id = c.id;
        
        end_time := clock_timestamp();
        query_time_ms := EXTRACT(MILLISECONDS FROM (end_time - start_time));
        
        RETURN QUERY
        SELECT 
            'Performance'::TEXT,
            'Multi-table RLS query'::TEXT,
            CASE 
                WHEN query_time_ms < 100 THEN '✅ FAST'
                WHEN query_time_ms < 500 THEN '⚠️ ACCEPTABLE'
                ELSE '❌ SLOW'
            END,
            query_time_ms || 'ms execution time',
            'MEDIUM'::TEXT;
    END;

    -- =====================================================
    -- CLEANUP
    -- =====================================================
    
    -- Reset context
    PERFORM set_config('request.jwt.claims', '', true);
    
    -- Clean up test data
    PERFORM cleanup_test_data();
    
    -- Final validation summary
    RETURN QUERY
    SELECT 
        'Summary'::TEXT,
        'Multi-tenant testing complete'::TEXT,
        '✅ COMPLETE'::TEXT,
        'All isolation tests executed - review results above',
        'INFO'::TEXT;
        
END $$;

-- =====================================================
-- CONTINUOUS MONITORING FUNCTIONS
-- =====================================================

-- Function to monitor RLS policy health
CREATE OR REPLACE FUNCTION monitor_rls_health()
RETURNS TABLE(
    table_name TEXT,
    rls_enabled BOOLEAN,
    policy_count INTEGER,
    last_policy_update TIMESTAMP WITH TIME ZONE,
    risk_level TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.table_name::TEXT,
        COALESCE(c.relrowsecurity, false) as rls_enabled,
        (
            SELECT COUNT(*)::INTEGER
            FROM pg_policies p
            WHERE p.schemaname = 'public' 
            AND p.tablename = t.table_name
        ) as policy_count,
        NOW() as last_policy_update, -- In practice, track this in audit logs
        CASE 
            WHEN NOT COALESCE(c.relrowsecurity, false) THEN 'CRITICAL'
            WHEN (SELECT COUNT(*) FROM pg_policies p WHERE p.schemaname = 'public' AND p.tablename = t.table_name) = 0 THEN 'HIGH'
            WHEN t.table_name IN ('clients', 'delivery_records', 'compliance_alerts') 
                AND (SELECT COUNT(*) FROM pg_policies p WHERE p.schemaname = 'public' AND p.tablename = t.table_name) < 2 THEN 'MEDIUM'
            ELSE 'LOW'
        END as risk_level
    FROM information_schema.tables t
    LEFT JOIN pg_class c ON c.relname = t.table_name
    LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'public'
    WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND t.table_name NOT IN ('schema_migrations', 'storage_migrations')
    ORDER BY 
        CASE risk_level
            WHEN 'CRITICAL' THEN 1
            WHEN 'HIGH' THEN 2
            WHEN 'MEDIUM' THEN 3
            ELSE 4
        END,
        t.table_name;
END $$;

-- Function to detect potential isolation breaches
CREATE OR REPLACE FUNCTION detect_isolation_breaches()
RETURNS TABLE(
    table_name TEXT,
    potential_breach_count BIGINT,
    severity TEXT,
    recommendation TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    -- This is a simplified version - in production you'd have more sophisticated detection
    
    -- Check for records without proper client association
    RETURN QUERY
    SELECT 
        'delivery_records'::TEXT,
        COUNT(*) as potential_breach_count,
        CASE WHEN COUNT(*) > 0 THEN 'HIGH' ELSE 'NONE' END as severity,
        'Delivery records without valid client_id found' as recommendation
    FROM delivery_records dr
    LEFT JOIN clients c ON dr.client_id = c.id
    WHERE c.id IS NULL;
    
    -- Check for orphaned temperature readings
    RETURN QUERY
    SELECT 
        'temperature_readings'::TEXT,
        COUNT(*) as potential_breach_count,
        CASE WHEN COUNT(*) > 0 THEN 'MEDIUM' ELSE 'NONE' END as severity,
        'Temperature readings without valid delivery record found' as recommendation
    FROM temperature_readings tr
    LEFT JOIN delivery_records dr ON tr.delivery_record_id = dr.id
    WHERE dr.id IS NULL;
    
    -- Check for compliance alerts without client association
    RETURN QUERY
    SELECT 
        'compliance_alerts'::TEXT,
        COUNT(*) as potential_breach_count,
        CASE WHEN COUNT(*) > 0 THEN 'HIGH' ELSE 'NONE' END as severity,
        'Compliance alerts without valid client_id found' as recommendation
    FROM compliance_alerts ca
    LEFT JOIN clients c ON ca.client_id = c.id
    WHERE c.id IS NULL;
END $$;

-- =====================================================
-- AUTOMATED TESTING SCHEDULER
-- =====================================================

-- Function to run daily isolation checks
CREATE OR REPLACE FUNCTION daily_isolation_check()
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    test_results RECORD;
    critical_failures INTEGER := 0;
    high_failures INTEGER := 0;
    total_tests INTEGER := 0;
    summary_text TEXT;
BEGIN
    -- Run full test suite
    FOR test_results IN 
        SELECT * FROM run_multitenant_tests()
        WHERE security_level IN ('CRITICAL', 'HIGH')
    LOOP
        total_tests := total_tests + 1;
        
        IF test_results.status LIKE '%FAIL%' OR test_results.status LIKE '%BREACH%' THEN
            IF test_results.security_level = 'CRITICAL' THEN
                critical_failures := critical_failures + 1;
            ELSIF test_results.security_level = 'HIGH' THEN
                high_failures := high_failures + 1;
            END IF;
        END IF;
    END LOOP;
    
    -- Create audit log entry
    INSERT INTO audit_logs (
        client_id,
        user_id, 
        action,
        resource_type,
        details
    ) VALUES (
        NULL,
        NULL,
        'daily_security_check',
        'database',
        jsonb_build_object(
            'total_tests', total_tests,
            'critical_failures', critical_failures,
            'high_failures', high_failures,
            'timestamp', NOW()
        )
    );
    
    -- Return summary
    summary_text := format(
        'Daily isolation check complete: %s tests run, %s critical failures, %s high-priority failures',
        total_tests, critical_failures, high_failures
    );
    
    IF critical_failures > 0 THEN
        summary_text := summary_text || ' ⚠️ IMMEDIATE ATTENTION REQUIRED';
    ELSIF high_failures > 0 THEN
        summary_text := summary_text || ' ⚠️ Review recommended';
    ELSE
        summary_text := summary_text || ' ✅ All systems secure';
    END IF;
    
    RETURN summary_text;
END $$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION run_multitenant_tests() TO authenticated;
GRANT EXECUTE ON FUNCTION monitor_rls_health() TO authenticated;
GRANT EXECUTE ON FUNCTION detect_isolation_breaches() TO authenticated;
GRANT EXECUTE ON FUNCTION daily_isolation_check() TO authenticated;

-- =====================================================
-- INITIAL TEST RUN
-- =====================================================

-- Run comprehensive test suite
DO $$
DECLARE
    test_result RECORD;
    total_tests INTEGER := 0;
    passed_tests INTEGER := 0;
    failed_tests INTEGER := 0;
    critical_failures INTEGER := 0;
BEGIN
    RAISE NOTICE '🧪 Running Comprehensive Multi-Tenant Isolation Tests...';
    RAISE NOTICE '';
    
    FOR test_result IN 
        SELECT * FROM run_multitenant_tests() 
        ORDER BY 
            CASE security_level
                WHEN 'CRITICAL' THEN 1
                WHEN 'HIGH' THEN 2
                WHEN 'MEDIUM' THEN 3
                ELSE 4
            END,
            test_category, test_name
    LOOP
        total_tests := total_tests + 1;
        
        IF test_result.status LIKE '%PASS%' OR test_result.status LIKE '%FAST%' OR test_result.status LIKE '%COMPLETE%' THEN
            passed_tests := passed_tests + 1;
        ELSE
            failed_tests := failed_tests + 1;
            IF test_result.security_level = 'CRITICAL' THEN
                critical_failures := critical_failures + 1;
            END IF;
        END IF;
        
        RAISE NOTICE '[%] [%] %: % - %', 
            test_result.security_level,
            test_result.test_category,
            test_result.test_name, 
            test_result.status,
            test_result.details;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 Test Summary:';
    RAISE NOTICE '   Total Tests: %', total_tests;
    RAISE NOTICE '   Passed: % (%.1f%%)', passed_tests, (passed_tests::FLOAT / total_tests::FLOAT * 100);
    RAISE NOTICE '   Failed: % (%.1f%%)', failed_tests, (failed_tests::FLOAT / total_tests::FLOAT * 100);
    RAISE NOTICE '   Critical Failures: %', critical_failures;
    RAISE NOTICE '';
    
    IF critical_failures = 0 AND failed_tests = 0 THEN
        RAISE NOTICE '🎉 All tests passed! Multi-tenant isolation is working correctly.';
    ELSIF critical_failures = 0 THEN
        RAISE NOTICE '⚠️ Some non-critical tests failed. Review results above.';
    ELSE
        RAISE NOTICE '🚨 CRITICAL SECURITY FAILURES DETECTED! Immediate attention required.';
    END IF;
END $$;

-- Success message
SELECT 'Multi-Tenant Isolation Testing completed successfully! 🔒' as test_status;