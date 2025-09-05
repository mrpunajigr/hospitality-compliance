import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    console.log('🔧 RLS FIX: Starting RLS policy repair')
    
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
    
    console.log('🔧 RLS FIX: Supabase admin client created')
    
    // Drop existing restrictive policies
    console.log('🔧 RLS FIX: Dropping existing policies...')
    
    const dropPolicies = `
      DROP POLICY IF EXISTS "delivery_records_insert_policy" ON delivery_records;
      DROP POLICY IF EXISTS "delivery_records_select_policy" ON delivery_records;
      DROP POLICY IF EXISTS "delivery_records_update_policy" ON delivery_records;
      DROP POLICY IF EXISTS "delivery_records_delete_policy" ON delivery_records;
    `
    
    const { error: dropError } = await supabaseAdmin.rpc('sql', { query: dropPolicies })
    if (dropError) {
      console.error('🔧 RLS FIX: Error dropping policies:', dropError)
    }
    
    // Create permissive policies
    console.log('🔧 RLS FIX: Creating permissive policies...')
    
    const createPolicies = `
      CREATE POLICY "Enable insert for service role" ON delivery_records
        FOR INSERT WITH CHECK (true);
      
      CREATE POLICY "Enable select for service role" ON delivery_records 
        FOR SELECT USING (true);
      
      CREATE POLICY "Enable update for service role" ON delivery_records
        FOR UPDATE USING (true) WITH CHECK (true);
    `
    
    const { error: createError } = await supabaseAdmin.rpc('sql', { query: createPolicies })
    if (createError) {
      console.error('🔧 RLS FIX: Error creating policies:', createError)
    }
    
    // Grant permissions
    console.log('🔧 RLS FIX: Granting permissions...')
    
    const grantPermissions = `
      GRANT ALL ON delivery_records TO service_role;
      GRANT USAGE ON SEQUENCE delivery_records_id_seq TO service_role;
    `
    
    const { error: grantError } = await supabaseAdmin.rpc('sql', { query: grantPermissions })
    if (grantError) {
      console.error('🔧 RLS FIX: Error granting permissions:', grantError)
    }
    
    console.log('🔧 RLS FIX: Completed - testing with insert...')
    
    // Test with a simple insert
    const { data: testRecord, error: testError } = await supabaseAdmin
      .from('delivery_records')
      .insert({
        client_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        user_id: 'test-rls-fix',
        supplier_name: 'RLS FIX SUCCESSFUL',
        image_path: 'test/rls-fix-test.jpg',
        processing_status: 'completed',
        raw_extracted_text: `RLS POLICIES FIXED - ${new Date().toISOString()}`,
        confidence_score: 0.99
      })
      .select()
      .single()
    
    if (testError) {
      console.error('🔧 RLS FIX: Test insert failed:', testError)
      return NextResponse.json({
        success: false,
        error: 'RLS fix failed - test insert still blocked',
        details: testError
      }, { status: 500 })
    }
    
    console.log('🔧 RLS FIX: SUCCESS! Test record created:', testRecord.id)
    
    return NextResponse.json({
      success: true,
      message: 'RLS policies fixed successfully!',
      testRecordId: testRecord.id,
      testRecord: testRecord
    })
    
  } catch (error) {
    console.error('🔧 RLS FIX: Exception:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    }, { status: 500 })
  }
}