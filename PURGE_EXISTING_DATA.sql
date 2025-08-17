-- =====================================================
-- SAFE DATABASE PURGE - ONLY EXISTING TABLES
-- =====================================================
-- 
-- This script safely purges data from tables that actually exist
-- 
-- First, let's see what tables we have:
-- =====================================================

-- Check what tables exist in the database
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name LIKE '%delivery%' 
    OR table_name LIKE '%alert%'
    OR table_name LIKE '%temperature%'
    OR table_name LIKE '%compliance%'
    OR table_name LIKE '%audit%'
    OR table_name LIKE '%notification%'
    OR table_name LIKE '%processing%'
ORDER BY table_name;

-- Also check for any tables with processing data
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;