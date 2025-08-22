import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
)

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { 
      companyId,
      userId,
      name,
      business_type,
      business_email,
      phone,
      license_number,
      address,
      estimated_monthly_deliveries
    } = body

    if (!companyId || !userId || !name || !business_type || !business_email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify user has permission to update this company
    const { data: userAccess, error: accessError } = await supabaseAdmin
      .from('client_users')
      .select('role, status')
      .eq('user_id', userId)
      .eq('client_id', companyId)
      .eq('status', 'active')
      .single()

    if (accessError || !userAccess) {
      return NextResponse.json(
        { error: 'Access denied or company not found' },
        { status: 403 }
      )
    }

    // Only owners and admins can update company details
    if (!['owner', 'admin'].includes(userAccess.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update company details' },
        { status: 403 }
      )
    }

    // Update the company record
    const { data: updatedCompany, error: updateError } = await supabaseAdmin
      .from('clients')
      .update({
        name,
        business_type,
        business_email,
        phone,
        license_number,
        address,
        estimated_monthly_deliveries,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating company:', updateError)
      return NextResponse.json(
        { error: 'Failed to update company', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      company: updatedCompany
    })

  } catch (error) {
    console.error('Company update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}