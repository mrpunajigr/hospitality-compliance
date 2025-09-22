-- Add onboarding progress tracking
-- This helps users resume from where they left off

CREATE TABLE IF NOT EXISTS user_onboarding_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    current_step TEXT NOT NULL DEFAULT 'signup', -- 'signup', 'profile', 'company', 'complete'
    form_data JSONB DEFAULT '{}', -- Store partial form data
    completed_steps TEXT[] DEFAULT ARRAY['signup'], -- Array of completed steps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE NULL,
    
    UNIQUE(user_id)
);

-- Add RLS policies for onboarding progress
ALTER TABLE user_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Users can only see and update their own progress
CREATE POLICY "Users can view own onboarding progress" ON user_onboarding_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding progress" ON user_onboarding_progress
    FOR ALL USING (auth.uid() = user_id);

-- Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_user_onboarding_progress_user_id ON user_onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_progress_current_step ON user_onboarding_progress(current_step);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_onboarding_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_onboarding_progress_updated_at
    BEFORE UPDATE ON user_onboarding_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_onboarding_progress_updated_at();

-- Add some useful helper functions
CREATE OR REPLACE FUNCTION get_user_onboarding_step(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT current_step 
        FROM user_onboarding_progress 
        WHERE user_id = user_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION complete_onboarding_step(user_uuid UUID, step_name TEXT, step_data JSONB DEFAULT '{}')
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO user_onboarding_progress (user_id, current_step, form_data, completed_steps)
    VALUES (
        user_uuid, 
        step_name, 
        step_data,
        CASE 
            WHEN step_name = 'profile' THEN ARRAY['signup', 'profile']
            WHEN step_name = 'company' THEN ARRAY['signup', 'profile', 'company']
            WHEN step_name = 'complete' THEN ARRAY['signup', 'profile', 'company', 'complete']
            ELSE ARRAY[step_name]
        END
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        current_step = EXCLUDED.current_step,
        form_data = EXCLUDED.form_data,
        completed_steps = EXCLUDED.completed_steps,
        updated_at = NOW(),
        completed_at = CASE WHEN EXCLUDED.current_step = 'complete' THEN NOW() ELSE NULL END;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE user_onboarding_progress IS 'Tracks user progress through the onboarding flow';
COMMENT ON COLUMN user_onboarding_progress.current_step IS 'Current step: signup, profile, company, complete';
COMMENT ON COLUMN user_onboarding_progress.form_data IS 'Stores partial form data for resuming';
COMMENT ON COLUMN user_onboarding_progress.completed_steps IS 'Array of completed onboarding steps';