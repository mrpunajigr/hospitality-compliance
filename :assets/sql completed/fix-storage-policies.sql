-- Fix Supabase Storage Bucket Policies for Image Access
-- Allow public read access to delivery-dockets bucket for training interface

-- Step 1: Make bucket public if it exists
UPDATE storage.buckets 
SET public = true 
WHERE name = 'delivery-dockets';

-- Step 2: Create bucket if it doesn't exist (with public read access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('delivery-dockets', 'delivery-dockets', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'application/pdf'])
ON CONFLICT (name) DO UPDATE SET 
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'application/pdf'];

-- Step 3: Create policy for public read access
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
    gen_random_uuid(),
    'delivery-dockets',
    'Allow public read access to delivery dockets',
    '(bucket_id = ''delivery-dockets'')',
    '(bucket_id = ''delivery-dockets'')',
    'SELECT',
    '{public, authenticated, service_role}'
) ON CONFLICT DO NOTHING;

-- Step 4: Create policy for authenticated users to upload
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
    gen_random_uuid(),
    'delivery-dockets',
    'Allow authenticated users to upload delivery dockets',
    '(bucket_id = ''delivery-dockets'' AND (storage.foldername(name))[1] = auth.uid()::text)',
    '(bucket_id = ''delivery-dockets'' AND (storage.foldername(name))[1] = auth.uid()::text)',
    'INSERT',
    '{authenticated}'
) ON CONFLICT DO NOTHING;

-- Step 5: Create policy for authenticated users to update their own files
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
    gen_random_uuid(),
    'delivery-dockets',
    'Allow authenticated users to update their own delivery dockets',
    '(bucket_id = ''delivery-dockets'' AND (storage.foldername(name))[1] = auth.uid()::text)',
    '(bucket_id = ''delivery-dockets'' AND (storage.foldername(name))[1] = auth.uid()::text)',
    'UPDATE',
    '{authenticated}'
) ON CONFLICT DO NOTHING;

-- Step 6: Create policy for authenticated users to delete their own files
INSERT INTO storage.policies (id, bucket_id, name, definition, check_definition, command, roles)
VALUES (
    gen_random_uuid(),
    'delivery-dockets',
    'Allow authenticated users to delete their own delivery dockets',
    '(bucket_id = ''delivery-dockets'' AND (storage.foldername(name))[1] = auth.uid()::text)',
    '(bucket_id = ''delivery-dockets'' AND (storage.foldername(name))[1] = auth.uid()::text)',
    'DELETE',
    '{authenticated}'
) ON CONFLICT DO NOTHING;

-- Verify the setup
SELECT 
    'Bucket Configuration:' as info,
    name, 
    public, 
    file_size_limit, 
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'delivery-dockets'

UNION ALL

SELECT 
    'Storage Policies:' as info,
    name,
    command::text,
    roles::text,
    definition
FROM storage.policies
WHERE bucket_id = 'delivery-dockets';

-- Success message
SELECT '✅ Storage policies fixed - delivery-dockets bucket now has public read access for training interface!' as result;