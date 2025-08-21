// Test Data Management API Route
// Simple endpoints for viewing and cleaning test data

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase admin client
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

// GET - View test data statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    const supabaseAdmin = getSupabaseAdmin()

    if (action === 'stats') {
      // Get test data statistics
      const { data: testRecords, error: testError } = await supabaseAdmin
        .from('delivery_records')
        .select('id, test_session_id, created_at, supplier_name')
        .eq('test_mode', true)
        .order('created_at', { ascending: false })

      if (testError) {
        throw new Error(`Failed to fetch test records: ${testError.message}`)
      }

      // Group by test session
      const sessionGroups = testRecords?.reduce((acc: any, record) => {
        const sessionId = record.test_session_id || 'unknown'
        if (!acc[sessionId]) {
          acc[sessionId] = []
        }
        acc[sessionId].push(record)
        return acc
      }, {}) || {}

      return NextResponse.json({
        success: true,
        stats: {
          totalTestRecords: testRecords?.length || 0,
          testSessions: Object.keys(sessionGroups).length,
          sessionGroups: sessionGroups
        }
      })
    }

    if (action === 'list') {
      // List all test records
      const { data: testRecords, error: testError } = await supabaseAdmin
        .from('delivery_records')
        .select('*')
        .eq('test_mode', true)
        .order('created_at', { ascending: false })
        .limit(50)

      if (testError) {
        throw new Error(`Failed to fetch test records: ${testError.message}`)
      }

      return NextResponse.json({
        success: true,
        data: testRecords
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use ?action=stats or ?action=list'
    }, { status: 400 })

  } catch (error) {
    console.error('Test data API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}

// DELETE - Clean up test data
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const sessionId = searchParams.get('sessionId')

    const supabaseAdmin = getSupabaseAdmin()

    if (action === 'session' && sessionId) {
      // Delete specific test session
      const { data: deletedRecords, error: deleteError } = await supabaseAdmin
        .from('delivery_records')
        .delete()
        .eq('test_mode', true)
        .eq('test_session_id', sessionId)
        .select()

      if (deleteError) {
        throw new Error(`Failed to delete test session: ${deleteError.message}`)
      }

      return NextResponse.json({
        success: true,
        message: `Deleted ${deletedRecords?.length || 0} records from test session ${sessionId}`
      })
    }

    if (action === 'all') {
      // Delete ALL test data (use with caution!)
      const { data: deletedRecords, error: deleteError } = await supabaseAdmin
        .from('delivery_records')
        .delete()
        .eq('test_mode', true)
        .select()

      if (deleteError) {
        throw new Error(`Failed to delete all test data: ${deleteError.message}`)
      }

      return NextResponse.json({
        success: true,
        message: `Deleted ${deletedRecords?.length || 0} test records`
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use ?action=session&sessionId=XXX or ?action=all'
    }, { status: 400 })

  } catch (error) {
    console.error('Test data cleanup error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}