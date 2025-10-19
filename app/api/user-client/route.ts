import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use admin client for reliable database access
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

export async function GET(request: NextRequest) {
  try {
    // Get user ID from URL params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    console.log('🔍 USER-CLIENT API: Fetching data for userId:', userId)

    // Direct query - same as the working SQL you ran
    const { data, error } = await supabaseAdmin
      .from('client_users')
      .select(`
        client_id,
        role,
        status,
        champion_enrolled,
        clients (
          id,
          name,
          business_type,
          business_email,
          phone,
          address,
          license_number,
          subscription_status,
          subscription_tier,
          onboarding_status,
          estimated_monthly_deliveries,
          owner_name,
          logo_url
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (error || !data || !data.clients) {
      console.error('❌ USER-CLIENT API: No client found for user:', userId, error?.message)
      return NextResponse.json({ error: 'No client found for user' }, { status: 404 })
    }

    const clientInfo = Array.isArray(data.clients) ? data.clients[0] : data.clients

    const userClient = {
      id: clientInfo.id,
      name: clientInfo.name,
      role: data.role,
      status: data.status,
      champion_enrolled: data.champion_enrolled || false,
      jobTitle: undefined, // Will add later if needed
      business_type: clientInfo.business_type,
      business_email: clientInfo.business_email,
      phone: clientInfo.phone,
      address: clientInfo.address,
      license_number: clientInfo.license_number,
      subscription_status: clientInfo.subscription_status,
      subscription_tier: clientInfo.subscription_tier,
      onboarding_status: clientInfo.onboarding_status,
      estimated_monthly_deliveries: clientInfo.estimated_monthly_deliveries,
      owner_name: clientInfo.owner_name,
      logo_url: clientInfo.logo_url
    }

    console.log('✅ USER-CLIENT API: Successfully retrieved data:', {
      name: userClient.name,
      role: userClient.role,
      champion_enrolled: userClient.champion_enrolled,
      owner_name: userClient.owner_name,
      address: userClient.address,
      hasAddress: !!userClient.address,
      hasOwnerName: !!userClient.owner_name
    })

    return NextResponse.json({ userClient })

  } catch (error) {
    console.error('❌ USER-CLIENT API: Exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}