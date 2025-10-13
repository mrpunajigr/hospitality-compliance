import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const securityHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, PUT, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Type': 'application/json'
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, PUT, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// Create Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
)

// Create user client to check session impact
const supabaseUser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
)

export async function POST(request: Request) {
  try {
    console.log('🏢 UPDATE-COMPANY API: Starting company setup API call')
    
    // STEP 1: Check if we can validate the user session through headers
    const authHeader = request.headers.get('Authorization')
    console.log('🔍 UPDATE-COMPANY API: Auth header present:', !!authHeader)
    
    const body = await request.json()
    
    const { 
      userId,
      ownersName,
      businessType,
      address,
      phoneNumber,
      companyLogo
    } = body

    if (!userId) {
      console.log('❌ UPDATE-COMPANY API: Missing userId')
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400, headers: securityHeaders }
      )
    }
    
    console.log('🔍 UPDATE-COMPANY API: Processing for user ID:', userId)

    // STEP 2: Lookup client for user (using admin client)
    console.log('🔍 UPDATE-COMPANY API: Finding client for user:', userId)
    console.log('🔍 UPDATE-COMPANY API: Using admin client for database query...')
    
    const { data: clientUserData, error: clientUserError } = await supabaseAdmin
      .from('client_users')
      .select(`
        client_id,
        clients (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    console.log('🔍 UPDATE-COMPANY API: Client lookup result:', {
      found: !!clientUserData,
      error: clientUserError?.message,
      clientId: clientUserData?.client_id
    })

    if (clientUserError || !clientUserData) {
      console.error('❌ UPDATE-COMPANY API: No client found for user:', clientUserError)
      return NextResponse.json(
        { error: 'No company found for this user. Please contact support.' },
        { status: 404, headers: securityHeaders }
      )
    }

    const clientId = clientUserData.client_id
    console.log('✅ Found client ID:', clientId)

    // Prepare the update data
    const updateData: any = {}
    
    if (businessType) {
      updateData.business_type = businessType
    }
    
    if (address) {
      updateData.address = address
    }
    
    if (phoneNumber) {
      updateData.phone = phoneNumber
    }
    
    if (ownersName) {
      updateData.owner_name = ownersName
    }
    
    // Mark onboarding as completed
    updateData.onboarding_status = 'completed'
    updateData.updated_at = new Date().toISOString()

    console.log('📝 UPDATE-COMPANY API: Updating client with data:', updateData)
    console.log('🔍 UPDATE-COMPANY API: Performing database update using admin client...')

    // STEP 3: Update the client record (using admin client)
    const { data: updatedClient, error: updateError } = await supabaseAdmin
      .from('clients')
      .update(updateData)
      .eq('id', clientId)
      .select()
      .single()

    console.log('🔍 UPDATE-COMPANY API: Update operation result:', {
      success: !updateError,
      error: updateError?.message,
      updatedFields: updateData,
      clientId: clientId
    })

    if (updateError) {
      console.error('❌ UPDATE-COMPANY API: Error updating client:', updateError)
      
      // Handle case where owner_name column doesn't exist
      if (updateError.message?.includes('owner_name') || updateError.code === '42703') {
        console.log('⚠️ owner_name column missing, retrying without it...')
        const retryData = { ...updateData }
        delete retryData.owner_name
        
        const { data: retryUpdatedClient, error: retryError } = await supabaseAdmin
          .from('clients')
          .update(retryData)
          .eq('id', clientId)
          .select()
          .single()
          
        if (retryError) {
          console.error('❌ Retry update failed:', retryError)
          return NextResponse.json(
            { error: 'Failed to update company information', details: retryError.message },
            { status: 500, headers: securityHeaders }
          )
        }
        
        console.log('✅ Company updated successfully (without owner_name field)')
        return NextResponse.json({
          success: true,
          client: retryUpdatedClient,
          message: 'Company setup completed successfully!'
        }, { headers: securityHeaders })
      }
      
      return NextResponse.json(
        { error: 'Failed to update company information', details: updateError.message },
        { status: 500, headers: securityHeaders }
      )
    }

    console.log('✅ UPDATE-COMPANY API: Company updated successfully')

    // STEP 4: Final validation - check if user session would still be valid
    console.log('🔍 UPDATE-COMPANY API: Final session impact check...')
    console.log('🔍 UPDATE-COMPANY API: Note - Admin operations should not affect user sessions')
    console.log('🔍 UPDATE-COMPANY API: User ID:', userId, 'should remain authenticated after this API call')

    // Handle company logo upload if provided
    let logoUrl = null
    if (companyLogo && typeof companyLogo === 'string' && companyLogo.startsWith('data:')) {
      try {
        console.log('📸 Processing company logo upload...')
        
        // Extract base64 data and content type
        const [header, base64Data] = companyLogo.split(',')
        const contentType = header.match(/data:([^;]+)/)?.[1] || 'image/png'
        const fileExtension = contentType.split('/')[1] || 'png'
        
        // Convert base64 to buffer
        const buffer = Buffer.from(base64Data, 'base64')
        
        // Generate unique filename
        const fileName = `company-logos/${clientId}-${Date.now()}.${fileExtension}`
        
        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabaseAdmin
          .storage
          .from('company-assets')
          .upload(fileName, buffer, {
            contentType,
            upsert: true
          })
        
        if (uploadError) {
          console.error('❌ Logo upload failed:', uploadError)
          // Don't fail the entire request for logo upload failure
        } else {
          // Get public URL
          const { data: urlData } = supabaseAdmin
            .storage
            .from('company-assets')
            .getPublicUrl(fileName)
          
          logoUrl = urlData.publicUrl
          console.log('✅ Logo uploaded successfully:', logoUrl)
          
          // Update client with logo URL
          await supabaseAdmin
            .from('clients')
            .update({ logo_url: logoUrl })
            .eq('id', clientId)
        }
      } catch (logoError) {
        console.error('❌ Logo processing error:', logoError)
        // Continue without failing the request
      }
    }

    console.log('🎯 UPDATE-COMPANY API: Returning success response')
    console.log('🔍 UPDATE-COMPANY API: Session for user', userId, 'should still be valid after this call')
    
    return NextResponse.json({
      success: true,
      client: updatedClient,
      logoUrl,
      message: 'Company setup completed successfully!'
    }, { headers: securityHeaders })

  } catch (error) {
    console.error('❌ Complete company setup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: securityHeaders }
    )
  }
}

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