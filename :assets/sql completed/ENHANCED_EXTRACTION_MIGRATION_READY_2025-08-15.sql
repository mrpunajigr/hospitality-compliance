-- Enhanced Google Cloud AI Extraction Fields Migration
-- Adds comprehensive extraction fields for multi-stage Document AI processing
-- Supports: Product classification, confidence scoring, compliance analysis

-- =====================================================
-- ADD ENHANCED EXTRACTION FIELDS TO DELIVERY_RECORDS
-- =====================================================

-- Enhanced line items with detailed product information
ALTER TABLE delivery_records 
ADD COLUMN IF NOT EXISTS extracted_line_items JSONB DEFAULT NULL;

-- Product classification results from classification engine
ALTER TABLE delivery_records 
ADD COLUMN IF NOT EXISTS product_classification JSONB DEFAULT NULL;

-- Detailed confidence scores for all extraction components
ALTER TABLE delivery_records 
ADD COLUMN IF NOT EXISTS confidence_scores JSONB DEFAULT NULL;

-- Temperature compliance analysis with violation details
ALTER TABLE delivery_records 
ADD COLUMN IF NOT EXISTS compliance_analysis JSONB DEFAULT NULL;

-- Estimated total value of delivery from line items
ALTER TABLE delivery_records 
ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(10,2) DEFAULT NULL;

-- Total count of line items found in document
ALTER TABLE delivery_records 
ADD COLUMN IF NOT EXISTS item_count INTEGER DEFAULT NULL;

-- Processing metadata including stages, timing, model version
ALTER TABLE delivery_records 
ADD COLUMN IF NOT EXISTS processing_metadata JSONB DEFAULT NULL;

-- =====================================================
-- ADD PERFORMANCE INDEXES FOR ENHANCED FIELDS
-- =====================================================

-- Index for product classification queries
CREATE INDEX IF NOT EXISTS idx_delivery_records_product_classification 
ON delivery_records USING GIN (product_classification);

-- Index for compliance analysis queries  
CREATE INDEX IF NOT EXISTS idx_delivery_records_compliance_analysis
ON delivery_records USING GIN (compliance_analysis);

-- Index for estimated value queries (for reporting)
CREATE INDEX IF NOT EXISTS idx_delivery_records_estimated_value
ON delivery_records (estimated_value) WHERE estimated_value IS NOT NULL;

-- Index for item count queries
CREATE INDEX IF NOT EXISTS idx_delivery_records_item_count
ON delivery_records (item_count) WHERE item_count IS NOT NULL;

-- Composite index for enhanced extraction queries
CREATE INDEX IF NOT EXISTS idx_delivery_records_enhanced_extraction
ON delivery_records (client_id, processing_status, estimated_value, item_count)
WHERE product_classification IS NOT NULL;

-- =====================================================
-- ADD COLUMN COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN delivery_records.extracted_line_items IS 
'JSONB array of detailed line items extracted from delivery docket with quantities, prices, categories, and confidence scores';

COMMENT ON COLUMN delivery_records.product_classification IS 
'JSONB object containing product classification results including categories, temperature requirements, and compliance rules';

COMMENT ON COLUMN delivery_records.confidence_scores IS 
'JSONB object with confidence scores for supplier, date, temperature, classification, and overall extraction quality';

COMMENT ON COLUMN delivery_records.compliance_analysis IS 
'JSONB object containing temperature compliance analysis, violations, risk levels, and recommended actions';

COMMENT ON COLUMN delivery_records.estimated_value IS 
'Estimated total monetary value of delivery calculated from extracted line items and pricing';

COMMENT ON COLUMN delivery_records.item_count IS 
'Total number of distinct line items/products identified in the delivery docket';

COMMENT ON COLUMN delivery_records.processing_metadata IS 
'JSONB object with processing pipeline metadata including stages completed, timing, AI model versions, and extraction methods';

-- =====================================================
-- ENHANCED EXTRACTION ANALYTICS TABLE
-- =====================================================

-- Create analytics table for tracking extraction performance
CREATE TABLE IF NOT EXISTS enhanced_extraction_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    date_period DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Extraction performance metrics
    total_documents_processed INTEGER DEFAULT 0,
    average_confidence_score DECIMAL(4,3) DEFAULT NULL,
    extraction_success_rate DECIMAL(4,3) DEFAULT NULL,
    
    -- Product classification metrics
    product_categories_detected JSONB DEFAULT NULL,
    classification_accuracy DECIMAL(4,3) DEFAULT NULL,
    
    -- Compliance metrics
    temperature_violations_detected INTEGER DEFAULT 0,
    compliance_score DECIMAL(4,3) DEFAULT NULL,
    
    -- Performance metrics
    average_processing_time_ms INTEGER DEFAULT NULL,
    total_line_items_extracted INTEGER DEFAULT 0,
    total_estimated_value DECIMAL(12,2) DEFAULT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(client_id, date_period)
);

