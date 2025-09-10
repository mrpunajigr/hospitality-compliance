/**
 * Role-Based Access Control (RBAC) Core Module
 * 
 * This module implements the comprehensive RBAC strategy for the JiGR 
 * hospitality compliance platform with role hierarchy and permissions.
 * 
 * Role Hierarchy: STAFF < SUPERVISOR < MANAGER < OWNER
 */

import { supabase } from './supabase'

// =====================================================
// TYPES AND INTERFACES
// =====================================================

export type UserRole = 'STAFF' | 'SUPERVISOR' | 'MANAGER' | 'OWNER'

export interface UserPermissions {
  // Document Management
  uploadDocuments: boolean
  viewAllDocuments: boolean
  viewOwnDocuments: boolean
  deleteDocuments: boolean
  
  // User Management
  inviteUsers: boolean
  removeUsers: boolean
  changeUserRoles: boolean
  viewUserList: boolean
  
  // Company Settings
  editBusinessDetails: boolean
  editComplianceRules: boolean
  editBranding: boolean
  viewSettings: boolean
  
  // Billing & Subscriptions
  manageBilling: boolean
  viewUsage: boolean
  changeSubscription: boolean
  downloadInvoices: boolean
  
  // Reports & Analytics
  viewComplianceReports: boolean
  exportReports: boolean
  viewAnalytics: boolean
  viewBasicStats: boolean
  
  // System Administration
  exportData: boolean
  deleteOrganization: boolean
  viewAuditLogs: boolean
  
  // Role level for hierarchy checks
  roleLevel: number
  role: UserRole
}

export interface UserClient {
  id: string
  name: string
  role: UserRole
  clientId: string
  permissions: UserPermissions
  status: 'active' | 'inactive' | 'pending'
  lastActiveAt?: string
  department?: string
  jobTitle?: string
}

export interface TeamMember {
  id: string
  email: string
  fullName: string
  role: UserRole
  status: 'active' | 'inactive' | 'pending'
  lastLogin?: string
  invitedAt?: string
  department?: string
  jobTitle?: string
  phone?: string
}

export interface InvitationData {
  email: string
  firstName: string
  lastName: string
  role: UserRole
  phone?: string
  department?: string
  jobTitle?: string
  message?: string
}

// =====================================================
// PERMISSION MATRIX DEFINITIONS
// =====================================================

const ROLE_PERMISSIONS: Record<UserRole, Partial<UserPermissions>> = {
  STAFF: {
    // Document Management
    uploadDocuments: true,
    viewAllDocuments: false,
    viewOwnDocuments: true,
    deleteDocuments: false,
    
    // User Management
    inviteUsers: false,
    removeUsers: false,
    changeUserRoles: false,
    viewUserList: false,
    
    // Company Settings
    editBusinessDetails: false,
    editComplianceRules: false,
    editBranding: false,
    viewSettings: false,
    
    // Billing & Subscriptions
    manageBilling: false,
    viewUsage: false,
    changeSubscription: false,
    downloadInvoices: false,
    
    // Reports & Analytics
    viewComplianceReports: false,
    exportReports: false,
    viewAnalytics: false,
    viewBasicStats: false,
    
    // System Administration
    exportData: false,
    deleteOrganization: false,
    viewAuditLogs: false,
    
    roleLevel: 1
  },
  
  SUPERVISOR: {
    // Document Management
    uploadDocuments: true,
    viewAllDocuments: false,
    viewOwnDocuments: true,
    deleteDocuments: false,
    
    // User Management
    inviteUsers: false,
    removeUsers: false,
    changeUserRoles: false,
    viewUserList: false,
    
    // Company Settings
    editBusinessDetails: false,
    editComplianceRules: false,
    editBranding: false,
    viewSettings: true,
    
    // Billing & Subscriptions
    manageBilling: false,
    viewUsage: false,
    changeSubscription: false,
    downloadInvoices: false,
    
    // Reports & Analytics
    viewComplianceReports: false,
    exportReports: false,
    viewAnalytics: false,
    viewBasicStats: true,
    
    // System Administration
    exportData: false,
    deleteOrganization: false,
    viewAuditLogs: false,
    
    roleLevel: 2
  },
  
  MANAGER: {
    // Document Management
    uploadDocuments: true,
    viewAllDocuments: true,
    viewOwnDocuments: true,
    deleteDocuments: true,
    
    // User Management
    inviteUsers: true,
    removeUsers: true,
    changeUserRoles: false, // Cannot change roles - only OWNER can
    viewUserList: true,
    
    // Company Settings
    editBusinessDetails: false,
    editComplianceRules: true,
    editBranding: false,
    viewSettings: true,
    
    // Billing & Subscriptions
    manageBilling: false,
    viewUsage: false,
    changeSubscription: false,
    downloadInvoices: false,
    
    // Reports & Analytics
    viewComplianceReports: true,
    exportReports: true,
    viewAnalytics: true,
    viewBasicStats: true,
    
    // System Administration
    exportData: true,
    deleteOrganization: false,
    viewAuditLogs: false,
    
    roleLevel: 3
  },
  
  OWNER: {
    // Document Management
    uploadDocuments: true,
    viewAllDocuments: true,
    viewOwnDocuments: true,
    deleteDocuments: true,
    
    // User Management
    inviteUsers: true,
    removeUsers: true,
    changeUserRoles: true,
    viewUserList: true,
    
    // Company Settings
    editBusinessDetails: true,
    editComplianceRules: true,
    editBranding: true,
    viewSettings: true,
    
    // Billing & Subscriptions
    manageBilling: true,
    viewUsage: true,
    changeSubscription: true,
    downloadInvoices: true,
    
    // Reports & Analytics
    viewComplianceReports: true,
    exportReports: true,
    viewAnalytics: true,
    viewBasicStats: true,
    
    // System Administration
    exportData: true,
    deleteOrganization: true,
    viewAuditLogs: true,
    
    roleLevel: 4
  }
}

