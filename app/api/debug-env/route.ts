import { NextResponse } from 'next/server'

export async function GET() {
  // Only available in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    
    // Email Configuration
    emailConfig: {
      hasResendKey: !!process.env.RESEND_API_KEY,
      resendKeyPreview: process.env.RESEND_API_KEY ? 
        `${process.env.RESEND_API_KEY.substring(0, 8)}...` : 'Not set',
      emailFromAddress: process.env.EMAIL_FROM_ADDRESS || 'Not set',
      emailFromName: process.env.EMAIL_FROM_NAME || 'Not set',
      enableEmailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS || 'Not set'
    },
    
    // Domain Configuration
    domainConfig: {
      nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not set',
      vercelUrl: process.env.VERCEL_URL || 'Not set',
      netlifyUrl: process.env.NETLIFY_URL || 'Not set',
      currentDomain: process.env.VERCEL_URL || process.env.NETLIFY_URL || 'localhost'
    },
    
    // Supabase Configuration
    supabaseConfig: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
        `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20)}...` : 'Not set'
    },
    
    // Runtime Info
    runtimeInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
  })
}