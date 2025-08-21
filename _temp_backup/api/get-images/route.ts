import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const userId = searchParams.get('userId')
    const clientId = searchParams.get('clientId')

    const supabaseAdmin = getSupabaseAdmin()
    const result: any = {}

    // Get user avatar if userId provided
    if (userId) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single()
      
      result.avatarUrl = profile?.avatar_url || null
    }

    // Get client logo if clientId provided
    if (clientId) {
      const { data: client } = await supabaseAdmin
        .from('clients')
        .select('logo_url')
        .eq('id', clientId)
        .single()
      
      result.logoUrl = client?.logo_url || null
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Get images error:', error)
    return NextResponse.json(
      { error: 'Failed to get images' },
      { status: 500 }
    )
  }
}