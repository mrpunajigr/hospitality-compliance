// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// CRITICAL: Non-conditional initialization for production reliability
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create the main client (always initialized, never null)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'jigr-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    flowType: 'pkce'
  }
})

// Admin client for server-side operations
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Storage bucket constants
export const STORAGE_BUCKET = 'delivery-dockets'
export const DELIVERY_DOCKETS_BUCKET = 'delivery-dockets'

// Database helper functions (simplified, no complex module imports)
export const getImageUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data?.publicUrl || ''
}

export const getDeliveryDocketSignedUrl = async (path: string, expiresIn = 3600) => {
  const { data, error } = await supabase.storage
    .from(DELIVERY_DOCKETS_BUCKET)
    .createSignedUrl(path, expiresIn)
  
  if (error) {
    console.error('Error creating signed URL:', error)
    return null
  }
  
  return data?.signedUrl || null
}

export const getDeliveryDocketImageUrl = (path: string) => {
  return getImageUrl(DELIVERY_DOCKETS_BUCKET, path)
}

export const getDeliveryDocketThumbnail = (path: string, width = 200, height = 200) => {
  const url = getDeliveryDocketImageUrl(path)
  if (!url) return ''
  
  // Add transformation parameters for Supabase Storage
  const transformUrl = new URL(url)
  transformUrl.searchParams.set('width', width.toString())
  transformUrl.searchParams.set('height', height.toString())
  transformUrl.searchParams.set('resize', 'contain')
  
  return transformUrl.toString()
}

export const getDeliveryDocketPreview = (path: string) => {
  return getDeliveryDocketThumbnail(path, 800, 600)
}

// Simple auth helper for client components
export const checkAuth = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error('Auth check failed:', error)
    return null
  }
}

// Ensure session is refreshed on client side
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      window.location.href = '/signin'
    }
  })
}

// Placeholder database helpers for TypeScript compatibility
// These maintain the exports other files expect while simplifying the implementation
export const getUserClients = async (userId: string) => {
  const { data, error } = await supabase
    .from('client_users')
    .select(`
      client_id,
      role,
      clients (
        id,
        name,
        business_type,
        business_email,
        subscription_status
      )
    `)
    .eq('user_id', userId)
  
  if (error) throw error
  return data || []
}

export const hasClientAccess = async (userId: string, clientId: string) => {
  const { data, error } = await supabase
    .from('client_users')
    .select('client_id')
    .eq('user_id', userId)
    .eq('client_id', clientId)
    .single()
  
  return !error && !!data
}

export const getUserClientRole = async (userId: string, clientId: string) => {
  const { data, error } = await supabase
    .from('client_users')
    .select('role')
    .eq('user_id', userId)
    .eq('client_id', clientId)
    .single()
  
  return data?.role || null
}

export const getDeliveryRecords = async (clientId: string) => {
  const { data, error } = await supabase
    .from('delivery_records')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export const getComplianceAlerts = async (clientId: string) => {
  const { data, error } = await supabase
    .from('compliance_alerts')
    .select('*')
    .eq('client_id', clientId)
    .eq('acknowledged', false)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export const acknowledgeAlert = async (alertId: string) => {
  const { error } = await supabase
    .from('compliance_alerts')
    .update({ acknowledged: true })
    .eq('id', alertId)
  
  if (error) throw error
}

export const createDeliveryRecord = async (recordData: any) => {
  const { data, error } = await supabase
    .from('delivery_records')
    .insert(recordData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const createAuditLog = async (logData: any) => {
  const { data, error } = await supabase
    .from('audit_logs')
    .insert(logData)
    .select()
    .single()
  
  if (error) throw error
  return data
}