# Quick Database Cache Clear

## Run this in Supabase SQL Editor:

```sql
DELETE FROM delivery_records 
WHERE 
  image_path LIKE '%test%' 
  OR supplier_name IN ('Unknown Supplier', 'TEST_DEFAULT') 
  OR raw_extracted_text LIKE '%AWS%'
  OR created_at < NOW() - INTERVAL '1 hour';

SELECT COUNT(*) as remaining_records FROM delivery_records;
```

## Then test upload again

After clearing, upload test45_IMG_3250.jpg and click "Test Read" - should show the fresh record with correct filename.