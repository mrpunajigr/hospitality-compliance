import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service role client for admin operations (like demo uploads)
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
export const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null

// Storage bucket names
export const STORAGE_BUCKET = 'bar-images' // Legacy bucket from template
export const DELIVERY_DOCKETS_BUCKET = 'delivery-dockets' // New bucket for compliance app

// Helper function to get public URL for uploaded files (legacy)
export const getImageUrl = (path: string) => {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
  return data.publicUrl || ''
}

// Helper function to get delivery docket URL
export const getDeliveryDocketUrl = (path: string) => {
  const { data } = supabase.storage.from(DELIVERY_DOCKETS_BUCKET).getPublicUrl(path)
  return data?.publicUrl || ''
}

// =====================================================
// MULTI-TENANT HELPER FUNCTIONS
// =====================================================

// Get user's client relationships
export const getUserClients = async (userId: string) => {
  const { data, error } = await supabase
    .from('client_users')
    .select(`
      client_id,
      role,
      status,
      clients (
        id,
        name,
        subscription_status,
        subscription_tier
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active')

  if (error) {
    console.error('Error fetching user clients:', error)
    return []
  }

  return data || []
}

// Check if user has access to a specific client
export const hasClientAccess = async (userId: string, clientId: string) => {
  const { data, error } = await supabase
    .from('client_users')
    .select('id')
    .eq('user_id', userId)
    .eq('client_id', clientId)
    .eq('status', 'active')
    .single()

  return !error && !!data
}

// Get user's role in a specific client
export const getUserClientRole = async (userId: string, clientId: string) => {
  const { data, error } = await supabase
    .from('client_users')
    .select('role')
    .eq('user_id', userId)
    .eq('client_id', clientId)
    .eq('status', 'active')
    .single()

  if (error) {
    console.error('Error fetching user role:', error)
    return null
  }

  return data?.role || null
}

// =====================================================
// DELIVERY RECORDS HELPERS
// =====================================================

// Get delivery records for a client
export const getDeliveryRecords = async (clientId: string, limit = 50) => {
  try {
    // Use server-side API to bypass RLS issues
    const response = await fetch(`/api/delivery-records?clientId=${clientId}&limit=${limit}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch delivery records')
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch delivery records')
    }

    return result.data || []

  } catch (error) {
    console.error('Error fetching delivery records:', error)
    return []
  }
}

// Create a new delivery record
export const createDeliveryRecord = async (record: {
  clientId: string
  userId: string
  supplierId?: string
  supplierName: string
  imagePath: string
  docketNumber?: string
  deliveryDate?: string
}) => {
  const { data, error } = await supabase
    .from('delivery_records')
    .insert({
      client_id: record.clientId,
      user_id: record.userId,
      supplier_id: record.supplierId,
      supplier_name: record.supplierName,
      image_path: record.imagePath,
      docket_number: record.docketNumber,
      delivery_date: record.deliveryDate,
      processing_status: 'pending'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating delivery record:', error)
    return null
  }

  return data
}

// =====================================================
// COMPLIANCE ALERTS HELPERS
// =====================================================

// Get active compliance alerts for a client
export const getComplianceAlerts = async (clientId: string) => {
  try {
    // Use server-side API to bypass RLS issues
    const response = await fetch(`/api/compliance-alerts?clientId=${clientId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch compliance alerts')
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch compliance alerts')
    }

    return result.data || []

  } catch (error) {
    console.error('Error fetching compliance alerts:', error)
    return []
  }
}

// Acknowledge a compliance alert
export const acknowledgeAlert = async (alertId: string, userId: string, correctiveActions?: string) => {
  const { data, error } = await supabase
    .from('compliance_alerts')
    .update({
      acknowledged_by: userId,
      acknowledged_at: new Date().toISOString(),
      corrective_actions: correctiveActions
    })
    .eq('id', alertId)
    .select()
    .single()

  if (error) {
    console.error('Error acknowledging alert:', error)
    return null
  }

  return data
}

// =====================================================
// SUPPLIERS HELPERS
// =====================================================

// Get suppliers for a client
export const getSuppliers = async (clientId: string) => {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('client_id', clientId)
    .eq('status', 'active')
    .order('name')

  if (error) {
    console.error('Error fetching suppliers:', error)
    return []
  }

  return data || []
}

// Create a new supplier
export const createSupplier = async (supplier: {
  clientId: string
  name: string
  contactEmail?: string
  contactPhone?: string
  deliverySchedule?: string[]
  productTypes?: string[]
}) => {
  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      client_id: supplier.clientId,
      name: supplier.name,
      contact_email: supplier.contactEmail,
      contact_phone: supplier.contactPhone,
      delivery_schedule: supplier.deliverySchedule,
      product_types: supplier.productTypes,
      status: 'active'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating supplier:', error)
    return null
  }

  return data
}

// =====================================================
// TEAM MANAGEMENT HELPERS
// =====================================================

// Get team members for a client
export const getTeamMembers = async (clientId: string) => {
  const { data, error } = await supabase
    .from('client_users')
    .select(`
      *,
      profiles (
        full_name,
        email,
        phone,
        avatar_url
      )
    `)
    .eq('client_id', clientId)
    .order('created_at')

  if (error) {
    console.error('Error fetching team members:', error)
    return []
  }

  return data || []
}

// Create a team invitation
export const createInvitation = async (invitation: {
  email: string
  clientId: string
  role: string
  invitedBy: string
}) => {
  const { data, error } = await supabase
    .from('invitations')
    .insert({
      email: invitation.email,
      client_id: invitation.clientId,
      role: invitation.role,
      invited_by: invitation.invitedBy
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating invitation:', error)
    return null
  }

  return data
}

// =====================================================
// AUDIT LOGGING
// =====================================================

// Create audit log entry
export const createAuditLog = async (log: {
  clientId: string
  userId?: string
  action: string
  resourceType?: string
  resourceId?: string
  details?: any
}) => {
  const { error } = await supabase
    .from('audit_logs')
    .insert({
      client_id: log.clientId,
      user_id: log.userId,
      action: log.action,
      resource_type: log.resourceType,
      resource_id: log.resourceId,
      details: log.details
    })

  if (error) {
    console.error('Error creating audit log:', error)
  }
}