// Delivery Tracking Module - Main Export File
// Centralized exports for the Delivery Tracking Module

// Components
export { default as DeliveryTracker } from './components/DeliveryTracker'

// Types
export type {
  DeliveryEvent,
  SupplierPerformance,
  DeliveryTrackerProps,
  DeliveryStats,
  EventType,
  RiskLevel,
  TrendDirection
} from './types'

// Hooks
export { useDeliveryTracking } from './hooks/useDeliveryTracking'

// Utilities
export {
  getEventIcon,
  getEventColor,
  getRiskColor,
  calculateRiskLevel,
  updateSupplierPerformance,
  createMockEvent,
  formatEventTime,
  formatEventType
} from './utils/deliveryHelpers'

// Module Information
export const MODULE_INFO = {
  name: 'DeliveryTrackingModule',
  version: '1.0.0',
  description: 'Real-time delivery tracking with supplier performance monitoring',
  author: 'JiGR Hospitality Compliance System',
  dependencies: [
    'react',
    '@/lib/design-system'
  ],
  features: [
    'Real-time delivery event tracking',
    'Supplier performance monitoring',
    'Temperature compliance tracking',
    'Risk assessment and alerts',
    'Manual event entry',
    'Auto-tracking simulation',
    'Performance analytics'
  ]
}