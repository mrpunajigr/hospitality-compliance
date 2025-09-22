import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET() {
  try {
    console.log('🔍 Debugging profiles table schema...')
    
    // Get table info
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .rpc('get_table_columns', { table_name: 'profiles' })
      
    if (tableError) {
      console.log('Could not get table info, trying alternative...')
      
      // Try to get a sample row to see columns
      const { data: sampleRow, error: sampleError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .limit(1)
        .single()
        
      if (sampleError && sampleError.code !== 'PGRST116') {
        console.error('Sample row error:', sampleError)
      }
      
      return NextResponse.json({
        tableInfo: null,
        tableError: tableError?.message,
        sampleRow: sampleRow || null,
        sampleError: sampleError?.message || null,
        
        // Try basic insert to see what happens
        testResult: 'See server logs for detailed schema info'
      })
    }
    
    return NextResponse.json({
      tableInfo,
      message: 'Check server logs for details'
    })
    
  } catch (error) {
    console.error('Debug profiles error:', error)
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}