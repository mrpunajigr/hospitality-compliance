-- =====================================================
-- INVESTIGATE OCR DATA QUALITY ISSUES
-- Comprehensive analysis of recent delivery records extraction data
-- =====================================================

-- Show the most recent delivery records with all OCR/AI extraction fields
SELECT 
    '=== MOST RECENT DELIVERY RECORDS ===' as section,
    id,
    client_id,
    supplier_name,
    docket_number,
    delivery_date,
    image_path,
    processing_status,
    confidence_score,
    created_at,
    updated_at
FROM delivery_records 
ORDER BY created_at DESC 
LIMIT 5;

-- Show detailed extraction data for the most recent record
SELECT 
    '=== RAW EXTRACTED TEXT ===' as section,
    id,
    raw_extracted_text
FROM delivery_records 
WHERE raw_extracted_text IS NOT NULL
ORDER BY created_at DESC 
LIMIT 3;

-- Show products data (legacy field)
SELECT 
    '=== LEGACY PRODUCTS FIELD ===' as section,
    id,
    products,
    supplier_name,
    created_at
FROM delivery_records 
WHERE products IS NOT NULL
ORDER BY created_at DESC 
LIMIT 3;

-- Show extracted temperatures (legacy field)
SELECT 
    '=== EXTRACTED TEMPERATURES ===' as section,
    id,
    extracted_temperatures,
    supplier_name,
    created_at
FROM delivery_records 
WHERE extracted_temperatures IS NOT NULL
ORDER BY created_at DESC 
LIMIT 3;

-- Show enhanced extraction fields (new fields)
SELECT 
    '=== ENHANCED EXTRACTION FIELDS ===' as section,
    id,
    extracted_line_items,
    product_classification,
    confidence_scores,
    compliance_analysis,
    estimated_value,
    item_count,
    processing_metadata,
    supplier_name,
    created_at
FROM delivery_records 
WHERE extracted_line_items IS NOT NULL 
   OR product_classification IS NOT NULL
   OR confidence_scores IS NOT NULL
ORDER BY created_at DESC 
LIMIT 3;

-- Show temperature readings table data
SELECT 
    '=== TEMPERATURE READINGS TABLE ===' as section,
    tr.id,
    tr.delivery_record_id,
    tr.temperature_value,
    tr.temperature_unit,
    tr.product_type,
    tr.is_compliant,
    tr.risk_level,
    tr.context,
    dr.supplier_name,
    tr.extracted_at
FROM temperature_readings tr
JOIN delivery_records dr ON tr.delivery_record_id = dr.id
ORDER BY tr.extracted_at DESC 
LIMIT 10;

-- Show compliance alerts for recent records
SELECT 
    '=== COMPLIANCE ALERTS ===' as section,
    ca.id,
    ca.delivery_record_id,
    ca.alert_type,
    ca.severity,
    ca.temperature_value,
    ca.supplier_name as alert_supplier_name,
    ca.message,
    dr.supplier_name as record_supplier_name,
    ca.created_at
FROM compliance_alerts ca
JOIN delivery_records dr ON ca.delivery_record_id = dr.id
ORDER BY ca.created_at DESC 
LIMIT 5;

-- Show error messages and processing issues
SELECT 
    '=== PROCESSING ERRORS ===' as section,
    id,
    supplier_name,
    processing_status,
    error_message,
    confidence_score,
    created_at
FROM delivery_records 
WHERE error_message IS NOT NULL 
   OR processing_status = 'failed'
ORDER BY created_at DESC 
LIMIT 5;

-- Analyze extraction data completeness for recent records
SELECT 
    '=== EXTRACTION COMPLETENESS ANALYSIS ===' as section,
    COUNT(*) as total_records,
    COUNT(raw_extracted_text) as has_raw_text,
    COUNT(supplier_name) as has_supplier_name,
    COUNT(docket_number) as has_docket_number,
    COUNT(delivery_date) as has_delivery_date,
    COUNT(products) as has_products_legacy,
    COUNT(extracted_temperatures) as has_temperatures_legacy,
    COUNT(extracted_line_items) as has_line_items_new,
    COUNT(product_classification) as has_classification_new,
    COUNT(confidence_scores) as has_confidence_scores,
    COUNT(compliance_analysis) as has_compliance_analysis,
    AVG(confidence_score) as avg_confidence_score
FROM delivery_records 
WHERE created_at >= NOW() - INTERVAL '7 days';

-- Show the JSON structure of extracted data for the most recent record
SELECT 
    '=== JSON STRUCTURE ANALYSIS ===' as section,
    id,
    supplier_name,
    -- Extract specific keys from products JSONB if it exists
    CASE 
        WHEN products IS NOT NULL THEN jsonb_pretty(products)
        ELSE 'NULL'
    END as products_structure,
    -- Extract specific keys from extracted_temperatures if it exists  
    CASE 
        WHEN extracted_temperatures IS NOT NULL THEN jsonb_pretty(extracted_temperatures)
        ELSE 'NULL'
    END as temperatures_structure,
    -- Extract specific keys from extracted_line_items if it exists
    CASE 
        WHEN extracted_line_items IS NOT NULL THEN jsonb_pretty(extracted_line_items)
        ELSE 'NULL'
    END as line_items_structure,
    created_at
FROM delivery_records 
ORDER BY created_at DESC 
LIMIT 1;

-- Check if "Fresh Dairy Co." appears in any fields
SELECT 
    '=== FRESH DAIRY CO SEARCH ===' as section,
    id,
    supplier_name,
    raw_extracted_text LIKE '%Fresh Dairy Co%' as in_raw_text,
    products::text LIKE '%Fresh Dairy Co%' as in_products,
    extracted_temperatures::text LIKE '%Fresh Dairy Co%' as in_temperatures,
    COALESCE(extracted_line_items::text LIKE '%Fresh Dairy Co%', false) as in_line_items,
    created_at
FROM delivery_records 
WHERE supplier_name LIKE '%Fresh Dairy%'
   OR raw_extracted_text LIKE '%Fresh Dairy%'
   OR products::text LIKE '%Fresh Dairy%'
   OR extracted_temperatures::text LIKE '%Fresh Dairy%'
   OR COALESCE(extracted_line_items::text LIKE '%Fresh Dairy%', false)
ORDER BY created_at DESC;