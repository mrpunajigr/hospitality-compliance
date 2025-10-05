import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    console.log('🔧 Debug Forgot Password Test')
    console.log('📧 Email:', email)
    console.log('🔗 Base URL:', process.env.NEXT_PUBLIC_BASE_URL)
    console.log('🔗 Redirect URL:', `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`)
    
    // Test the resetPasswordForEmail function with detailed logging
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`
    })

    console.log('📤 Supabase response data:', data)
    console.log('❌ Supabase error:', error)

    return NextResponse.json({
      success: !error,
      environment: {
        hasBaseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      },
      supabaseResponse: {
        data,
        error: error ? {
          message: error.message,
          status: error.status
        } : null
      }
    })

  } catch (error) {
    console.error('❌ Debug endpoint error:', error)
    return NextResponse.json(
      { error: 'Debug test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}