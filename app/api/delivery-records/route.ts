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
        suppliers (name, contact_email)
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching delivery records:', error)
      return NextResponse.json(
        { error: 'Failed to fetch delivery records' },
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
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}