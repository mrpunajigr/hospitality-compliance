-- Enhanced Google Document AI Extraction Fields Migration (FIXED VERSION)
-- Adds support for enhanced extraction data including line items, product classification, and confidence scoring
-- FIXED: Removed problematic preset data inserts with non-existent client IDs

-- Add enhanced extraction fields to delivery_records table
ALTER TABLE delivery_records 
ADD COLUMN IF NOT EXISTS extracted_line_items JSONB,
ADD COLUMN IF NOT EXISTS product_classification JSONB,
ADD COLUMN IF NOT EXISTS confidence_scores JSONB,
ADD COLUMN IF NOT EXISTS compliance_analysis JSONB,
ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS item_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS processing_metadata JSONB;

-- Add indexes for performance on new JSONB fields
CREATE INDEX IF NOT EXISTS idx_delivery_records_product_classification 
ON delivery_records USING GIN (product_classification);

CREATE INDEX IF NOT EXISTS idx_delivery_records_extracted_line_items 
ON delivery_records USING GIN (extracted_line_items);

CREATE INDEX IF NOT EXISTS idx_delivery_records_confidence_scores 
ON delivery_records USING GIN (confidence_scores);

CREATE INDEX IF NOT EXISTS idx_delivery_records_compliance_analysis 
ON delivery_records USING GIN (compliance_analysis);

-- Add index on estimated_value for reporting queries
CREATE INDEX IF NOT EXISTS idx_delivery_records_estimated_value 
ON delivery_records (estimated_value);

-- Add index on item_count for analytics
CREATE INDEX IF NOT EXISTS idx_delivery_records_item_count 
ON delivery_records (item_count);

-- Create client_display_configurations table for configurable results system
CREATE TABLE IF NOT EXISTS client_display_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    config_name TEXT DEFAULT 'default',
    is_active BOOLEAN DEFAULT true,
    
    -- Mandatory Fields (Always Shown)
    show_supplier BOOLEAN DEFAULT true,
    show_delivery_date BOOLEAN DEFAULT true,
    show_signed_by BOOLEAN DEFAULT true,
    show_temperature_data BOOLEAN DEFAULT true,
    show_product_classification BOOLEAN DEFAULT true,
    
    -- Optional Fields (Configurable)
    show_invoice_number BOOLEAN DEFAULT false,
    show_items BOOLEAN DEFAULT false,
    show_unit_size BOOLEAN DEFAULT false,
    show_unit_price BOOLEAN DEFAULT false,
    show_sku_code BOOLEAN DEFAULT false,
    show_tax BOOLEAN DEFAULT false,
    show_estimated_value BOOLEAN DEFAULT false,
    show_item_count BOOLEAN DEFAULT false,
    
    -- Display Preferences
    results_card_layout TEXT DEFAULT 'compact' CHECK (results_card_layout IN ('compact', 'detailed', 'minimal')),
    group_by_temperature_category BOOLEAN DEFAULT true,
    show_confidence_scores BOOLEAN DEFAULT false,
    
    -- Business-Specific Settings
    currency_symbol TEXT DEFAULT '$',
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    temperature_unit TEXT DEFAULT 'C',
    
    -- Industry preset reference
    industry_preset TEXT CHECK (industry_preset IN ('restaurant', 'hotel', 'cafe', 'catering', 'custom')) DEFAULT 'restaurant',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint for active configurations per client
CREATE UNIQUE INDEX IF NOT EXISTS idx_client_active_config 
ON client_display_configurations (client_id) 
WHERE is_active = true;

-- Add index for quick config lookups
CREATE INDEX IF NOT EXISTS idx_client_display_config_client_id 
ON client_display_configurations (client_id, is_active);

-- NOTE: Industry preset data will be handled by the API when clients first access configuration
-- This avoids foreign key constraint issues with non-existent client IDs

