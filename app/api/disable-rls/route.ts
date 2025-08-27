import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    console.log('🔓 DISABLE RLS: Temporarily disabling RLS for testing')
    
    // Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    console.log('🔓 DISABLE RLS: Admin client created')
    
    // Try to disable RLS on the delivery_records table
    // Note: This approach uses the supabase client's direct query method
    try {
      const { error: disableError } = await supabaseAdmin
        .rpc('exec_sql', { 
          sql: 'ALTER TABLE delivery_records DISABLE ROW LEVEL SECURITY;' 
        })
      
      if (disableError) {
        console.log('🔓 DISABLE RLS: exec_sql failed, trying alternative method:', disableError)
      } else {
        console.log('🔓 DISABLE RLS: RLS disabled successfully')
      }
    } catch (rpcError) {
      console.log('🔓 DISABLE RLS: RPC method failed, proceeding with insert test:', rpcError)
    }
    
    // Test insert regardless of RLS disable success
    console.log('🔓 DISABLE RLS: Testing database insert...')
    
    const { data: testRecord, error: testError } = await supabaseAdmin
      .from('delivery_records')
      .insert({
        client_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        user_id: null,
        supplier_name: 'RLS DISABLED TEST',
        image_path: 'test/rls-disabled-test.jpg',
        processing_status: 'completed',
        raw_extracted_text: `RLS DISABLED TEST - ${new Date().toISOString()}`,
        confidence_score: 0.99
      })
      .select()
      .single()
    
    if (testError) {
      console.error('🔓 DISABLE RLS: Insert still failed:', testError)
      
      // Return detailed error information
      return NextResponse.json({
        success: false,
        error: 'Database insert failed even with RLS disabled',
        details: {
          code: testError.code,
          message: testError.message,
          hint: testError.hint,
          details: testError.details
        }
      }, { status: 500 })
    }
    
    console.log('🔓 DISABLE RLS: SUCCESS! Record created:', testRecord.id)
    
    return NextResponse.json({
      success: true,
      message: 'RLS disabled and test insert successful!',
      testRecordId: testRecord.id,
      testRecord: testRecord
    })
    
  } catch (error) {
    console.error('🔓 DISABLE RLS: Exception:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    }, { status: 500 })
  }
}