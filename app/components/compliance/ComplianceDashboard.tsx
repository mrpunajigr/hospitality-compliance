'use client'

// Hospitality Compliance SaaS - Compliance Dashboard Component
// Safari 12 compatible dashboard with flexbox layouts and performance optimization

import { useEffect, useState } from 'react'
import { getDeliveryRecords, getComplianceAlerts, acknowledgeAlert } from '@/lib/supabase'
import type { DeliveryRecordWithRelations, ComplianceAlertWithRecord } from '@/types/database'

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
  }, [clientId])

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
  const hasTemperatures = record.temperature_readings && record.temperature_readings.length > 0
  const isCompliant = !hasTemperatures || record.temperature_readings.every(reading => reading.is_compliant !== false)
  
  const statusColor = record.processing_status === 'completed' 
    ? isCompliant ? 'text-green-600' : 'text-red-600'
    : record.processing_status === 'failed' 
    ? 'text-red-600'
    : 'text-yellow-600'

  return (
    <div className="delivery-record-item p-3 border border-gray-200 rounded-lg bg-white" style={{ minHeight: '60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: '1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="font-medium text-gray-900">
              {record.supplier_name || 'Unknown Supplier'}
            </span>
            {record.docket_number && (
              <span className="text-sm text-gray-600">#{record.docket_number}</span>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span className="text-sm text-gray-500">
              {new Date(record.created_at).toLocaleDateString()}
            </span>
            
            {hasTemperatures && (
              <span className="text-sm text-gray-600">
                {record.temperature_readings.length} temp reading{record.temperature_readings.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {record.processing_status === 'completed' && (
            <span className={`text-sm font-medium ${statusColor}`}>
              {isCompliant ? 'Compliant' : 'Violation'}
            </span>
          )}
          
          {record.processing_status === 'processing' && (
            <span className="text-sm text-yellow-600">Processing...</span>
          )}
          
          {record.processing_status === 'failed' && (
            <span className="text-sm text-red-600">Failed</span>
          )}
        </div>
      </div>
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