import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client only when needed
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const clientId = formData.get('clientId') as string
    const userId = formData.get('userId') as string

    if (!file || !clientId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: file, clientId, or userId' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (8MB max)
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 8MB' },
        { status: 400 }
      )
    }

    // Create unique file path
    const timestamp = Date.now()
    const dateFolder = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = `${clientId}/${dateFolder}/${fileName}`

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Supabase storage using admin client
    const supabaseAdmin = getSupabaseAdmin()
    const { data: uploadResult, error: uploadError } = await supabaseAdmin.storage
      .from('delivery-dockets')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Ensure client exists for demo
    const { error: clientError } = await supabaseAdmin
      .from('clients')
      .upsert({
        id: clientId,
        name: 'Demo Restaurant',
        business_type: 'restaurant',
        license_number: 'DEMO123',
        business_email: 'demo@restaurant.com',
        phone: '+64 9 123 4567',
        address: {
          street: '123 Demo Street',
          city: 'Auckland',
          region: 'Auckland',
          postalCode: '1010',
          country: 'NZ'
        },
        subscription_status: 'active',
        subscription_tier: 'basic',
        estimated_monthly_deliveries: 100
      }, {
        onConflict: 'id'
      })

    if (clientError) {
      console.log('Client upsert note:', clientError.message)
    }

    // Create auth user first (required for foreign key constraints)
    try {
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: 'sarah.manager@cornerstonecafe.co.nz',
        password: 'password123',
        email_confirm: true,
        user_metadata: {
          full_name: 'Sarah Wilson'
        }
      })

      if (authError) {
        console.log('Auth user creation result:', authError.message)
      }
    } catch (e) {
      console.log('Auth user creation note:', e)
    }

    // Ensure the user profile exists (seed data might not be loaded)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: 'sarah.manager@cornerstonecafe.co.nz', // Use the actual seeded email
        full_name: 'Sarah Wilson', // Use the actual seeded name
        phone: '+64 21 123 456'
      }, {
        onConflict: 'id'
      })

    if (profileError) {
      console.log('Profile upsert error:', profileError.message)
    }

    // Call the real Supabase Edge Function for Document AI processing
    console.log('🤖 Calling Supabase Edge Function for Document AI processing...')
    
    const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/process-delivery-docket`
    const processingResponse = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        bucketId: 'delivery-dockets',
        fileName: fileName,
        imagePath: uploadResult.path,
        deliveryRecordId: deliveryRecord.id,
        userId: null,
        clientId: clientId
      })
    })

    if (!processingResponse.ok) {
      const errorText = await processingResponse.text()
      console.error('🤖 Document AI processing failed:', errorText)
      
      // Fallback to basic record creation if AI processing fails
      const { data: deliveryRecord, error: dbError } = await supabaseAdmin
        .from('delivery_records')
        .insert({
          client_id: clientId,
          user_id: null,
          image_path: uploadResult.path,
          processing_status: 'failed',
          error_message: `Document AI processing failed: ${errorText}`,
          raw_extracted_text: 'AI processing failed - file uploaded but not processed'
        })
        .select()
        .single()
        
      if (dbError) {
        console.error('Fallback database error:', dbError)
        return NextResponse.json(
          { error: `Database error: ${dbError.message}` },
          { status: 500 }
        )
      }
        
      return NextResponse.json({
        success: false,
        message: 'File uploaded but AI processing failed',
        deliveryRecordId: deliveryRecord.id,
        filePath: uploadResult.path,
        processingError: errorText
      })
    }

    const processingResult = await processingResponse.json()
    console.log('🤖 Document AI processing result:', processingResult)

    // The Edge Function should have created the delivery record, so we'll fetch it
    const { data: deliveryRecord, error: fetchError } = await supabaseAdmin
      .from('delivery_records')
      .select('*')
      .eq('image_path', uploadResult.path)
      .single()

    if (fetchError || !deliveryRecord) {
      console.error('Error fetching processed delivery record:', fetchError)
      return NextResponse.json(
        { error: 'AI processing completed but could not retrieve record' },
        { status: 500 }
      )
    }

    // Temperature readings should be created by the Edge Function during AI processing
    // No need to create mock temperature data here

    // Create audit log
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        client_id: clientId,
        user_id: null, // Set to null to bypass foreign key constraint for demo
        action: 'document.uploaded',
        resource_type: 'delivery_record',
        resource_id: deliveryRecord.id,
        details: {
          fileName: file.name,
          fileSize: file.size,
          filePath: uploadResult.path,
          demo_user_id: userId // Keep track of demo user in details
        }
      })

    return NextResponse.json({
      success: true,
      message: 'Document uploaded and processed successfully',
      deliveryRecordId: deliveryRecord.id,
      filePath: uploadResult.path,
      enhancedExtraction: processingResult?.extractionResult || null,
      processingStatus: deliveryRecord.processing_status,
      confidenceScore: deliveryRecord.confidence_score
    })

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}