/**
 * Reporting & Analytics Module Registration
 * Registers the Reporting & Analytics AddOn module with the JiGR Suite Module Registry
 * 
 * SAFETY: This only registers the module - no changes to existing code
 */

import { moduleRegistry } from '@/lib/ModuleRegistry'
import { getReportingAnalyticsCore } from './ReportingAnalyticsCore'

/**
 * Register Reporting & Analytics module with the registry
 */
export const registerReportingAnalyticsModule = async () => {
  try {
    const registry = moduleRegistry
    const reportingModule = getReportingAnalyticsCore()
    
    // Register the module instance
    await registry.registerModule(reportingModule)
    
    console.log('✅ Reporting & Analytics Module registered successfully')
    return true
    
  } catch (error) {
    console.error('❌ Failed to register Reporting & Analytics Module:', error)
    return false
  }
}

/**
 * Initialize Reporting & Analytics module during app startup
 */
export const initializeReportingAnalyticsModule = async (config?: Record<string, any>) => {
  try {
    // Register with module registry
    await registerReportingAnalyticsModule()
    
    // Get module instance
    const reportingModule = getReportingAnalyticsCore()
    
    // Configure if needed
    if (config) {
      await reportingModule.configure(config)
    }
    
    // Initialize and activate
    if (!reportingModule.isLoaded) {
      await reportingModule.initialize()
    }
    
    if (!reportingModule.isActive) {
      await reportingModule.activate()
    }
    
    console.log('📊 Reporting & Analytics Module initialized and active')
    return reportingModule
    
  } catch (error) {
    console.error('❌ Failed to initialize Reporting & Analytics Module:', error)
    throw error
  }
}

/**
 * Initialize with enhanced analytics capabilities
 */
export const initializeEnhancedAnalytics = async (options?: {
  enablePredictiveInsights?: boolean
  enableRealTimeAnalytics?: boolean
  enableSupplierRanking?: boolean
  cacheRefreshInterval?: number
}) => {
  const config = {
    enablePredictiveInsights: options?.enablePredictiveInsights ?? true,
    enableRealTimeAnalytics: options?.enableRealTimeAnalytics ?? true,
    enableSupplierAnalytics: true,
    cacheRefreshInterval: options?.cacheRefreshInterval ?? 300000, // 5 minutes
    enableTrendAnalysis: true,
    enableAnomalyDetection: options?.enablePredictiveInsights ?? true,
    enableRiskPrediction: options?.enablePredictiveInsights ?? true
  }
  
  return await initializeReportingAnalyticsModule(config)
}

const ReportingAnalyticsRegistration = { 
  registerReportingAnalyticsModule, 
  initializeReportingAnalyticsModule,
  initializeEnhancedAnalytics
}

export default ReportingAnalyticsRegistration