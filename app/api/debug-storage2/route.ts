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

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const clientId = 'b13e93dd-e981-4d43-97e6-26b7713fb90c'
    
    // Check last few days
    const dates = []
    for (let i = 0; i < 5; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }
    
    const results: Record<string, string[]> = {}
    
    for (const date of dates) {
      const { data: files } = await supabase.storage
        .from('delivery-dockets')
        .list(`${clientId}/${date}`)
      
      results[date] = files?.map(f => f.name) || []
    }
    
    return NextResponse.json({
      success: true,
      clientId,
      filesByDate: results
    })

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}