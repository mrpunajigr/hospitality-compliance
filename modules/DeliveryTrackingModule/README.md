# 📦 Delivery Tracking Module

A comprehensive real-time delivery tracking system with supplier performance monitoring for hospitality compliance management.

## 🚀 Features

- **Real-time Event Tracking**: Monitor delivery events as they happen
- **Supplier Performance Analytics**: Track compliance rates, temperature averages, and risk levels
- **Temperature Compliance**: Monitor cold chain compliance with configurable thresholds
- **Manual Event Entry**: Add delivery events manually when needed
- **Risk Assessment**: Automatic risk level calculation based on performance metrics
- **Auto-simulation**: Built-in mock data generation for testing and demos

## 📋 Components

### DeliveryTracker
Main component providing full delivery tracking interface.

```tsx
import { DeliveryTracker } from '@/modules/DeliveryTrackingModule'

<DeliveryTracker 
  clientId="client-123"
  userId="user-456"
  onDeliveryEvent={(event) => console.log(event)}
  autoTracking={false}
  maxEvents={20}
  updateInterval={3000}
/>
```

## 🔧 Hooks

### useDeliveryTracking
React hook for delivery tracking functionality.

```tsx
import { useDeliveryTracking } from '@/modules/DeliveryTrackingModule'

const {
  recentEvents,
  supplierPerformance,
  isTracking,
  startTracking,
  stopTracking,
  addManualEvent
} = useDeliveryTracking({
  userId: 'user-123',
  autoTracking: true,
  maxEvents: 50
})
```

## 📊 Types

### DeliveryEvent
```typescript
interface DeliveryEvent {
  id: string
  timestamp: string
  type: 'arrival' | 'temperature_check' | 'compliance_verified' | 'violation_detected' | 'accepted' | 'rejected'
  supplierName: string
  temperature?: number
  isCompliant?: boolean
  notes?: string
  userId: string
}
```

### SupplierPerformance
```typescript
interface SupplierPerformance {
  name: string
  todayDeliveries: number
  todayCompliance: number
  avgTemperature: number
  lastDeliveryTime?: string
  trend: 'improving' | 'declining' | 'stable'
  riskLevel: 'low' | 'medium' | 'high'
}
```

## 🛠 Utilities

### Event Helpers
- `getEventIcon(type)` - Returns emoji icon for event type
- `getEventColor(type)` - Returns CSS classes for event styling
- `getRiskColor(level)` - Returns CSS classes for risk level styling
- `formatEventTime(timestamp)` - Formats timestamp for display
- `formatEventType(type)` - Formats event type for display

### Performance Helpers
- `calculateRiskLevel(compliance, temperature)` - Calculates supplier risk level
- `updateSupplierPerformance(performance, event)` - Updates supplier metrics
- `createMockEvent(userId, suppliers)` - Creates mock delivery events

## 📦 Installation & Usage

1. **Import the module**:
```tsx
import { DeliveryTracker, useDeliveryTracking } from '@/modules/DeliveryTrackingModule'
```

2. **Use in your component**:
```tsx
function Dashboard() {
  return (
    <DeliveryTracker 
      clientId="your-client-id"
      userId="your-user-id"
      onDeliveryEvent={(event) => {
        // Handle delivery events
        console.log('New delivery event:', event)
      }}
    />
  )
}
```

## 🔗 Dependencies

- **React**: useState, useEffect, useCallback hooks
- **Design System**: getCardStyle, getTextStyle utilities
- **TypeScript**: Full type safety

## 📝 Configuration

### Props
- `clientId`: Client identifier for multi-tenant support
- `userId`: User identifier for event tracking
- `onDeliveryEvent`: Callback for delivery event handling
- `autoTracking`: Enable automatic event simulation (default: false)
- `maxEvents`: Maximum events to keep in memory (default: 20)
- `updateInterval`: Auto-tracking interval in ms (default: 3000)

### Customization
- Event types can be extended in `types/index.ts`
- Styling can be customized through design system utilities
- Mock data suppliers can be configured in `utils/deliveryHelpers.ts`

## 🎯 Use Cases

1. **Real-time Monitoring**: Track deliveries as they arrive
2. **Compliance Reporting**: Monitor temperature compliance rates
3. **Supplier Assessment**: Evaluate supplier performance metrics
4. **Risk Management**: Identify high-risk suppliers and deliveries
5. **Historical Analysis**: Review delivery patterns and trends

## 🔄 Integration

This module can be easily integrated into any JiGR hospitality compliance system:

```tsx
// In your dashboard
import { DeliveryTracker } from '@/modules/DeliveryTrackingModule'

// In your analytics page
import { useDeliveryTracking } from '@/modules/DeliveryTrackingModule'

// In your API routes
import { DeliveryEvent, SupplierPerformance } from '@/modules/DeliveryTrackingModule'
```

## 📈 Performance

- Lightweight React hooks-based architecture
- Efficient state management with minimal re-renders
- Configurable event limits to manage memory usage
- Optimized supplier performance calculations

## 🛡 Security

- All events include user tracking for audit trails
- Supplier data is client-scoped for multi-tenant security
- No sensitive data stored in component state
- Event validation and sanitization built-in

---

**Module Version**: 1.0.0  
**Last Updated**: August 2025  
**Compatibility**: React 18+, TypeScript 4.5+