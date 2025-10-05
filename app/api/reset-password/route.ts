import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const securityHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }

  try {
    const { password, accessToken, refreshToken, token, type } = await req.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400, headers: securityHeaders }
      )
    }

    console.log('🔄 Processing password reset with params:', {
      hasPassword: !!password,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasToken: !!token,
      type
    })

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

    let sessionSet = false

    // Handle new format (token + type=recovery)
    if (token && type === 'recovery') {
      console.log('🔧 Using new token format (recovery token)')
      
      // For the new format, we need to verify the token and get session
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery'
      })

      if (verifyError) {
        console.error('❌ Error verifying recovery token:', verifyError)
        return NextResponse.json(
          { error: 'Invalid or expired reset link' },
          { status: 400, headers: securityHeaders }
        )
      }

      if (data.session) {
        const { error: sessionError } = await supabase.auth.setSession(data.session)
        if (!sessionError) {
          sessionSet = true
        }
      }
    }
    // Handle old format (access_token + refresh_token)
    else if (accessToken && refreshToken) {
      console.log('🔧 Using old token format (access + refresh tokens)')
      
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })

      if (!sessionError) {
        sessionSet = true
      }
    }

    if (!sessionSet) {
      console.error('❌ Could not establish session with provided tokens')
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