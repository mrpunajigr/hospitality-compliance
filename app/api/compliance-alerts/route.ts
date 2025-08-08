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

    if (!clientId) {
      return NextResponse.json(
        { error: 'Missing clientId parameter' },
        { status: 400 }
      )
    }

    // Fetch compliance alerts with admin client (bypasses RLS)
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('compliance_alerts')
      .select(`
        *,
        delivery_records (
          docket_number,
          supplier_name,
          created_at
        )
      `)
      .eq('client_id', clientId)
      .is('resolved_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching compliance alerts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch compliance alerts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || []
    })

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}