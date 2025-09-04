-- Check what Google Cloud Document AI actually extracted
SELECT 
  id,
  supplier_name,
  delivery_date,
  image_path,
  LEFT(raw_extracted_text, 200) as text_preview,
  LENGTH(raw_extracted_text) as text_length,
  processing_status,
  created_at
FROM delivery_records 
ORDER BY created_at DESC 
LIMIT 3;