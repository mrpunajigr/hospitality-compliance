import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// CRITICAL: Add security headers to prevent CSRF issues
const securityHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Type': 'application/json'
}

// CRITICAL: Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// Create Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Email verification API called')
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400, headers: securityHeaders }
      )
    }

    console.log('🧪 Verifying token:', token.substring(0, 8) + '...')

    // Find the verification token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('email_verification_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (tokenError || !tokenData) {
      console.log('❌ Invalid token:', tokenError?.message)
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400, headers: securityHeaders }
      )
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)
    
    if (now > expiresAt) {
      console.log('❌ Token expired:', { now, expiresAt })
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400, headers: securityHeaders }
      )
    }

    // Check if token was already used
    if (tokenData.used_at) {
      console.log('❌ Token already used:', tokenData.used_at)
      return NextResponse.json(
        { error: 'Verification token has already been used' },
        { status: 400, headers: securityHeaders }
      )
    }

    console.log('✅ Token is valid, verifying user email')

    // Mark token as used
    const { error: markUsedError } = await supabaseAdmin
      .from('email_verification_tokens')
      .update({ 
        used_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenData.id)

    if (markUsedError) {
      console.error('❌ Failed to mark token as used:', markUsedError)
      return NextResponse.json(
        { error: 'Failed to process verification' },
        { status: 500, headers: securityHeaders }
      )
    }

    // Update user profile to mark email as verified
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        email_verified: true,
        email_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenData.user_id)

    if (profileError) {
      console.error('❌ Failed to update profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 500, headers: securityHeaders }
      )
    }

    console.log('✅ Email verification successful for user:', tokenData.user_id)

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      userId: tokenData.user_id
    }, { headers: securityHeaders })

  } catch (error) {
    console.error('❌ Email verification error:', error)
    return NextResponse.json({
      error: 'Internal server error during verification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers: securityHeaders })
  }
}

export async function GET(request: NextRequest) {
  // Handle GET requests for token verification via URL parameters
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({
        message: 'POST to this endpoint with {"token": "verification_token"} to verify email',
        instructions: 'Token should be provided in request body for POST or as ?token= parameter for GET'
      }, { headers: securityHeaders })
    }

    // Reuse POST logic for GET requests
    const response = await POST(new NextRequest(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    }))

    return response

  } catch (error) {
    console.error('❌ GET verification error:', error)
    return NextResponse.json({
      error: 'Failed to process GET verification request'
    }, { status: 500, headers: securityHeaders })
  }
}