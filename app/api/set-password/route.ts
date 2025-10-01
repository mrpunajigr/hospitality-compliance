import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const securityHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }

  try {
    const { password, profileData, profileImage } = await req.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400, headers: securityHeaders }
      )
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers: securityHeaders }
      )
    }

    console.log('🔐 Setting password for user:', user.id)

    // Set the user's password using Supabase auth
    const { error: passwordError } = await supabase.auth.updateUser({
      password: password
    })

    if (passwordError) {
      console.error('❌ Error setting password:', passwordError)
      return NextResponse.json(
        { error: 'Failed to set password', details: passwordError.message },
        { status: 500, headers: securityHeaders }
      )
    }

    console.log('✅ Password set successfully')

    // Update user profile in the profiles table
    if (profileData) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          preferred_name: profileData.preferredName,
          mobile_number: profileData.mobileNumber,
          job_title: profileData.jobTitle,
          department: profileData.department,
          avatar_url: profileImage,
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('❌ Error updating profile:', profileError)
        // Don't fail the request if profile update fails
        console.log('⚠️ Password set but profile update failed')
      } else {
        console.log('✅ Profile updated successfully')
      }
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Password and profile updated successfully'
      },
      { status: 200, headers: securityHeaders }
    )

  } catch (error) {
    console.error('❌ Set password API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: securityHeaders }
    )
  }
}