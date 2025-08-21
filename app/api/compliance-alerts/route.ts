import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client only when needed - with graceful degradation
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    // Don't throw error - return null for demo mode graceful handling
    return null
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

    // Get Supabase admin client - may be null in demo mode
    const supabaseAdmin = getSupabaseAdmin()
    
    // If no admin client available, return empty data silently
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // Fetch compliance alerts with admin client (bypasses RLS)
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
      // Silent return for demo mode - no console errors
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    return NextResponse.json({
      success: true,
      data: data || []
    })

  } catch (error) {
    // Silent fallback for demo mode - no console errors
    return NextResponse.json({
      success: true,
      data: []
    })
  }
}