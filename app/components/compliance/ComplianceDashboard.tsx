'use client'

// Hospitality Compliance SaaS - Compliance Dashboard Component
// Safari 12 compatible dashboard with flexbox layouts and performance optimization

import { useEffect, useState } from 'react'
import { getDeliveryRecords, getComplianceAlerts, acknowledgeAlert, getDeliveryDocketThumbnail, getDeliveryDocketPreview, getDeliveryDocketSignedUrl } from '@/lib/supabase'
import type { DeliveryRecordWithRelations, ComplianceAlertWithRecord } from '@/types/database'
import ImagePreviewModal from '@/app/components/ImagePreviewModal'

interface ComplianceDashboardProps {
  clientId: string
  userId: string
}

interface DashboardMetrics {
  todaysDeliveries: number
  complianceRate: number
  activeAlerts: number
  pendingAcknowledgments: number
}

// Helper function to format full upload timestamp
function formatUploadTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString('en-NZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

export default function ComplianceDashboard({ clientId, userId }: ComplianceDashboardProps) {
  const [deliveryRecords, setDeliveryRecords] = useState<DeliveryRecordWithRelations[]>([])
  const [complianceAlerts, setComplianceAlerts] = useState<ComplianceAlertWithRecord[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    todaysDeliveries: 0,
    complianceRate: 0,
    activeAlerts: 0,
    pendingAcknowledgments: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [clientId]) // Removed loadDashboardData from dependencies to prevent infinite loop

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load recent delivery records and active alerts in parallel
      const [records, alerts] = await Promise.all([
        getDeliveryRecords(clientId, 20),
        getComplianceAlerts(clientId)
      ])

      setDeliveryRecords(records)
      setComplianceAlerts(alerts)

      // Calculate metrics
      const today = new Date().toDateString()
      const todaysRecords = records.filter((record: any) => 
        new Date(record.created_at).toDateString() === today
      )

      const compliantRecords = records.filter((record: any) => {
        if (!record.temperature_readings || record.temperature_readings.length === 0) return true
        return record.temperature_readings.every((reading: any) => reading.is_compliant !== false)
      })

      const pendingAlerts = alerts.filter((alert: any) => 
        alert.requires_acknowledgment && !alert.acknowledged_at
      )

      setMetrics({
        todaysDeliveries: todaysRecords.length,
        complianceRate: records.length > 0 ? Math.round((compliantRecords.length / records.length) * 100) : 100,
        activeAlerts: alerts.length,
        pendingAcknowledgments: pendingAlerts.length
      })

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const result = await acknowledgeAlert(alertId, userId)
      
      if (result) {
        // Update local state
        setComplianceAlerts(prev => 
          prev.map(alert => 
            alert.id === alertId 
              ? { ...alert, acknowledged_by: userId, acknowledged_at: new Date().toISOString() }
              : alert
          )
        )
        
        // Update metrics
        setMetrics(prev => ({
          ...prev,
          pendingAcknowledgments: Math.max(0, prev.pendingAcknowledgments - 1)
        }))
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error)
    }
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={loadDashboardData} />
  }

  return (
    <div className="compliance-dashboard">
      {/* Metrics Cards - Using flexbox for Safari 12 compatibility */}
      <div className="dashboard-cards" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <MetricCard
          title="Today's Deliveries"
          value={metrics.todaysDeliveries}
icon=""
          color="bg-blue-50 text-blue-700"
        />
        <MetricCard
          title="Compliance Rate"
          value={`${metrics.complianceRate}%`}
icon=""
          color={
            metrics.complianceRate >= 95 
              ? "bg-green-50 text-green-700"
              : metrics.complianceRate >= 85
              ? "bg-yellow-50 text-yellow-700"  
              : "bg-red-50 text-red-700"
          }
        />
        <MetricCard
          title="Active Alerts"
          value={metrics.activeAlerts}
icon=""
          color={metrics.activeAlerts > 0 ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-700"}
        />
        <MetricCard
          title="Pending Actions"
          value={metrics.pendingAcknowledgments}
          icon=""
          color={metrics.pendingAcknowledgments > 0 ? "bg-orange-50 text-orange-700" : "bg-gray-50 text-gray-700"}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Critical Alerts Section */}
        {complianceAlerts.length > 0 && (
          <AlertsSection 
            alerts={complianceAlerts} 
            onAcknowledge={handleAcknowledgeAlert}
          />
        )}

        {/* Recent Deliveries Section */}
        <RecentDeliveriesSection records={deliveryRecords} />
      </div>
    </div>
  )
}

// =====================================================
// SUB COMPONENTS
// =====================================================

