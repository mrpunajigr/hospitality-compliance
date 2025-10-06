import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const securityHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }

  try {
    const requestBody = await req.json()
    const { password, accessToken, refreshToken } = requestBody

    console.log('🔄 Processing password reset with request:', {
      hasPassword: !!password,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      passwordLength: password?.length || 0,
      accessTokenLength: accessToken?.length || 0,
      refreshTokenLength: refreshToken?.length || 0,
      fullBody: requestBody
    })

    if (!password || !accessToken || !refreshToken) {
      console.error('❌ Missing parameters:', {
        password: !!password,
        accessToken: !!accessToken,
        refreshToken: !!refreshToken
      })
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400, headers: securityHeaders }
      )
    }

    console.log('🔄 All parameters present, proceeding with password reset')

    // Create a new Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Set the session with the provided tokens
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    })

    if (sessionError) {
      console.error('❌ Error setting session:', sessionError)
      return NextResponse.json(
        { error: 'Invalid or expired reset link' },
        { status: 400, headers: securityHeaders }
      )
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    })

    if (updateError) {
      console.error('❌ Error updating password:', updateError)
      return NextResponse.json(
        { error: 'Failed to update password', details: updateError.message },
        { status: 500, headers: securityHeaders }
      )
    }

    console.log('✅ Password reset successfully')

    return NextResponse.json(
      { 
        success: true,
        message: 'Password reset successfully'
      },
      { status: 200, headers: securityHeaders }
    )

  } catch (error) {
    console.error('❌ Reset password API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: securityHeaders }
    )
  }
}