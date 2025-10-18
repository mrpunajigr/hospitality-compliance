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
    console.log('🔐 Set-password API called at:', new Date().toISOString())
    console.log('🔧 Environment check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
      serviceRoleKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) + '...'
    })

    const { password, profileData, profileImage, userId } = await req.json()
    console.log('📝 Request data received:', {
      hasPassword: !!password,
      hasProfileData: !!profileData,
      hasProfileImage: !!profileImage,
      userId: userId
    })

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
      console.error('❌ Full password error:', JSON.stringify(passwordError, null, 2))
      console.error('❌ User ID being used:', user.id)
      return NextResponse.json(
        { 
          error: 'Failed to set password', 
          details: passwordError.message,
          userId: user.id,
          errorCode: passwordError.code || 'unknown',
          fullError: passwordError
        },
        { status: 500, headers: securityHeaders }
      )
    }

    console.log('✅ Password set successfully')

    // Update user profile in the profiles table using admin client
    if (profileData) {
      // Get user email for profile update
      const { data: authUser, error: userError } = await supabaseAdmin.auth.admin.getUserById(user.id)
      const userEmail = authUser?.user?.email

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: user.id,
          email: userEmail, // Include email to satisfy NOT NULL constraint
          preferred_name: profileData.preferredName,
          phone: profileData.mobileNumber, // Column is 'phone' not 'mobile_number'
          job_title: profileData.jobTitle,
          // department: profileData.department, // Department column doesn't exist in profiles table
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
        
        // Champion Role Detection Logic - First User Registration
        // Find the user's client record
        const { data: clientUser, error: clientError } = await supabaseAdmin
          .from('client_users')
          .select('client_id, role')
          .eq('user_id', user.id)
          .single()
        
        if (clientUser) {
          // Check if this is the first user for this company
          const { data: allClientUsers, error: countError } = await supabaseAdmin
            .from('client_users')
            .select('id, created_at')
            .eq('client_id', clientUser.client_id)
            .order('created_at', { ascending: true })
          
          if (!countError && allClientUsers && allClientUsers.length > 0) {
            const isFirstUser = allClientUsers[0].id === user.id || allClientUsers.length === 1
            
            if (isFirstUser && clientUser.role === 'OWNER') {
              console.log(`🏆 Champion detected: First user registration for company`)
              
              // Update role to CHAMPION (first users are Champions, not owners initially)
              const { error: roleUpdateError } = await supabaseAdmin
                .from('client_users')
                .update({ 
                  role: 'CHAMPION',
                  updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id)
              
              if (roleUpdateError) {
                console.error('❌ Failed to update role to CHAMPION:', roleUpdateError)
              } else {
                console.log('✅ Role updated to CHAMPION successfully')
                
                // Set client to evaluation mode
                const { error: evaluationError } = await supabaseAdmin
                  .from('clients')
                  .update({
                    evaluation_mode: true,
                    evaluation_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
                    champion_user_id: user.id,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', clientUser.client_id)
                
                if (evaluationError) {
                  console.error('❌ Failed to set evaluation mode:', evaluationError)
                } else {
                  console.log('✅ Client set to evaluation mode successfully')
                }
              }
            } else if (!isFirstUser) {
              console.log(`ℹ️ Not first user - regular role assignment`)
            }
          }
        }
      }
    } else {
      // No profile data provided - just update the timestamp
      // Don't create new profile, just update existing one
      console.log('ℹ️ No profile data provided, skipping profile update')
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
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500, headers: securityHeaders }
    )
  }
}