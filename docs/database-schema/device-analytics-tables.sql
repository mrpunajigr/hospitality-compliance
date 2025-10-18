-- =============================================
-- JiGR Device Analytics Database Schema
-- For capturing user device information
-- =============================================

-- Table: user_device_info
-- Stores comprehensive device information for each user
CREATE TABLE IF NOT EXISTS user_device_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Device Information (JSON)
  device_info JSONB NOT NULL,
  
  -- Analytics Fields (extracted for easy querying)
  device_description TEXT,
  device_category TEXT, -- 'mobile', 'tablet', 'desktop'
  device_subcategory TEXT, -- 'ipad', 'iphone', 'android-tablet', etc.
  screen_size_category TEXT, -- 'tiny', 'small', 'medium', 'large'
  
  -- Capabilities & Compatibility
  is_recommended_device BOOLEAN DEFAULT false,
  supports_advanced_features BOOLEAN DEFAULT false,
  is_legacy_device BOOLEAN DEFAULT false,
  needs_optimization BOOLEAN DEFAULT false,
  
  -- Timestamps
  detected_at TIMESTAMPTZ NOT NULL,
  session_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one record per user (upsert on login)
  UNIQUE(user_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_device_info_user_id ON user_device_info(user_id);
CREATE INDEX IF NOT EXISTS idx_user_device_info_category ON user_device_info(device_category);
CREATE INDEX IF NOT EXISTS idx_user_device_info_subcategory ON user_device_info(device_subcategory);
CREATE INDEX IF NOT EXISTS idx_user_device_info_recommended ON user_device_info(is_recommended_device);

-- Enable RLS (Row Level Security)
ALTER TABLE user_device_info ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own device info" ON user_device_info
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own device info" ON user_device_info
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own device info" ON user_device_info
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin policy for analytics
CREATE POLICY "Admins can view all device info" ON user_device_info
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_clients 
      WHERE user_id = auth.uid() 
      AND role = 'OWNER'
    )
  );

-- =============================================
-- Update profiles table to include device summary
-- =============================================

-- Add device info summary to profiles for quick access
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS current_device_info JSONB;

-- Add index for device info queries
CREATE INDEX IF NOT EXISTS idx_profiles_device_info ON profiles USING GIN (current_device_info);

-- =============================================
-- Analytics Views for Reporting
-- =============================================

-- View: Device usage analytics
CREATE OR REPLACE VIEW device_analytics AS
SELECT 
  device_category,
  device_subcategory,
  screen_size_category,
  is_recommended_device,
  supports_advanced_features,
  is_legacy_device,
  needs_optimization,
  COUNT(*) as user_count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
FROM user_device_info 
GROUP BY 
  device_category,
  device_subcategory,
  screen_size_category,
  is_recommended_device,
  supports_advanced_features,
  is_legacy_device,
  needs_optimization
ORDER BY user_count DESC;

-- View: Recent device sessions
CREATE OR REPLACE VIEW recent_device_sessions AS
SELECT 
  u.id as user_id,
  u.email,
  p.full_name,
  udi.device_description,
  udi.device_category,
  udi.device_subcategory,
  udi.is_recommended_device,
  udi.session_start,
  udi.detected_at
FROM user_device_info udi
JOIN auth.users u ON u.id = udi.user_id
LEFT JOIN profiles p ON p.id = udi.user_id
WHERE udi.session_start >= NOW() - INTERVAL '30 days'
ORDER BY udi.session_start DESC;

-- View: Device compatibility summary
CREATE OR REPLACE VIEW device_compatibility_stats AS
SELECT 
  'Total Users' as metric,
  COUNT(*) as count,
  100.0 as percentage
FROM user_device_info

UNION ALL

SELECT 
  'Recommended Devices' as metric,
  COUNT(*) as count,
  COUNT(*) * 100.0 / (SELECT COUNT(*) FROM user_device_info) as percentage
FROM user_device_info 
WHERE is_recommended_device = true

UNION ALL

SELECT 
  'Legacy Devices' as metric,
  COUNT(*) as count,
  COUNT(*) * 100.0 / (SELECT COUNT(*) FROM user_device_info) as percentage
FROM user_device_info 
WHERE is_legacy_device = true

UNION ALL

SELECT 
  'iPads' as metric,
  COUNT(*) as count,
  COUNT(*) * 100.0 / (SELECT COUNT(*) FROM user_device_info) as percentage
FROM user_device_info 
WHERE device_subcategory = 'ipad';

-- =============================================
-- Sample Queries for Analytics
-- =============================================

/*
-- Top device types
SELECT device_category, COUNT(*) as users
FROM user_device_info 
GROUP BY device_category 
ORDER BY users DESC;

-- iPad usage breakdown
SELECT 
  device_info->>'browser' as browser,
  device_info->>'browserVersion' as version,
  COUNT(*) as users
FROM user_device_info 
WHERE device_subcategory = 'ipad'
GROUP BY device_info->>'browser', device_info->>'browserVersion'
ORDER BY users DESC;

-- Screen size distribution
SELECT 
  screen_size_category,
  AVG((device_info->>'screenWidth')::int) as avg_width,
  AVG((device_info->>'screenHeight')::int) as avg_height,
  COUNT(*) as users
FROM user_device_info 
GROUP BY screen_size_category
ORDER BY users DESC;

-- Legacy device identification
SELECT 
  device_description,
  device_info->>'browser' as browser,
  device_info->>'browserVersion' as version,
  COUNT(*) as users
FROM user_device_info 
WHERE is_legacy_device = true
GROUP BY device_description, device_info->>'browser', device_info->>'browserVersion'
ORDER BY users DESC;
*/