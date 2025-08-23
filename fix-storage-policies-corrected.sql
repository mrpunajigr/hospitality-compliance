-- Fix Supabase Storage Bucket Policies for Image Access (Corrected Version)
-- Compatible with current Supabase storage schema

-- Step 1: Check current storage schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'storage'
ORDER BY table_name;

-- Step 2: Create bucket if it doesn't exist and make it public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'delivery-dockets', 
    'delivery-dockets', 
    true, 
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'application/pdf']
)
ON CONFLICT (name) DO UPDATE SET 
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'application/pdf'];

-- Step 3: Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies using the correct approach
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to delivery dockets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload delivery dockets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own delivery dockets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own delivery dockets" ON storage.objects;

-- Create policy for public read access
CREATE POLICY "Allow public read access to delivery dockets"
ON storage.objects FOR SELECT
USING (bucket_id = 'delivery-dockets');

-- Create policy for authenticated users to upload
CREATE POLICY "Allow authenticated users to upload delivery dockets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'delivery-dockets');

-- Create policy for authenticated users to update their own files  
CREATE POLICY "Allow authenticated users to update their own delivery dockets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'delivery-dockets')
WITH CHECK (bucket_id = 'delivery-dockets');

-- Create policy for authenticated users to delete their own files
CREATE POLICY "Allow authenticated users to delete their own delivery dockets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'delivery-dockets');

-- Step 5: Create service role policies for Edge Functions
CREATE POLICY "Allow service role full access to delivery dockets"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'delivery-dockets')
WITH CHECK (bucket_id = 'delivery-dockets');

-- Step 6: Verify the setup
SELECT 
    'Bucket Configuration:' as category,
    name, 
    public::text as value, 
    file_size_limit::text as limit_info,
    allowed_mime_types::text as mime_types
FROM storage.buckets 
WHERE name = 'delivery-dockets'

UNION ALL

SELECT 
    'RLS Policies:' as category,
    policyname as name,
    cmd::text as value,
    roles::text as limit_info,
    qual::text as mime_types
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects' 
AND policyname LIKE '%delivery%';

-- Final verification: Check if any files exist
SELECT 
    'Existing Files:' as category,
    name,
    bucket_id as value,
    created_at::text as limit_info,
    owner::text as mime_types
FROM storage.objects
WHERE bucket_id = 'delivery-dockets'
ORDER BY created_at DESC
LIMIT 5;

-- Success message
SELECT '✅ Storage policies fixed - delivery-dockets bucket configured with public read access!' as result;