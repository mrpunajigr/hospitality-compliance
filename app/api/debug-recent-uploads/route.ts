import { NextResponse } from 'next/server'
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
    const userId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01'
    const today = '2025-09-04'
    
    // List files uploaded today
    const { data: files, error } = await supabase.storage
      .from('delivery-dockets')
      .list(`${userId}/${today}`)
    
    console.log('Files uploaded today:', files)
    
    if (error) {
      console.error('Storage error:', error)
      return NextResponse.json({
        error: error.message,
        userId,
        today,
        path: `${userId}/${today}`
      })
    }
    
    return NextResponse.json({
      success: true,
      userId,
      today,
      path: `${userId}/${today}`,
      filesCount: files?.length || 0,
      files: files?.map(f => ({
        name: f.name,
        size: f.metadata?.size,
        created: f.created_at
      })) || []
    })

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}