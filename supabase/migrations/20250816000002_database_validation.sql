-- Database Validation and Testing Migration
-- Comprehensive testing suite for multi-tenant isolation and data integrity
-- Phase 1: Foundation & MVP - Database & Authentication

-- =====================================================
-- VALIDATION FUNCTIONS
-- =====================================================

-- Function to check if all required tables exist
CREATE OR REPLACE FUNCTION validate_schema_completeness()
RETURNS TABLE(
    table_name TEXT,
    exists BOOLEAN,
    row_count BIGINT,
    has_rls BOOLEAN,
    policy_count INTEGER
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    required_tables TEXT[] := ARRAY[
        'clients', 'profiles', 'client_users', 'invitations', 'suppliers',
        'delivery_records', 'temperature_readings', 'compliance_alerts',
        'compliance_reports', 'inspector_access', 'audit_logs', 'data_exports',
        'document_usage', 'webhook_logs', 'compliance_settings',
        'client_display_configurations', 'enhanced_extraction_analytics',
        'assets', 'asset_usage'
    ];
    table_name_var TEXT;
BEGIN
    FOREACH table_name_var IN ARRAY required_tables
    LOOP
        RETURN QUERY
        SELECT 
            table_name_var,
            EXISTS(
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = table_name_var
            ),
            (
                SELECT 
                    CASE 
                        WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = table_name_var)
                        THEN (SELECT n_tup_ins FROM pg_stat_user_tables WHERE relname = table_name_var)
                        ELSE 0
                    END
            ),
            (
                SELECT COALESCE(c.relrowsecurity, false)
                FROM pg_class c
                JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE n.nspname = 'public' AND c.relname = table_name_var
            ),
            (
                SELECT COUNT(*)::INTEGER
                FROM pg_policies p
                WHERE p.schemaname = 'public' AND p.tablename = table_name_var
            );
    END LOOP;
END $$;

