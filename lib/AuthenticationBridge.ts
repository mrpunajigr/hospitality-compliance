/**
 * Authentication Bridge - JiGR Suite
 * Backwards compatibility layer for existing auth imports while using new module system
 * 
 * SAFETY: This creates backwards compatible layer - ZERO RISK to existing code
 */

// =============================================================================
// BACKWARDS COMPATIBILITY BRIDGE
// =============================================================================

/**
 * Bridge function to maintain backwards compatibility
 * Routes existing function calls through the new Authentication Core module
 */
async function getAuthenticationCapability() {
  try {
    // Try to use the new module system first
    const { getAuthenticationCore } = await import('./core/Authentication')
    const authCore = getAuthenticationCore()
    
    if (authCore.isLoaded && authCore.isActive) {
      return authCore.getCapabilityInterface('authentication')
    }
  } catch (error) {
    console.warn('⚠️ Authentication Core not available, falling back to legacy:', error)
  }
  
  // Fallback to legacy system if module not available
  try {
    return await import('./auth-utils-legacy')
  } catch (error) {
    console.error('❌ Both modular and legacy auth systems unavailable:', error)
    throw error
  }
}

async function getProfileManagementCapability() {
  try {
    const legacy = await import('./auth-utils-legacy')
    return await (legacy as any).getProfileManagementCapability()
  } catch (error) {
    console.warn('⚠️ Profile Management not available from legacy, trying core module')
    try {
      const { getAuthenticationCore } = await import('./core/Authentication')
      const authCore = getAuthenticationCore()
    
      if (authCore.isLoaded && authCore.isActive) {
        return authCore.getCapabilityInterface('profile-management')
      }
    } catch (coreError) {
      console.warn('⚠️ Profile Management not available from core module')
    }
  }
  
  // Fallback to legacy functions
  try {
    const legacy = await import('./auth-utils-legacy')
    return {
      getUserProfile: (legacy as any).getUserClient,
      updateUserProfile: (legacy as any).updateUserProfile || (() => Promise.resolve({ success: false, error: 'Not implemented in legacy' }))
    }
  } catch (error) {
    console.error('❌ Profile management unavailable:', error)
    throw error
  }
}

// =============================================================================
// BRIDGED FUNCTIONS - MAINTAIN EXACT API
// =============================================================================

/**
 * Get user client information - bridged to new module system
 * Maintains exact same API as legacy getUserClient
 */
export async function getUserClient(userId: string): Promise<any> {
  try {
    const authCapability = await getAuthenticationCapability()
    
    // If using new module system
    if (authCapability.getUserClient) {
      return await authCapability.getUserClient(userId)
    }
    
    // If using legacy system
    if (authCapability.default?.getUserClient) {
      return await authCapability.default.getUserClient(userId)
    }
    
    // Direct function call for legacy
    if (typeof authCapability === 'object' && authCapability.getUserClient) {
      return await authCapability.getUserClient(userId)
    }
    
    console.error('❌ getUserClient function not found in auth capability')
    return null
    
  } catch (error) {
    console.error('❌ Error in bridged getUserClient:', error)
    
    // Final fallback to direct legacy import
    try {
      const legacy = await import('./auth-utils-legacy')
      return await (legacy as any).getUserClient(userId)
    } catch (fallbackError) {
      console.error('❌ Legacy fallback failed:', fallbackError)
      return null
    }
  }
}

/**
 * User client type definition - maintained for compatibility
 */
export interface UserClient {
  id: string
  name: string
  role: string
  email?: string
  permissions?: string[]
  createdAt?: string
  metadata?: Record<string, any>
}

/**
 * Create user client - bridged function
 */
