import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    console.log('🧪 DB TEST: Starting direct database test')
    
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
    
    console.log('🧪 DB TEST: Supabase client created')
    
    // Create a simple test record
    const { data: deliveryRecord, error: dbError } = await supabaseAdmin
      .from('delivery_records')
      .insert({
        client_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        user_id: null,
        supplier_name: 'DB TEST API WORKING',
        image_path: 'test/direct-db-test.jpg',
        processing_status: 'completed',
        raw_extracted_text: `DIRECT DB TEST - ${new Date().toISOString()} - API can write to database!`,
        confidence_score: 0.99
      })
      .select()
      .single()
      
    console.log('🧪 DB TEST: Insert completed', { data: deliveryRecord, error: dbError })
    
    if (dbError) {
      console.error('🧪 DB TEST: Database error:', dbError)
      return NextResponse.json({
        success: false,
        error: 'Database insert failed',
        details: dbError
      }, { status: 500 })
    }
    
    if (deliveryRecord) {
      console.log('🧪 DB TEST: Record created successfully:', deliveryRecord.id)
      return NextResponse.json({
        success: true,
        message: 'Database record created successfully',
        recordId: deliveryRecord.id,
        record: deliveryRecord
      })
    }
    
    return NextResponse.json({
      success: false,
      error: 'No record returned but no error'
    }, { status: 500 })
    
  } catch (error) {
    console.error('🧪 DB TEST: Exception:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    }, { status: 500 })
  }
}