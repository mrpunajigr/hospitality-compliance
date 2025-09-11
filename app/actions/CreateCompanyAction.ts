'use server'

import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createCompanyAction(formData: FormData) {
  console.log('🚀 SERVER ACTION: Starting company creation')
  
  try {
    // Extract form data
    const businessName = formData.get('businessName') as string
    const businessType = formData.get('businessType') as string
    const email = formData.get('email') as string
    const userId = formData.get('userId') as string
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string

    console.log('📝 SERVER ACTION: Data extracted', { businessName, businessType, email, fullName })

    // Test database connection first
    const { data: testData, error: testError } = await supabaseAdmin
      .from('clients')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error('❌ SERVER ACTION: Database connection failed', testError)
      throw new Error(`Database connection failed: ${testError.message}`)
    }

    console.log('✅ SERVER ACTION: Database connection successful')

    // Create client record
    const { data: clientData, error: clientError } = await supabaseAdmin
      .from('clients')
      .insert({
        name: businessName,
        business_type: businessType,
        business_email: email,
        phone: phone,
        subscription_status: 'trial',
        subscription_tier: 'basic',
        onboarding_status: 'started',
        estimated_monthly_deliveries: 50
      })
      .select()
      .single()

    if (clientError) {
      console.error('❌ SERVER ACTION: Client creation failed', clientError)
      throw new Error(`Client creation failed: ${clientError.message}`)
    }

    console.log('✅ SERVER ACTION: Client created', clientData)

    // Create user profile if doesn't exist
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existingProfile) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          full_name: fullName,
          email: email,
          phone: phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('❌ SERVER ACTION: Profile creation failed', profileError)
        throw new Error(`Profile creation failed: ${profileError.message}`)
      }

      console.log('✅ SERVER ACTION: Profile created')
    }

    // Link user to client
    const { error: linkError } = await supabaseAdmin
      .from('client_users')
      .insert({
        client_id: clientData.id,
        user_id: userId,
        role: 'OWNER',
        status: 'active',
        joined_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })

    if (linkError) {
      console.error('❌ SERVER ACTION: User linking failed', linkError)
      throw new Error(`User linking failed: ${linkError.message}`)
    }

    console.log('✅ SERVER ACTION: User linked to client')

    // Create compliance settings
    const { error: complianceError } = await supabaseAdmin
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
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (complianceError) {
      console.error('❌ SERVER ACTION: Compliance settings failed', complianceError)
      throw new Error(`Compliance settings failed: ${complianceError.message}`)
    }

    console.log('✅ SERVER ACTION: Company creation completed successfully')

    // Redirect to dashboard
    redirect('/app/dashboard')

  } catch (error) {
    console.error('💥 SERVER ACTION: Fatal error', error)
    
    // Return error state instead of throwing
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }
  }
}