-- =====================================================
-- SAFE DATABASE PURGE - CHECK TABLES FIRST
-- =====================================================

-- First, let's see what tables actually exist
SELECT 
    'AVAILABLE TABLES' as info,
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Now let's safely delete only from tables that exist
BEGIN;

-- Safe delete with existence check for delivery_records
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'delivery_records') THEN
        DELETE FROM delivery_records;
        RAISE NOTICE 'Deleted from delivery_records';
    ELSE
        RAISE NOTICE 'Table delivery_records does not exist';
    END IF;
END $$;

-- Safe delete with existence check for temperature_readings
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'temperature_readings') THEN
        DELETE FROM temperature_readings;
        RAISE NOTICE 'Deleted from temperature_readings';
    ELSE
        RAISE NOTICE 'Table temperature_readings does not exist';
    END IF;
END $$;

-- Safe delete with existence check for compliance_alerts
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'compliance_alerts') THEN
        DELETE FROM compliance_alerts;
        RAISE NOTICE 'Deleted from compliance_alerts';
    ELSE
        RAISE NOTICE 'Table compliance_alerts does not exist';
    END IF;
END $$;

-- Safe delete with existence check for violation_alerts
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'violation_alerts') THEN
        DELETE FROM violation_alerts;
        RAISE NOTICE 'Deleted from violation_alerts';
    ELSE
        RAISE NOTICE 'Table violation_alerts does not exist';
    END IF;
END $$;

-- Safe delete with existence check for audit_logs
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        DELETE FROM audit_logs;
        RAISE NOTICE 'Deleted from audit_logs';
    ELSE
        RAISE NOTICE 'Table audit_logs does not exist';
    END IF;
END $$;

-- Verification - check what we have now
SELECT 
    'AFTER PURGE' as status,
    table_name,
    (SELECT COUNT(*) FROM information_schema.tables t2 WHERE t2.table_name = t1.table_name) as table_exists
FROM (VALUES 
    ('delivery_records'),
    ('temperature_readings'), 
    ('compliance_alerts'),
    ('violation_alerts'),
    ('audit_logs'),
    ('clients'),
    ('profiles')
) AS t1(table_name);

COMMIT;

SELECT '✅ SAFE PURGE COMPLETED' as result;