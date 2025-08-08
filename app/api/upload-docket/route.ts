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

    // Create delivery record in database with demo processing results
    const mockData = {
      supplierName: 'Fresh Dairy Co.',
      docketNumber: `FD-${Date.now()}`,
      deliveryDate: new Date().toISOString(),
      products: ['milk', 'cheese', 'butter'],
      confidenceScore: 0.92
    }

    const { data: deliveryRecord, error: dbError } = await supabaseAdmin
      .from('delivery_records')
      .insert({
        client_id: clientId,
        user_id: null, // Set to null to bypass foreign key constraint for demo
        supplier_name: mockData.supplierName,
        docket_number: mockData.docketNumber,
        delivery_date: mockData.deliveryDate,
        products: mockData.products,
        image_path: uploadResult.path,
        processing_status: 'completed',
        confidence_score: mockData.confidenceScore,
        raw_extracted_text: 'Demo OCR text: Fresh Dairy Co. delivery docket with temperature readings.'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      )
    }

    // Add temperature readings for demo
    const temperatureReadings = [
      {
        delivery_record_id: deliveryRecord.id,
        temperature_value: 3.2,
        temperature_unit: 'C',
        product_type: 'chilled',
        is_compliant: true,
        risk_level: 'low',
        safe_min_temp: 0,
        safe_max_temp: 4,
        context: 'Dairy products temperature: 3.2°C'
      },
      {
        delivery_record_id: deliveryRecord.id,
        temperature_value: -18.5,
        temperature_unit: 'C', 
        product_type: 'frozen',
        is_compliant: true,
        risk_level: 'low',
        safe_min_temp: -25,
        safe_max_temp: -18,
        context: 'Frozen goods temperature: -18.5°C'
      }
    ]

    await supabaseAdmin
      .from('temperature_readings')
      .insert(temperatureReadings)

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
      deliveryRecord,
      filePath: uploadResult.path
    })

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}