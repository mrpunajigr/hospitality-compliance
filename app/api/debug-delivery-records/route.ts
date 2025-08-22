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

    // Test 2: Get all delivery records (admin) 
    const { data: allRecords, error: allRecordsError } = await supabaseAdmin
      .from('delivery_records')
      .select(`
        id,
        supplier_name,
        status,
        created_at,
        analysis,
        extraction_data,
        file_url,
        client_id,
        user_id
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

    // Test 4: Check table structure
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
          error: allRecordsError
        },
        regularRecords: {
          data: regularRecords,
          error: regularError
        },
        tableInfo: {
          data: tableInfo,
          error: tableError
        }
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