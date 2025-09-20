-- ===============================================================================
-- DATABASE BACKUP SCRIPT - Before Cleanup
-- ===============================================================================
-- Run this before cleanup to create backup of current data
-- ===============================================================================

-- Create backup tables with timestamp
DO $$
DECLARE
    backup_suffix TEXT := '_backup_' || to_char(now(), 'YYYY_MM_DD_HH24_MI_SS');
BEGIN
    -- Backup clients
    EXECUTE format('CREATE TABLE clients%s AS SELECT * FROM clients', backup_suffix);
    
    -- Backup profiles  
    EXECUTE format('CREATE TABLE profiles%s AS SELECT * FROM profiles', backup_suffix);
    
    -- Backup client_users relationships
    EXECUTE format('CREATE TABLE client_users%s AS SELECT * FROM client_users', backup_suffix);
    
    -- Backup invitations
    EXECUTE format('CREATE TABLE invitations%s AS SELECT * FROM invitations', backup_suffix);
    
    -- Backup assets
    EXECUTE format('CREATE TABLE assets%s AS SELECT * FROM assets WHERE client_id IS NOT NULL', backup_suffix);
    
    -- Log backup creation
    RAISE NOTICE 'Backup tables created with suffix: %', backup_suffix;
END $$;

-- Show backup summary
SELECT 
    schemaname,
    tablename,
    n_tup_ins as rows_backed_up
FROM pg_stat_user_tables 
WHERE tablename LIKE '%_backup_%'
ORDER BY tablename;