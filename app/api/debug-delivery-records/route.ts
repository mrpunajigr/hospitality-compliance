import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create both regular and admin clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request: Request) {
  try {
    console.log('🔍 Debug Delivery Records API called')

    // Test 1: Count all delivery records (admin)
    const { count: totalCount, error: countError } = await supabaseAdmin
      .from('delivery_records')
      .select('*', { count: 'exact', head: true })

    console.log('🔍 Total delivery records count:', totalCount, 'Error:', countError)

    // Test 2: Get all delivery records with ALL OCR fields (admin) 
    const { data: allRecords, error: allRecordsError } = await supabaseAdmin
      .from('delivery_records')
      .select(`
        id,
        client_id,
        user_id,
        supplier_name,
        docket_number,
        delivery_date,
        image_path,
        raw_extracted_text,
        products,
        extracted_temperatures,
        extracted_line_items,
        product_classification,
        confidence_scores,
        compliance_analysis,
        estimated_value,
        item_count,
        processing_metadata,
        processing_status,
        confidence_score,
        error_message,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    console.log('🔍 All records (admin):', allRecords, 'Error:', allRecordsError)

    // Test 3: Try with regular client (what dashboard uses)
    const { data: regularRecords, error: regularError } = await supabase
      .from('delivery_records')
      .select(`
        id,
        supplier_name,
        status,
        created_at,
        analysis,
        extraction_data,
        file_url
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    console.log('🔍 Regular client records:', regularRecords, 'Error:', regularError)

    // Test 4: Search for "Fresh Dairy Co." specifically
    const { data: freshDairyRecords, error: freshDairyError } = await supabaseAdmin
      .from('delivery_records')
      .select('*')
      .or(`supplier_name.ilike.%Fresh Dairy%,raw_extracted_text.ilike.%Fresh Dairy%`)
      .order('created_at', { ascending: false })

    console.log('🔍 Fresh Dairy records found:', freshDairyRecords?.length, 'Error:', freshDairyError)

    // Test 5: Get temperature readings from separate table
    const { data: temperatureReadings, error: tempError } = await supabaseAdmin
      .from('temperature_readings')
      .select(`
        *,
        delivery_records!inner(supplier_name, created_at)
      `)
      .order('extracted_at', { ascending: false })
      .limit(10)

    console.log('🔍 Temperature readings found:', temperatureReadings?.length, 'Error:', tempError)

    // Test 6: Check table structure with full sample
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('delivery_records')
      .select('*')
      .limit(1)

    console.log('🔍 Table structure sample:', tableInfo, 'Error:', tableError)

    return NextResponse.json({
      success: true,
      debug: {
        totalCount: {
          count: totalCount,
          error: countError
        },
        allRecords: {
          data: allRecords,
          count: allRecords?.length || 0,
          error: allRecordsError
        },
        regularRecords: {
          data: regularRecords,
          count: regularRecords?.length || 0,
          error: regularError
        },
        freshDairyRecords: {
          data: freshDairyRecords,
          count: freshDairyRecords?.length || 0,
          error: freshDairyError
        },
        temperatureReadings: {
          data: temperatureReadings,
          count: temperatureReadings?.length || 0,
          error: tempError
        },
        tableInfo: {
          data: tableInfo,
          error: tableError
        }
      },
      investigation_notes: {
        purpose: "OCR Data Quality Investigation",
        focus: "Looking for Fresh Dairy Co. extraction and data structure",
        fields_checked: [
          "raw_extracted_text", "supplier_name", "products", "extracted_temperatures",
          "extracted_line_items", "product_classification", "confidence_scores",
          "compliance_analysis", "processing_metadata"
        ]
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('🔍 Debug API Error:', error)
    const err = error as Error
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        details: err?.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}