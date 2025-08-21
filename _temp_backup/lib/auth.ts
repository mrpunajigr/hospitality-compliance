/**
 * Authentication & Authorization Helpers - Module Compatibility Layer
 * 
 * BACKWARD COMPATIBILITY: This file maintains all existing function exports
 * while routing through the new Authentication Core module system.
 * 
 * SAFETY: ALL existing imports continue to work unchanged - ZERO RISK
 */

// =============================================================================
// DIRECT PASS-THROUGH EXPORTS
// =============================================================================

// All existing functions are re-exported exactly as they were
// This ensures 100% backward compatibility with zero breaking changes
export {
  // Authentication functions
  getCurrentUser,
  getCurrentUserProfile,
  isAuthenticated,
  
  // Multi-tenant authorization  
  canAccessClient,
  getUserRoleForClient,
  hasRoleOrHigher,
  
  // Permission checks
  hasPermission,
  getRolePermissions,
  PERMISSIONS,
  
  // Client context helpers
  getAccessibleClients,
  getDefaultClient,
  isSubscriptionActive,
  
  // Authentication actions
  signIn,
  signUp,
  signOut,
  resetPassword,
  
  // Profile management
  createUserProfile,
  updateUserProfile,
  
  // Invitation handling
  acceptInvitation,
  
  // Utilities
  formatRole,
  getRoleColor
} from './core/Authentication'

// =============================================================================
// TYPE EXPORTS
// =============================================================================

// All existing types are re-exported exactly as they were
export type {
  UserRole,
  Permission,
  SubscriptionStatus
} from './core/Authentication'

// =============================================================================
// USAGE TRACKING (Optional)
// =============================================================================

// Optional: Track usage of legacy imports for migration planning
// This can be removed in production if not needed
const logLegacyUsage = (functionName: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`📊 Legacy auth import: ${functionName} via lib/auth.ts`)
  }
}

// =============================================================================
// MIGRATION COMMENTS
// =============================================================================

/*
 * MIGRATION PATH:
 * 
 * This file provides 100% backward compatibility during the transition period.
 * Components can be gradually migrated to use the new module interface:
 * 
 * OLD: import { signIn } from '@/lib/auth'
 * NEW: import { signIn } from '@/lib/core/Authentication'
 * 
 * Or even better, use the module capabilities:
 * NEW: const auth = getAuthenticationCapability(); await auth.signIn(email, password)
 * 
 * This gradual migration approach ensures no breaking changes while enabling
 * the full power of the modular architecture.
 */