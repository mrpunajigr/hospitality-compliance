-- Add extracted_temperatures field to delivery_records for Phase 2 simplification
-- This stores the raw extracted temperature data before Phase 3 compliance processing

ALTER TABLE delivery_records 
ADD COLUMN extracted_temperatures JSONB;

-- Add comment for documentation
COMMENT ON COLUMN delivery_records.extracted_temperatures IS 'Raw temperature data extracted from OCR (Phase 2). Contains array of {value, unit, context} objects.';