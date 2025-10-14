/**
 * Authentication Utilities - Legacy Implementation
 * 
 * This is the original authentication implementation preserved for fallback
 * when the modular Authentication Core is not available.
 */

import { supabase } from './supabase'

export interface UserClient {
  id: string
  name: string
  role: string
  status: string
  jobTitle?: string
  business_type?: string
  business_email?: string
  phone?: string
  address?: string
  license_number?: string
  subscription_status?: string
  subscription_tier?: string
  onboarding_status?: string
  estimated_monthly_deliveries?: number
  owner_name?: string
  logo_url?: string
}

/**
 * Get the user's associated client/company information
 */
export async function getUserClient(userId: string): Promise<UserClient | null> {
  try {
    // First, get the basic client relationship
    console.log('🔍 getUserClient: Querying client_users for userId:', userId)
    const { data, error } = await supabase
      .from('client_users')
      .select(`
        client_id,
        role,
        status,
        clients (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()
    
    console.log('🔍 getUserClient: client_users query result:', { data, error: error?.message })

    if (error || !data || !data.clients) {
      if (error) {
        console.log('ℹ️ User client lookup result:', error.message || 'No client association found')
      } else {
        console.log('ℹ️ User has no active client association')
      }
      return null
    }

    // Then get full client details
    const clientInfo = Array.isArray(data.clients) ? data.clients[0] : data.clients as { id: string; name: string }
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientInfo.id)
      .single()

    if (clientError) {
      console.log('ℹ️ Client details lookup result:', clientError.message || 'Unable to fetch extended client details')
      // Return basic info even if extended details fail
      return {
        id: clientInfo.id,
        name: clientInfo.name,
        role: data.role,
        status: data.status,
        jobTitle: undefined, // job_title column may not exist yet
        business_type: undefined,
        business_email: undefined,
        phone: undefined,
        address: undefined,
        license_number: undefined,
        subscription_status: undefined,
        subscription_tier: undefined,
        onboarding_status: undefined,
        estimated_monthly_deliveries: undefined,
        owner_name: undefined,
        logo_url: undefined
      }
    }

    console.log('✅ getUserClient: Successfully retrieved client data for:', clientInfo.name)
    return {
      id: clientInfo.id,
      name: clientInfo.name,
      role: data.role,
      status: data.status,
      jobTitle: undefined, // job_title column may not exist yet - will add later
      business_type: clientData.business_type,
      business_email: clientData.business_email,
      phone: clientData.phone,
      address: clientData.address,
      license_number: clientData.license_number,
      subscription_status: clientData.subscription_status,
      subscription_tier: clientData.subscription_tier,
      onboarding_status: clientData.onboarding_status,
      estimated_monthly_deliveries: clientData.estimated_monthly_deliveries,
      owner_name: clientData.owner_name,
      logo_url: clientData.logo_url
    }
  } catch (error) {
    console.log('ℹ️ getUserClient exception:', error instanceof Error ? error.message : 'Unknown error occurred')
    return null
  }
}

/**
 * Check if user has access to a specific client
 */
export async function userHasClientAccess(userId: string, clientId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('client_users')
      .select('id')
      .eq('user_id', userId)
      .eq('client_id', clientId)
      .eq('status', 'active')
      .single()

    return !error && !!data
  } catch (error) {
    return false
  }
}