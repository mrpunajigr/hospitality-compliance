/**
 * Authentication Core Module - Helper Functions
 * Extracted from lib/auth.ts - maintains identical function signatures
 * 
 * SAFETY: This preserves ALL existing functionality - ZERO RISK to existing code
 */

import { supabase, getUserClients, hasClientAccess, getUserClientRole } from '@/lib/supabase'
import type { Database, UserWithClients } from '@/types/database'
import { 
  PERMISSIONS,
  type UserRole, 
  type Permission, 
  type SubscriptionStatus,
  type ClientAccessInfo,
  type UserProfileData 
} from './AuthenticationTypes'

// Re-export permissions for backward compatibility
export { PERMISSIONS }
export type { UserRole, Permission, SubscriptionStatus } from './AuthenticationTypes'

// =============================================================================
// AUTHENTICATION HELPERS
// =============================================================================

// Get current authenticated user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  return user
}

// Get current user profile with client relationships
export const getCurrentUserProfile = async (): Promise<UserWithClients | null> => {
  const user = await getCurrentUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      client_users (
        *,
        clients (*)
      )
    `)
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data as UserWithClients
}

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser()
  return !!user
}

// =============================================================================
// MULTI-TENANT AUTHORIZATION
// =============================================================================

// Check if user has access to a specific client
export const canAccessClient = async (clientId: string): Promise<boolean> => {
  const user = await getCurrentUser()
  
  if (!user) return false
  
  return await hasClientAccess(user.id, clientId)
}

// Get user's role for a specific client
export const getUserRoleForClient = async (clientId: string): Promise<UserRole | null> => {
  const user = await getCurrentUser()
  
  if (!user) return null
  
  return await getUserClientRole(user.id, clientId) as UserRole | null
}

// Check if user has a specific role or higher for a client
export const hasRoleOrHigher = async (clientId: string, requiredRole: UserRole): Promise<boolean> => {
  const userRole = await getUserRoleForClient(clientId)
  
  if (!userRole) return false
  
  return checkRoleHierarchy(userRole, requiredRole)
}

// Role hierarchy helper
const checkRoleHierarchy = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy: Record<UserRole, number> = {
    staff: 1,
    manager: 2,
    admin: 3,
    owner: 4
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

// =============================================================================
// PERMISSION CHECKS
// =============================================================================

// Get permissions for a user role
export const getRolePermissions = (role: UserRole): Permission[] => {
  const rolePermissions: Record<UserRole, Permission[]> = {
    staff: [
      PERMISSIONS.UPLOAD_DOCUMENTS,
    ],
    manager: [
      PERMISSIONS.UPLOAD_DOCUMENTS,
      PERMISSIONS.VIEW_ALL_DOCUMENTS,
      PERMISSIONS.VIEW_COMPLIANCE_REPORTS,
      PERMISSIONS.ACKNOWLEDGE_ALERTS,
      PERMISSIONS.MANAGE_SUPPLIERS,
    ],
    admin: [
      PERMISSIONS.UPLOAD_DOCUMENTS,
      PERMISSIONS.VIEW_ALL_DOCUMENTS,
      PERMISSIONS.DELETE_DOCUMENTS,
      PERMISSIONS.VIEW_COMPLIANCE_REPORTS,
      PERMISSIONS.GENERATE_REPORTS,
      PERMISSIONS.ACKNOWLEDGE_ALERTS,
      PERMISSIONS.INVITE_USERS,
      PERMISSIONS.MANAGE_USER_ROLES,
      PERMISSIONS.MANAGE_SUPPLIERS,
      PERMISSIONS.MANAGE_SETTINGS,
      PERMISSIONS.VIEW_AUDIT_LOGS,
      PERMISSIONS.EXPORT_DATA,
      PERMISSIONS.GRANT_INSPECTOR_ACCESS,
    ],
    owner: [
      // All admin permissions plus:
      PERMISSIONS.UPLOAD_DOCUMENTS,
      PERMISSIONS.VIEW_ALL_DOCUMENTS,
      PERMISSIONS.DELETE_DOCUMENTS,
      PERMISSIONS.VIEW_COMPLIANCE_REPORTS,
      PERMISSIONS.GENERATE_REPORTS,
      PERMISSIONS.ACKNOWLEDGE_ALERTS,
      PERMISSIONS.INVITE_USERS,
      PERMISSIONS.MANAGE_USER_ROLES,
      PERMISSIONS.REMOVE_USERS,
      PERMISSIONS.MANAGE_SUPPLIERS,
      PERMISSIONS.MANAGE_SETTINGS,
      PERMISSIONS.VIEW_AUDIT_LOGS,
      PERMISSIONS.MANAGE_BILLING,
      PERMISSIONS.EXPORT_DATA,
      PERMISSIONS.GRANT_INSPECTOR_ACCESS,
    ]
  }
  
  return rolePermissions[role] || []
}

// Check if user has a specific permission for a client
export const hasPermission = async (clientId: string, permission: Permission): Promise<boolean> => {
  const userRole = await getUserRoleForClient(clientId)
  
  if (!userRole) return false
  
  const permissions = getRolePermissions(userRole)
  return permissions.includes(permission)
}

// =============================================================================
// CLIENT CONTEXT HELPERS
// =============================================================================

// Get user's accessible clients
export const getAccessibleClients = async () => {
  const user = await getCurrentUser()
  
  if (!user) return []
  
  return await getUserClients(user.id)
}

// Get default client for user (first active client)
export const getDefaultClient = async () => {
  const clients = await getAccessibleClients()
  return clients.length > 0 ? clients[0] : null
}

// Check if client subscription is active
export const isSubscriptionActive = (subscriptionStatus: SubscriptionStatus): boolean => {
  return subscriptionStatus === 'active' || subscriptionStatus === 'trial'
}

// =============================================================================
// AUTHENTICATION ACTIONS
// =============================================================================

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

// Sign up new user (for team invitations)
export const signUp = async (email: string, password: string, invitationToken?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        invitation_token: invitationToken
      }
    }
  })
  
  if (error) {
    throw new Error(error.message)
  }
  
  return data
}

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(error.message)
  }
}

// Reset password
export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  
  if (error) {
    throw new Error(error.message)
  }
}

// =============================================================================
// PROFILE MANAGEMENT
// =============================================================================

// Create user profile after signup
export const createUserProfile = async (userId: string, email: string, fullName?: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      full_name: fullName,
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create profile: ${error.message}`)
  }
  
  return data
}

