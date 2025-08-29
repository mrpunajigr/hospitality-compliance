-- Simple Supabase Storage Fix - Make delivery-dockets bucket public
-- This approach works without superuser permissions

-- Step 1: Create or update bucket to be public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'delivery-dockets', 
    'delivery-dockets', 
    true, -- Make bucket public for read access
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'application/pdf']
)
ON CONFLICT (name) DO UPDATE SET 
    public = true, -- Ensure it's public
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'application/pdf'];

-- Step 2: Verify the bucket is now public
SELECT 
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE name = 'delivery-dockets';

-- Step 3: Check if there are any existing files
SELECT 
    name,
    bucket_id,
    created_at,
    updated_at
FROM storage.objects
WHERE bucket_id = 'delivery-dockets'
ORDER BY created_at DESC
LIMIT 10;

-- Success message
SELECT 
    '✅ Bucket configured as public! Images should now load in training interface.' as result,
    'If images still don''t load, check the file paths in the delivery_records table.' as note;