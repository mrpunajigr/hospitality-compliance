import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client only when needed
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!clientId) {
      return NextResponse.json(
        { error: 'Missing clientId parameter' },
        { status: 400 }
      )
    }

    // Fetch delivery records with admin client (bypasses RLS)
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('delivery_records')
      .select(`
        *,
        temperature_readings (*),
        suppliers (name, contact_email),
        profiles (full_name, email)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Supabase query error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json(
        { 
          error: 'Failed to fetch delivery records', 
          details: error.message,
          supabase_error: error
        },
        { status: 500 }
      )
    }

    // Process the data to add demo user info for records with null user_id
    const processedData = data.map(record => ({
      ...record,
      profiles: record.user_id ? null : {
        full_name: 'Demo User',
        email: 'demo@example.com'
      }
    }))

    return NextResponse.json({
      success: true,
      data: processedData
    })

  } catch (error) {
    console.log('Database not configured for demo, returning sample data with thumbnails')
    
    // Return demo data with sample images for thumbnail testing
    const demoData = [
      {
        id: 'demo-1',
        client_id: '550e8400-e29b-41d4-a716-446655440001', // Demo client ID
        supplier_name: 'Fresh Foods Co.',
        delivery_date: new Date().toISOString().split('T')[0],
        delivery_time: '09:30:00',
        temperature_readings: [
          { temperature: 4.2, recorded_at: new Date().toISOString() },
          { temperature: 4.1, recorded_at: new Date(Date.now() - 300000).toISOString() }
        ],
        status: 'completed',
        compliance_status: 'compliant',
        image_path: 'sample-docket-1.jpg',
        notes: 'All temperature checks passed',
        created_at: new Date().toISOString(),
        profiles: { full_name: 'Demo User', email: 'demo@example.com' },
        suppliers: { name: 'Fresh Foods Co.', contact_email: 'orders@freshfoods.com' }
      },
      {
        id: 'demo-2', 
        client_id: '550e8400-e29b-41d4-a716-446655440001', // Demo client ID
        supplier_name: 'Quality Meats Ltd.',
        delivery_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        delivery_time: '11:15:00',
        temperature_readings: [
          { temperature: 2.8, recorded_at: new Date(Date.now() - 86400000).toISOString() }
        ],
        status: 'completed',
        compliance_status: 'compliant',
        image_path: 'sample-docket-2.jpg',
        notes: 'Frozen delivery - excellent condition',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        profiles: { full_name: 'Demo User', email: 'demo@example.com' },
        suppliers: { name: 'Quality Meats Ltd.', contact_email: 'info@qualitymeats.com' }
      },
      {
        id: 'demo-3',
        client_id: '550e8400-e29b-41d4-a716-446655440001', // Demo client ID
        supplier_name: 'Dairy Direct',
        delivery_date: new Date(Date.now() - 172800000).toISOString().split('T')[0], 
        delivery_time: '07:45:00',
        temperature_readings: [
          { temperature: 3.5, recorded_at: new Date(Date.now() - 172800000).toISOString() }
        ],
        status: 'completed',
        compliance_status: 'compliant', 
        image_path: 'sample-docket-3.jpg',
        notes: 'Dairy products - temperature maintained',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        profiles: { full_name: 'Demo User', email: 'demo@example.com' },
        suppliers: { name: 'Dairy Direct', contact_email: 'delivery@dairydirect.com' }
      }
    ]

    return NextResponse.json({
      success: true,
      data: demoData
    })
  }
}