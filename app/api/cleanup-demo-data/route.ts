import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    console.log('🗑️ Starting demo data cleanup via API...')
    
    // Step 1: Get count of existing records
    const { count: deliveryCount, error: countError } = await supabaseAdmin
      .from('delivery_records')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('Error counting records:', countError)
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }
    
    const { count: tempCount } = await supabaseAdmin
      .from('temperature_readings')
      .select('*', { count: 'exact', head: true })
    
    console.log(`📊 Found ${deliveryCount} delivery records, ${tempCount} temperature readings`)
    
    if (deliveryCount === 0) {
      return NextResponse.json({
        success: true,
        message: 'No data to clean - database is already empty',
        recordsDeleted: {
          deliveryRecords: 0,
          temperatureReadings: 0,
          auditLogs: 0
        }
      })
    }
    
    // Step 2: Delete temperature readings first (foreign key dependency)
    console.log('🗑️ Deleting temperature readings...')
    const { error: tempError } = await supabaseAdmin
      .from('temperature_readings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records
    
    if (tempError) {
      console.error('Error deleting temperature readings:', tempError)
      return NextResponse.json({ error: tempError.message }, { status: 500 })
    }
    
    // Step 3: Delete audit logs
    console.log('🗑️ Deleting audit logs...')
    const { error: auditError } = await supabaseAdmin
      .from('audit_logs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records
    
    if (auditError) {
      console.error('Error deleting audit logs:', auditError)
    }
    
    // Step 4: Delete delivery records
    console.log('🗑️ Deleting delivery records...')
    const { error: deliveryError } = await supabaseAdmin
      .from('delivery_records')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records
    
    if (deliveryError) {
      console.error('Error deleting delivery records:', deliveryError)
      return NextResponse.json({ error: deliveryError.message }, { status: 500 })
    }
    
    // Step 5: Verify cleanup
    const { count: finalCount } = await supabaseAdmin
      .from('delivery_records')
      .select('*', { count: 'exact', head: true })
    
    console.log(`✅ Cleanup complete. Final count: ${finalCount} records remaining`)
    
    return NextResponse.json({
      success: true,
      message: 'Demo data cleanup completed successfully',
      recordsDeleted: {
        deliveryRecords: deliveryCount || 0,
        temperatureReadings: tempCount || 0,
        auditLogs: 'cleaned'
      },
      finalCount: finalCount || 0,
      ready: 'Fresh database ready for real AI processing tests'
    })
    
  } catch (error) {
    console.error('🗑️ Cleanup API Error:', error)
    const err = error as Error
    return NextResponse.json(
      { 
        success: false,
        error: 'Cleanup failed', 
        details: err?.message 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Just return current counts without deleting
    const { count: deliveryCount } = await supabaseAdmin
      .from('delivery_records')
      .select('*', { count: 'exact', head: true })
    
    const { count: tempCount } = await supabaseAdmin
      .from('temperature_readings')
      .select('*', { count: 'exact', head: true })
    
    return NextResponse.json({
      currentCounts: {
        deliveryRecords: deliveryCount || 0,
        temperatureReadings: tempCount || 0
      },
      message: deliveryCount === 0 ? 'Database is clean' : 'Demo data present - use POST to cleanup'
    })
    
  } catch (error) {
    console.error('Cleanup status error:', error)
    const err = error as Error
    return NextResponse.json(
      { error: err?.message },
      { status: 500 }
    )
  }
}