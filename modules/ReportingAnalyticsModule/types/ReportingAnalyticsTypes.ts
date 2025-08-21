/**
 * Reporting & Analytics Module - Type Definitions
 * Comprehensive type system for analytics, reporting, and insights
 * 
 * SAFETY: This creates NEW types with ZERO RISK to existing code
 */

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

export interface ReportingAnalyticsConfig {
  // Analytics Settings
  enableRealTimeAnalytics: boolean
  enablePredictiveInsights: boolean
  enableSupplierAnalytics: boolean
  enableComplianceTracking: boolean
  
  // Data Retention
  metricsRetentionDays: number
  reportRetentionDays: number
  cacheRefreshInterval: number
  
  // Reporting Configuration
  defaultReportFormat: 'PDF' | 'CSV' | 'Excel' | 'JSON'
  enableScheduledReports: boolean
  enableInspectorPortal: boolean
  
  // Performance Settings
  maxConcurrentReports: number
  maxAnalyticsQueries: number
  enableDataCompression: boolean
  
  // AI/ML Features
  enableTrendAnalysis: boolean
  enableAnomalyDetection: boolean
  enableRiskPrediction: boolean
  confidenceThreshold: number
}

// =============================================================================
// ANALYTICS & METRICS TYPES
// =============================================================================

export interface AnalyticsMetrics {
  // Core Metrics
  complianceRate: number
  violationCount: number
  avgTemperature: number
  riskScore: number
  deliveryCount: number
  supplierCount: number
  
  // Trend Data
  trendData: TrendDataPoint[]
  
  // Metadata
  generatedAt: Date
}

export interface TrendDataPoint {
  timestamp: Date
  value: number
  metric: string
  change?: number
  changePercent?: number
}

export interface ComplianceAnalysis {
  currentStatus: 'compliant' | 'non-compliant' | 'warning'
  trendAnalysis: TrendDataPoint[]
  riskAssessment: number
  recommendations: Recommendation[]
  lastUpdated: Date
}

export interface Recommendation {
  id: string
  type: 'critical' | 'important' | 'suggestion'
  title: string
  description: string
  action: string
  impact: string
  priority: number
  category: 'temperature' | 'supplier' | 'process' | 'compliance'
  estimatedEffort: 'low' | 'medium' | 'high'
  potentialSavings?: number
}

// =============================================================================
// SUPPLIER ANALYTICS TYPES
// =============================================================================

export interface SupplierPerformance {
  // Supplier Identity
  supplierId: string
  supplierName: string
  
  // Performance Metrics
  deliveryCount: number
  complianceRate: number
  avgTemperature: number
  violationCount: number
  riskScore: number
  
  // Trend Analysis
  trend: 'improving' | 'declining' | 'stable'
  trendData: TrendDataPoint[]
  
  // Quality Metrics
  onTimeDeliveries: number
  documentationQuality: number
  temperatureConsistency: number
  
  // Risk Indicators
  riskFactors: string[]
  nextReviewDate: Date
  
  // Benchmarking
  industryRanking?: number
  peerComparison?: SupplierComparison
}

export interface SupplierComparison {
  position: number
  totalSuppliers: number
  performanceDelta: number
  strongerThan: number
  weakerThan: number
}

// =============================================================================
// PREDICTIVE ANALYTICS TYPES
// =============================================================================

export interface PredictiveInsights {
  riskPredictions: RiskPrediction[]
  recommendations: Recommendation[]
  trends: PredictiveTrend[]
  anomalies: AnomalyDetection[]
  confidenceScore: number
}

export interface RiskPrediction {
  timeframe: '1day' | '1week' | '1month' | '3months'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  probability: number
  factors: RiskFactor[]
  preventiveActions: string[]
  estimatedImpact: number
}

export interface RiskFactor {
  factor: string
  weight: number
  description: string
  mitigationStrategies: string[]
}

export interface PredictiveTrend {
  metric: string
  direction: 'increasing' | 'decreasing' | 'stable'
  velocity: number
  projectedValue: number
  timeframe: string
  confidence: number
}

export interface AnomalyDetection {
  timestamp: Date
  type: 'temperature' | 'volume' | 'timing' | 'compliance'
  severity: 'low' | 'medium' | 'high'
  description: string
  expectedValue: number
  actualValue: number
  deviation: number
  possibleCauses: string[]
  investigationStatus: 'pending' | 'investigating' | 'resolved'
}

// =============================================================================
// REPORTING TYPES
// =============================================================================

export interface ReportDefinition {
  id: string
  name: string
  type: ReportType
  description: string
  
  // Configuration
  template: string
  format: 'PDF' | 'CSV' | 'Excel' | 'JSON'
  schedule?: ReportSchedule
  
  // Data Sources
  dataSources: DataSource[]
  filters: ReportFilter[]
  
  // Output
  outputSettings: ReportOutputSettings
  
  // Metadata
  createdBy: string
  createdAt: Date
  lastGenerated?: Date
  isActive: boolean
}

export type ReportType = 
  | 'compliance-summary' 
  | 'violation-report'
  | 'supplier-analysis'
  | 'temperature-tracking'
  | 'inspector-ready'
  | 'custom'

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  dayOfWeek?: number
  dayOfMonth?: number
  time: string
  timezone: string
  recipients: string[]
  isActive: boolean
}

export interface DataSource {
  source: string
  table: string
  fields: string[]
  joinConditions?: JoinCondition[]
}

export interface JoinCondition {
  sourceField: string
  targetTable: string
  targetField: string
  type: 'inner' | 'left' | 'right' | 'full'
}

