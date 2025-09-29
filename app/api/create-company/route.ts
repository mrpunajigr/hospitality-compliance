import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

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
console.log('🔑 Environment check:', {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING'
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
)

export async function POST(request: Request) {
  try {
    console.log('🚀 Create company API called')
    const body = await request.json()
    console.log('📋 Request body:', body)
    
    const { 
      businessName, 
      businessType, 
      phone, 
      userId,
      email,
      fullName,
      position,
      ownerName
    } = body

    // Initialize email verification status at function level
    let emailSentSuccessfully = false

    if (!businessName || !businessType || !userId || !email) {
      console.log('❌ Missing required fields:', { businessName, businessType, userId, email })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: securityHeaders }
      )
    }
    
    console.log('✅ All required fields present')
    
    // Test Supabase connection
    console.log('🧪 Testing Supabase connection...')
    try {
      const { data, error } = await supabaseAdmin.from('clients').select('count').limit(1)
      if (error) {
        console.error('❌ Supabase connection test failed:', error)
        return NextResponse.json(
          { error: 'Database connection failed', details: error.message },
          { status: 500, headers: securityHeaders }
        )
      }
      console.log('✅ Supabase connection successful')
    } catch (connError) {
      console.error('❌ Supabase connection exception:', connError)
      return NextResponse.json(
        { error: 'Database connection exception', details: (connError as Error).message },
        { status: 500, headers: securityHeaders }
      )
    }

    // 1. Verify user exists in auth.users and get/create profile
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is expected if profile doesn't exist
      console.error('Error checking profile:', profileCheckError)
      return NextResponse.json(
        { error: 'Failed to verify user profile', details: profileCheckError.message },
        { status: 500, headers: securityHeaders }
      )
    }

    if (!existingProfile) {
      console.log('Creating missing profile for authenticated user:', userId)
      // Only create profile if user exists in auth.users (enforced by foreign key)
      // Use minimal fields that are guaranteed to exist
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          full_name: fullName
        })
      
      if (profileError) {
        console.error('❌ Error creating profile:', profileError)
        console.error('❌ Profile error details:', {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint
        })
        
        // If foreign key constraint fails, it means user doesn't exist in auth.users
        if (profileError.code === '23503') {
          return NextResponse.json(
            { error: 'User account not found. Please ensure user is properly registered.' },
            { status: 400, headers: securityHeaders }
          )
        }
        else {
          return NextResponse.json(
            { error: 'Failed to create user profile', details: profileError.message },
            { status: 500, headers: securityHeaders }
          )
        }
      }
    }

    // 2. Check for duplicate business names
    console.log('🔍 Checking for duplicate business names...')
    const businessNameTrimmed = businessName.trim()
    
    const { data: existingClients, error: duplicateCheckError } = await supabaseAdmin
      .from('clients')
      .select('id, name, business_email')
      .ilike('name', businessNameTrimmed)
      .limit(5) // Check first 5 matches for analysis
    
    if (duplicateCheckError) {
      console.error('Error checking for duplicate business names:', duplicateCheckError)
      return NextResponse.json(
        { error: 'Failed to validate business name', details: duplicateCheckError.message },
        { status: 500, headers: securityHeaders }
      )
    }
    
    // Analyze duplicate matches
    if (existingClients && existingClients.length > 0) {
      console.log('🔍 Found existing businesses with similar names:', existingClients.length)
      
      // Check for exact name match (case-insensitive)
      const exactMatch = existingClients.find(client => 
        client.name.toLowerCase() === businessNameTrimmed.toLowerCase()
      )
      
      if (exactMatch) {
        console.warn('❌ Exact business name match found:', exactMatch.name)
        
        // Check if same email trying to register same business
        if (exactMatch.business_email === email) {
          return NextResponse.json(
            { 
              error: 'Account already exists',
              errorCode: 'ACCOUNT_EXISTS',
              message: 'An account for this business already exists with your email address. Please sign in instead.',
              canRetry: false,
              action: 'signin'
            },
            { status: 409, headers: securityHeaders }
          )
        } else {
          // Different email, business name taken
          return NextResponse.json(
            { 
              error: 'Business name already registered',
              errorCode: 'DUPLICATE_BUSINESS_NAME',
              message: `This business name is already registered by another user. Please choose a different name, or contact ${exactMatch.business_email} for access to the existing account.`,
              canRetry: true,
              contactEmail: exactMatch.business_email,
              suggestions: [
                `${businessNameTrimmed} Ltd`,
                `${businessNameTrimmed} 2025`,
                `${businessNameTrimmed} NZ`
              ]
            },
            { status: 409, headers: securityHeaders }
          )
        }
      }
      
      // If we get here, there are similar names but no exact match
      console.log('✅ No exact match found, proceeding with business creation')
    } else {
      console.log('✅ No similar business names found')
    }

    // 3. Create the company/client record
    console.log('🏢 Creating client record...')
    const clientInsertData: any = {
      name: businessName,
      business_type: businessType,
      business_email: email,
      phone: phone,
      subscription_status: 'trial',
      subscription_tier: 'basic',
      onboarding_status: 'started',
      estimated_monthly_deliveries: 50 // Default estimate
    }
    
    // Add owner_name if provided (gracefully handle if column doesn't exist)
    if (ownerName || fullName) {
      clientInsertData.owner_name = ownerName || fullName
    }
    console.log('🔵 Client insert data:', clientInsertData)
    console.log('🔵 About to insert client with fields:', Object.keys(clientInsertData))
    
    const { data: clientData, error: clientError } = await supabaseAdmin
      .from('clients')
      .insert(clientInsertData)
      .select()
      .single()

    if (clientError) {
      console.error('Error creating client:', clientError)
      console.error('Client error details:', {
        code: clientError.code,
        message: clientError.message,
        details: clientError.details,
        hint: clientError.hint
      })
      
      // Handle specific case where owner_name column doesn't exist
      if (clientError.message?.includes('owner_name') || clientError.code === '42703') {
        console.log('⚠️ owner_name column missing, retrying without it...')
        // Retry without owner_name field
        const retryData = { ...clientInsertData }
        delete retryData.owner_name
        
        const { data: retryClientData, error: retryError } = await supabaseAdmin
          .from('clients')
          .insert(retryData)
          .select()
          .single()
          
        if (!retryError) {
          console.log('✅ Client created successfully without owner_name field')
          
          // Generate verification token and send verification email immediately after client creation
          console.log('📧 Generating verification token and sending email...')
          
          try {
            // Generate cryptographically secure verification token
            const verificationToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
              .map(b => b.toString(16).padStart(2, '0'))
              .join('')
            
            console.log('🔑 Generated verification token')
            
            // Store verification token in database
            const { error: tokenError } = await supabaseAdmin
              .from('email_verification_tokens')
              .insert({
                user_id: userId,
                token: verificationToken,
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
              })

            if (tokenError) {
              console.error('❌ Error creating verification token:', tokenError)
              console.error('Token error details:', tokenError.message, tokenError.details)
              // Continue without failing - user can request resend later
            } else {
              console.log('✅ Verification token stored in database')
              
              // Send verification email
              const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jigr.app'}/update-profile?verify=${verificationToken}&onboarding=true`
              console.log('📧 Attempting to send verification email to:', email)
              
              const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://jigr.app'}/api/send-email`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  to: email,
                  subject: 'Welcome to JiGR - Verify Your Email',
                  data: {
                    verificationToken,
                    verificationUrl,
                    userFullName: fullName || 'there',
                    companyName: businessName
                  }
                })
              })

              if (emailResponse.ok) {
                const emailResult = await emailResponse.json()
                console.log('✅ Verification email sent successfully:', emailResult)
                emailSentSuccessfully = true
              } else {
                const errorText = await emailResponse.text()
                console.error('❌ Failed to send verification email. Status:', emailResponse.status)
                console.error('❌ Email API response:', errorText)
                // Continue without failing - user can request resend later
              }
            }
          } catch (emailError) {
            console.error('❌ Error during email verification process:', emailError)
            const errorMessage = emailError instanceof Error ? emailError.message : String(emailError)
            console.error('Email error details:', errorMessage)
            // Continue without failing - company creation was successful
          }
          
          // Continue with the rest of the function using retryClientData
          const clientData = retryClientData
          
          // Jump to user linking step
          console.log('🔗 Creating client_users link...')
          const linkData = {
            user_id: userId,
            client_id: clientData.id,
            role: 'OWNER',
            status: 'active',
            joined_at: new Date().toISOString()
          }
          
          const { data: linkResult, error: linkError } = await supabaseAdmin
            .from('client_users')
            .insert(linkData)
            .select()

          if (linkError) {
            console.error('Error linking user to client:', linkError)
            return NextResponse.json(
              { error: 'Failed to link user to company', details: linkError.message },
              { status: 500, headers: securityHeaders }
            )
          }

          return NextResponse.json({
            success: true,
            client: clientData,
            note: 'Created successfully (owner_name field not available in database)'
          }, { headers: securityHeaders })
        } else {
          console.error('❌ Retry also failed:', retryError)
        }
      }
      
      // Final fallback - create absolute minimal company record
      console.log('⚠️ Attempting final fallback with minimal company data...')
      const minimalData = {
        name: businessName,
        business_email: email,
        subscription_status: 'trial'
      }
      
      const { data: minimalClient, error: minimalError } = await supabaseAdmin
        .from('clients')
        .insert(minimalData)
        .select()
        .single()
        
      if (!minimalError && minimalClient) {
        console.log('✅ Minimal client created successfully')
        
        // Link user to minimal client
        const linkData = {
          user_id: userId,
          client_id: minimalClient.id,
          role: 'OWNER',
          status: 'active',
          joined_at: new Date().toISOString()
        }
        
        const { error: linkError } = await supabaseAdmin
          .from('client_users')
          .insert(linkData)

        if (!linkError) {
          return NextResponse.json({
            success: true,
            client: minimalClient,
            note: 'Created with minimal data due to schema limitations',
            message: emailSentSuccessfully 
              ? 'Company created successfully. Please check your email to verify your account and complete onboarding.'
              : 'Company created successfully. Verification email failed to send - please use the resend option.',
            verificationEmailSent: emailSentSuccessfully
          }, { headers: securityHeaders })
        }
      }
      
      return NextResponse.json(
        { error: 'Failed to create company', details: clientError.message },
        { status: 500, headers: securityHeaders }
      )
    }

    // 4. Link the user to the company as owner
    console.log('🔗 Creating client_users link...')
    const linkData = {
      user_id: userId,
      client_id: clientData.id,
      role: 'OWNER',
      status: 'active',
      joined_at: new Date().toISOString()
    }
    console.log('🔵 Link data:', linkData)
    console.log('🔍 EXACT USER ID BEING STORED:', userId, 'Length:', userId.length)
    
    const { data: linkResult, error: linkError } = await supabaseAdmin
      .from('client_users')
      .insert(linkData)
      .select()

    if (linkError) {
      console.error('Error linking user to client:', linkError)
      console.error('Link error details:', {
        code: linkError.code,
        message: linkError.message,
        details: linkError.details,
        hint: linkError.hint
      })
      return NextResponse.json(
        { error: 'Failed to link user to company', details: linkError.message },
        { status: 500, headers: securityHeaders }
      )
    }

    console.log('✅ User successfully linked to client:', linkResult)

    // 4. Create default compliance settings for the company
    const { error: settingsError } = await supabaseAdmin
      .from('compliance_settings')
      .insert({
        client_id: clientData.id,
        rules: {
          chilled_min_temp: -2,
          chilled_max_temp: 5,
          frozen_min_temp: -25,
          frozen_max_temp: -18,
          ambient_max_temp: 25
        },
        alert_preferences: {
          email_alerts: true,
          critical_only: false,
          immediate_notification: true
        },
        notification_emails: [email],
        retention_policy: {
          document_retention_days: 365,
          auto_delete_old_records: false
        }
      })

    if (settingsError) {
      console.error('Error creating compliance settings:', settingsError)
      // This is not critical - continue without failing
    }


    return NextResponse.json({
      success: true,
      client: clientData,
      message: emailSentSuccessfully 
        ? 'Company created successfully. Please check your email to verify your account and complete onboarding.'
        : 'Company created successfully. Verification email failed to send - please use the resend option.',
      verificationEmailSent: emailSentSuccessfully
    }, { headers: securityHeaders })

  } catch (error) {
    console.error('Company creation error:', error)
    const err = error as Error
    console.error('Error details:', {
      name: err?.name,
      message: err?.message,
      stack: err?.stack
    })
    return NextResponse.json(
      { error: 'Internal server error', details: err?.message },
      { status: 500, headers: securityHeaders }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint with company data to create a new company',
    endpoint: '/api/create-company',
    method: 'POST',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    supabaseConnected: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  }, { headers: securityHeaders })
}