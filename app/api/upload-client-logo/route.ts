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

    // Validate required fields
    if (!file || !clientId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: file, clientId, or userId' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (10MB max for high-quality logos)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    
    // Skip permission check for testing - TODO: implement proper user roles
    console.log(`Logo upload attempt: userId=${userId}, clientId=${clientId}`)

    // Generate unique filename
    const fileExt = file.name.split('.').pop() || 'png'
    const fileName = `${clientId}/logo.${fileExt}`
    
    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Supabase storage
    const { data: uploadResult, error: uploadError } = await supabaseAdmin.storage
      .from('client-logos')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true // Replace existing logo
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload logo' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('client-logos')
      .getPublicUrl(fileName)

    // Update client record with logo URL
    const { error: updateError } = await supabaseAdmin
      .from('clients')
      .update({ 
        logo_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId)

    if (updateError) {
      console.error('Client update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update client logo' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      logo_url: publicUrl,
      message: 'Client logo updated successfully'
    })

  } catch (error) {
    console.error('Client logo upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}