-- Add analysis column to delivery_records table for Google Cloud extraction data
ALTER TABLE delivery_records ADD COLUMN IF NOT EXISTS analysis JSONB DEFAULT NULL;