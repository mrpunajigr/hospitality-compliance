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
    
    // List all files in delivery-dockets bucket
    const { data: rootFiles, error: rootError } = await supabase.storage
      .from('delivery-dockets')
      .list('')
    
    console.log('📂 Root files:', rootFiles)
    
    // List files in client folder
    const clientId = 'b13e93dd-e981-4d43-97e6-26b7713fb90c'
    const { data: clientFiles, error: clientError } = await supabase.storage
      .from('delivery-dockets')
      .list(clientId)
    
    console.log('📂 Client folder:', clientFiles)
    
    // List today's files
    const today = new Date().toISOString().split('T')[0]
    const { data: todayFiles, error: todayError } = await supabase.storage
      .from('delivery-dockets')
      .list(`${clientId}/${today}`)
    
    console.log('📂 Today folder:', todayFiles)
    
    return NextResponse.json({
      success: true,
      rootFiles: rootFiles?.map(f => f.name) || [],
      clientFiles: clientFiles?.map(f => f.name) || [],
      todayFiles: todayFiles?.map(f => f.name) || [],
      clientId,
      today,
      errors: {
        rootError: rootError?.message,
        clientError: clientError?.message,
        todayError: todayError?.message
      }
    })

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}