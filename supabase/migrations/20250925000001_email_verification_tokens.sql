-- Email Verification Tokens Table
-- Replaces temporary password system with secure email verification

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    used_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);

-- Add email_verified field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE NULL;

-- Add onboarding-related fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS job_title TEXT NULL,
ADD COLUMN IF NOT EXISTS preferred_name TEXT NULL,
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"emailAlerts": true, "complianceReminders": true, "weeklyReports": false}'::jsonb;

-- Add business_type to clients table if not exists (for onboarding)
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'restaurant';

-- RLS policies for email_verification_tokens
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only see their own verification tokens
CREATE POLICY "Users can view own verification tokens" ON email_verification_tokens
    FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all verification tokens
CREATE POLICY "Service role can manage verification tokens" ON email_verification_tokens
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Update trigger for email_verification_tokens
CREATE OR REPLACE FUNCTION update_email_verification_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_verification_tokens_updated_at
    BEFORE UPDATE ON email_verification_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_email_verification_tokens_updated_at();

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_verification_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM email_verification_tokens 
    WHERE expires_at < NOW() - INTERVAL '1 day';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE email_verification_tokens IS 'Stores secure tokens for email verification, replacing temporary password system';
COMMENT ON COLUMN email_verification_tokens.token IS 'Cryptographically secure verification token';
COMMENT ON COLUMN email_verification_tokens.expires_at IS 'Token expiration time (24 hours from creation)';
COMMENT ON COLUMN email_verification_tokens.used_at IS 'Timestamp when token was successfully used';
COMMENT ON COLUMN profiles.email_verified IS 'Whether user has verified their email address';
COMMENT ON COLUMN profiles.job_title IS 'User job title from onboarding';
COMMENT ON COLUMN profiles.preferred_name IS 'User preferred display name';
COMMENT ON COLUMN profiles.notification_preferences IS 'JSON object storing email notification preferences';