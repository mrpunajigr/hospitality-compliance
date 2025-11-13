-- Add Barcode Field to Existing inventory_items Table
-- Date: 2025-11-13
-- Purpose: Add universal barcode support (UPC/EAN/GTIN)
-- Run this in: Supabase Table Editor SQL Editor

-- Step 1: Add barcode column to inventory_items
ALTER TABLE inventory_items 
ADD COLUMN barcode VARCHAR(20);

-- Step 2: Add comment explaining the field
COMMENT ON COLUMN inventory_items.barcode IS 'Universal product barcode (UPC/EAN/GTIN) - same across all vendors';

-- Step 3: Create index for fast barcode lookups
CREATE INDEX idx_inventory_items_barcode 
ON inventory_items(barcode) 
WHERE barcode IS NOT NULL;

-- Step 4: Create unique constraint (barcode must be unique per client)
CREATE UNIQUE INDEX idx_inventory_items_client_barcode 
ON inventory_items(client_id, barcode) 
WHERE barcode IS NOT NULL;

-- Verify the change
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'inventory_items'
  AND column_name = 'barcode';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Barcode field added successfully!';
  RAISE NOTICE '📦 Field: inventory_items.barcode (VARCHAR 20)';
  RAISE NOTICE '🔍 Indexes: Created for fast lookups';
  RAISE NOTICE '🔒 Constraint: Unique per client';
END $$;
