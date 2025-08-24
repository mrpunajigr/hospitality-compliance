-- Fix Storage Bucket Policies for Image Display
-- Run this in Supabase SQL Editor

-- Make delivery-dockets bucket public for reading
UPDATE storage.buckets 
SET public = true 
WHERE id = 'delivery-dockets';

-- Create RLS policy for authenticated reads
CREATE POLICY "Allow authenticated users to read delivery dockets"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'delivery-dockets' 
  AND auth.role() = 'authenticated'
);

-- Create RLS policy for public reads (for signed URLs)
CREATE POLICY "Allow public reads for delivery dockets"  
ON storage.objects
FOR SELECT
USING (bucket_id = 'delivery-dockets');

-- Ensure RLS is enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;