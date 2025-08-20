/**
 * Authentication Utilities - Modern Bridge Interface
 * 
 * This file provides a seamless bridge between legacy authentication usage
 * and the new Authentication Core module system. All existing imports and
 * function calls continue to work exactly as before.
 * 
 * SAFETY: 100% backwards compatible - existing code unchanged, zero risk
 */

// Re-export everything from the Authentication Bridge
export {
  getUserClient,
  createUserClient,
  updateUserClient,
  getUserPermissions,
  hasPermission,
  signInUser,
  signOutUser,
  getCurrentUser,
  getTeamMembers,
  addTeamMember,
  removeTeamMember,
  isModularAuthAvailable,
  getAuthSystemStatus,
  type UserClient
} from './AuthenticationBridge'

// Also re-export the legacy interface for direct access if needed
export * from './auth-utils-legacy'

// =============================================================================
// MIGRATION UTILITIES
// =============================================================================

/**
 * Check which authentication system is currently active
 */
export async function getActiveAuthSystem(): Promise<'modular' | 'legacy'> {
  try {
    const { isModularAuthAvailable } = await import('./AuthenticationBridge')
    const isModular = await isModularAuthAvailable()
    return isModular ? 'modular' : 'legacy'
  } catch (error) {
    return 'legacy'
  }
}

/**
 * Get detailed system information for debugging
 */
export async function getAuthDebugInfo(): Promise<{
  activeSystem: 'modular' | 'legacy'
  moduleStatus?: any
  capabilities?: string[]
  lastError?: string
}> {
  try {
    const activeSystem = await getActiveAuthSystem()
    
    if (activeSystem === 'modular') {
      const { getAuthSystemStatus } = await import('./AuthenticationBridge')
      const status = await getAuthSystemStatus()
      
      return {
        activeSystem: 'modular',
        moduleStatus: status.healthStatus,
        capabilities: status.capabilities
      }
    } else {
      return {
        activeSystem: 'legacy',
        capabilities: ['basic-auth', 'user-client-lookup']
      }
    }
  } catch (error) {
    return {
      activeSystem: 'legacy',
      lastError: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// =============================================================================
// DEFAULT EXPORT FOR LEGACY COMPATIBILITY
// =============================================================================

import * as AuthBridge from './AuthenticationBridge'

export default {
  ...AuthBridge,
  getActiveAuthSystem,
  getAuthDebugInfo
}