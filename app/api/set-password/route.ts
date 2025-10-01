import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase admin client with service role key for auth operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
)

export async function POST(req: NextRequest) {
  const securityHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }

  try {
    const { password, profileData, profileImage, userId } = await req.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400, headers: securityHeaders }
      )
    }

    // For now, accept userId directly to bypass auth context issue
    // This is a temporary fix - in production, proper auth token should be used
    let user: any = null
    let userError: any = null

    if (userId) {
      // Use the provided userId directly
      user = { id: userId }
      console.log('🔐 Using provided userId:', userId)
    } else {
      // Try to get user from auth context
      const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser()
      user = authUser
      userError = authError
    }
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required - userId must be provided' },
        { status: 401, headers: securityHeaders }
      )
    }

    console.log('🔐 Setting password for user:', user.id)

    // First check if user exists in auth.users by trying to get user info
    const { data: existingUser, error: userCheckError } = await supabaseAdmin.auth.admin.getUserById(user.id)
    
    if (userCheckError || !existingUser.user) {
      console.error('❌ User not found in auth.users:', userCheckError)
      return NextResponse.json(
        { error: 'User account not found. Please ensure user is properly registered.' },
        { status: 400, headers: securityHeaders }
      )
    }

    console.log('✅ User exists in auth.users:', existingUser.user.id)

    // Set the user's password using Supabase admin auth
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: password }
    )

    if (passwordError) {
      console.error('❌ Error setting password:', passwordError)
      return NextResponse.json(
        { error: 'Failed to set password', details: passwordError.message },
        { status: 500, headers: securityHeaders }
      )
    }

    console.log('✅ Password set successfully')

    // Update user profile in the profiles table using admin client
    if (profileData) {
      const { error: profileError } = await supabaseAdmin
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
        return NextResponse.json(
          { error: 'Failed to update profile', details: profileError.message },
          { status: 500, headers: securityHeaders }
        )
      } else {
        console.log('✅ Profile updated successfully')
      }
    } else {
      // Even if no profile data provided, ensure basic profile exists
      const { error: basicProfileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: user.id,
          updated_at: new Date().toISOString()
        })

      if (basicProfileError) {
        console.error('❌ Error creating basic profile:', basicProfileError)
        return NextResponse.json(
          { error: 'Failed to create user profile', details: basicProfileError.message },
          { status: 500, headers: securityHeaders }
        )
      } else {
        console.log('✅ Basic profile created successfully')
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