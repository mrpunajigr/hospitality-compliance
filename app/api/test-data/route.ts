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

    if (action === 'setup-hero') {
      // Create demo hero data
      console.log('🏆 Setting up demo hero data...')
      
      // First, ensure we have a demo client
      const { data: client, error: clientError } = await supabaseAdmin
        .from('clients')
        .upsert({
          id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          name: 'Demo Restaurant',
          business_type: 'restaurant',
          business_email: 'demo@example.com',
          phone: '+64 21 123 4567',
          address: '123 Queen Street, Auckland, New Zealand',
          owner_name: 'Demo Owner',
          subscription_status: 'active',
          subscription_tier: 'professional',
          onboarding_status: 'completed'
        })
        .select()
        .single()

      if (clientError) {
        console.error('❌ Failed to create demo client:', clientError)
        throw new Error(`Failed to create demo client: ${clientError.message}`)
      }

      // Now create/update the client_users record with hero enrollment
      const { data: clientUser, error: clientUserError } = await supabaseAdmin
        .from('client_users')
        .upsert({
          user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01',
          client_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          role: 'OWNER',
          status: 'active',
          champion_enrolled: true
        })
        .select()
        .single()

      if (clientUserError) {
        console.error('❌ Failed to create demo hero user:', clientUserError)
        throw new Error(`Failed to create demo hero user: ${clientUserError.message}`)
      }

      console.log('✅ Demo hero data created successfully')
      return NextResponse.json({
        success: true,
        message: 'Demo hero data created successfully',
        data: {
          client,
          clientUser
        }
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use ?action=stats or ?action=list or ?action=setup-hero'
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