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
    console.log('📧 Resend verification API called')
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400, headers: securityHeaders }
      )
    }

    console.log('🔍 Looking up user by email:', email)

    // Find user by email in profiles table
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, email_verified, full_name')
      .eq('email', email)
      .single()

    if (profileError || !profileData) {
      console.log('❌ User not found:', profileError?.message)
      return NextResponse.json(
        { error: 'User not found with this email address' },
        { status: 404, headers: securityHeaders }
      )
    }

    // Check if email is already verified
    if (profileData.email_verified) {
      console.log('⚠️ Email already verified')
      return NextResponse.json(
        { 
          error: 'Email is already verified',
          alreadyVerified: true
        },
        { status: 400, headers: securityHeaders }
      )
    }

    console.log('📨 Generating new verification token for user:', profileData.id)

    // Generate new verification token
    const verificationToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Delete any existing unused tokens for this user
    const { error: deleteError } = await supabaseAdmin
      .from('email_verification_tokens')
      .delete()
      .eq('user_id', profileData.id)
      .is('used_at', null)

    if (deleteError) {
      console.warn('⚠️ Failed to clean up old tokens:', deleteError)
    }

    // Store new verification token
    const { error: tokenError } = await supabaseAdmin
      .from('email_verification_tokens')
      .insert({
        user_id: profileData.id,
        token: verificationToken,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      })

    if (tokenError) {
      console.error('❌ Failed to create verification token:', tokenError)
      return NextResponse.json(
        { error: 'Failed to generate verification token' },
        { status: 500, headers: securityHeaders }
      )
    }

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jigr.app'}/admin/profile?verify=${verificationToken}&onboarding=true`
    
    console.log('📧 Sending verification email to:', email)

    const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://jigr.app'}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: 'JiGR - Verify Your Email Address',
        data: {
          verificationToken,
          verificationUrl,
          userFullName: profileData.full_name || 'there',
          companyName: 'your company'
        }
      })
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('❌ Failed to send verification email:', errorText)
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500, headers: securityHeaders }
      )
    }

    console.log('✅ Verification email sent successfully')

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
      email: email
    }, { headers: securityHeaders })

  } catch (error) {
    console.error('❌ Resend verification error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers: securityHeaders })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint with {"email": "user@example.com"} to resend verification email',
    instructions: 'Provide the email address of the user who needs a new verification email'
  }, { headers: securityHeaders })
}