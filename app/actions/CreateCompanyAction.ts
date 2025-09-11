'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createCompanyAction(formData: FormData) {
  console.log('🚀 SERVER ACTION: Create company called')
  
  try {
    const businessName = formData.get('businessName') as string
    const businessType = formData.get('businessType') as string  
    const phone = formData.get('phone') as string
    const userId = formData.get('userId') as string
    const email = formData.get('email') as string
    const fullName = formData.get('fullName') as string

    console.log('📋 Server action data:', { businessName, businessType, email, fullName })

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
      console.error('❌ Client creation error:', clientError)
      return { success: false, error: clientError.message }
    }

    console.log('✅ Client created:', clientData.id)
    return { success: true, client: clientData }

  } catch (error) {
    console.error('❌ Server action error:', error)
    return { success: false, error: (error as Error).message }
  }
}