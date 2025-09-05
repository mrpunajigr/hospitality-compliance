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
  console.log('🚨 API ROUTE START - process-docket called')
  
  try {
    const body = await request.json()
    console.log('📍 API Route - Request received:', body)
    
    // Call Edge Function
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.functions.invoke('process-delivery-docket', {
      body: body
    })
    
    console.log('📍 API Route - Edge Function response:', data)
    
    if (error) {
      console.error('Edge Function error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (!data.success) {
      console.error('Edge Function returned success: false')
      return NextResponse.json({ success: false, error: data.message }, { status: 400 })
    }

    // CRITICAL: Return the Edge Function's extracted data directly
    console.log('✅ Returning Edge Function data to frontend')
    const responseData = {
      success: true,
      deliveryRecordId: data.deliveryRecordId,
      message: data.message,
      extractedText: data.extractedText,
      enhancedExtraction: data.enhancedExtraction  // THIS IS KEY
    }
    
    console.log('📍 API Route - Returning to frontend:', responseData)
    return NextResponse.json(responseData)

  } catch (error) {
    console.error('🚨 API ROUTE ERROR:', error)
    console.error('🚨 Error type:', typeof error)
    console.error('🚨 Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('🚨 Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'API route failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorType: typeof error,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}