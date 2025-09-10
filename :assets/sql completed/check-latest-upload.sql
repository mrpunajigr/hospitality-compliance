-- Check latest upload data with all available fields
SELECT 
  id,
  supplier_name,
  delivery_date,
  created_at,
  image_path,
  analysis,
  extraction_data,
  line_items,
  temperature_reading,
  handwritten_notes
FROM delivery_records 
ORDER BY created_at DESC 
LIMIT 1;