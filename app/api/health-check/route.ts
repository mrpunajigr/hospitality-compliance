// Health check API for Vercel deployment verification
// Checks environment variables and basic connectivity

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const checks = {
      environment: 'production',
      timestamp: new Date().toISOString(),
      supabase: {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        connection: false
      },
      googleCloud: {
        projectId: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
        credentials: !!process.env.GOOGLE_CLOUD_CREDENTIALS,
        credentialsValid: false
      },
      apis: {
        getUploadUrl: true,
        createDeliveryRecord: true,
        processDocument: true
      }
    }

    // Test Supabase connection
    if (checks.supabase.url && checks.supabase.serviceKey) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        
        const { data, error } = await supabase
          .from('delivery_records')
          .select('count')
          .limit(1)
        
        checks.supabase.connection = !error
      } catch (error) {
        console.error('Supabase connection test failed:', error)
      }
    }

    // Test Google Cloud credentials validity
    if (checks.googleCloud.projectId && checks.googleCloud.credentials) {
      try {
        const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS!)
        checks.googleCloud.credentialsValid = !!(credentials.private_key && credentials.client_email)
      } catch (error) {
        console.error('Google Cloud credentials parsing failed:', error)
      }
    }

    const allChecksPass = 
      checks.supabase.url && 
      checks.supabase.serviceKey && 
      checks.supabase.connection &&
      checks.googleCloud.projectId &&
      checks.googleCloud.credentials &&
      checks.googleCloud.credentialsValid

    return NextResponse.json({
      status: allChecksPass ? 'healthy' : 'warning',
      checks,
      message: allChecksPass 
        ? 'All systems operational' 
        : 'Some environment variables or connections missing'
    }, { 
      status: allChecksPass ? 200 : 206 
    })

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}