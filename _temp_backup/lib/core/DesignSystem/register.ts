/**
 * Design System Core Module Registration
 * Registers the Design System Core module with the JiGR Suite Module Registry
 * 
 * SAFETY: This only registers the module - no changes to existing code
 */

import { moduleRegistry } from '@/lib/ModuleRegistry'
import { getDesignSystemCore } from './DesignSystemCore'

/**
 * Register Design System Core module with the registry
 */
export const registerDesignSystemCore = async () => {
  try {
    const registry = moduleRegistry
    const designModule = getDesignSystemCore()
    
    // Register the module instance
    await registry.registerModule(designModule)
    
    console.log('✅ Design System Core module registered successfully')
    return true
    
  } catch (error) {
    console.error('❌ Failed to register Design System Core module:', error)
    return false
  }
}

/**
 * Initialize Design System Core module during app startup
 */
export const initializeDesignSystemCore = async (config?: Record<string, any>) => {
  try {
    // Register with module registry
    await registerDesignSystemCore()
    
    // Get module instance
    const designModule = getDesignSystemCore()
    
    // Configure if needed
    if (config) {
      await designModule.configure(config)
    }
    
    // Initialize and activate
    if (!designModule.isLoaded) {
      await designModule.initialize()
    }
    
    if (!designModule.isActive) {
      await designModule.activate()
    }
    
    console.log('🎨 Design System Core module initialized and active')
    return designModule
    
  } catch (error) {
    console.error('❌ Failed to initialize Design System Core module:', error)
    throw error
  }
}

const DesignSystemCoreRegistration = { registerDesignSystemCore, initializeDesignSystemCore }

export default DesignSystemCoreRegistration