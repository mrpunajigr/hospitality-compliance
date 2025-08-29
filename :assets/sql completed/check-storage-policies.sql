-- Check Supabase Storage Bucket Policies
-- Diagnose why images are not loading in the training interface

-- Check if delivery-dockets bucket exists
SELECT name, public, file_size_limit, allowed_mime_types, avif_autodetection, owner
FROM storage.buckets 
WHERE name = 'delivery-dockets';

-- Check bucket policies for delivery-dockets
SELECT *
FROM storage.policies
WHERE bucket_id = 'delivery-dockets';

-- Check if there are any files in the bucket
SELECT name, bucket_id, owner, created_at, updated_at, metadata
FROM storage.objects
WHERE bucket_id = 'delivery-dockets'
ORDER BY created_at DESC
LIMIT 10;

-- Check RLS policies on storage.objects
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Check if the bucket is public or if we need signed URLs
SELECT name, public
FROM storage.buckets
WHERE name = 'delivery-dockets';