export async function createUserClient(userData: Partial<UserClient>): Promise<{ success: boolean; data?: UserClient; error?: string }> {
  try {
    const authCapability = await getAuthenticationCapability()
    
    if (authCapability.createUserClient) {
      return await authCapability.createUserClient(userData)
    }
    
    // Fallback to legacy if available
    const legacy = await import('./auth-utils-legacy')
    if ((legacy as any).createUserClient) {
      return await (legacy as any).createUserClient(userData)
    }
    
    return { success: false, error: 'createUserClient not available' }
    
  } catch (error) {
    console.error('❌ Error in bridged createUserClient:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Update user client - bridged function
 */
export async function updateUserClient(clientId: string, updates: Partial<UserClient>): Promise<{ success: boolean; data?: UserClient; error?: string }> {
  try {
    const profileCapability = await getProfileManagementCapability()
    
    if (profileCapability.updateUserProfile) {
      return await profileCapability.updateUserProfile(clientId, updates)
    }
    
    return { success: false, error: 'updateUserClient not available' }
    
  } catch (error) {
    console.error('❌ Error in bridged updateUserClient:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Get user permissions - bridged function
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const authCapability = await getAuthenticationCapability()
    
    if (authCapability.getUserPermissions) {
      return await authCapability.getUserPermissions(userId)
    }
    
    // Fallback to extracting from user client
    const userClient = await getUserClient(userId)
    return userClient?.permissions || []
    
  } catch (error) {
    console.error('❌ Error in bridged getUserPermissions:', error)
    return []
  }
}

/**
 * Check user permission - bridged function
 */
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  try {
    const permissions = await getUserPermissions(userId)
    return permissions.includes(permission) || permissions.includes('*')
  } catch (error) {
    console.error('❌ Error checking permission:', error)
    return false
  }
}

// =============================================================================
// AUTHENTICATION UTILITIES - BRIDGED
// =============================================================================

/**
 * Sign in user - bridged to new auth system
 */
export async function signInUser(email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const authCapability = await getAuthenticationCapability()
    
    if (authCapability.signIn) {
      return await authCapability.signIn(email, password)
    }
    
    // Fallback to legacy
    const legacy = await import('./auth-utils-legacy')
    if ((legacy as any).signInUser) {
      return await (legacy as any).signInUser(email, password)
    }
    
    return { success: false, error: 'Sign in functionality not available' }
    
  } catch (error) {
    console.error('❌ Error in bridged signInUser:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Sign out user - bridged to new auth system
 */
export async function signOutUser(): Promise<{ success: boolean; error?: string }> {
  try {
    const authCapability = await getAuthenticationCapability()
    
    if (authCapability.signOut) {
      return await authCapability.signOut()
    }
    
    // Fallback to legacy
    const legacy = await import('./auth-utils-legacy')
    if ((legacy as any).signOutUser) {
      return await (legacy as any).signOutUser()
    }
    
    return { success: false, error: 'Sign out functionality not available' }
    
  } catch (error) {
    console.error('❌ Error in bridged signOutUser:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Get current user - bridged function
 */
export async function getCurrentUser(): Promise<any> {
  try {
    const authCapability = await getAuthenticationCapability()
    
    if (authCapability.getCurrentUser) {
      return await authCapability.getCurrentUser()
    }
    
    // Fallback to Supabase directly
    const { supabase } = await import('./supabase')
    const { data: { user } } = await supabase.auth.getUser()
    return user
    
  } catch (error) {
    console.error('❌ Error in bridged getCurrentUser:', error)
    return null
  }
}

// =============================================================================
// TEAM MANAGEMENT - BRIDGED
// =============================================================================

/**
 * Get team management capability - bridged function
 */
async function getTeamManagementCapability() {
  try {
    const { getAuthenticationCore } = await import('./core/Authentication')
    const authCore = getAuthenticationCore()
    
    if (authCore.isLoaded && authCore.isActive) {
      return authCore.getCapabilityInterface('team-management')
    }
  } catch (error) {
    console.warn('⚠️ Team Management not available from module')
  }
  
  // Fallback to legacy team functions
  return {
    getTeamMembers: async (clientId: string) => {
      try {
        const legacy = await import('./auth-utils-legacy')
        return await (legacy as any).getTeamMembers(clientId)
      } catch (error) {
        return []
      }
    },
    addTeamMember: async (clientId: string, userData: any) => {
      return { success: false, error: 'Team management not available in legacy mode' }
    },
    removeTeamMember: async (clientId: string, userId: string) => {
      return { success: false, error: 'Team management not available in legacy mode' }
    }
  }
}

/**
 * Get team members - bridged function
 */
export async function getTeamMembers(clientId: string): Promise<any[]> {
  try {
    const teamCapability = await getTeamManagementCapability()
    return await teamCapability.getTeamMembers(clientId)
  } catch (error) {
    console.error('❌ Error getting team members:', error)
    return []
  }
}

/**
 * Add team member - bridged function
 */
export async function addTeamMember(clientId: string, userData: any): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const teamCapability = await getTeamManagementCapability()
    return await teamCapability.addTeamMember(clientId, userData)
  } catch (error) {
    console.error('❌ Error adding team member:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Remove team member - bridged function
 */
export async function removeTeamMember(clientId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const teamCapability = await getTeamManagementCapability()
    return await teamCapability.removeTeamMember(clientId, userId)
  } catch (error) {
    console.error('❌ Error removing team member:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// =============================================================================
// MODULE STATUS HELPERS
// =============================================================================

/**
 * Check if modular authentication is available
 */
export async function isModularAuthAvailable(): Promise<boolean> {
  try {
    const { getAuthenticationCore } = await import('./core/Authentication')
    const authCore = getAuthenticationCore()
    return authCore.isLoaded && authCore.isActive
  } catch (error) {
    return false
  }
}

/**
 * Get authentication system status
 */
export async function getAuthSystemStatus(): Promise<{
  usingModular: boolean
  capabilities: string[]
  healthStatus: 'healthy' | 'degraded' | 'unavailable'
}> {
  try {
    const isModular = await isModularAuthAvailable()
    
    if (isModular) {
      const { getAuthenticationCore } = await import('./core/Authentication')
      const authCore = getAuthenticationCore()
      
      return {
        usingModular: true,
        capabilities: authCore.manifest.provides.map((p: any) => p.name),
        healthStatus: authCore.isActive ? 'healthy' : 'degraded'
      }
    } else {
      return {
        usingModular: false,
        capabilities: ['basic-auth', 'user-client'],
        healthStatus: 'degraded'
      }
    }
  } catch (error) {
    return {
      usingModular: false,
      capabilities: [],
      healthStatus: 'unavailable'
    }
  }
}

// =============================================================================
// DEFAULT EXPORT FOR COMPATIBILITY
// =============================================================================

const AuthenticationBridge = {
  // User management
  getUserClient,
  createUserClient,
  updateUserClient,
  getUserPermissions,
  hasPermission,
  
  // Authentication
  signInUser,
  signOutUser,
  getCurrentUser,
  
  // Team management
  getTeamMembers,
  addTeamMember,
  removeTeamMember,
  
  // System status
  isModularAuthAvailable,
  getAuthSystemStatus
}

export default AuthenticationBridge