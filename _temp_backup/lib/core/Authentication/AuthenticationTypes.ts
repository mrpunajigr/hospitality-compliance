/**
 * Authentication Core Module - Type Definitions
 * Centralized type definitions for authentication system
 * 
 * SAFETY: This creates NEW type definitions - ZERO RISK to existing code
 */

// Re-export existing types for backward compatibility
export type { Database, UserWithClients } from '@/types/database'

// =============================================================================
// USER ROLES & PERMISSIONS
// =============================================================================

export type UserRole = 'staff' | 'manager' | 'admin' | 'owner'
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled'

// Permission definitions
export const PERMISSIONS = {
  // Document permissions
  UPLOAD_DOCUMENTS: 'upload_documents',
  VIEW_ALL_DOCUMENTS: 'view_all_documents',
  DELETE_DOCUMENTS: 'delete_documents',
  
  // Compliance permissions  
  VIEW_COMPLIANCE_REPORTS: 'view_compliance_reports',
  GENERATE_REPORTS: 'generate_reports',
  ACKNOWLEDGE_ALERTS: 'acknowledge_alerts',
  
  // Team management
  INVITE_USERS: 'invite_users',
  MANAGE_USER_ROLES: 'manage_user_roles',
  REMOVE_USERS: 'remove_users',
  
  // Client management
  MANAGE_SUPPLIERS: 'manage_suppliers',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  
  // Billing & admin
  MANAGE_BILLING: 'manage_billing',
  EXPORT_DATA: 'export_data',
  GRANT_INSPECTOR_ACCESS: 'grant_inspector_access'
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// =============================================================================
// AUTHENTICATION INTERFACES
// =============================================================================

export interface AuthenticationOptions {
  sessionTimeout?: number
  passwordMinLength?: number
  passwordRequireSpecialChars?: boolean
  invitationExpiryHours?: number
  enableMultipleClients?: boolean
  enableRememberMe?: boolean
}

export interface AuthenticationResult {
  success: boolean
  user?: any
  error?: string
  requiresVerification?: boolean
  client?: any
  role?: UserRole
}

export interface ClientAccessInfo {
  clientId: string
  role: UserRole
  status: 'active' | 'inactive' | 'suspended'
  permissions: Permission[]
  client: {
    id: string
    name: string
    subscription_status: SubscriptionStatus
    subscription_tier: string
  }
}

export interface UserProfileData {
  id: string
  email: string
  full_name?: string
  phone?: string
  avatar_url?: string
  clients: ClientAccessInfo[]
  last_sign_in?: string
  created_at: string
}

export interface InvitationData {
  id: string
  email: string
  role: UserRole
  token: string
  status: 'pending' | 'accepted' | 'expired'
  client_id: string
  invited_by: string
  expires_at: string
  created_at: string
}

// =============================================================================
// MODULE CONFIGURATION
// =============================================================================

export interface AuthenticationCoreConfig {
  // Session management
  sessionTimeout: number
  refreshTokenLifetime: number
  enableSessionRefresh: boolean
  
  // Password policies
  passwordMinLength: number
  passwordRequireUppercase: boolean
  passwordRequireLowercase: boolean
  passwordRequireNumbers: boolean
  passwordRequireSpecialChars: boolean
  passwordMaxAttempts: number
  passwordLockoutDuration: number
  
  // Multi-tenancy
  enableMultipleClients: boolean
  defaultClientSelection: 'first' | 'last_used' | 'prompt'
  enableClientSwitching: boolean
  
  // Invitations
  invitationExpiryHours: number
  enableSelfRegistration: boolean
  requireEmailVerification: boolean
  
  // Security
  enableRememberMe: boolean
  rememberMeDuration: number
  enableIPWhitelisting: boolean
  enableDeviceTracking: boolean
  
  // Audit
  enableAuditLogging: boolean
  auditRetentionDays: number
}

// =============================================================================
// MODULE EVENTS
// =============================================================================

export interface AuthenticationEvents {
  // User authentication
  'user:signed-in': { user: UserProfileData; client: ClientAccessInfo }
  'user:signed-out': { userId: string }
  'user:sign-in-failed': { email: string; reason: string; attempts: number }
  
  // User management
  'user:profile-updated': { userId: string; changes: Partial<UserProfileData> }
  'user:role-changed': { userId: string; clientId: string; oldRole: UserRole; newRole: UserRole }
  
  // Client access
  'client:accessed': { userId: string; clientId: string }
  'client:switched': { userId: string; fromClientId: string; toClientId: string }
  'client:access-denied': { userId: string; clientId: string; reason: string }
  
  // Team management
  'team:user-invited': { email: string; clientId: string; role: UserRole; invitedBy: string }
  'team:invitation-accepted': { userId: string; clientId: string; role: UserRole }
  'team:user-removed': { userId: string; clientId: string; removedBy: string }
  
  // Security events
  'security:suspicious-login': { userId: string; ip: string; reason: string }
  'security:account-locked': { userId: string; reason: string }
  'security:password-reset-requested': { email: string }
  'security:password-reset-completed': { userId: string }
}

// =============================================================================
// CAPABILITY INTERFACES
// =============================================================================

export interface AuthenticationCapability {
  // User authentication
  signIn(email: string, password: string, options?: { rememberMe?: boolean }): Promise<AuthenticationResult>
  signOut(userId?: string): Promise<void>
  signUp(email: string, password: string, invitationToken?: string): Promise<AuthenticationResult>
  
  // Session management
  getCurrentUser(): Promise<any>
  getCurrentUserProfile(): Promise<UserProfileData | null>
  refreshSession(): Promise<boolean>
  isAuthenticated(): Promise<boolean>
  
  // Password management
  resetPassword(email: string): Promise<void>
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>
  
  // Multi-tenant access
  canAccessClient(userId: string, clientId: string): Promise<boolean>
  getUserRoleForClient(userId: string, clientId: string): Promise<UserRole | null>
  getAccessibleClients(userId: string): Promise<ClientAccessInfo[]>
  switchClient(userId: string, clientId: string): Promise<boolean>
}

export interface AuthorizationCapability {
  // Permission checks
  hasPermission(userId: string, clientId: string, permission: Permission): Promise<boolean>
  hasRoleOrHigher(userId: string, clientId: string, requiredRole: UserRole): Promise<boolean>
  getRolePermissions(role: UserRole): Permission[]
  
  // Role management
  assignUserRole(userId: string, clientId: string, role: UserRole, assignedBy: string): Promise<boolean>
  removeUserRole(userId: string, clientId: string, removedBy: string): Promise<boolean>
  
  // Client access control
  grantClientAccess(userId: string, clientId: string, role: UserRole, grantedBy: string): Promise<boolean>
  revokeClientAccess(userId: string, clientId: string, revokedBy: string): Promise<boolean>
}

export interface ProfileManagementCapability {
  // Profile operations
  createUserProfile(userId: string, email: string, fullName?: string): Promise<UserProfileData>
  updateUserProfile(userId: string, updates: Partial<UserProfileData>): Promise<UserProfileData>
  getUserProfile(userId: string): Promise<UserProfileData | null>
  deleteUserProfile(userId: string, deletedBy: string): Promise<boolean>
  
  // Avatar management
  updateAvatar(userId: string, avatarFile: File): Promise<string>
  removeAvatar(userId: string): Promise<void>
}

export interface TeamManagementCapability {
  // Invitations
  createInvitation(email: string, clientId: string, role: UserRole, invitedBy: string): Promise<InvitationData>
  acceptInvitation(token: string, password: string): Promise<AuthenticationResult>
  cancelInvitation(invitationId: string, cancelledBy: string): Promise<boolean>
  getInvitations(clientId: string): Promise<InvitationData[]>
  
  // Team management
  getTeamMembers(clientId: string): Promise<UserProfileData[]>
  removeTeamMember(userId: string, clientId: string, removedBy: string): Promise<boolean>
  updateTeamMemberRole(userId: string, clientId: string, newRole: UserRole, updatedBy: string): Promise<boolean>
}