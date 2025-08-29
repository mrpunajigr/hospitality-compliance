// Hospitality Compliance SaaS - Document Processing API Route
// This route calls the Supabase Edge Function to process delivery dockets

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client only when needed
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { bucketId, fileName, filePath, deliveryRecordId, userId, clientId, testMode = false } = await request.json()

    // Validate required parameters
    if (!bucketId || !fileName || !filePath || !clientId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    console.log(`API: Processing docket ${fileName} for client ${clientId}, record: ${deliveryRecordId}, testMode: ${testMode}`)
    console.log('🔍 API Route DEBUG - Parameters:')
    console.log('  filePath received:', filePath)
    console.log('  deliveryRecordId received:', deliveryRecordId)
    console.log('  clientId received:', clientId)
    console.log('🔍 API Route - About to send to Edge Function:')
    console.log('  imagePath (mapped from filePath):', filePath)

    // Call the Supabase Edge Function
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.functions.invoke('process-delivery-docket', {
      body: {
        bucketId,
        fileName,
        imagePath: filePath,  // FIXED: Edge function expects 'imagePath' parameter
        filePath,  // Also send original for compatibility
        deliveryRecordId,
        userId: null,
        clientId,
        testMode
      }
    })

    if (error) {
      console.error('Edge Function error details:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: `Edge Function error: ${JSON.stringify(error)}` },
        { status: 500 }
      )
    }

    if (!data.success) {
      console.error('Processing failed:', data.error)
      return NextResponse.json(
        { error: data.error || 'Processing failed' },
        { status: 400 }
      )
    }

    console.log(`API: Successfully processed docket ${fileName}`)

    return NextResponse.json({
      success: true,
      deliveryRecordId: data.deliveryRecordId,
      extractedData: data.extractedData,
      alertsGenerated: data.alertsGenerated,
      processingTime: data.processingTime
    })

  } catch (error) {
    console.error('API route error:', error)
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}