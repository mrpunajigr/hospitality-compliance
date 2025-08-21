// Delivery Tracking Module - Type Definitions
// Extracted from DeliveryTracker component for modular use

export interface DeliveryEvent {
  id: string
  timestamp: string
  type: 'arrival' | 'temperature_check' | 'compliance_verified' | 'violation_detected' | 'accepted' | 'rejected'
  supplierName: string
  temperature?: number
  isCompliant?: boolean
  notes?: string
  userId: string
}

export interface SupplierPerformance {
  name: string
  todayDeliveries: number
  todayCompliance: number
  avgTemperature: number
  lastDeliveryTime?: string
  trend: 'improving' | 'declining' | 'stable'
  riskLevel: 'low' | 'medium' | 'high'
}

export interface DeliveryTrackerProps {
  clientId: string
  userId: string
  onDeliveryEvent?: (event: DeliveryEvent) => void
  autoTracking?: boolean
  maxEvents?: number
  updateInterval?: number
}

export interface DeliveryStats {
  totalDeliveries: number
  complianceRate: number
  averageTemperature: number
  violationCount: number
  topSuppliers: SupplierPerformance[]
}

export type EventType = DeliveryEvent['type']
export type RiskLevel = SupplierPerformance['riskLevel']
export type TrendDirection = SupplierPerformance['trend']