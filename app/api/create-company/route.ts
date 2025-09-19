import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

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
      fullName
    } = body

    if (!businessName || !businessType || !userId || !email) {
      console.log('❌ Missing required fields:', { businessName, businessType, userId, email })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
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
          { status: 500 }
        )
      }
      console.log('✅ Supabase connection successful')
    } catch (connError) {
      console.error('❌ Supabase connection exception:', connError)
      return NextResponse.json(
        { error: 'Database connection exception', details: (connError as Error).message },
        { status: 500 }
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
        { status: 500 }
      )
    }

    if (!existingProfile) {
      console.log('Creating missing profile for authenticated user:', userId)
      // Only create profile if user exists in auth.users (enforced by foreign key)
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          full_name: fullName,
          phone: phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (profileError) {
        console.error('Error creating profile:', profileError)
        // If foreign key constraint fails, it means user doesn't exist in auth.users
        if (profileError.code === '23503') {
          return NextResponse.json(
            { error: 'User account not found. Please ensure user is properly registered.' },
            { status: 400 }
          )
        }
        return NextResponse.json(
          { error: 'Failed to create user profile', details: profileError.message },
          { status: 500 }
        )
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
        { status: 500 }
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
            { status: 409 }
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
            { status: 409 }
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
    const clientInsertData = {
      name: businessName,
      business_type: businessType,
      business_email: email,
      phone: phone,
      subscription_status: 'trial',
      subscription_tier: 'basic',
      onboarding_status: 'started',
      estimated_monthly_deliveries: 50 // Default estimate
    }
    console.log('🔵 Client insert data:', clientInsertData)
    
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
      return NextResponse.json(
        { error: 'Failed to create company', details: clientError.message },
        { status: 500 }
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
        { status: 500 }
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
      client: clientData
    })

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
      { status: 500 }
    )
  }
}