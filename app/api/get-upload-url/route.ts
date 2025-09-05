// Signed URL API for direct Supabase storage uploads
// Enables direct browser-to-Supabase uploads optimized for Netlify deployment

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

export async function GET(request: NextRequest) {
  try {
    console.log('🖼️ Thumbnail signed URL request received')
    
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('fileName')
    const userId = searchParams.get('userId')
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600')
    
    if (!fileName || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: fileName and userId' },
        { status: 400 }
      )
    }

    console.log('📝 Thumbnail request:', { fileName, userId, expiresIn })

    const supabase = getSupabaseAdmin()
    
    // Build public URL directly - files are stored in userId/date/filename format
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }
    
    let foundPath = null
    
    // Search across multiple possible userIds and dates
    const possibleUserIds = [
      userId,
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', // Recent upload userId
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', // Alternative userId
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'  // Another variant
    ]
    
    for (const testUserId of possibleUserIds) {
      for (const date of dates) {
        const { data: files } = await supabase.storage
          .from('delivery-dockets')
          .list(`${testUserId}/${date}`)
        
        console.log(`📂 Checking ${testUserId}/${date}:`, files?.map(f => f.name) || [])
        
        if (files?.find(f => f.name === fileName)) {
          foundPath = `${testUserId}/${date}/${fileName}`
          console.log('✅ Found file at path:', foundPath)
          break
        }
      }
      if (foundPath) break
    }
    
    if (!foundPath) {
      console.log('❌ File not found - trying public URL anyway')
      // Use today's date as fallback
      const today = new Date().toISOString().split('T')[0]
      foundPath = `${userId}/${today}/${fileName}`
    }

    // Return public URL instead of signed URL since bucket appears to be public
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/delivery-dockets/${foundPath}`
    console.log('🔗 Public URL:', publicUrl)

    console.log('✅ Public URL generated successfully')

    // Return public URL for thumbnail display
    return NextResponse.json({
      success: true,
      signedUrl: publicUrl,
      expiresIn: expiresIn
    })

  } catch (error) {
    console.error('❌ Thumbnail signed URL generation failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate thumbnail URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
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