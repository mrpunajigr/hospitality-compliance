-- Add analysis column to delivery_records table for Google Cloud extraction data
ALTER TABLE delivery_records ADD COLUMN analysis JSONB DEFAULT NULL;