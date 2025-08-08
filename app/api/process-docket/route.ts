// Hospitality Compliance SaaS - Document Processing API Route
// This route calls the Supabase Edge Function to process delivery dockets

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { bucketId, fileName, filePath, userId, clientId } = await request.json()

    // Validate required parameters
    if (!bucketId || !fileName || !filePath || !userId || !clientId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    console.log(`API: Processing docket ${fileName} for client ${clientId}`)

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('process-delivery-docket', {
      body: {
        bucketId,
        fileName,
        filePath,
        userId,
        clientId
      }
    })

    if (error) {
      console.error('Edge Function error:', error)
      return NextResponse.json(
        { error: error.message || 'Processing failed' },
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