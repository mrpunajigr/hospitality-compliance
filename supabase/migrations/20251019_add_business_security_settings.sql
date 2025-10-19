-- Migration: Add business security settings table
-- Description: Store client-specific security configuration settings
-- Date: 2025-10-19

-- Create business_security_settings table
CREATE TABLE business_security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  setting_key TEXT NOT NULL,
  setting_name TEXT NOT NULL,
  setting_value JSONB,
  category TEXT DEFAULT 'custom' CHECK (category IN ('authentication', 'sessions', 'monitoring', 'access', 'compliance', 'custom')),
  is_enabled BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique setting keys per client
  UNIQUE(client_id, setting_key)
);

-- Create indexes for performance
CREATE INDEX idx_business_security_settings_client_id ON business_security_settings(client_id);
CREATE INDEX idx_business_security_settings_category ON business_security_settings(category);
CREATE INDEX idx_business_security_settings_enabled ON business_security_settings(is_enabled);

-- Enable RLS
ALTER TABLE business_security_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_security_settings
CREATE POLICY "Users can view security settings for their client"
ON business_security_settings FOR SELECT
USING (
  client_id IN (
    SELECT client_id FROM client_users 
    WHERE user_id = auth.uid()
    AND status = 'active'
  )
);

CREATE POLICY "Managers and above can manage security settings"
ON business_security_settings FOR ALL
USING (
  client_id IN (
    SELECT client_id FROM client_users 
    WHERE user_id = auth.uid() 
    AND role IN ('MANAGER', 'OWNER', 'CHAMPION')
    AND status = 'active'
  )
)
WITH CHECK (
  client_id IN (
    SELECT client_id FROM client_users 
    WHERE user_id = auth.uid() 
    AND role IN ('MANAGER', 'OWNER', 'CHAMPION')
    AND status = 'active'
  )
);

-- Insert default security settings for existing clients
INSERT INTO business_security_settings (client_id, setting_key, setting_name, setting_value, category, is_enabled)
SELECT 
  id as client_id,
  'audit_logging' as setting_key,
  'Enhanced Audit Logs' as setting_name,
  'true' as setting_value,
  'compliance' as category,
  true as is_enabled
FROM clients
ON CONFLICT (client_id, setting_key) DO NOTHING;

INSERT INTO business_security_settings (client_id, setting_key, setting_name, setting_value, category, is_enabled)
SELECT 
  id as client_id,
  'password_complexity' as setting_key,
  'Strong Passwords' as setting_name,
  'true' as setting_value,
  'authentication' as category,
  true as is_enabled
FROM clients
ON CONFLICT (client_id, setting_key) DO NOTHING;

INSERT INTO business_security_settings (client_id, setting_key, setting_name, setting_value, category, is_enabled)
SELECT 
  id as client_id,
  'login_monitoring' as setting_key,
  'Login Monitoring' as setting_name,
  'true' as setting_value,
  'monitoring' as category,
  true as is_enabled
FROM clients
ON CONFLICT (client_id, setting_key) DO NOTHING;

-- Add comments
COMMENT ON TABLE business_security_settings IS 'Client-specific security configuration settings';
COMMENT ON COLUMN business_security_settings.setting_key IS 'Unique identifier for the setting type';
COMMENT ON COLUMN business_security_settings.setting_name IS 'Human-readable name for the setting';
COMMENT ON COLUMN business_security_settings.setting_value IS 'JSON value for the setting (can be boolean, string, number, object)';
COMMENT ON COLUMN business_security_settings.category IS 'Category grouping for organization';
COMMENT ON COLUMN business_security_settings.is_enabled IS 'Whether this security setting is currently active';

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_business_security_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_security_settings_updated_at
  BEFORE UPDATE ON business_security_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_business_security_settings_updated_at();