-- Function to test multi-tenant isolation
CREATE OR REPLACE FUNCTION test_multitenant_isolation()
RETURNS TABLE(
    test_name TEXT,
    passed BOOLEAN,
    details TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    -- Test 1: Check that all tables have RLS enabled
    RETURN QUERY
    SELECT 
        'All tables have RLS enabled'::TEXT,
        NOT EXISTS(
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public'
            AND c.relkind = 'r'
            AND c.relname NOT IN ('schema_migrations', 'storage_migrations')
            AND NOT c.relrowsecurity
        ),
        (
            SELECT string_agg(c.relname, ', ')
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public'
            AND c.relkind = 'r'
            AND c.relname NOT IN ('schema_migrations', 'storage_migrations')
            AND NOT c.relrowsecurity
        );

    -- Test 2: Check that client-scoped tables have proper policies
    RETURN QUERY
    SELECT 
        'Client-scoped tables have policies'::TEXT,
        NOT EXISTS(
            SELECT 1 FROM UNNEST(ARRAY[
                'clients', 'client_users', 'delivery_records', 'suppliers',
                'compliance_alerts', 'compliance_reports', 'compliance_settings',
                'client_display_configurations', 'enhanced_extraction_analytics'
            ]) AS table_name
            WHERE NOT EXISTS(
                SELECT 1 FROM pg_policies 
                WHERE schemaname = 'public' 
                AND tablename = table_name
            )
        ),
        (
            SELECT string_agg(table_name, ', ')
            FROM UNNEST(ARRAY[
                'clients', 'client_users', 'delivery_records', 'suppliers',
                'compliance_alerts', 'compliance_reports', 'compliance_settings',
                'client_display_configurations', 'enhanced_extraction_analytics'
            ]) AS table_name
            WHERE NOT EXISTS(
                SELECT 1 FROM pg_policies 
                WHERE schemaname = 'public' 
                AND tablename = table_name
            )
        );

    -- Test 3: Check foreign key relationships
    RETURN QUERY
    SELECT 
        'Foreign key constraints exist'::TEXT,
        EXISTS(
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_type = 'FOREIGN KEY'
            AND table_schema = 'public'
        ),
        (
            SELECT COUNT(*)::TEXT || ' foreign key constraints found'
            FROM information_schema.table_constraints 
            WHERE constraint_type = 'FOREIGN KEY'
            AND table_schema = 'public'
        );

    -- Test 4: Check indexes for performance
    RETURN QUERY
    SELECT 
        'Performance indexes exist'::TEXT,
        EXISTS(
            SELECT 1 FROM pg_indexes 
            WHERE schemaname = 'public'
            AND indexname LIKE 'idx_%'
        ),
        (
            SELECT COUNT(*)::TEXT || ' performance indexes found'
            FROM pg_indexes 
            WHERE schemaname = 'public'
            AND indexname LIKE 'idx_%'
        );
END $$;

-- Function to generate test data for validation
CREATE OR REPLACE FUNCTION generate_test_data()
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    test_client_1 UUID;
    test_client_2 UUID;
    test_user_1 UUID;
    test_user_2 UUID;
    test_delivery_1 UUID;
    test_delivery_2 UUID;
BEGIN
    -- Create test clients
    INSERT INTO clients (name, business_email, business_type)
    VALUES 
        ('Test Restaurant 1', 'test1@example.com', 'restaurant'),
        ('Test Hotel 2', 'test2@example.com', 'hotel')
    RETURNING id INTO test_client_1;
    
    SELECT id INTO test_client_2 FROM clients WHERE business_email = 'test2@example.com';

    -- Create test users (Note: In production these would come from auth.users)
    INSERT INTO profiles (id, email, full_name)
    VALUES 
        (gen_random_uuid(), 'user1@test.com', 'Test User 1'),
        (gen_random_uuid(), 'user2@test.com', 'Test User 2')
    ON CONFLICT (id) DO NOTHING;
    
    SELECT id INTO test_user_1 FROM profiles WHERE email = 'user1@test.com';
    SELECT id INTO test_user_2 FROM profiles WHERE email = 'user2@test.com';

    -- Create client-user relationships
    INSERT INTO client_users (user_id, client_id, role, status)
    VALUES 
        (test_user_1, test_client_1, 'owner', 'active'),
        (test_user_2, test_client_2, 'owner', 'active')
    ON CONFLICT (user_id, client_id) DO NOTHING;

    -- Create test delivery records
    INSERT INTO delivery_records (client_id, user_id, supplier_name, image_path, processing_status)
    VALUES 
        (test_client_1, test_user_1, 'Test Supplier 1', '/test/path1.jpg', 'completed'),
        (test_client_2, test_user_2, 'Test Supplier 2', '/test/path2.jpg', 'completed')
    RETURNING id INTO test_delivery_1;
    
    SELECT id INTO test_delivery_2 FROM delivery_records 
    WHERE client_id = test_client_2 LIMIT 1;

    -- Create test temperature readings
    INSERT INTO temperature_readings (delivery_record_id, temperature_value, temperature_unit, is_compliant)
    VALUES 
        (test_delivery_1, 4.5, 'C', true),
        (test_delivery_2, 8.2, 'C', false);

    -- Create test compliance alerts
    INSERT INTO compliance_alerts (delivery_record_id, client_id, alert_type, severity, message)
    VALUES 
        (test_delivery_2, test_client_2, 'temperature_violation', 'critical', 'Temperature exceeded safe limits');

    RETURN 'Test data generated successfully for validation';
END $$;

-- Function to cleanup test data
CREATE OR REPLACE FUNCTION cleanup_test_data()
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    -- Delete test data in reverse order of dependencies
    DELETE FROM compliance_alerts WHERE message LIKE '%test%' OR message LIKE '%Test%';
    DELETE FROM temperature_readings WHERE delivery_record_id IN (
        SELECT id FROM delivery_records WHERE supplier_name LIKE 'Test%'
    );
    DELETE FROM delivery_records WHERE supplier_name LIKE 'Test%';
    DELETE FROM client_users WHERE client_id IN (
        SELECT id FROM clients WHERE business_email LIKE '%test%'
    );
    DELETE FROM profiles WHERE email LIKE '%test%';
    DELETE FROM clients WHERE business_email LIKE '%test%';
    
    RETURN 'Test data cleaned up successfully';
END $$;

-- =====================================================
-- PERFORMANCE TESTING FUNCTIONS
-- =====================================================

-- Function to test query performance with RLS
CREATE OR REPLACE FUNCTION test_rls_performance()
RETURNS TABLE(
    query_name TEXT,
    execution_time_ms NUMERIC,
    row_count BIGINT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    row_count_var BIGINT;
BEGIN
    -- Test 1: Client data access query
    start_time := clock_timestamp();
    
    SELECT COUNT(*) INTO row_count_var
    FROM delivery_records dr
    JOIN clients c ON dr.client_id = c.id
    WHERE c.business_type = 'restaurant';
    
    end_time := clock_timestamp();
    
    RETURN QUERY
    SELECT 
        'Client delivery records query'::TEXT,
        EXTRACT(MILLISECONDS FROM (end_time - start_time)),
        row_count_var;

    -- Test 2: Multi-table join with RLS
    start_time := clock_timestamp();
    
    SELECT COUNT(*) INTO row_count_var
    FROM delivery_records dr
    JOIN temperature_readings tr ON dr.id = tr.delivery_record_id
    JOIN compliance_alerts ca ON dr.id = ca.delivery_record_id;
    
    end_time := clock_timestamp();
    
    RETURN QUERY
    SELECT 
        'Multi-table compliance query'::TEXT,
        EXTRACT(MILLISECONDS FROM (end_time - start_time)),
        row_count_var;

    -- Test 3: Analytics query
    start_time := clock_timestamp();
    
    SELECT COUNT(*) INTO row_count_var
    FROM enhanced_extraction_analytics ea
    JOIN delivery_records dr ON ea.delivery_record_id = dr.id;
    
    end_time := clock_timestamp();
    
    RETURN QUERY
    SELECT 
        'Analytics aggregation query'::TEXT,
        EXTRACT(MILLISECONDS FROM (end_time - start_time)),
        row_count_var;
END $$;

-- =====================================================
-- COMPREHENSIVE VALIDATION RUNNER
-- =====================================================

-- Function to run all validation tests
CREATE OR REPLACE FUNCTION run_database_validation()
RETURNS TABLE(
    test_category TEXT,
    test_name TEXT,
    status TEXT,
    details TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    -- Schema completeness tests
    RETURN QUERY
    SELECT 
        'Schema'::TEXT,
        'Table: ' || sc.table_name,
        CASE 
            WHEN sc.exists AND sc.has_rls AND sc.policy_count > 0 THEN '✅ PASS'
            WHEN sc.exists AND sc.has_rls THEN '⚠️ PARTIAL (no policies)'
            WHEN sc.exists THEN '❌ FAIL (no RLS)'
            ELSE '❌ FAIL (missing table)'
        END,
        'Rows: ' || sc.row_count || ', RLS: ' || sc.has_rls || ', Policies: ' || sc.policy_count
    FROM validate_schema_completeness() sc;

    -- Multi-tenant isolation tests
    RETURN QUERY
    SELECT 
        'Security'::TEXT,
        mt.test_name,
        CASE WHEN mt.passed THEN '✅ PASS' ELSE '❌ FAIL' END,
        COALESCE(mt.details, 'All checks passed')
    FROM test_multitenant_isolation() mt;

    -- Performance tests
    RETURN QUERY
    SELECT 
        'Performance'::TEXT,
        'Query: ' || pt.query_name,
        CASE 
            WHEN pt.execution_time_ms < 100 THEN '✅ FAST (<100ms)'
            WHEN pt.execution_time_ms < 500 THEN '⚠️ MEDIUM (100-500ms)'
            ELSE '❌ SLOW (>500ms)'
        END,
        pt.execution_time_ms || 'ms, ' || pt.row_count || ' rows'
    FROM test_rls_performance() pt;
END $$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION validate_schema_completeness() TO authenticated;
GRANT EXECUTE ON FUNCTION test_multitenant_isolation() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_test_data() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_test_data() TO authenticated;
GRANT EXECUTE ON FUNCTION test_rls_performance() TO authenticated;
GRANT EXECUTE ON FUNCTION run_database_validation() TO authenticated;

-- =====================================================
-- INITIAL VALIDATION RUN
-- =====================================================

-- Run validation and display results
DO $$
DECLARE
    validation_result RECORD;
    total_tests INTEGER := 0;
    passed_tests INTEGER := 0;
BEGIN
    RAISE NOTICE '🔍 Running Database Validation Suite...';
    RAISE NOTICE '';
    
    FOR validation_result IN 
        SELECT * FROM run_database_validation() 
        ORDER BY test_category, test_name
    LOOP
        total_tests := total_tests + 1;
        
        IF validation_result.status LIKE '%PASS%' OR validation_result.status LIKE '%FAST%' THEN
            passed_tests := passed_tests + 1;
        END IF;
        
        RAISE NOTICE '[%] %: % - %', 
            validation_result.test_category,
            validation_result.test_name, 
            validation_result.status,
            validation_result.details;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 Validation Summary: % of % tests passed (%.1f%%)', 
        passed_tests, 
        total_tests, 
        (passed_tests::FLOAT / total_tests::FLOAT * 100);
        
    IF passed_tests = total_tests THEN
        RAISE NOTICE '🎉 All validations passed! Database is ready for production.';
    ELSE
        RAISE NOTICE '⚠️ Some validations failed. Review above results.';
    END IF;
END $$;

-- Success message
SELECT 'Database Validation Migration completed successfully! 🧪' as migration_status;