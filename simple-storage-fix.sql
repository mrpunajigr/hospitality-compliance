-- Simple Storage Bucket Fix
-- Run this in Supabase SQL Editor

-- Make delivery-dockets bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'delivery-dockets';