// =====================================================
// CORE RBAC FUNCTIONS
// =====================================================

/**
 * Get user's permissions for a specific organization
 */
export async function getUserPermissions(userId: string, clientId: string): Promise<UserPermissions | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_user_permissions', {
        user_uuid: userId,
        target_client_id: clientId
      })

    if (error) {
      console.error('Error getting user permissions:', error)
      return null
    }

    if (!data) {
      return null
    }

    const role = data.role as UserRole
    const basePermissions = ROLE_PERMISSIONS[role]
    
    if (!basePermissions) {
      return null
    }

    return {
      ...basePermissions,
      role,
      roleLevel: basePermissions.roleLevel || 0
    } as UserPermissions
  } catch (error) {
    console.error('Error in getUserPermissions:', error)
    return null
  }
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(
  userId: string, 
  clientId: string, 
  permission: keyof UserPermissions
): Promise<boolean> {
  try {
    const permissions = await getUserPermissions(userId, clientId)
    if (!permissions) return false
    
    return permissions[permission] === true
  } catch (error) {
    console.error('Error checking permission:', error)
    return false
  }
}

/**
 * Check if user can manage another user based on role hierarchy
 */
export async function canManageUser(
  managerId: string, 
  clientId: string, 
  targetRole: UserRole
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('can_manage_user', {
        manager_id: managerId,
        target_client_id: clientId,
        target_role: targetRole
      })

    if (error) {
      console.error('Error checking user management permission:', error)
      return false
    }

    return data === true
  } catch (error) {
    console.error('Error in canManageUser:', error)
    return false
  }
}

/**
 * Get user's role level for hierarchy comparisons
 */
export function getRoleLevel(role: UserRole): number {
  return ROLE_PERMISSIONS[role]?.roleLevel || 0
}

/**
 * Check if one role can manage another role
 */
export function canRoleManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  const managerLevel = getRoleLevel(managerRole)
  const targetLevel = getRoleLevel(targetRole)
  
  // OWNER can manage everyone
  if (managerRole === 'OWNER') return true
  
  // MANAGER can manage STAFF and SUPERVISOR
  if (managerRole === 'MANAGER') {
    return targetRole === 'STAFF' || targetRole === 'SUPERVISOR'
  }
  
  // SUPERVISOR and STAFF cannot manage anyone
  return false
}

// =====================================================
// USER CLIENT FUNCTIONS
// =====================================================

/**
 * Get user's client relationship with permissions
 */
