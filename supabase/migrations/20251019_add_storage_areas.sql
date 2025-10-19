-- Migration: Add storage_areas table for business storage area configuration
-- Date: 2025-10-19
-- Description: Creates table to manage storage areas within businesses (fridges, freezers, pantries, etc.)

-- Create storage_areas table
CREATE TABLE IF NOT EXISTS public.storage_areas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    area_type VARCHAR(20) NOT NULL CHECK (area_type IN ('pantry', 'storeroom', 'fridge', 'freezer', 'chiller', 'underbench', 'other')),
    temperature_min DECIMAL(5,2),
    temperature_max DECIMAL(5,2),
    location_description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_storage_areas_client_id ON public.storage_areas(client_id);
CREATE INDEX IF NOT EXISTS idx_storage_areas_area_type ON public.storage_areas(area_type);
CREATE INDEX IF NOT EXISTS idx_storage_areas_is_active ON public.storage_areas(is_active);
CREATE INDEX IF NOT EXISTS idx_storage_areas_created_at ON public.storage_areas(created_at);

-- Add unique constraint to prevent duplicate storage area names per client
CREATE UNIQUE INDEX IF NOT EXISTS idx_storage_areas_client_name_unique 
ON public.storage_areas(client_id, LOWER(name)) 
WHERE is_active = true;

-- Enable RLS (Row Level Security)
ALTER TABLE public.storage_areas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Users can view storage areas for their client
CREATE POLICY "Users can view their client's storage areas"
ON public.storage_areas FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.client_users cu
        WHERE cu.client_id = storage_areas.client_id
        AND cu.user_id = auth.uid()
        AND cu.status = 'active'
    )
);

-- Policy: Owners and Managers can insert storage areas
CREATE POLICY "Owners and Managers can create storage areas"
ON public.storage_areas FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.client_users cu
        WHERE cu.client_id = storage_areas.client_id
        AND cu.user_id = auth.uid()
        AND cu.role IN ('OWNER', 'MANAGER')
        AND cu.status = 'active'
    )
);

-- Policy: Owners and Managers can update storage areas
CREATE POLICY "Owners and Managers can update storage areas"
ON public.storage_areas FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.client_users cu
        WHERE cu.client_id = storage_areas.client_id
        AND cu.user_id = auth.uid()
        AND cu.role IN ('OWNER', 'MANAGER')
        AND cu.status = 'active'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.client_users cu
        WHERE cu.client_id = storage_areas.client_id
        AND cu.user_id = auth.uid()
        AND cu.role IN ('OWNER', 'MANAGER')
        AND cu.status = 'active'
    )
);

-- Policy: Only Owners can delete storage areas
CREATE POLICY "Only Owners can delete storage areas"
ON public.storage_areas FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.client_users cu
        WHERE cu.client_id = storage_areas.client_id
        AND cu.user_id = auth.uid()
        AND cu.role = 'OWNER'
        AND cu.status = 'active'
    )
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_storage_areas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_storage_areas_updated_at_trigger
    BEFORE UPDATE ON public.storage_areas
    FOR EACH ROW
    EXECUTE PROCEDURE update_storage_areas_updated_at();

-- Add temperature validation constraint
ALTER TABLE public.storage_areas 
ADD CONSTRAINT check_temperature_range 
CHECK (
    (temperature_min IS NULL AND temperature_max IS NULL) OR 
    (temperature_min IS NOT NULL AND temperature_max IS NOT NULL AND temperature_min <= temperature_max)
);

-- Insert default storage areas for existing clients (optional - run manually if needed)
-- This can be run after the migration to populate default storage areas for existing businesses

/*
-- Example: Insert default storage areas for a specific client
INSERT INTO public.storage_areas (client_id, name, area_type, temperature_min, temperature_max, created_by) VALUES
('client-uuid-here', 'Main Fridge', 'fridge', 0, 4, 'user-uuid-here'),
('client-uuid-here', 'Freezer', 'freezer', -20, -15, 'user-uuid-here'),
('client-uuid-here', 'Pantry', 'pantry', 15, 25, 'user-uuid-here'),
('client-uuid-here', 'Walk-in Chiller', 'chiller', 0, 4, 'user-uuid-here')
ON CONFLICT (client_id, LOWER(name)) WHERE is_active = true DO NOTHING;
*/

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.storage_areas TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.storage_areas IS 'Storage areas within businesses for temperature monitoring and compliance';
COMMENT ON COLUMN public.storage_areas.area_type IS 'Type of storage area: pantry, storeroom, fridge, freezer, chiller, underbench, other';
COMMENT ON COLUMN public.storage_areas.temperature_min IS 'Minimum temperature threshold in Celsius';
COMMENT ON COLUMN public.storage_areas.temperature_max IS 'Maximum temperature threshold in Celsius';
COMMENT ON COLUMN public.storage_areas.location_description IS 'Optional description of the storage area location';
COMMENT ON COLUMN public.storage_areas.is_active IS 'Whether this storage area is currently active/in use';