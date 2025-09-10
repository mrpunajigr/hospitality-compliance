SELECT 
    supplier,
    delivery_date,
    item_count,
    confidence_score,
    processing_status,
    LEFT(raw_extracted_text, 1000) as extraction_preview,
    created_at
FROM delivery_records 
ORDER BY created_at DESC 
LIMIT 2;