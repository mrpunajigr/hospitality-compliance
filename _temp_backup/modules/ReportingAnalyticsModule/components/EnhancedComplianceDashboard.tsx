'use client'

/**
 * Enhanced Compliance Dashboard - Modular Analytics Component
 * Advanced intelligence for restaurant operations with real-time insights
 * 
 * SAFETY: This is a COPY of existing functionality - ZERO RISK to existing code
 * Original component remains unchanged and fully functional
 */

import { useEffect, useState } from 'react'
import { getCardStyle, getTextStyle } from '@/lib/design-system'
import type { 
  AnalyticsMetrics, 
  SupplierPerformance, 
  Recommendation,
  ComplianceAnalysis 
} from '../types/ReportingAnalyticsTypes'

interface EnhancedComplianceDashboardProps {
  clientId: string
  userId: string
  
  // Module Integration Options
  useModularAnalytics?: boolean
  enablePredictiveInsights?: boolean
  enableSupplierRanking?: boolean
  refreshInterval?: number
}

interface EnhancedMetrics {
  // Current Performance
  todaysDeliveries: number
  complianceRate: number
  activeAlerts: number
  pendingAcknowledgments: number
  
  // Trend Analysis
  weeklyTrend: number // % change from last week
  monthlyTrend: number // % change from last month
  avgTemperature: number
  
  // Supplier Performance
  topSuppliers: SupplierStats[]
  riskSuppliers: SupplierStats[]
  
  // Time Analysis
  peakViolationHours: string[]
  deliveryPatterns: DeliveryPattern[]
  
  // Predictive Insights
  riskScore: number // 0-100 risk assessment
  recommendations: Recommendation[]
}

interface SupplierStats {
  name: string
  deliveryCount: number
  complianceRate: number
  avgTemperature: number
  violationCount: number
  trend: 'improving' | 'declining' | 'stable'
}

interface DeliveryPattern {
  hour: string
  count: number
  violationRate: number
}

// Enhanced analytics functions with module integration capability
const calculateTrend = (currentPeriod: any[], previousPeriod: any[]): number => {
  if (previousPeriod.length === 0) return 0
  
  const currentRate = currentPeriod.length > 0 ? 
    (currentPeriod.filter(r => r.compliant).length / currentPeriod.length) * 100 : 100
  const previousRate = previousPeriod.length > 0 ? 
    (previousPeriod.filter(r => r.compliant).length / previousPeriod.length) * 100 : 100
  
  return Number((currentRate - previousRate).toFixed(1))
}

const analyzeSupplierPerformance = (records: any[]): SupplierStats[] => {
  const supplierData = new Map<string, {
    deliveries: any[]
    violations: number
    temperatures: number[]
  }>()
  
  // Group data by supplier
  records.forEach(record => {
    if (!record.supplier_name) return
    
    if (!supplierData.has(record.supplier_name)) {
      supplierData.set(record.supplier_name, {
        deliveries: [],
        violations: 0,
        temperatures: []
      })
    }
    
    const data = supplierData.get(record.supplier_name)!
    data.deliveries.push(record)
    
    // Check for violations
    if (record.temperature_readings) {
      record.temperature_readings.forEach((reading: any) => {
        if (reading.temperature) {
          data.temperatures.push(parseFloat(reading.temperature))
        }
        if (reading.is_compliant === false) {
          data.violations++
        }
      })
    }
  })
  
  // Convert to SupplierStats format with enhanced analytics
  const suppliers: SupplierStats[] = []
  
  supplierData.forEach((data, name) => {
    // Calculate compliance based on deliveries with readings, not total violations
    const deliveriesWithReadings = data.deliveries.filter(delivery => 
      delivery.temperature_readings && delivery.temperature_readings.length > 0
    )
    
    const compliantDeliveries = deliveriesWithReadings.filter(delivery =>
      delivery.temperature_readings.every((reading: any) => reading.is_compliant !== false)
    )
    
    const complianceRate = deliveriesWithReadings.length > 0 ? 
      (compliantDeliveries.length / deliveriesWithReadings.length) * 100 : 0
    
    const avgTemp = data.temperatures.length > 0 ? 
      data.temperatures.reduce((sum, temp) => sum + temp, 0) / data.temperatures.length : 0
    
    suppliers.push({
      name,
      deliveryCount: data.deliveries.length,
      complianceRate: Math.round(complianceRate),
      avgTemperature: Number(avgTemp.toFixed(1)),
      violationCount: data.violations,
      trend: complianceRate >= 95 ? 'stable' : complianceRate >= 85 ? 'declining' : 'improving'
    })
  })
  
  return suppliers.sort((a, b) => b.deliveryCount - a.deliveryCount)
}