export async function getUserClient(userId: string): Promise<UserClient | null> {
  try {
    const { data: clientData, error } = await supabase
      .from('client_users')
      .select(`
        *,
        clients!inner (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()

    if (error || !clientData) {
      console.error('Error getting user client:', error)
      return null
    }

    const permissions = await getUserPermissions(userId, clientData.client_id)
    if (!permissions) return null

    return {
      id: clientData.id,
      name: clientData.clients.name,
      role: clientData.role as UserRole,
      clientId: clientData.client_id,
      permissions,
      status: clientData.status,
      lastActiveAt: clientData.last_active_at,
      department: clientData.department,
      jobTitle: clientData.job_title
    }
  } catch (error) {
    console.error('Error in getUserClient:', error)
    return null
  }
}

/**
 * Get team members for a client
 */
export async function getTeamMembers(clientId: string): Promise<TeamMember[]> {
  try {
    const { data, error } = await supabase
      .from('client_users')
      .select(`
        *,
        profiles!inner (
          id,
          email,
          full_name,
          phone
        )
      `)
      .eq('client_id', clientId)
      .order('role', { ascending: false }) // OWNER first, then MANAGER, etc.

    if (error) {
      console.error('Error getting team members:', error)
      return []
    }

    return data.map((member: any) => ({
      id: member.user_id,
      email: member.profiles.email,
      fullName: member.profiles.full_name || 'Unknown User',
      role: member.role as UserRole,
      status: member.status,
      lastLogin: member.last_active_at,
      invitedAt: member.invited_at,
      department: member.department,
      jobTitle: member.job_title,
      phone: member.profiles.phone
    }))
  } catch (error) {
    console.error('Error in getTeamMembers:', error)
    return []
  }
}

// =====================================================
// INVITATION FUNCTIONS
// =====================================================

/**
 * Send team member invitation
 */
export async function inviteTeamMember(
  clientId: string, 
  invitedBy: string, 
  invitationData: InvitationData
): Promise<{ success: boolean; invitationId?: string; error?: string }> {
  try {
    // Check if inviter has permission to invite users
    const canInvite = await hasPermission(invitedBy, clientId, 'inviteUsers')
    if (!canInvite) {
      return { success: false, error: 'Insufficient permissions to invite users' }
    }

    // Check if inviter can assign this role
    const inviterClient = await getUserClient(invitedBy)
    if (!inviterClient) {
      return { success: false, error: 'Inviter not found in organization' }
    }

    if (!canRoleManageRole(inviterClient.role, invitationData.role)) {
      return { success: false, error: `Cannot invite users with role ${invitationData.role}` }
    }

    // Check if user is already invited or a member
    const { data: existingUser } = await supabase
      .from('client_users')
      .select('profiles!inner(email)')
      .eq('client_id', clientId)
      .eq('profiles.email', invitationData.email)
      .single()

    if (existingUser) {
      return { success: false, error: 'User is already a member of this organization' }
    }

    const { data: existingInvitation } = await supabase
      .from('invitations')
      .select('id')
      .eq('client_id', clientId)
      .eq('email', invitationData.email)
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return { success: false, error: 'User already has a pending invitation' }
    }

    // Create invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .insert({
        client_id: clientId,
        email: invitationData.email,
        first_name: invitationData.firstName,
        last_name: invitationData.lastName,
        role: invitationData.role,
        phone: invitationData.phone,
        invited_by: invitedBy,
        invitation_message: invitationData.message,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })
      .select('id')
      .single()

    if (inviteError) {
      console.error('Error creating invitation:', inviteError)
      return { success: false, error: 'Failed to create invitation' }
    }

    // Log audit trail
    await logAuditEvent(clientId, invitedBy, 'user_invited', 'invitation', invitation.id, {
      invitedEmail: invitationData.email,
      assignedRole: invitationData.role,
      inviterRole: inviterClient.role
    })

    return { success: true, invitationId: invitation.id }
  } catch (error) {
    console.error('Error in inviteTeamMember:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// =====================================================
// AUDIT LOGGING
// =====================================================

/**
 * Log audit events for compliance and security
 */
export async function logAuditEvent(
  clientId: string,
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  details: Record<string, any> = {}
): Promise<void> {
  try {
    await supabase
      .from('audit_logs')
      .insert({
        client_id: clientId,
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        timestamp: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error logging audit event:', error)
    // Don't throw - audit logging failures shouldn't break the main flow
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Get role display name for UI
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames = {
    STAFF: 'Staff',
    SUPERVISOR: 'Supervisor', 
    MANAGER: 'Manager',
    OWNER: 'Owner'
  }
  return roleNames[role] || role
}

/**
 * Get role description for UI
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions = {
    STAFF: 'Upload documents and view own uploads',
    SUPERVISOR: 'Shift management and basic reporting',
    MANAGER: 'Full operations and team management',
    OWNER: 'Complete system access and billing'
  }
  return descriptions[role] || ''
}

/**
 * Get available roles that a user can assign
 */
export function getAssignableRoles(userRole: UserRole): UserRole[] {
  if (userRole === 'OWNER') {
    return ['STAFF', 'SUPERVISOR', 'MANAGER', 'OWNER']
  }
  
  if (userRole === 'MANAGER') {
    return ['STAFF', 'SUPERVISOR']
  }
  
  return []
}

/**
 * Check if role requires special confirmation
 */
export function roleRequiresConfirmation(role: UserRole): boolean {
  return role === 'OWNER' || role === 'MANAGER'
}

export default {
  getUserPermissions,
  hasPermission,
  canManageUser,
  getUserClient,
  getTeamMembers,
  inviteTeamMember,
  logAuditEvent,
  getRoleLevel,
  canRoleManageRole,
  getRoleDisplayName,
  getRoleDescription,
  getAssignableRoles,
  roleRequiresConfirmation
}