-- Enable RLS on analytics table
ALTER TABLE enhanced_extraction_analytics ENABLE ROW LEVEL SECURITY;

-- Analytics table policies
CREATE POLICY "Users can view own client analytics" ON enhanced_extraction_analytics
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM client_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "System can manage analytics" ON enhanced_extraction_analytics
    FOR ALL USING (true);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_enhanced_analytics_client_date
ON enhanced_extraction_analytics (client_id, date_period DESC);

-- =====================================================
-- VALIDATION FUNCTIONS
-- =====================================================

-- Function to validate enhanced extraction data integrity
CREATE OR REPLACE FUNCTION validate_enhanced_extraction_data()
RETURNS TABLE(
    table_name TEXT,
    validation_check TEXT,
    status TEXT,
    record_count BIGINT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    -- Check delivery records with enhanced fields
    RETURN QUERY
    SELECT 
        'delivery_records'::TEXT,
        'Records with enhanced extraction data'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN '✅ FOUND' ELSE '⚠️ NONE' END,
        COUNT(*)
    FROM delivery_records 
    WHERE product_classification IS NOT NULL;
    
    -- Check confidence score validity
    RETURN QUERY
    SELECT 
        'delivery_records'::TEXT,
        'Valid confidence scores (0.0-1.0)'::TEXT,
        CASE 
            WHEN COUNT(*) = 0 THEN '✅ ALL VALID'
            ELSE '❌ INVALID FOUND'
        END,
        COUNT(*)
    FROM delivery_records dr
    WHERE confidence_scores IS NOT NULL
    AND (
        (confidence_scores->>'overall')::DECIMAL < 0.0 OR 
        (confidence_scores->>'overall')::DECIMAL > 1.0
    );
    
    -- Check analytics data
    RETURN QUERY
    SELECT 
        'enhanced_extraction_analytics'::TEXT,
        'Analytics records available'::TEXT,
        CASE WHEN COUNT(*) > 0 THEN '✅ FOUND' ELSE '⚠️ NONE' END,
        COUNT(*)
    FROM enhanced_extraction_analytics;
    
END $$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION validate_enhanced_extraction_data() TO authenticated;

-- =====================================================
-- SUCCESS VERIFICATION
-- =====================================================

-- Verify migration completed successfully
DO $$
DECLARE
    column_count INTEGER;
    index_count INTEGER;
    analytics_exists BOOLEAN;
BEGIN
    -- Check all enhanced columns exist
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns 
    WHERE table_name = 'delivery_records' 
    AND column_name IN (
        'extracted_line_items', 'product_classification', 'confidence_scores',
        'compliance_analysis', 'estimated_value', 'item_count', 'processing_metadata'
    );
    
    -- Check indexes created
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE tablename = 'delivery_records'
    AND indexname LIKE 'idx_delivery_records_%classification%'
    OR indexname LIKE 'idx_delivery_records_%compliance%'
    OR indexname LIKE 'idx_delivery_records_%enhanced%';
    
    -- Check analytics table exists
    SELECT EXISTS(
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'enhanced_extraction_analytics'
    ) INTO analytics_exists;
    
    -- Report results
    RAISE NOTICE '📊 Enhanced Extraction Migration Results:';
    RAISE NOTICE '   Enhanced columns added: % of 7', column_count;
    RAISE NOTICE '   Performance indexes created: %', index_count;  
    RAISE NOTICE '   Analytics table created: %', CASE WHEN analytics_exists THEN '✅' ELSE '❌' END;
    RAISE NOTICE '';
    
    IF column_count = 7 AND index_count >= 3 AND analytics_exists THEN
        RAISE NOTICE '🎉 Enhanced Google Cloud AI extraction migration completed successfully!';
        RAISE NOTICE '📈 Ready for advanced document processing with product classification and compliance analysis';
    ELSE
        RAISE NOTICE '⚠️ Migration incomplete - review results above';
    END IF;
END $$;

-- Final success message
SELECT 'Enhanced Extraction Migration Completed! 🚀' as migration_status;