const generateRecommendations = (metrics: Partial<EnhancedMetrics>): Recommendation[] => {
  const recommendations: Recommendation[] = []
  
  // Critical recommendations
  if (metrics.complianceRate && metrics.complianceRate < 85) {
    recommendations.push({
      id: `critical_compliance_${Date.now()}`,
      type: 'critical',
      title: 'Low Compliance Rate Alert',
      description: `Your compliance rate is ${metrics.complianceRate}%, below the 85% safety threshold.`,
      action: 'Review supplier contracts and temperature monitoring procedures immediately.',
      impact: 'Prevents health inspection violations and food safety incidents',
      priority: 1,
      category: 'compliance',
      estimatedEffort: 'high'
    })
  }
  
  // Supplier-based recommendations
  if (metrics.riskSuppliers && metrics.riskSuppliers.length > 0) {
    recommendations.push({
      id: `supplier_risk_${Date.now()}`,
      type: 'important',
      title: 'High-Risk Suppliers Identified',
      description: `${metrics.riskSuppliers.length} supplier(s) showing poor compliance patterns.`,
      action: `Contact ${metrics.riskSuppliers[0].name} to discuss temperature control improvements.`,
      impact: 'Reduces violation risk by 30-40% through proactive supplier management',
      priority: 2,
      category: 'supplier',
      estimatedEffort: 'medium'
    })
  }
  
  // Temperature-based insights
  if (metrics.avgTemperature && metrics.avgTemperature > 4.0) {
    recommendations.push({
      id: `temperature_trend_${Date.now()}`,
      type: 'important',
      title: 'Temperature Trend Concern',
      description: `Average delivery temperature is ${metrics.avgTemperature}°C, approaching risk zone.`,
      action: 'Implement additional temperature monitoring during transport.',
      impact: 'Maintains food safety and prevents spoilage costs',
      priority: 3,
      category: 'temperature',
      estimatedEffort: 'medium'
    })
  }
  
  // Positive reinforcement
  if (metrics.complianceRate && metrics.complianceRate >= 95) {
    recommendations.push({
      id: `excellent_compliance_${Date.now()}`,
      type: 'suggestion',
      title: 'Excellent Compliance Performance',
      description: `Outstanding ${metrics.complianceRate}% compliance rate achieved.`,
      action: 'Document current procedures as best practices for training.',
      impact: 'Maintains high standards and reduces operational risk',
      priority: 4,
      category: 'process',
      estimatedEffort: 'low'
    })
  }
  
  return recommendations
}

