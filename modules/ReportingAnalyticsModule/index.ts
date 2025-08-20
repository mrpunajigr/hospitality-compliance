/**
 * Reporting & Analytics Module - Main Entry Point
 * Comprehensive analytics, reporting, and business intelligence module
 * 
 * SAFETY: This creates NEW module interface - ZERO RISK to existing code
 */

// =============================================================================
// CORE MODULE EXPORTS
// =============================================================================

export { ReportingAnalyticsCore, getReportingAnalyticsCore } from './ReportingAnalyticsCore'
export { 
  registerReportingAnalyticsModule, 
  initializeReportingAnalyticsModule,
  initializeEnhancedAnalytics
} from './register'

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type * from './types/ReportingAnalyticsTypes'

// =============================================================================
// COMPONENT EXPORTS
// =============================================================================

export { default as ModularEnhancedComplianceDashboard } from './components/EnhancedComplianceDashboard'
export { default as ReportGenerator } from './components/ReportGenerator'

// =============================================================================
// CAPABILITY INTERFACES
// =============================================================================

import { getReportingAnalyticsCore } from './ReportingAnalyticsCore'

/**
 * Get Compliance Analytics capability
 * Real-time compliance metrics and analysis
 */
export const getComplianceAnalyticsCapability = () => {
  const module = getReportingAnalyticsCore()
  return module.getCapabilityInterface('compliance-analytics')
}

/**
 * Get Report Generation capability
 * Advanced report creation in multiple formats
 */
export const getReportGenerationCapability = () => {
  const module = getReportingAnalyticsCore()
  return module.getCapabilityInterface('report-generation')
}

/**
 * Get Supplier Analytics capability
 * Comprehensive supplier performance tracking
 */
export const getSupplierAnalyticsCapability = () => {
  const module = getReportingAnalyticsCore()
  return module.getCapabilityInterface('supplier-analytics')
}

/**
 * Get Predictive Insights capability
 * AI-powered analytics and forecasting
 */
export const getPredictiveInsightsCapability = () => {
  const module = getReportingAnalyticsCore()
  return module.getCapabilityInterface('predictive-insights')
}

/**
 * Get Dashboard Metrics capability
 * Real-time dashboard data and visualizations
 */
export const getDashboardMetricsCapability = () => {
  const module = getReportingAnalyticsCore()
  return module.getCapabilityInterface('dashboard-metrics')
}

/**
 * Get Inspector Portal capability
 * Secure inspector access and compliance documentation
 */
