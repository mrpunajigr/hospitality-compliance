-- Add TEST mode infrastructure to support live testing with easy cleanup
-- This replaces DEMO mode with proper database operations tagged for testing

-- Add test mode fields to delivery_records
ALTER TABLE delivery_records 
ADD COLUMN test_mode BOOLEAN DEFAULT FALSE,
ADD COLUMN test_session_id TEXT;

-- Add indexes for efficient test data queries
CREATE INDEX idx_delivery_records_test_mode ON delivery_records(test_mode);
CREATE INDEX idx_delivery_records_test_session ON delivery_records(test_session_id);

-- Add comment documentation
COMMENT ON COLUMN delivery_records.test_mode IS 'Marks records as test data for easy bulk deletion';
COMMENT ON COLUMN delivery_records.test_session_id IS 'Groups test records by session for batch operations';

-- Update RLS policies to handle test mode (optional - for future security)
-- Test records are still subject to the same client access controls

-- Add test mode fields to temperature_readings (inherited via foreign key cascade)
-- No changes needed - when parent delivery_record is deleted, temperature_readings cascade automatically

-- Add test mode to compliance_alerts (for future Phase 3)
ALTER TABLE compliance_alerts 
ADD COLUMN test_mode BOOLEAN DEFAULT FALSE,
ADD COLUMN test_session_id TEXT;

CREATE INDEX idx_compliance_alerts_test_mode ON compliance_alerts(test_mode);
CREATE INDEX idx_compliance_alerts_test_session ON compliance_alerts(test_session_id);

COMMENT ON COLUMN compliance_alerts.test_mode IS 'Marks alerts as test data for easy bulk deletion';
COMMENT ON COLUMN compliance_alerts.test_session_id IS 'Groups test alerts by session for batch operations';