-- Create enhanced_extraction_analytics table for business intelligence
CREATE TABLE IF NOT EXISTS enhanced_extraction_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    delivery_record_id UUID REFERENCES delivery_records(id) ON DELETE CASCADE,
    
    -- Extraction quality metrics
    overall_confidence DECIMAL(3,2),
    supplier_confidence DECIMAL(3,2),
    date_confidence DECIMAL(3,2),
    temperature_confidence DECIMAL(3,2),
    classification_confidence DECIMAL(3,2),
    
    -- Product analysis
    total_products INTEGER DEFAULT 0,
    frozen_products INTEGER DEFAULT 0,
    chilled_products INTEGER DEFAULT 0,
    ambient_products INTEGER DEFAULT 0,
    unclassified_products INTEGER DEFAULT 0,
    
    -- Value analysis
    estimated_total_value DECIMAL(10,2),
    average_item_value DECIMAL(8,2),
    
    -- Compliance insights
    temperature_violations INTEGER DEFAULT 0,
    compliance_score DECIMAL(3,2),
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    
    -- Processing metadata
    processing_time_ms INTEGER,
    extraction_method TEXT,
    ai_model_version TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_extraction_analytics_client_date 
ON enhanced_extraction_analytics (client_id, created_at);

CREATE INDEX IF NOT EXISTS idx_extraction_analytics_confidence 
ON enhanced_extraction_analytics (overall_confidence);

CREATE INDEX IF NOT EXISTS idx_extraction_analytics_compliance 
ON enhanced_extraction_analytics (compliance_score, risk_level);

-- Add helpful comments
COMMENT ON TABLE client_display_configurations IS 'Configuration settings for customizable delivery docket results display per client';
COMMENT ON TABLE enhanced_extraction_analytics IS 'Analytics and metrics for enhanced Document AI extraction performance and insights';

COMMENT ON COLUMN delivery_records.extracted_line_items IS 'JSONB array of line items extracted with quantities, prices, and SKUs';
COMMENT ON COLUMN delivery_records.product_classification IS 'JSONB object containing products classified by temperature requirements (frozen/chilled/ambient)';
COMMENT ON COLUMN delivery_records.confidence_scores IS 'JSONB object with confidence scores for each extracted field';
COMMENT ON COLUMN delivery_records.compliance_analysis IS 'JSONB object with detailed temperature compliance analysis and violations';
COMMENT ON COLUMN delivery_records.estimated_value IS 'Total estimated value of delivery based on extracted line items';
COMMENT ON COLUMN delivery_records.item_count IS 'Number of individual line items extracted from the document';
COMMENT ON COLUMN delivery_records.processing_metadata IS 'JSONB metadata about the AI processing pipeline and methods used';

-- Update trigger for updated_at on client_display_configurations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_client_display_config_updated_at 
    BEFORE UPDATE ON client_display_configurations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for easy extraction analytics queries
CREATE OR REPLACE VIEW v_extraction_performance AS
SELECT 
    c.name as client_name,
    c.id as client_id,
    COUNT(dr.id) as total_documents,
    AVG(dr.confidence_score) as avg_confidence,
    AVG(CAST(dr.estimated_value AS DECIMAL)) as avg_document_value,
    AVG(dr.item_count) as avg_items_per_document,
    SUM(CASE WHEN (dr.compliance_analysis->>'overallCompliance') = 'violation' THEN 1 ELSE 0 END) as violation_count,
    (SUM(CASE WHEN (dr.compliance_analysis->>'overallCompliance') = 'compliant' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(dr.id), 0)) as compliance_rate
FROM clients c
LEFT JOIN delivery_records dr ON c.id = dr.client_id
WHERE dr.processing_status = 'completed'
    AND dr.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY c.id, c.name;

COMMENT ON VIEW v_extraction_performance IS 'Summary view of extraction performance metrics by client for the last 30 days';

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON client_display_configurations TO authenticated;
GRANT SELECT, INSERT ON enhanced_extraction_analytics TO authenticated;
GRANT SELECT ON v_extraction_performance TO authenticated;

-- Success message
SELECT 'Enhanced Extraction Migration completed successfully! 🚀' as migration_status;