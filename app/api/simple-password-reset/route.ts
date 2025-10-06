import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const securityHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }

  try {
    const { email, newPassword } = await req.json()

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and new password are required' },
        { status: 400, headers: securityHeaders }
      )
    }

    console.log('🔄 Processing simple password reset for:', email)

    // Create admin Supabase client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // First, verify the user exists
    const { data: users, error: getUserError } = await supabaseAdmin.auth.admin.listUsers()
    const user = users?.users?.find(u => u.email === email)

    if (getUserError || !user) {
      console.log('❌ User not found:', email)
      // For security, we don't reveal if email exists or not
      return NextResponse.json(
        { 
          success: true,
          message: 'If an account with this email exists, the password has been reset.'
        },
        { status: 200, headers: securityHeaders }
      )
    }

    // Update the user's password directly using admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword
    })

    if (updateError) {
      console.error('❌ Error updating password:', updateError)
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500, headers: securityHeaders }
      )
    }

    console.log('✅ Password reset successfully for user:', user.id)

    return NextResponse.json(
      { 
        success: true,
        message: 'Password has been reset successfully'
      },
      { status: 200, headers: securityHeaders }
    )

  } catch (error) {
    console.error('❌ Simple password reset API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: securityHeaders }
    )
  }
}