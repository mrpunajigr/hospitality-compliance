-- ===============================================================================
-- DATABASE CLEANUP SCRIPT - JiGR Hospitality Compliance
-- ===============================================================================
-- WARNING: This script will delete ALL user accounts, companies, and related data
-- This is IRREVERSIBLE in production - use with extreme caution
-- ===============================================================================

BEGIN;

-- Safety check - display what will be deleted
SELECT 
  'CLEANUP SUMMARY' as operation,
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM clients) as total_clients,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM client_users) as total_user_client_relationships,
  (SELECT COUNT(*) FROM invitations) as total_invitations;

-- ===============================================================================
-- PHASE 1: Clear User-Related Data (respecting foreign key dependencies)
-- ===============================================================================

-- 1. Clear invitations (no dependencies)
DELETE FROM invitations;
SELECT 'Cleared invitations table' as status;

-- 2. Clear client_users relationships (depends on users and clients)
DELETE FROM client_users;
SELECT 'Cleared client_users relationships' as status;

-- 3. Clear document analyses (depends on clients)
DELETE FROM document_analyses;
SELECT 'Cleared document_analyses' as status;

-- 4. Clear delivery dockets (depends on clients)
DELETE FROM delivery_dockets WHERE client_id IS NOT NULL;
SELECT 'Cleared delivery_dockets' as status;

-- 5. Clear assets/uploads (depends on clients)
DELETE FROM assets WHERE client_id IS NOT NULL;
SELECT 'Cleared client assets' as status;

-- ===============================================================================
-- PHASE 2: Clear Company/Client Data
-- ===============================================================================

-- 6. Clear clients (main company records)
DELETE FROM clients;
SELECT 'Cleared clients table' as status;

-- ===============================================================================
-- PHASE 3: Clear User Profiles (after client relationships removed)
-- ===============================================================================

-- 7. Clear profiles (linked to auth.users)
DELETE FROM profiles;
SELECT 'Cleared profiles table' as status;

-- ===============================================================================
-- PHASE 4: Reset Auto-Increment Sequences
-- ===============================================================================

-- Reset sequences to start fresh IDs from 1
ALTER SEQUENCE IF EXISTS clients_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS invitations_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS client_users_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS assets_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS document_analyses_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS delivery_dockets_id_seq RESTART WITH 1;

SELECT 'Reset all auto-increment sequences' as status;

-- ===============================================================================
-- VERIFICATION: Show cleanup results
-- ===============================================================================

SELECT 
  'CLEANUP COMPLETED' as operation,
  (SELECT COUNT(*) FROM auth.users) as remaining_users,
  (SELECT COUNT(*) FROM clients) as remaining_clients,
  (SELECT COUNT(*) FROM profiles) as remaining_profiles,
  (SELECT COUNT(*) FROM client_users) as remaining_relationships,
  (SELECT COUNT(*) FROM invitations) as remaining_invitations;

-- Display preserved system data (should remain untouched)
SELECT 
  'PRESERVED SYSTEM DATA' as operation,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
  'Schema and structure preserved' as note;

COMMIT;

-- ===============================================================================
-- NOTES FOR MANUAL CLEANUP (if needed)
-- ===============================================================================

-- Auth.users cleanup requires Supabase Auth API or dashboard
-- Cannot be done via SQL due to Supabase Auth security
-- 
-- Storage bucket cleanup:
-- - Company logos in 'company-logos' bucket
-- - Document uploads in 'document-uploads' bucket
-- - Module assets should be preserved
--
-- To clean auth.users manually:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Select all test users and delete
-- OR use Supabase Management API if needed

SELECT 'Database cleanup script completed successfully' as final_status;