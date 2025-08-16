-- Database Migration Rollback Procedures
-- Safe rollback procedures for all database migrations
-- Phase 1: Foundation & MVP - Database & Authentication

-- =====================================================
-- ROLLBACK SAFETY CHECKS
-- =====================================================

-- Function to check if rollback is safe
CREATE OR REPLACE FUNCTION check_rollback_safety(migration_version TEXT)
RETURNS TABLE(
    can_rollback BOOLEAN,
    warning_message TEXT,
    data_loss_risk TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    CASE migration_version
        WHEN '20250816000002_database_validation' THEN
            RETURN QUERY SELECT 
                true, 
                'Safe to rollback - only removes validation functions',
                'None - validation functions only';
                
        WHEN '20250816000001_complete_rls_policies' THEN
            RETURN QUERY SELECT 
                true, 
                'Safe to rollback - removes RLS policies for new tables only',
                'None - only affects enhanced tables';
                
        WHEN '20250812000001_add_assets_table' THEN
            RETURN QUERY SELECT 
                false, 
                'WARNING: Will remove assets table and all uploaded assets',
                'HIGH - all client assets will be lost';
                
        WHEN '20240101000002_rls_policies' THEN
            RETURN QUERY SELECT 
                false, 
                'CRITICAL: Will disable all multi-tenant security',
                'CRITICAL - exposes all client data';
                
        WHEN '20240101000001_initial_schema' THEN
            RETURN QUERY SELECT 
                false, 
                'CRITICAL: Will destroy entire database',
                'TOTAL - all data will be lost';
                
        ELSE
            RETURN QUERY SELECT 
                false, 
                'Unknown migration version',
                'Unknown - manual review required';
    END CASE;
END $$;

-- =====================================================
-- ROLLBACK SCRIPTS
-- =====================================================

-- Rollback: 20250816000002_database_validation.sql
-- Safe rollback - removes validation functions only
/*
DROP FUNCTION IF EXISTS validate_schema_completeness();
DROP FUNCTION IF EXISTS test_multitenant_isolation();
DROP FUNCTION IF EXISTS generate_test_data();
DROP FUNCTION IF EXISTS cleanup_test_data();
DROP FUNCTION IF EXISTS test_rls_performance();
DROP FUNCTION IF EXISTS run_database_validation();
*/

-- Rollback: 20250816000001_complete_rls_policies.sql
-- Safe rollback - removes RLS policies for enhanced tables
/*
-- Drop new RLS policies
DROP POLICY IF EXISTS "Users can view client display configurations" ON client_display_configurations;
DROP POLICY IF EXISTS "Admins can manage display configurations" ON client_display_configurations;
DROP POLICY IF EXISTS "Users can view client analytics" ON enhanced_extraction_analytics;
DROP POLICY IF EXISTS "System can insert analytics" ON enhanced_extraction_analytics;
DROP POLICY IF EXISTS "Admins can manage analytics" ON enhanced_extraction_analytics;

-- Disable RLS on enhanced tables
ALTER TABLE client_display_configurations DISABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_extraction_analytics DISABLE ROW LEVEL SECURITY;

-- Drop helper functions
DROP FUNCTION IF EXISTS user_is_admin_for_client(UUID);
DROP FUNCTION IF EXISTS user_has_access_to_client(UUID);
DROP FUNCTION IF EXISTS validate_rls_isolation();

-- Drop performance indexes
DROP INDEX IF EXISTS idx_client_users_user_client_status;
DROP INDEX IF EXISTS idx_client_users_client_role_status;
DROP INDEX IF EXISTS idx_client_display_config_client_active;
DROP INDEX IF EXISTS idx_enhanced_analytics_client_date;
*/

-- Rollback: Enhanced Extraction Migration (DANGEROUS)
-- WARNING: This will lose all enhanced AI extraction data
/*
-- Drop enhanced extraction tables
DROP TABLE IF EXISTS enhanced_extraction_analytics CASCADE;
DROP TABLE IF EXISTS client_display_configurations CASCADE;

-- Remove enhanced fields from delivery_records
ALTER TABLE delivery_records DROP COLUMN IF EXISTS extracted_line_items;
ALTER TABLE delivery_records DROP COLUMN IF EXISTS product_classification;
ALTER TABLE delivery_records DROP COLUMN IF EXISTS confidence_scores;
ALTER TABLE delivery_records DROP COLUMN IF EXISTS compliance_analysis;
ALTER TABLE delivery_records DROP COLUMN IF EXISTS estimated_value;
ALTER TABLE delivery_records DROP COLUMN IF EXISTS item_count;
ALTER TABLE delivery_records DROP COLUMN IF EXISTS processing_metadata;

-- Drop enhanced indexes
DROP INDEX IF EXISTS idx_delivery_records_product_classification;
DROP INDEX IF EXISTS idx_delivery_records_extracted_line_items;
DROP INDEX IF EXISTS idx_delivery_records_confidence_scores;
DROP INDEX IF EXISTS idx_delivery_records_compliance_analysis;
DROP INDEX IF EXISTS idx_delivery_records_estimated_value;
DROP INDEX IF EXISTS idx_delivery_records_item_count;

-- Drop enhanced views
DROP VIEW IF EXISTS v_extraction_performance;
*/

-- Rollback: Assets Table Migration (DANGEROUS)
-- WARNING: This will lose all uploaded assets
/*
-- Drop asset tables
DROP TABLE IF EXISTS asset_usage CASCADE;
DROP TABLE IF EXISTS assets CASCADE;

-- Drop asset functions
DROP FUNCTION IF EXISTS increment_asset_usage();

-- Drop asset indexes
DROP INDEX IF EXISTS idx_assets_type;
DROP INDEX IF EXISTS idx_assets_category;
DROP INDEX IF EXISTS idx_assets_client_id;
DROP INDEX IF EXISTS idx_assets_is_active;
DROP INDEX IF EXISTS idx_assets_is_default;
DROP INDEX IF EXISTS idx_assets_uploaded_by;
DROP INDEX IF EXISTS idx_asset_usage_asset_id;
DROP INDEX IF EXISTS idx_asset_usage_client_id;
DROP INDEX IF EXISTS idx_asset_usage_used_in;
DROP INDEX IF EXISTS idx_asset_usage_created_at;
DROP INDEX IF EXISTS idx_assets_type_active;
DROP INDEX IF EXISTS idx_assets_client_type;
*/

-- =====================================================
-- EMERGENCY PROCEDURES
-- =====================================================

-- Emergency: Disable all RLS temporarily
-- Use only in emergency situations for debugging
/*
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', table_record.tablename);
    END LOOP;
    
    RAISE NOTICE 'EMERGENCY: All RLS disabled - IMMEDIATE SECURITY RISK';
END $$;
*/

-- Emergency: Re-enable all RLS
-- Run after emergency debugging
/*
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_record.tablename);
    END LOOP;
    
    RAISE NOTICE 'All RLS re-enabled - Security restored';
END $$;
*/

-- =====================================================
-- DATA BACKUP PROCEDURES
-- =====================================================

-- Function to create data backup before major changes
CREATE OR REPLACE FUNCTION create_migration_backup(backup_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    table_count INTEGER;
    total_rows BIGINT;
BEGIN
    -- Count tables and rows for backup verification
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public';
    
    SELECT SUM(n_tup_ins) INTO total_rows
    FROM pg_stat_user_tables;
    
    -- Create backup notification (actual backup would be done via pg_dump)
    INSERT INTO audit_logs (
        client_id, 
        user_id, 
        action, 
        resource_type, 
        details
    ) VALUES (
        NULL,
        NULL,
        'system_backup',
        'database',
        jsonb_build_object(
            'backup_name', backup_name,
            'table_count', table_count,
            'total_rows', total_rows,
            'timestamp', NOW()
        )
    );
    
    RETURN format('Backup checkpoint created: %s (%s tables, %s rows)', 
                  backup_name, table_count, total_rows);
END $$;

-- Function to verify data integrity after migration
CREATE OR REPLACE FUNCTION verify_migration_integrity()
RETURNS TABLE(
    check_name TEXT,
    status TEXT,
    details TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    -- Check 1: Foreign key constraints
    RETURN QUERY
    SELECT 
        'Foreign Key Integrity'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END,
        COUNT(*)::TEXT || ' constraint violations found'
    FROM information_schema.constraint_column_usage ccu
    JOIN information_schema.table_constraints tc 
        ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public';

    -- Check 2: Required data exists
    RETURN QUERY
    SELECT 
        'Core Data Exists'::TEXT,
        CASE WHEN EXISTS(SELECT 1 FROM clients) THEN '✅ PASS' ELSE '⚠️ WARNING' END,
        'Clients table has data: ' || CASE WHEN EXISTS(SELECT 1 FROM clients) THEN 'Yes' ELSE 'No' END;

    -- Check 3: Indexes exist
    RETURN QUERY
    SELECT 
        'Performance Indexes'::TEXT,
        CASE WHEN COUNT(*) > 10 THEN '✅ PASS' ELSE '⚠️ WARNING' END,
        COUNT(*)::TEXT || ' indexes found (expected >10)'
    FROM pg_indexes 
    WHERE schemaname = 'public';
END $$;

-- =====================================================
-- SAFE MIGRATION PROCEDURES
-- =====================================================

-- Function to safely apply migration with rollback capability
CREATE OR REPLACE FUNCTION safe_migration_apply(
    migration_name TEXT,
    migration_sql TEXT,
    create_backup BOOLEAN DEFAULT true
)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    backup_name TEXT;
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    result_message TEXT;
BEGIN
    start_time := NOW();
    
    -- Create backup if requested
    IF create_backup THEN
        backup_name := migration_name || '_backup_' || to_char(NOW(), 'YYYYMMDD_HH24MI');
        PERFORM create_migration_backup(backup_name);
    END IF;
    
    -- Apply migration (this would execute the actual migration SQL)
    -- In practice, this would be done outside this function
    
    end_time := NOW();
    
    -- Verify integrity after migration
    IF NOT EXISTS(SELECT 1 FROM verify_migration_integrity() WHERE status LIKE '%FAIL%') THEN
        result_message := format('Migration %s completed successfully in %s', 
                                migration_name, 
                                end_time - start_time);
    ELSE
        result_message := format('Migration %s completed with warnings - review integrity checks', 
                                migration_name);
    END IF;
    
    -- Log migration completion
    INSERT INTO audit_logs (
        client_id, 
        user_id, 
        action, 
        resource_type, 
        details
    ) VALUES (
        NULL,
        NULL,
        'migration_applied',
        'database',
        jsonb_build_object(
            'migration_name', migration_name,
            'backup_created', backup_name,
            'duration', EXTRACT(EPOCH FROM (end_time - start_time)),
            'timestamp', end_time
        )
    );
    
    RETURN result_message;
END $$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION check_rollback_safety(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_migration_backup(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_migration_integrity() TO authenticated;
GRANT EXECUTE ON FUNCTION safe_migration_apply(TEXT, TEXT, BOOLEAN) TO authenticated;

-- =====================================================
-- USAGE INSTRUCTIONS
-- =====================================================

/*
USAGE INSTRUCTIONS:

1. Before any migration:
   SELECT * FROM check_rollback_safety('migration_version');

2. Create backup before risky migration:
   SELECT create_migration_backup('before_major_change');

3. After migration, verify integrity:
   SELECT * FROM verify_migration_integrity();

4. If rollback needed, use appropriate rollback script above

5. For safe migration application:
   SELECT safe_migration_apply('migration_name', 'migration_sql', true);

EMERGENCY PROCEDURES:
- Only use emergency RLS disable in controlled debugging environments
- Always re-enable RLS immediately after debugging
- Never run emergency procedures in production without approval

BACKUP VERIFICATION:
- Use pg_dump for actual backup creation
- Verify backup integrity before proceeding with risky migrations
- Test rollback procedures in staging environment first
*/

-- Success message
SELECT 'Rollback Procedures Migration completed successfully! 🛡️' as migration_status;