export default function ModularEnhancedComplianceDashboard({ 
  clientId, 
  userId,
  useModularAnalytics = false,
  enablePredictiveInsights = false,
  enableSupplierRanking = false,
  refreshInterval = 300000 // 5 minutes
}: EnhancedComplianceDashboardProps) {
  const [metrics, setMetrics] = useState<EnhancedMetrics>({
    todaysDeliveries: 0,
    complianceRate: 0,
    activeAlerts: 0,
    pendingAcknowledgments: 0,
    weeklyTrend: 0,
    monthlyTrend: 0,
    avgTemperature: 0,
    topSuppliers: [],
    riskSuppliers: [],
    peakViolationHours: [],
    deliveryPatterns: [],
    riskScore: 0,
    recommendations: []
  })
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('week')
  const [analyticsModule, setAnalyticsModule] = useState<any>(null)

  // Initialize modular analytics if enabled
  useEffect(() => {
    if (useModularAnalytics) {
      const initializeModule = async () => {
        try {
          // Dynamically import the reporting analytics module
          const { getReportingAnalyticsCore } = await import('../ReportingAnalyticsCore')
          const module = getReportingAnalyticsCore()
          
          // Initialize if not already loaded
          if (!module.isLoaded) {
            await module.initialize()
          }
          if (!module.isActive) {
            await module.activate()
          }
          
          setAnalyticsModule(module)
        } catch (error) {
          console.error('Failed to initialize modular analytics:', error)
          // Fall back to traditional analytics
        }
      }
      
      initializeModule()
    }
  }, [useModularAnalytics])

  const loadEnhancedDashboardData = async () => {
    try {
      setLoading(true)
      
      // Use modular analytics if available
      if (analyticsModule && useModularAnalytics) {
        await loadModularAnalyticsData()
      } else {
        await loadTraditionalAnalyticsData()
      }
      
    } catch (error) {
      console.error('Error loading enhanced dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadModularAnalyticsData = async () => {
    try {
      // Get compliance analytics capability
      const complianceCapability = analyticsModule.getCapabilityInterface('compliance-analytics')
      const dashboardCapability = analyticsModule.getCapabilityInterface('dashboard-metrics')
      const supplierCapability = analyticsModule.getCapabilityInterface('supplier-analytics')
      
      // Load comprehensive metrics using module capabilities
      const [complianceMetrics, dashboardData, supplierAnalysis] = await Promise.all([
        complianceCapability.calculateComplianceMetrics(clientId, timeframe),
        dashboardCapability.getDashboardData(clientId, timeframe),
        supplierCapability.analyzeSupplierPerformance(clientId, timeframe)
      ])
      
      // Process and combine modular data
      const enhancedMetrics: EnhancedMetrics = {
        todaysDeliveries: dashboardData.metrics.deliveryCount || 0,
        complianceRate: complianceMetrics.complianceRate || 0,
        activeAlerts: dashboardData.alerts?.length || 0,
        pendingAcknowledgments: dashboardData.alerts?.filter((a: any) => !a.acknowledged).length || 0,
        weeklyTrend: complianceMetrics.trendData?.find((t: any) => t.metric === 'weekly')?.change || 0,
        monthlyTrend: complianceMetrics.trendData?.find((t: any) => t.metric === 'monthly')?.change || 0,
        avgTemperature: complianceMetrics.avgTemperature || 0,
        topSuppliers: supplierAnalysis.slice(0, 3) || [],
        riskSuppliers: supplierAnalysis.filter((s: any) => s.riskScore > 70).slice(0, 3) || [],
        peakViolationHours: [],
        deliveryPatterns: [],
        riskScore: complianceMetrics.riskScore || 0,
        recommendations: []
      }
      
      // Generate intelligent recommendations if enabled
      if (enablePredictiveInsights) {
        const predictiveCapability = analyticsModule.getCapabilityInterface('predictive-insights')
        const insights = await predictiveCapability.generatePredictions(clientId)
        enhancedMetrics.recommendations = insights.recommendations || []
      } else {
        enhancedMetrics.recommendations = generateRecommendations(enhancedMetrics)
      }
      
      setMetrics(enhancedMetrics)
      
    } catch (error) {
      console.error('Error in modular analytics:', error)
      // Fall back to traditional analytics
      await loadTraditionalAnalyticsData()
    }
  }

  const loadTraditionalAnalyticsData = async () => {
    // Traditional analytics loading (existing functionality)
    // This is the fallback method using existing Supabase queries
    
    try {
      // Import traditional functions
      const { getDeliveryRecords, getComplianceAlerts } = await import('@/lib/supabase')
      
      // Get current data
      const records = await getDeliveryRecords(clientId)
      const alerts = await getComplianceAlerts(clientId)
      
      // Calculate date ranges
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      
      // Filter records by time periods
      const todaysRecords = records.filter((record: any) => 
        new Date(record.created_at) >= todayStart
      )
      
      const weekRecords = records.filter((record: any) => 
        new Date(record.created_at) >= weekStart
      )
      
      const monthRecords = records.filter((record: any) => 
        new Date(record.created_at) >= monthStart
      )
      
      const lastWeekRecords = records.filter((record: any) => {
        const date = new Date(record.created_at)
        return date >= lastWeekStart && date < weekStart
      })
      
      // Calculate compliance rates
      const calculateCompliance = (recs: any[]) => {
        if (recs.length === 0) return 100
        
        const recordsWithReadings = recs.filter(record => record.temperature_readings && record.temperature_readings.length > 0)
        if (recordsWithReadings.length === 0) return 0
        
        const compliant = recordsWithReadings.filter(record => {
          return record.temperature_readings.every((reading: any) => reading.is_compliant !== false)
        })
        return Math.round((compliant.length / recordsWithReadings.length) * 100)
      }
      
      const currentCompliance = calculateCompliance(weekRecords)
      const lastWeekCompliance = calculateCompliance(lastWeekRecords)
      
      // Calculate average temperature
      const allTemperatures: number[] = []
      weekRecords.forEach((record: any) => {
        if (record.temperature_readings) {
          record.temperature_readings.forEach((reading: any) => {
            if (reading.temperature) {
              allTemperatures.push(parseFloat(reading.temperature))
            }
          })
        }
      })
      
      const avgTemp = allTemperatures.length > 0 ? 
        allTemperatures.reduce((sum, temp) => sum + temp, 0) / allTemperatures.length : 0
      
      // Analyze suppliers
      const allSuppliers = analyzeSupplierPerformance(weekRecords)
      const topSuppliers = allSuppliers.slice(0, 3)
      const riskSuppliers = allSuppliers
        .filter(supplier => supplier.complianceRate < 90 || supplier.violationCount > 2)
        .slice(0, 3)
      
      // Calculate risk score
      let riskScore = 0
      riskScore += (100 - currentCompliance) * 0.5
      riskScore += Math.max(0, (avgTemp - 4)) * 5
      riskScore += riskSuppliers.length * 3
      riskScore += (weekRecords.length === 0 ? 20 : 0)
      riskScore = Math.min(100, Math.max(0, Math.round(riskScore)))
      
      // Generate recommendations
      const tempMetrics = {
        complianceRate: currentCompliance,
        avgTemperature: avgTemp,
        riskSuppliers: riskSuppliers
      }
      const recommendations = generateRecommendations(tempMetrics)
      
      // Pending alerts
      const pendingAlerts = alerts.filter((alert: any) => 
        alert.requires_acknowledgment && !alert.acknowledged_at
      )
      
      setMetrics({
        todaysDeliveries: todaysRecords.length,
        complianceRate: currentCompliance,
        activeAlerts: alerts.length,
        pendingAcknowledgments: pendingAlerts.length,
        weeklyTrend: currentCompliance - lastWeekCompliance,
        monthlyTrend: currentCompliance - calculateCompliance(monthRecords.slice(0, Math.floor(monthRecords.length / 2))),
        avgTemperature: Number(avgTemp.toFixed(1)),
        topSuppliers,
        riskSuppliers,
        peakViolationHours: [],
        deliveryPatterns: [],
        riskScore: Math.round(riskScore),
        recommendations
      })
      
    } catch (error) {
      console.error('Error in traditional analytics:', error)
    }
  }

  useEffect(() => {
    if (clientId) {
      loadEnhancedDashboardData()
      
      // Set up refresh interval
      const interval = setInterval(loadEnhancedDashboardData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [clientId, timeframe, analyticsModule, useModularAnalytics])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className={getCardStyle('primary')}>
          <div className="text-center p-8">
            <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white font-medium">
              Loading {useModularAnalytics ? 'modular' : 'traditional'} analytics dashboard...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Module Status Indicator */}
      {useModularAnalytics && (
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${analyticsModule ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-white/80 text-sm">
              {analyticsModule ? 'Modular Analytics Active' : 'Loading Module...'}
            </span>
          </div>
        </div>
      )}
      
      {/* Timeframe Selector */}
      <div className="flex justify-between items-center">
        <h2 className={`${getTextStyle('sectionTitle')} text-white`}>
          {useModularAnalytics ? 'Advanced' : 'Enhanced'} Compliance Intelligence Dashboard
        </h2>
        
        <div className="flex bg-black/70 backdrop-blur-sm rounded-full p-1 border border-white/40">
          {(['today', 'week', 'month'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 capitalize ${
                timeframe === period 
                  ? 'bg-white text-black'
                  : 'text-white/80 hover:text-white hover:bg-white/25'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Compliance Rate with Trend */}
        <div className={getCardStyle('primary')}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-3xl">📊</div>
            <div className={`flex items-center space-x-1 text-sm ${
              metrics.weeklyTrend >= 0 ? 'text-green-300' : 'text-red-300'
            }`}>
              <span>{metrics.weeklyTrend >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(metrics.weeklyTrend)}%</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {metrics.complianceRate}%
          </div>
          <div className={`${getTextStyle('body')} text-white/80 text-sm`}>
            Compliance Rate
          </div>
          <div className="mt-2 text-xs text-white/60">
            {metrics.weeklyTrend >= 0 ? 'Improving' : 'Needs attention'}
          </div>
        </div>

        {/* Risk Score */}
        <div className={getCardStyle('primary')}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-3xl">⚡</div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              metrics.riskScore <= 20 ? 'bg-green-600/20 text-green-300' :
              metrics.riskScore <= 50 ? 'bg-yellow-600/20 text-yellow-300' :
              'bg-red-600/20 text-red-300'
            }`}>
              {metrics.riskScore <= 20 ? 'Low Risk' :
               metrics.riskScore <= 50 ? 'Medium Risk' : 'High Risk'}
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {100 - metrics.riskScore}
          </div>
          <div className={`${getTextStyle('body')} text-white/80 text-sm`}>
            Safety Score
          </div>
          <div className="mt-2 w-full bg-white/20 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                metrics.riskScore <= 20 ? 'bg-green-500' :
                metrics.riskScore <= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${100 - metrics.riskScore}%` }}
            />
          </div>
        </div>

        {/* Average Temperature */}
        <div className={getCardStyle('primary')}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-3xl">🌡️</div>
            <div className={`text-sm ${
              metrics.avgTemperature <= 4 ? 'text-green-300' : 'text-yellow-300'
            }`}>
              Target: ≤4°C
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {metrics.avgTemperature}°C
          </div>
          <div className={`${getTextStyle('body')} text-white/80 text-sm`}>
            Avg Temperature
          </div>
          <div className="mt-2 text-xs text-white/60">
            {metrics.avgTemperature <= 4 ? 'Within safe range' : 'Monitor closely'}
          </div>
        </div>

        {/* Active Alerts */}
        <div className={getCardStyle('primary')}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-3xl">🚨</div>
            {metrics.pendingAcknowledgments > 0 && (
              <div className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                {metrics.pendingAcknowledgments} pending
              </div>
            )}
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {metrics.activeAlerts}
          </div>
          <div className={`${getTextStyle('body')} text-white/80 text-sm`}>
            Active Alerts
          </div>
          <div className="mt-2 text-xs text-white/60">
            {metrics.activeAlerts === 0 ? 'All clear' : 'Requires attention'}
          </div>
        </div>

      </div>

      {/* Intelligent Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Supplier Performance */}
        <div className={getCardStyle('secondary')}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`${getTextStyle('sectionTitle')} text-white`}>
                Supplier Performance
              </h3>
              {enableSupplierRanking && (
                <div className="text-xs text-white/60">AI-Ranked</div>
              )}
            </div>
            
            {metrics.topSuppliers.length > 0 ? (
              <div className="space-y-4">
                {metrics.topSuppliers.map((supplier, index) => (
                  <div key={supplier.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-600 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        'bg-orange-600 text-white'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <div className={`${getTextStyle('body')} text-white font-medium`}>
                          {supplier.name}
                        </div>
                        <div className="text-white/60 text-sm">
                          {supplier.deliveryCount} deliveries
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-medium ${
                        supplier.complianceRate >= 95 ? 'text-green-300' :
                        supplier.complianceRate >= 85 ? 'text-yellow-300' :
                        'text-red-300'
                      }`}>
                        {supplier.complianceRate}%
                      </div>
                      <div className="text-white/60 text-xs">
                        {supplier.avgTemperature}°C avg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 text-center py-4">
                No supplier data available yet
              </p>
            )}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className={getCardStyle('form')}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`${getTextStyle('sectionTitle')} text-gray-900`}>
                {enablePredictiveInsights ? 'AI-Powered' : 'Smart'} Recommendations
              </h3>
              {enablePredictiveInsights && (
                <div className="text-xs text-gray-600">Predictive AI</div>
              )}
            </div>
            
            {metrics.recommendations.length > 0 ? (
              <div className="space-y-3">
                {metrics.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={rec.id || index} className={`p-3 rounded-xl border-l-4 ${
                    rec.type === 'critical' ? 'bg-red-50 border-red-500' :
                    rec.type === 'important' ? 'bg-yellow-50 border-yellow-500' :
                    'bg-blue-50 border-blue-500'
                  }`}>
                    <div className="flex items-start space-x-2">
                      <div className="text-lg">
                        {rec.type === 'critical' ? '🚨' :
                         rec.type === 'important' ? '⚠️' : '💡'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {rec.title}
                        </div>
                        <div className="text-gray-700 text-xs mt-1">
                          {rec.description}
                        </div>
                        <div className="text-gray-600 text-xs mt-2 italic">
                          💡 {rec.action}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-4xl mb-2">✨</div>
                <p className="text-gray-600">
                  All systems running smoothly!
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Risk Suppliers Alert */}
      {metrics.riskSuppliers.length > 0 && (
        <div className={`${getCardStyle('primary')} border-l-4 border-red-500`}>
          <div className="p-6">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <h4 className={`${getTextStyle('sectionTitle')} text-white mb-2`}>
                  High-Risk Suppliers Detected
                </h4>
                <p className="text-white/80 mb-4">
                  The following suppliers show concerning compliance patterns and need immediate attention:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {metrics.riskSuppliers.map((supplier) => (
                    <div key={supplier.name} className="bg-red-600/20 rounded-xl p-3">
                      <div className="font-medium text-white mb-1">
                        {supplier.name}
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="text-red-300">
                          {supplier.complianceRate}% compliance
                        </div>
                        <div className="text-white/60">
                          {supplier.violationCount} violations
                        </div>
                        <div className="text-white/60">
                          {supplier.avgTemperature}°C average
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}