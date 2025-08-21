/**
 * Authentication Core Module Registration
 * Registers the Authentication Core module with the JiGR Suite Module Registry
 * 
 * SAFETY: This only registers the module - no changes to existing code
 */

import ModuleRegistry from '@/lib/ModuleRegistry'
import { getAuthenticationCore } from './AuthenticationCore'

/**
 * Register Authentication Core module with the registry
 */
export const registerAuthenticationCore = async () => {
  try {
    const registry = ModuleRegistry
    const authModule = getAuthenticationCore()
    
    // Register the module instance
    await registry.registerModule(authModule)
    
    console.log('✅ Authentication Core module registered successfully')
    return true
    
  } catch (error) {
    console.error('❌ Failed to register Authentication Core module:', error)
    return false
  }
}

/**
 * Initialize Authentication Core module during app startup
 */
export const initializeAuthenticationCore = async (config?: Record<string, any>) => {
  try {
    // Register with module registry
    await registerAuthenticationCore()
    
    // Get module instance
    const authModule = getAuthenticationCore()
    
    // Configure if needed
    if (config) {
      await authModule.configure(config)
    }
    
    // Initialize and activate
    if (!authModule.isLoaded) {
      await authModule.initialize()
    }
    
    if (!authModule.isActive) {
      await authModule.activate()
    }
    
    console.log('🚀 Authentication Core module initialized and active')
    return authModule
    
  } catch (error) {
    console.error('❌ Failed to initialize Authentication Core module:', error)
    throw error
  }
}

const AuthenticationCoreRegistration = { registerAuthenticationCore, initializeAuthenticationCore }

export default AuthenticationCoreRegistration