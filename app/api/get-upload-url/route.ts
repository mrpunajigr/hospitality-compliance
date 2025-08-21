// Signed URL API for direct Supabase storage uploads
// Bypasses Vercel 4.5MB API route limit by enabling direct browser-to-Supabase uploads

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

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 Signed URL request received')
    
    const { fileName, fileType, clientId, userId } = await request.json()
    
    if (!fileName || !fileType || !clientId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: fileName, fileType, clientId, or userId' },
        { status: 400 }
      )
    }

    console.log('📝 Upload request:', { fileName, fileType, clientId, userId })

    const supabase = getSupabaseAdmin()
    
    // Generate unique file path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const uniqueFileName = `${timestamp}-${fileName}`
    const filePath = `delivery-dockets/${clientId}/${uniqueFileName}`
    
    console.log('📁 File path:', filePath)

    // Generate signed URL for upload
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('delivery-dockets')
      .createSignedUploadUrl(filePath, {
        upsert: false
      })

    if (signedUrlError) {
      console.error('❌ Signed URL error:', signedUrlError)
      throw signedUrlError
    }

    if (!signedUrlData?.signedUrl) {
      throw new Error('No signed URL returned from Supabase')
    }

    console.log('✅ Signed URL generated successfully')

    // Return signed URL and metadata for client
    return NextResponse.json({
      signedUrl: signedUrlData.signedUrl,
      filePath: filePath,
      fileName: uniqueFileName,
      uploadToken: signedUrlData.token || 'no-token',
      expiresIn: 300,
      bucket: 'delivery-dockets'
    })

  } catch (error) {
    console.error('❌ Signed URL generation failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate upload URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}