export interface ReportFilter {
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in'
  value: any
  logicalOperator?: 'AND' | 'OR'
}

export interface ReportOutputSettings {
  pageSize?: 'A4' | 'Letter' | 'Legal'
  orientation?: 'portrait' | 'landscape'
  includeCharts: boolean
  includeRawData: boolean
  branding: BrandingSettings
  compression?: 'none' | 'low' | 'medium' | 'high'
}

export interface BrandingSettings {
  logo?: string
  companyName: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  fonts: {
    header: string
    body: string
  }
}

// =============================================================================
// DASHBOARD & VISUALIZATION TYPES
// =============================================================================

export interface DashboardMetrics {
  // Real-time Metrics
  liveMetrics: LiveMetric[]
  
  // Historical Data
  historicalData: HistoricalDataPoint[]
  
  // Charts and Visualizations
  charts: ChartConfiguration[]
  
  // Key Performance Indicators
  kpis: KPI[]
  
  // Alerts and Notifications
  alerts: Alert[]
  
  // Last Updated
  lastRefresh: Date
  refreshInterval: number
}

export interface LiveMetric {
  id: string
  name: string
  value: number
  unit?: string
  change?: number
  changePercent?: number
  status: 'good' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
}

export interface HistoricalDataPoint {
  timestamp: Date
  metrics: Record<string, number>
}

export interface ChartConfiguration {
  id: string
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'gauge'
  title: string
  data: ChartData
  options: ChartOptions
  refreshInterval?: number
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string
  borderWidth?: number
}

export interface ChartOptions {
  responsive: boolean
  maintainAspectRatio: boolean
  scales?: any
  plugins?: any
  animation?: any
}

export interface KPI {
  id: string
  name: string
  currentValue: number
  targetValue?: number
  unit?: string
  format: 'number' | 'percentage' | 'currency' | 'duration'
  trend: {
    direction: 'up' | 'down' | 'stable'
    period: string
    change: number
  }
  status: 'excellent' | 'good' | 'warning' | 'critical'
  description?: string
}

export interface Alert {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  timestamp: Date
  source: string
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
  relatedEntity?: {
    type: 'supplier' | 'delivery' | 'violation'
    id: string
    name: string
  }
  actionRequired: boolean
  actions?: AlertAction[]
}

export interface AlertAction {
  id: string
  label: string
  type: 'primary' | 'secondary'
  action: string
  params?: Record<string, any>
}

// =============================================================================
// INSPECTOR PORTAL TYPES
// =============================================================================

export interface InspectorAccess {
  accessToken: string
  portalUrl: string
  expiresAt: Date
  permissions: InspectorPermission[]
  inspectorInfo: InspectorInfo
  clientInfo: ClientInfo
}

export type InspectorPermission = 
  | 'read_compliance'
  | 'read_violations'
  | 'read_reports'
  | 'export_data'
  | 'view_trends'

export interface InspectorInfo {
  id: string
  name: string
  organization: string
  credentials: string
  contactInfo: ContactInfo
}

export interface ClientInfo {
  id: string
  name: string
  businessType: string
  address: Address
  contactInfo: ContactInfo
  complianceOfficer: string
}

export interface ContactInfo {
  email: string
  phone?: string
  alternateEmail?: string
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

// =============================================================================
// EXPORT UTILITY TYPES
// =============================================================================

export interface ExportRequest {
  id: string
  format: 'CSV' | 'Excel' | 'PDF' | 'JSON'
  dataType: 'compliance' | 'violations' | 'suppliers' | 'full'
  filters: ReportFilter[]
  dateRange: DateRange
  includeCharts: boolean
  compression: boolean
  requestedBy: string
  requestedAt: Date
}

export interface DateRange {
  startDate: Date
  endDate: Date
  timezone?: string
}

export interface ExportResult {
  id: string
  status: 'processing' | 'completed' | 'failed'
  downloadUrl?: string
  fileSize?: number
  recordCount?: number
  generatedAt?: Date
  expiresAt?: Date
  error?: string
}

// =============================================================================
// PERFORMANCE & MONITORING TYPES
// =============================================================================

export interface PerformanceMetrics {
  queryExecutionTime: number
  reportGenerationTime: number
  cacheHitRate: number
  memoryUsage: number
  activeConnections: number
  queuedTasks: number
}

export interface SystemHealth {
  analyticsEngine: 'healthy' | 'degraded' | 'down'
  database: 'healthy' | 'degraded' | 'down'
  cache: 'healthy' | 'degraded' | 'down'
  reportGenerator: 'healthy' | 'degraded' | 'down'
  overallStatus: 'healthy' | 'degraded' | 'down'
  lastHealthCheck: Date
}

// =============================================================================
// INTEGRATION TYPES
// =============================================================================

export interface DataIntegration {
  id: string
  source: string
  type: 'real-time' | 'batch' | 'on-demand'
  schedule?: string
  lastSync: Date
  nextSync?: Date
  status: 'active' | 'paused' | 'error'
  errorDetails?: string
  recordsSynced: number
  syncDuration: number
}

export interface WebhookConfig {
  id: string
  endpoint: string
  events: string[]
  secret: string
  isActive: boolean
  retryPolicy: RetryPolicy
  lastTriggered?: Date
  successCount: number
  failureCount: number
}

export interface RetryPolicy {
  maxRetries: number
  backoffStrategy: 'linear' | 'exponential'
  initialDelay: number
  maxDelay: number
}