// Update user profile
export const updateUserProfile = async (updates: {
  full_name?: string
  phone?: string
  avatar_url?: string
}) => {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('No authenticated user')
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`)
  }
  
  return data
}

// =============================================================================
// INVITATION HANDLING
// =============================================================================

// Accept team invitation
export const acceptInvitation = async (token: string, password: string) => {
  // Validate invitation token
  const { data: invitation, error: inviteError } = await supabase
    .from('invitations')
    .select('*, clients(*)')
    .eq('token', token)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .single()
  
  if (inviteError || !invitation) {
    throw new Error('Invalid or expired invitation')
  }
  
  // Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: invitation.email,
    password,
  })
  
  if (authError || !authData.user) {
    throw new Error(`Signup failed: ${authError?.message}`)
  }
  
  // Create profile
  await createUserProfile(authData.user.id, invitation.email)
  
  // Create client-user relationship
  const { error: relationError } = await supabase
    .from('client_users')
    .insert({
      user_id: authData.user.id,
      client_id: invitation.client_id,
      role: invitation.role as UserRole,
      status: 'active',
      invited_by: invitation.invited_by,
      invited_at: invitation.created_at,
      joined_at: new Date().toISOString()
    })
  
  if (relationError) {
    throw new Error(`Failed to create team membership: ${relationError.message}`)
  }
  
  // Mark invitation as accepted
  await supabase
    .from('invitations')
    .update({ status: 'accepted' })
    .eq('id', invitation.id)
  
  return {
    user: authData.user,
    client: invitation.clients,
    role: invitation.role
  }
}

// =============================================================================
// UTILITIES
// =============================================================================

// Format role for display
export const formatRole = (role: UserRole): string => {
  const roleLabels: Record<UserRole, string> = {
    staff: 'Staff Member',
    manager: 'Manager', 
    admin: 'Administrator',
    owner: 'Owner'
  }
  
  return roleLabels[role] || role
}

// Get role color for UI
export const getRoleColor = (role: UserRole): string => {
  const roleColors: Record<UserRole, string> = {
    staff: 'bg-gray-100 text-gray-800',
    manager: 'bg-blue-100 text-blue-800',
    admin: 'bg-purple-100 text-purple-800',
    owner: 'bg-green-100 text-green-800'
  }
  
  return roleColors[role] || 'bg-gray-100 text-gray-800'
}