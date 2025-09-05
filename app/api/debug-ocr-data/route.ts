import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create admin client with service role key
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
    console.log('🔍 OCR Data Investigation - Debug API called')

    // Test 1: Get most recent delivery records with ALL OCR fields
    const { data: recentRecords, error: recentError } = await supabaseAdmin
      .from('delivery_records')
      .select(`
        id,
        client_id,
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

    console.log('🔍 Recent records with all OCR fields:', recentRecords?.length, 'Error:', recentError)

    // Test 2: Look for "Fresh Dairy Co." specifically
    const { data: freshDairyRecords, error: freshDairyError } = await supabaseAdmin
      .from('delivery_records')
      .select('*')
      .or(`supplier_name.ilike.%Fresh Dairy%,raw_extracted_text.ilike.%Fresh Dairy%`)
      .order('created_at', { ascending: false })

    console.log('🔍 Fresh Dairy records found:', freshDairyRecords?.length, 'Error:', freshDairyError)

    // Test 3: Get temperature readings table data
    const { data: temperatureReadings, error: tempError } = await supabaseAdmin
      .from('temperature_readings')
      .select(`
        *,
        delivery_records!inner(supplier_name, created_at)
      `)
      .order('extracted_at', { ascending: false })
      .limit(10)

    console.log('🔍 Temperature readings found:', temperatureReadings?.length, 'Error:', tempError)

    // Test 4: Get compliance alerts
    const { data: complianceAlerts, error: alertsError } = await supabaseAdmin
      .from('compliance_alerts')
      .select(`
        *,
        delivery_records!inner(supplier_name, created_at)
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    console.log('🔍 Compliance alerts found:', complianceAlerts?.length, 'Error:', alertsError)

    // Test 5: Analyze data completeness  
    let dataStats = null
    let statsError = null
    try {
      const { data, error } = await supabaseAdmin
        .rpc('analyze_extraction_completeness')
      dataStats = data
      statsError = error
    } catch (error) {
      // If function doesn't exist, set error for manual analysis fallback
      statsError = error as any
    }

    // Test 6: Check for processing errors
    const { data: errorRecords, error: errorQueryError } = await supabaseAdmin
      .from('delivery_records')
      .select('id, supplier_name, processing_status, error_message, confidence_score, created_at')
      .or('processing_status.eq.failed,error_message.is.not.null')
      .order('created_at', { ascending: false })

    // Manual analysis if RPC doesn't exist
    let extractionAnalysis = null
    if (recentRecords && recentRecords.length > 0) {
      extractionAnalysis = {
        total_records: recentRecords.length,
        has_raw_text: recentRecords.filter(r => r.raw_extracted_text).length,
        has_supplier_name: recentRecords.filter(r => r.supplier_name).length,
        has_docket_number: recentRecords.filter(r => r.docket_number).length,
        has_delivery_date: recentRecords.filter(r => r.delivery_date).length,
        has_products_legacy: recentRecords.filter(r => r.products).length,
        has_temperatures_legacy: recentRecords.filter(r => r.extracted_temperatures).length,
        has_line_items_new: recentRecords.filter(r => r.extracted_line_items).length,
        has_classification_new: recentRecords.filter(r => r.product_classification).length,
        has_confidence_scores: recentRecords.filter(r => r.confidence_scores).length,
        has_compliance_analysis: recentRecords.filter(r => r.compliance_analysis).length,
        avg_confidence_score: recentRecords
          .filter(r => r.confidence_score !== null)
          .reduce((acc, r, _, arr) => acc + (r.confidence_score || 0) / arr.length, 0)
      }
    }

    return NextResponse.json({
      success: true,
      investigation: {
        // Most recent records with all OCR data
        recentRecords: {
          data: recentRecords,
          count: recentRecords?.length || 0,
          error: recentError
        },

        // Specific search for Fresh Dairy Co
        freshDairyRecords: {
          data: freshDairyRecords,
          count: freshDairyRecords?.length || 0,  
          error: freshDairyError
        },

        // Temperature readings from separate table
        temperatureReadings: {
          data: temperatureReadings,
          count: temperatureReadings?.length || 0,
          error: tempError
        },

        // Compliance alerts
        complianceAlerts: {
          data: complianceAlerts,
          count: complianceAlerts?.length || 0,
          error: alertsError
        },

        // Processing errors
        errorRecords: {
          data: errorRecords,
          count: errorRecords?.length || 0,
          error: errorQueryError
        },

        // Manual extraction analysis
        extractionAnalysis: extractionAnalysis,

        // RPC data stats (if available)
        dataStats: {
          data: dataStats,
          error: statsError
        }
      },
      timestamp: new Date().toISOString(),
      note: "This API shows all OCR/AI extraction fields to investigate data quality issues"
    })

  } catch (error) {
    console.error('🔍 OCR Debug API Error:', error)
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