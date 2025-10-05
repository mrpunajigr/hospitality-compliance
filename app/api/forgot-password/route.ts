import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const securityHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }

  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400, headers: securityHeaders }
      )
    }

    console.log('🔄 Processing password reset request for:', email)
    console.log('🔧 Environment check:', {
      hasBaseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`
    })

    // Use Supabase's resetPasswordForEmail function
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`
    })

    if (error) {
      console.error('❌ Error sending password reset email:', error)
      
      // For security, we don't reveal if the email exists or not
      // Always return success to prevent email enumeration attacks
      return NextResponse.json(
        { 
          success: true,
          message: 'If an account with this email exists, you will receive a password reset link.'
        },
        { status: 200, headers: securityHeaders }
      )
    }

    console.log('✅ Password reset email sent successfully')

    return NextResponse.json(
      { 
        success: true,
        message: 'Password reset email sent successfully'
      },
      { status: 200, headers: securityHeaders }
    )

  } catch (error) {
    console.error('❌ Forgot password API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: securityHeaders }
    )
  }
}