-- Create storage buckets for avatars and client logos
-- Migration: 20250101000004_create_storage_buckets

-- Create avatars bucket for user profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars', 
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Create client-logos bucket for company branding
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'client-logos',
    'client-logos',
    true, 
    10485760, -- 10MB limit for high-quality logos
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for avatars bucket
-- Users can upload/update their own avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar" ON storage.objects
    FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar" ON storage.objects
    FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Anyone can view avatars (public bucket)
CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Set up RLS policies for client-logos bucket
-- Users can manage logos for their client
CREATE POLICY "Users can upload client logo" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'client-logos' 
        AND EXISTS (
            SELECT 1 FROM user_client_roles ucr
            WHERE ucr.user_id = auth.uid()
            AND ucr.client_id::text = (storage.foldername(name))[1]
            AND ucr.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Users can update client logo" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'client-logos'
        AND EXISTS (
            SELECT 1 FROM user_client_roles ucr
            WHERE ucr.user_id = auth.uid()
            AND ucr.client_id::text = (storage.foldername(name))[1]
            AND ucr.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Users can delete client logo" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'client-logos'
        AND EXISTS (
            SELECT 1 FROM user_client_roles ucr
            WHERE ucr.user_id = auth.uid()
            AND ucr.client_id::text = (storage.foldername(name))[1]
            AND ucr.role IN ('owner', 'admin')
        )
    );

-- Anyone can view client logos (public bucket for branding)
CREATE POLICY "Anyone can view client logos" ON storage.objects
    FOR SELECT USING (bucket_id = 'client-logos');