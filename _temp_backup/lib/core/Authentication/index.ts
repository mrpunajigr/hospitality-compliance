/**
 * Authentication Core Module - Main Entry Point
 * Provides clean module interface and backward compatibility
 * 
 * SAFETY: This maintains ALL existing imports - ZERO RISK to existing code
 */

// =============================================================================
// MODULE EXPORTS
// =============================================================================

export { AuthenticationCore, getAuthenticationCore } from './AuthenticationCore'
export * from './AuthenticationTypes'

// =============================================================================
// BACKWARD COMPATIBILITY LAYER
// =============================================================================

// Re-export all existing functions from AuthenticationHelpers
// This ensures existing imports continue to work unchanged
export {
  getCurrentUser,
  getCurrentUserProfile, 
  isAuthenticated,
  canAccessClient,
  getUserRoleForClient,
  hasRoleOrHigher,
  hasPermission,
  getAccessibleClients,
  getDefaultClient,
  isSubscriptionActive,
  signIn,
  signUp,
  signOut,
  resetPassword,
  createUserProfile,
  updateUserProfile,
  acceptInvitation,
  formatRole,
  getRoleColor,
  getRolePermissions,
  PERMISSIONS
} from './AuthenticationHelpers'

// Re-export types for backward compatibility
export type {
  UserRole,
  Permission,
  SubscriptionStatus
} from './AuthenticationHelpers'

// =============================================================================
// MODULE INTERFACE
// =============================================================================

import { getAuthenticationCore } from './AuthenticationCore'

/**
 * Get the Authentication Core module instance
 * This is the primary interface for other modules to interact with authentication
 */
export const getAuthenticationModule = () => {
  return getAuthenticationCore()
}

/**
 * Initialize and activate the Authentication Core module
 * Call this during application startup
 */
export const initializeAuthenticationModule = async (config?: Record<string, any>) => {
  const authModule = getAuthenticationCore()
  
  if (config) {
    await authModule.configure(config)
  }
  
  if (!authModule.isLoaded) {
    await authModule.initialize()
  }
  
  if (!authModule.isActive) {
    await authModule.activate()
  }
  
  return authModule
}

/**
 * Get authentication capabilities
 * Provides type-safe access to authentication functions
 */
export const getAuthenticationCapability = () => {
  const authModule = getAuthenticationCore()
  return authModule.getCapabilityInterface('authentication')
}

/**
 * Get authorization capabilities  
 * Provides type-safe access to authorization functions
 */
export const getAuthorizationCapability = () => {
  const authModule = getAuthenticationCore()
  return authModule.getCapabilityInterface('authorization')
}

/**
 * Get profile management capabilities
 * Provides type-safe access to profile management functions
 */
export const getProfileManagementCapability = () => {
  const authModule = getAuthenticationCore()
  return authModule.getCapabilityInterface('profile-management')
}

/**
 * Get team management capabilities
 * Provides type-safe access to team management functions
 */
export const getTeamManagementCapability = () => {
  const authModule = getAuthenticationCore()
  return authModule.getCapabilityInterface('team-management')
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

const AuthenticationCoreModule = {
  AuthenticationCore: getAuthenticationCore,
  getAuthenticationCore,
  getAuthenticationModule,
  initializeAuthenticationModule,
  getAuthenticationCapability,
  getAuthorizationCapability,
  getProfileManagementCapability,
  getTeamManagementCapability
}

export default AuthenticationCoreModule