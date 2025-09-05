-- Enhanced Product Analysis Fields - FIXED VERSION
-- Add product classification and line item analysis fields to delivery_records

ALTER TABLE delivery_records 
ADD COLUMN IF NOT EXISTS line_item_analysis JSONB,
ADD COLUMN IF NOT EXISTS distinct_product_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS product_categories JSONB DEFAULT '{
  "frozen": 0,
  "chilled": 0, 
  "ambient": 0,
  "unclassified": 0
}'::jsonb;

-- Update existing records with default values (FIXED for JSONB)
UPDATE delivery_records 
SET 
  distinct_product_count = COALESCE(jsonb_array_length(products), 0),
  product_categories = '{
    "frozen": 0,
    "chilled": 0,
    "ambient": 0, 
    "unclassified": 0
  }'::jsonb
WHERE distinct_product_count IS NULL OR product_categories IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_delivery_records_distinct_count 
  ON delivery_records(distinct_product_count);
  
CREATE INDEX IF NOT EXISTS idx_delivery_records_product_categories 
  ON delivery_records USING GIN(product_categories);

-- Add training corrections for product categories
ALTER TABLE ai_training_corrections
ADD COLUMN IF NOT EXISTS category_corrections JSONB,
ADD COLUMN IF NOT EXISTS line_item_corrections JSONB;

COMMENT ON COLUMN delivery_records.line_item_analysis IS 'Enhanced line item analysis with distinct counts and extraction metadata';
COMMENT ON COLUMN delivery_records.distinct_product_count IS 'Number of distinct products (not quantities)';
COMMENT ON COLUMN delivery_records.product_categories IS 'Product classification counts by temperature category';
COMMENT ON COLUMN ai_training_corrections.category_corrections IS 'Human corrections for product category classifications';
COMMENT ON COLUMN ai_training_corrections.line_item_corrections IS 'Human corrections for line item analysis';

-- Success message
SELECT 'Enhanced product analysis fields added successfully! 🎯' as result;