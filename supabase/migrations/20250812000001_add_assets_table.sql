-- Assets Management Migration
-- Adds support for dynamic background images, logos, and other JiGR assets

-- =====================================================
-- ASSETS TABLE
-- =====================================================

-- Assets table for storing backgrounds, logos, and other media
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('background', 'logo', 'icon', 'image')),
    category TEXT CHECK (category IN ('kitchen', 'restaurant', 'hotel', 'office', 'neutral', 'brand')),
    file_url TEXT NOT NULL, -- Supabase Storage URL
    file_path TEXT NOT NULL, -- Storage bucket path
    file_size INTEGER,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')), -- Contrast difficulty for backgrounds
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false, -- Mark system default assets
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE, -- NULL for global assets
    uploaded_by UUID REFERENCES profiles(id),
    usage_count INTEGER DEFAULT 0, -- Track how often asset is used
    alt_text TEXT, -- Accessibility description
    tags JSONB DEFAULT '[]', -- Search tags ['modern', 'dark', 'industrial']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ASSET USAGE TRACKING
-- =====================================================

-- Track where assets are being used
CREATE TABLE asset_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    used_in TEXT NOT NULL, -- 'mood_board', 'dashboard', 'login_page', 'company_profile'
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    session_id TEXT, -- Track per-session usage
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Asset queries
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_category ON assets(category);
CREATE INDEX idx_assets_client_id ON assets(client_id);
CREATE INDEX idx_assets_is_active ON assets(is_active);
CREATE INDEX idx_assets_is_default ON assets(is_default);
CREATE INDEX idx_assets_uploaded_by ON assets(uploaded_by);

-- Usage tracking
CREATE INDEX idx_asset_usage_asset_id ON asset_usage(asset_id);
CREATE INDEX idx_asset_usage_client_id ON asset_usage(client_id);
CREATE INDEX idx_asset_usage_used_in ON asset_usage(used_in);
CREATE INDEX idx_asset_usage_created_at ON asset_usage(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_assets_type_active ON assets(type, is_active) WHERE is_active = true;
CREATE INDEX idx_assets_client_type ON assets(client_id, type) WHERE is_active = true;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Apply updated_at trigger to assets table
CREATE TRIGGER update_assets_updated_at 
    BEFORE UPDATE ON assets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to increment usage count when asset is used
CREATE OR REPLACE FUNCTION increment_asset_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE assets 
    SET usage_count = usage_count + 1 
    WHERE id = NEW.asset_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-increment usage count
CREATE TRIGGER increment_asset_usage_count
    AFTER INSERT ON asset_usage
    FOR EACH ROW
    EXECUTE FUNCTION increment_asset_usage();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on assets table
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all global assets (client_id IS NULL) and their client's assets
CREATE POLICY "View assets policy" ON assets
    FOR SELECT
    USING (
        client_id IS NULL -- Global assets visible to all
        OR 
        client_id IN (
            SELECT client_id 
            FROM client_users 
            WHERE user_id = auth.uid() 
            AND status = 'active'
        )
    );

-- Policy: Users can insert assets for their client only (admins/managers)
CREATE POLICY "Insert assets policy" ON assets
    FOR INSERT
    WITH CHECK (
        client_id IN (
            SELECT client_id 
            FROM client_users 
            WHERE user_id = auth.uid() 
            AND status = 'active'
            AND role IN ('admin', 'manager', 'owner')
        )
    );

-- Policy: Users can update their client's assets (admins/managers)
CREATE POLICY "Update assets policy" ON assets
    FOR UPDATE
    USING (
        client_id IN (
            SELECT client_id 
            FROM client_users 
            WHERE user_id = auth.uid() 
            AND status = 'active'
            AND role IN ('admin', 'manager', 'owner')
        )
    );

-- Policy: Users can delete their client's assets (admins/managers)
CREATE POLICY "Delete assets policy" ON assets
    FOR DELETE
    USING (
        client_id IN (
            SELECT client_id 
            FROM client_users 
            WHERE user_id = auth.uid() 
            AND status = 'active'
            AND role IN ('admin', 'manager', 'owner')
        )
    );

-- Asset usage policies
CREATE POLICY "View asset usage policy" ON asset_usage
    FOR SELECT
    USING (
        client_id IN (
            SELECT client_id 
            FROM client_users 
            WHERE user_id = auth.uid() 
            AND status = 'active'
        )
    );

CREATE POLICY "Insert asset usage policy" ON asset_usage
    FOR INSERT
    WITH CHECK (
        client_id IN (
            SELECT client_id 
            FROM client_users 
            WHERE user_id = auth.uid() 
            AND status = 'active'
        )
    );

-- =====================================================
-- STORAGE BUCKET SETUP
-- =====================================================

-- Create storage bucket for assets (run this in Supabase dashboard or via API)
-- This is a comment as it needs to be run via Supabase Storage API
/*
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true);

-- Storage policies
CREATE POLICY "Assets bucket select policy" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'assets');

CREATE POLICY "Assets bucket insert policy" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'assets' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Assets bucket update policy" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'assets' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Assets bucket delete policy" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'assets' 
        AND auth.role() = 'authenticated'
    );
*/

-- =====================================================
-- INSERT DEFAULT ASSETS
-- =====================================================

-- Insert some default background assets
INSERT INTO assets (name, type, category, file_url, file_path, difficulty, is_default, alt_text, tags) VALUES
    ('Chef Workspace', 'background', 'kitchen', '/chef-workspace1jpg.jpg', 'backgrounds/chef-workspace1jpg.jpg', 'medium', true, 'Professional chef workspace with cooking equipment', '["kitchen", "professional", "workspace"]'),
    ('Clean White', 'background', 'neutral', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmZmZmIi8+PC9zdmc+', 'backgrounds/clean-white.svg', 'easy', true, 'Clean white background for high contrast', '["neutral", "clean", "minimal"]'),
    ('Dark Gray', 'background', 'neutral', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PC9zdmc+', 'backgrounds/dark-gray.svg', 'easy', true, 'Dark gray background for testing', '["neutral", "dark", "minimal"]'),
    ('Medium Gray', 'background', 'neutral', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNmI3Mjg2Ci8+PC9zdmc+', 'backgrounds/medium-gray.svg', 'medium', true, 'Medium gray background for testing', '["neutral", "medium", "minimal"]');

-- Migration completed successfully