function MetricCard({ title, value, icon, color }: {
  title: string
  value: string | number
  icon: string
  color: string
}) {
  return (
    <div className={`metric-card p-4 rounded-lg ${color}`} style={{ minWidth: '200px', flex: '1' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  )
}

function AlertsSection({ 
  alerts, 
  onAcknowledge 
}: { 
  alerts: ComplianceAlertWithRecord[]
  onAcknowledge: (alertId: string) => void
}) {
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical')
  const warningAlerts = alerts.filter(alert => alert.severity === 'warning')

  return (
    <div className="alerts-section">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance Alerts</h2>
      
      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="mb-4">
          <h3 className="text-md font-medium text-red-700 mb-2">Critical Issues</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {criticalAlerts.map(alert => (
              <AlertCard 
                key={alert.id}
                alert={alert}
                onAcknowledge={onAcknowledge}
              />
            ))}
          </div>
        </div>
      )}

      {/* Warning Alerts */}
      {warningAlerts.length > 0 && (
        <div>
          <h3 className="text-md font-medium text-yellow-700 mb-2">Warnings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {warningAlerts.map(alert => (
              <AlertCard 
                key={alert.id}
                alert={alert}
                onAcknowledge={onAcknowledge}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AlertCard({ 
  alert, 
  onAcknowledge 
}: { 
  alert: ComplianceAlertWithRecord
  onAcknowledge: (alertId: string) => void
}) {
  const isAcknowledged = !!alert.acknowledged_at
  const severityColor = alert.severity === 'critical' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'

  return (
    <div className={`alert-card p-3 border rounded-lg ${severityColor}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: '1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="text-sm font-medium">
              {alert.supplier_name}
            </span>
            {alert.temperature_value && (
              <span className="text-sm text-gray-600">
                {alert.temperature_value}°C
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
          
          <p className="text-xs text-gray-500">
            {new Date(alert.created_at).toLocaleString()}
          </p>
        </div>
        
        {alert.requires_acknowledgment && !isAcknowledged && (
          <button
            onClick={() => onAcknowledge(alert.id)}
            className="acknowledge-btn ml-3 px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
            style={{ minHeight: '32px', minWidth: '80px' }}
          >
            Acknowledge
          </button>
        )}
        
        {isAcknowledged && (
          <span className="ml-3 px-2 py-1 text-xs text-green-700 bg-green-100 rounded">
            Acknowledged
          </span>
        )}
      </div>
    </div>
  )
}

function RecentDeliveriesSection({ records }: { records: DeliveryRecordWithRelations[] }) {
  return (
    <div className="recent-deliveries-section">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Deliveries</h2>
      
      {records.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No delivery records yet.</p>
          <p className="text-sm mt-1">Upload your first delivery docket to get started.</p>
        </div>
      ) : (
        <div className="delivery-records-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {records.slice(0, 10).map(record => (
            <DeliveryRecordCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  )
}

function DeliveryRecordCard({ record }: { record: DeliveryRecordWithRelations }) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('')
  const [thumbnailLoading, setThumbnailLoading] = useState(true)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  
  // Deployment verification - this will show if new component code is running
  console.log('📋 Dashboard component loaded - Bug fixes complete - v1.8.11.f')
  
  // Extract core data for Phase 2 display
  const supplierName = record.supplier_name || 'Unknown Supplier'
  const deliveryDate = record.delivery_date 
    ? new Date(record.delivery_date).toLocaleDateString()
    : new Date(record.created_at).toLocaleDateString()
  
  // Extract temperatures from new extracted_temperatures field or fallback to temperature_readings
  const temperatures = record.extracted_temperatures || 
    (record.temperature_readings?.map(tr => ({ value: tr.temperature_value, unit: tr.temperature_unit || 'C' })) || [])
  
  const uploadedBy = record.profiles?.full_name || 'Demo User'
  
  // Generate signed URLs asynchronously
  useEffect(() => {
    
    const generateSignedUrls = async () => {
      if (!record.image_path) {
        setThumbnailLoading(false)
        return
      }
      
      try {
        setThumbnailLoading(true)
        
        // Generate both thumbnail and preview URLs
        const [thumbnailSignedUrl, previewSignedUrl] = await Promise.all([
          getDeliveryDocketThumbnail(record.image_path),
          getDeliveryDocketPreview(record.image_path)
        ])
        
        setThumbnailUrl(thumbnailSignedUrl)
        setPreviewUrl(previewSignedUrl)
        
      } catch (error) {
        console.error('❌ Error generating signed URLs:', error)
      } finally {
        setThumbnailLoading(false)
      }
    }
    
    generateSignedUrls()
  }, [record.image_path])
  
  // Helper function for dynamic card styling based on status
  const getCardStyling = (record: DeliveryRecordWithRelations): string => {
    // Status-based tints
    switch (record.processing_status) {
      case 'completed': return 'bg-green-50 border border-green-200'
      case 'processing': return 'bg-yellow-50 border border-yellow-200'  
      case 'failed': return 'bg-red-50 border border-red-200'
      default: return 'bg-gray-50 border border-gray-200' // pending
    }
  }

  return (
    <div className={`delivery-record-item p-3 rounded-lg ${getCardStyling(record)}`} style={{ minHeight: '110px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        
        {/* Core Extracted Data - 4 Key Points */}
        <div style={{ flex: '1' }}>
          {/* Row 1: Supplier & Docket Number */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="font-medium text-gray-900">
              Supplier: {supplierName}
            </span>
            {record.docket_number && (
              <span className="text-sm text-gray-600">#{record.docket_number}</span>
            )}
          </div>
          
          {/* Row 2: Delivery Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
            <span className="text-sm text-gray-600">
              Delivered: {deliveryDate}
            </span>
          </div>
          
          {/* Row 3: Temperature Readings */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
            {temperatures.length > 0 ? (
              <span className="text-sm text-gray-600">
                Temperatures: {temperatures.map((t: any) => `${t.value}°${t.unit}`).join(', ')}
              </span>
            ) : (
              <span className="text-sm text-gray-400">No temperatures detected</span>
            )}
          </div>
          
          {/* Row 4: Uploaded By & Test Mode Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="text-sm text-gray-500">
              Uploaded by: {uploadedBy}
            </span>
            <span className="text-xs text-gray-400" style={{ fontSize: '0.75rem' }}>
              • {formatUploadTimestamp(record.created_at)}
            </span>
            <span className="text-sm text-gray-400">
              {record.processing_status === 'completed' ? 'Processed' : 
               record.processing_status === 'processing' ? 'Processing...' : 
               record.processing_status === 'failed' ? 'Failed' : 'Pending'}
            </span>
          </div>
        </div>
        
        {/* Processing Status - Simplified for Phase 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
          <span className={`text-xs px-2 py-1 rounded ${
            record.processing_status === 'completed' ? 'bg-green-100 text-green-700' :
            record.processing_status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
            record.processing_status === 'failed' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {record.processing_status === 'completed' ? 'Ready' :
             record.processing_status === 'processing' ? 'Processing' :
             record.processing_status === 'failed' ? 'Failed' : 'Pending'}
          </span>
          {record.confidence_score && (
            <span className="text-xs text-gray-500">
              {Math.round(record.confidence_score * 100)}% confidence
            </span>
          )}
        </div>

        {/* Thumbnail Image - Moved to Right Side with Signed URL Loading */}
        {record.image_path && (
          <div 
            className="thumbnail-container cursor-pointer flex-shrink-0"
            onClick={() => previewUrl ? setPreviewOpen(true) : null}
            title={previewUrl ? "Click to preview full image" : "Loading image..."}
            style={{ 
              position: 'relative',
              transition: 'transform 0.3s ease',
              transformOrigin: 'center'
            }}
            onMouseEnter={(e) => {
              if (!thumbnailLoading && thumbnailUrl) {
                e.currentTarget.style.transform = 'scale(2)'
                e.currentTarget.style.zIndex = '10'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.zIndex = '1'
            }}
          >
            {thumbnailLoading ? (
              // Loading skeleton
              <div className="w-20 h-20 bg-gray-200 rounded border-2 border-gray-300 flex items-center justify-center animate-pulse">
                <div className="text-gray-400 text-xs">Loading...</div>
              </div>
            ) : thumbnailUrl ? (
              // Signed URL image
              <img
                src={thumbnailUrl}
                alt="Delivery docket thumbnail"
                className="w-20 h-20 object-cover rounded border-2 border-gray-300 hover:border-blue-400 transition-colors shadow-sm"
                loading="lazy"
                onLoad={() => {
                  console.log('✅ IMG LOADED successfully for URL:', thumbnailUrl.substring(0, 120) + '...')
                }}
                onError={(e) => {
                  console.log('❌ IMG ERROR for URL:', thumbnailUrl.substring(0, 120) + '...')
                  console.log('❌ IMG ERROR details:', e)
                  // Fallback to document icon if signed URL fails
                  const target = e.currentTarget
                  target.src = "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='1.5'%3e%3cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/%3e%3cpolyline points='14,2 14,8 20,8'/%3e%3cline x1='16' y1='13' x2='8' y2='13'/%3e%3cline x1='16' y1='17' x2='8' y2='17'/%3e%3cpolyline points='10,9 9,9 8,9'/%3e%3c/svg%3e"
                  target.alt = "Document icon"
                }}
              />
            ) : (
              // Fallback document icon if no signed URL generated
              <div className="w-20 h-20 bg-gray-100 rounded border-2 border-gray-300 flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewOpen && previewUrl && (
        <ImagePreviewModal 
          imagePath={record.image_path}
          imageUrl={previewUrl}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  )
}

// =====================================================
// LOADING & ERROR COMPONENTS
// =====================================================

function LoadingSkeleton() {
  return (
    <div className="compliance-dashboard">
      <div className="dashboard-cards" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-lg p-4" style={{ minWidth: '200px', flex: '1', minHeight: '80px' }}>
          </div>
        ))}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-16"></div>
        ))}
      </div>
    </div>
  )
}

function ErrorDisplay({ error, onRetry }: { error: string, onRetry: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="text-red-600 mb-4">
        <p className="font-medium">Error loading dashboard</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
      <button
        onClick={onRetry}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
        style={{ minHeight: '40px' }}
      >
        Try Again
      </button>
    </div>
  )
}