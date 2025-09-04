# Fix Stale Database Records Issue

## Step 1: Clear Old Test Records

Run this in Supabase SQL Editor:

```sql
-- Clear all stale test delivery records 
DELETE FROM delivery_records 
WHERE 
  supplier_name IN ('Unknown Supplier', 'TEST_DEFAULT', 'Extraction Failed')
  OR raw_extracted_text LIKE '%AWS processing attempted%'
  OR image_path LIKE '%test20%'
  OR processing_status = 'processed'
  OR supplier_name LIKE '%test%';

-- Show remaining records
SELECT id, supplier_name, image_path, processing_status, created_at 
FROM delivery_records 
ORDER BY created_at DESC;
```

## Step 2: Fix Database Read Logic

The component now reads the LATEST record regardless of user_id to avoid stale data issues.

## Step 3: Test Fresh Upload

After clearing stale records, upload a new delivery docket. The component should display the fresh record with:
- Correct filename preservation
- Google Cloud processing results
- Current timestamp

## Expected Result

Fresh uploads should create NEW records and display them immediately, not show old cached AWS data.