export const getInspectorPortalCapability = () => {
  const module = getReportingAnalyticsCore()
  return module.getCapabilityInterface('inspector-portal')
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Generate compliance report with modular system
 */
export const generateComplianceReport = async (
  clientId: string, 
  options: any
) => {
  const reportCapability = getReportGenerationCapability()
  return await reportCapability.generateComplianceReport(clientId, options)
}

/**
 * Get real-time compliance metrics
 */
export const getComplianceMetrics = async (
  clientId: string, 
  timeframe = 'week'
) => {
  const analyticsCapability = getComplianceAnalyticsCapability()
  return await analyticsCapability.calculateComplianceMetrics(clientId, timeframe)
}

/**
 * Analyze supplier performance
 */
export const analyzeSupplierPerformance = async (
  clientId: string, 
  timeframe = 'month'
) => {
  const supplierCapability = getSupplierAnalyticsCapability()
  return await supplierCapability.analyzeSupplierPerformance(clientId, timeframe)
}

/**
 * Get predictive insights and recommendations
 */
export const getPredictiveInsights = async (clientId: string) => {
  const predictiveCapability = getPredictiveInsightsCapability()
  return await predictiveCapability.generatePredictions(clientId)
}

/**
 * Get real-time dashboard data
 */
export const getDashboardData = async (
  clientId: string, 
  timeframe = 'week'
) => {
  const dashboardCapability = getDashboardMetricsCapability()
  return await dashboardCapability.getDashboardData(clientId, timeframe)
}

/**
 * Generate inspector portal access
 */
export const generateInspectorAccess = async (
  clientId: string, 
  inspectorId: string
) => {
  const inspectorCapability = getInspectorPortalCapability()
  return await inspectorCapability.generateInspectorAccess(clientId, inspectorId)
}

// =============================================================================
// HIGH-LEVEL INTEGRATION HELPERS
// =============================================================================

/**
 * Initialize complete analytics stack
 */
export const initializeAnalyticsStack = async (config?: {
  enablePredictiveInsights?: boolean
  enableRealTimeAnalytics?: boolean
  enableSupplierRanking?: boolean
  enableInspectorPortal?: boolean
}) => {
  console.log('🚀 Initializing Reporting & Analytics Stack...')
  
  try {
    // Initialize with enhanced configuration
    const module = await initializeEnhancedAnalytics({
      enablePredictiveInsights: config?.enablePredictiveInsights ?? true,
      enableRealTimeAnalytics: config?.enableRealTimeAnalytics ?? true,
      enableSupplierRanking: config?.enableSupplierRanking ?? true
    })
    
    // Verify all capabilities are available
    const capabilities = [
      'compliance-analytics',
      'report-generation', 
      'supplier-analytics',
      'dashboard-metrics'
    ]
    
    if (config?.enablePredictiveInsights) {
      capabilities.push('predictive-insights')
    }
    
    if (config?.enableInspectorPortal) {
      capabilities.push('inspector-portal')
    }
    
    // Test capability availability
    for (const capability of capabilities) {
      try {
        module.getCapabilityInterface(capability)
      } catch (error) {
        console.warn(`⚠️ Capability ${capability} not available:`, error)
      }
    }
    
    console.log('✅ Reporting & Analytics Stack initialized successfully')
    console.log(`📊 Available capabilities: ${capabilities.join(', ')}`)
    
    return {
      module,
      capabilities,
      
      // Direct access to key functions
      generateReport: (clientId: string, options: any) => 
        generateComplianceReport(clientId, options),
      
      getMetrics: (clientId: string, timeframe?: string) => 
        getComplianceMetrics(clientId, timeframe),
      
      analyzeSuppliers: (clientId: string, timeframe?: string) => 
        analyzeSupplierPerformance(clientId, timeframe),
      
      getDashboard: (clientId: string, timeframe?: string) => 
        getDashboardData(clientId, timeframe),
      
      getPredictions: config?.enablePredictiveInsights ? 
        (clientId: string) => getPredictiveInsights(clientId) : 
        undefined,
      
      generateInspectorPortal: config?.enableInspectorPortal ? 
        (clientId: string, inspectorId: string) => generateInspectorAccess(clientId, inspectorId) : 
        undefined
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize Reporting & Analytics Stack:', error)
    throw error
  }
}

/**
 * Quick setup for basic reporting
 */
export const setupBasicReporting = async () => {
  return await initializeAnalyticsStack({
    enablePredictiveInsights: false,
    enableRealTimeAnalytics: true,
    enableSupplierRanking: false,
    enableInspectorPortal: false
  })
}

/**
 * Full enterprise analytics setup
 */
export const setupEnterpriseAnalytics = async () => {
  return await initializeAnalyticsStack({
    enablePredictiveInsights: true,
    enableRealTimeAnalytics: true,
    enableSupplierRanking: true,
    enableInspectorPortal: true
  })
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

const ReportingAnalyticsModule = {
  // Core
  ReportingAnalyticsCore,
  getReportingAnalyticsCore,
  
  // Registration
  registerReportingAnalyticsModule,
  initializeReportingAnalyticsModule,
  initializeEnhancedAnalytics,
  
  // Components
  ModularEnhancedComplianceDashboard,
  ReportGenerator,
  
  // Capabilities
  getComplianceAnalyticsCapability,
  getReportGenerationCapability,
  getSupplierAnalyticsCapability,
  getPredictiveInsightsCapability,
  getDashboardMetricsCapability,
  getInspectorPortalCapability,
  
  // High-level functions
  generateComplianceReport,
  getComplianceMetrics,
  analyzeSupplierPerformance,
  getPredictiveInsights,
  getDashboardData,
  generateInspectorAccess,
  
  // Setup helpers
  initializeAnalyticsStack,
  setupBasicReporting,
  setupEnterpriseAnalytics
}

export default ReportingAnalyticsModule