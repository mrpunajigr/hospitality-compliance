-- ===============================================================================
-- LAUNCH CLEANUP SCRIPT - JiGR Hospitality Compliance
-- ===============================================================================
-- 🚀 Production-ready script to clean ALL test data before launch
-- 
-- Usage: Copy and paste this entire script into Supabase SQL Editor
--        https://supabase.com/dashboard/project/rggdywqnvpuwssluzfud/sql
-- 
-- ⚠️  WARNING: This will permanently delete ALL user accounts and company data
--     This action is IRREVERSIBLE - use only when ready to go live
-- ===============================================================================

-- First, let's see what we're about to delete
SELECT 
  '🔍 BEFORE CLEANUP - What will be deleted:' as status,
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM profiles) as profiles,
  (SELECT COUNT(*) FROM clients) as clients,
  (SELECT COUNT(*) FROM client_users) as client_relationships,
  (SELECT COUNT(*) FROM invitations) as invitations;

-- ===============================================================================
-- PHASE 1: CLEAR APPLICATION DATA (safe order, respecting foreign keys)
-- ===============================================================================

-- 1. Clear invitations (no dependencies)
DELETE FROM invitations;

-- 2. Clear client_users relationships 
DELETE FROM client_users;

-- 3. Clear any uploaded assets
DELETE FROM assets WHERE client_id IS NOT NULL;

-- 4. Clear delivery records (if exists)
DELETE FROM delivery_dockets WHERE client_id IS NOT NULL;

-- 5. Clear document analyses (if exists) 
DELETE FROM document_analyses WHERE client_id IS NOT NULL;

-- 6. Clear clients (companies)
DELETE FROM clients;

-- 7. Clear user profiles
DELETE FROM profiles;

-- Show progress
SELECT '✅ Application data cleared' as status;

-- ===============================================================================
-- PHASE 2: CLEAR SUPABASE AUTH USERS
-- ===============================================================================

-- Clear all auth users (this is the important part that my previous script missed!)
DELETE FROM auth.users;

-- Show progress  
SELECT '✅ Auth users cleared' as status;

-- ===============================================================================
-- PHASE 3: RESET AUTO-INCREMENT SEQUENCES
-- ===============================================================================

-- Reset all sequences to start fresh from 1
ALTER SEQUENCE IF EXISTS clients_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS invitations_id_seq RESTART WITH 1; 
ALTER SEQUENCE IF EXISTS client_users_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS assets_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS document_analyses_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS delivery_dockets_id_seq RESTART WITH 1;

SELECT '✅ Sequences reset to start from 1' as status;

-- ===============================================================================
-- FINAL VERIFICATION
-- ===============================================================================

-- Verify everything is clean
SELECT 
  '🎯 AFTER CLEANUP - Verification:' as status,
  (SELECT COUNT(*) FROM auth.users) as remaining_auth_users,
  (SELECT COUNT(*) FROM profiles) as remaining_profiles,
  (SELECT COUNT(*) FROM clients) as remaining_clients,
  (SELECT COUNT(*) FROM client_users) as remaining_relationships,
  (SELECT COUNT(*) FROM invitations) as remaining_invitations;

-- Show system tables are preserved
SELECT 
  '✅ SYSTEM PRESERVED:' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
  'Database schema and structure intact' as note;

-- Success message
SELECT '🚀 LAUNCH CLEANUP COMPLETED SUCCESSFULLY!' as final_status,
       'Database is now clean and ready for production launch' as message,
       'Next account created will get ID #1' as next_steps;

-- ===============================================================================
-- POST-CLEANUP MANUAL TASKS (if needed)
-- ===============================================================================

/*
📋 Additional cleanup tasks (manual):

1. 🗂️  STORAGE BUCKETS:
   - Go to: Storage > company-logos > Delete all files
   - Go to: Storage > document-uploads > Delete all files  
   - Keep: module-assets (system icons)

2. 📊 LOGS & ANALYTICS:
   - Dashboard > Logs > Clear if desired
   - Any external analytics reset

3. 🔐 API KEYS (for launch):
   - Rotate Supabase service keys
   - Update environment variables
   - Test all integrations

4. ✅ VERIFICATION:
   - Create test account (should get ID #1)
   - Test all functionality  
   - Verify clean email sending
*/