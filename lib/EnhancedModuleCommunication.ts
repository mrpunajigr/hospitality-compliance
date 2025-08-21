/**
 * Enhanced Module Communication System - JiGR Suite
 * Advanced event-driven communication with publish/subscribe patterns and intelligent routing
 * 
 * SAFETY: This creates NEW enhanced communication layer - ZERO RISK to existing code
 */

import { EventEmitter } from 'events'
import { moduleRegistry } from './ModuleRegistry'
import type { BaseJiGRModule } from './BaseJiGRModule'

// =============================================================================
// ENHANCED EVENT TYPES
// =============================================================================

export interface EnhancedModuleEvent {
  id: string
  type: string
  source: string
  target?: string | string[] | 'broadcast'
  data?: any
  timestamp: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
  tags?: string[]
  
  // Event Flow Control
  propagationStopped?: boolean
  requiresAcknowledgment?: boolean
  expiresAt?: Date
  
  // Event Metadata
  correlationId?: string
  traceId?: string
  userId?: string
  clientId?: string
}

export interface EventSubscription {
  id: string
  subscriberId: string
  eventType: string
  filter?: EventFilter
  handler: (event: EnhancedModuleEvent) => Promise<void> | void
  priority: number
  isActive: boolean
  createdAt: Date
}

export interface EventFilter {
  tags?: string[]
  sourceModules?: string[]
  dataFilters?: Record<string, any>
  customFilter?: (event: EnhancedModuleEvent) => boolean
}

export interface EventMetrics {
  totalEvents: number
  eventsByType: Record<string, number>
  eventsBySource: Record<string, number>
  eventsByPriority: Record<string, number>
  averageProcessingTime: number
  failedEvents: number
  queuedEvents: number
  lastEventTime?: Date
}

// =============================================================================
// STANDARDIZED EVENT SCHEMAS
// =============================================================================

export namespace EventSchemas {
  // Authentication Events
  export interface UserAuthenticatedEvent {
    userId: string
    email: string
    clientId?: string
    role: string
    sessionId: string
  }
  
  export interface UserSignedOutEvent {
    userId: string
    sessionId: string
  }
  
  export interface AuthenticationFailedEvent {
    email: string
    reason: string
    ipAddress: string
  }

  // Database Events
  export interface RecordCreatedEvent {
    table: string
    recordId: string
    data: any
    userId?: string
    clientId?: string
  }
  
  export interface RecordUpdatedEvent {
    table: string
    recordId: string
    changes: any
    previousData: any
    userId?: string
    clientId?: string
  }
  
  export interface RecordDeletedEvent {
    table: string
    recordId: string
    data: any
    userId?: string
    clientId?: string
  }

  // Design System Events
  export interface ThemeChangedEvent {
    theme: 'light' | 'dark'
    userId: string
    clientId?: string
  }
  
  export interface StyleUpdatedEvent {
    component: string
    styles: any
    affectedModules: string[]
  }

  // Compliance & Analytics Events
  export interface ViolationDetectedEvent {
    violationId: string
    type: 'temperature' | 'documentation' | 'timing'
    severity: 'low' | 'medium' | 'high' | 'critical'
    deliveryRecordId: string
    supplierId: string
    clientId: string
    details: any
  }
  
  export interface ComplianceMetricsUpdatedEvent {
    clientId: string
    metrics: {
      complianceRate: number
      violationCount: number
      avgTemperature: number
      riskScore: number
    }
    timeframe: string
  }
  
  export interface ReportGeneratedEvent {
    reportId: string
    type: string
    format: string
    clientId: string
    userId: string
    downloadUrl: string
  }

  // Temperature & Delivery Events
  export interface TemperatureReadingEvent {
    deliveryRecordId: string
    temperature: number
    isCompliant: boolean
    productType: string
    supplierId: string
    clientId: string
    timestamp: Date
  }
  
  export interface DeliveryProcessedEvent {
    deliveryRecordId: string
    supplierId: string
    clientId: string
    processingResults: any
    aiAnalysis?: any
    complianceStatus: 'compliant' | 'violation' | 'warning'
  }

  // System Events
  export interface ModuleStatusChangedEvent {
    moduleId: string
    status: 'loading' | 'active' | 'inactive' | 'error'
    previousStatus: string
    details?: any
  }
  
  export interface SystemHealthEvent {
    status: 'healthy' | 'degraded' | 'unhealthy'
    modules: Record<string, string>
    metrics: any
  }
}

// =============================================================================
// ENHANCED COMMUNICATION ENGINE
// =============================================================================

export class EnhancedModuleCommunication extends EventEmitter {
  private subscriptions: Map<string, EventSubscription[]> = new Map()
  private eventQueue: EnhancedModuleEvent[] = []
  private metrics: EventMetrics = {
    totalEvents: 0,
    eventsByType: {},
    eventsBySource: {},
    eventsByPriority: {},
    averageProcessingTime: 0,
    failedEvents: 0,
    queuedEvents: 0
  }
  
  private isProcessing = false
  private batchSize = 10
  private processingInterval = 100 // ms
  private maxQueueSize = 1000
  
  constructor() {
    super()
    this.setMaxListeners(100) // Allow many module subscriptions
    this.startEventProcessor()
  }

  // =============================================================================
  // PUBLISH/SUBSCRIBE SYSTEM
  // =============================================================================

  /**
   * Subscribe to events with advanced filtering
   */
  subscribe(
    subscriberId: string,
    eventType: string,
    handler: (event: EnhancedModuleEvent) => Promise<void> | void,
    options: {
      filter?: EventFilter
      priority?: number
    } = {}
  ): string {
    const subscriptionId = `${subscriberId}_${eventType}_${Date.now()}`
    
    const subscription: EventSubscription = {
      id: subscriptionId,
      subscriberId,
      eventType,
      filter: options.filter,
      handler,
      priority: options.priority || 0,
      isActive: true,
      createdAt: new Date()
    }
    
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, [])
    }
    
    const eventSubscriptions = this.subscriptions.get(eventType)!
    eventSubscriptions.push(subscription)
    
    // Sort by priority (higher number = higher priority)
    eventSubscriptions.sort((a, b) => b.priority - a.priority)
    
    console.log(`📡 Module ${subscriberId} subscribed to ${eventType}`)
    return subscriptionId
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): boolean {
    for (const [eventType, subscriptions] of this.subscriptions.entries()) {
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId)
      if (index !== -1) {
        const subscription = subscriptions[index]
        subscriptions.splice(index, 1)
        console.log(`📡 Module ${subscription.subscriberId} unsubscribed from ${eventType}`)
        return true
      }
    }
    return false
  }

  /**
   * Publish event to the system
   */
  async publish(event: Omit<EnhancedModuleEvent, 'id' | 'timestamp'>): Promise<void> {
    const enhancedEvent: EnhancedModuleEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      traceId: event.traceId || `trace_${Date.now()}`
    }

    // Update metrics
    this.updateEventMetrics(enhancedEvent)

    // Add to queue
    if (this.eventQueue.length >= this.maxQueueSize) {
      console.warn('⚠️ Event queue full, dropping oldest event')
      this.eventQueue.shift()
    }
    
    this.eventQueue.push(enhancedEvent)
    
    // Process immediately if critical priority
    if (enhancedEvent.priority === 'critical') {
      await this.processEvent(enhancedEvent)
    }

    console.log(`📤 Event published: ${enhancedEvent.type} from ${enhancedEvent.source}`)
  }

  /**
   * Publish standardized events with type safety
   */
  async publishUserAuthenticated(data: EventSchemas.UserAuthenticatedEvent, source: string) {
    await this.publish({
      type: 'user:authenticated',
      source,
      data,
      priority: 'medium',
      tags: ['auth', 'user']
    })
  }

  async publishViolationDetected(data: EventSchemas.ViolationDetectedEvent, source: string) {
    await this.publish({
      type: 'compliance:violation-detected',
      source,
      data,
      priority: 'high',
      tags: ['compliance', 'violation', data.type]
    })
  }

  async publishTemperatureReading(data: EventSchemas.TemperatureReadingEvent, source: string) {
    await this.publish({
      type: 'delivery:temperature-reading',
      source,
      data,
      priority: data.isCompliant ? 'low' : 'high',
      tags: ['temperature', 'delivery', data.isCompliant ? 'compliant' : 'violation']
    })
  }

  async publishReportGenerated(data: EventSchemas.ReportGeneratedEvent, source: string) {
    await this.publish({
      type: 'reporting:report-generated',
      source,
      data,
      priority: 'medium',
      tags: ['reporting', data.type, data.format]
    })
  }

  async publishComplianceMetricsUpdated(data: EventSchemas.ComplianceMetricsUpdatedEvent, source: string) {
    await this.publish({
      type: 'analytics:compliance-metrics-updated',
      source,
      data,
      priority: 'medium',
      tags: ['analytics', 'metrics', 'compliance']
    })
  }

  // =============================================================================
  // EVENT PROCESSING ENGINE
  // =============================================================================

  private startEventProcessor(): void {
    setInterval(async () => {
      if (this.isProcessing || this.eventQueue.length === 0) {
        return
      }

      this.isProcessing = true
      
      try {
        // Process events in batches
        const batch = this.eventQueue.splice(0, this.batchSize)
        
        for (const event of batch) {
          await this.processEvent(event)
        }
        
        this.metrics.queuedEvents = this.eventQueue.length
        
      } catch (error) {
        console.error('❌ Event processing error:', error)
      } finally {
        this.isProcessing = false
      }
    }, this.processingInterval)
  }

  private async processEvent(event: EnhancedModuleEvent): Promise<void> {
    const startTime = Date.now()
    
    try {
      // Get subscriptions for this event type
      const subscriptions = this.subscriptions.get(event.type) || []
      
      // Process subscriptions in parallel for better performance
      const promises = subscriptions
        .filter(sub => sub.isActive && this.matchesFilter(event, sub.filter))
        .map(async (subscription) => {
          try {
            await subscription.handler(event)
          } catch (error) {
            console.error(`❌ Event handler error for ${subscription.subscriberId}:`, error)
            this.metrics.failedEvents++
          }
        })

      await Promise.all(promises)
      
      // Update processing time metrics
      const processingTime = Date.now() - startTime
      this.updateProcessingMetrics(processingTime)
      
      // Emit to EventEmitter for legacy compatibility
      this.emit('event-processed', event)
      
    } catch (error) {
      console.error('❌ Event processing failed:', error)
      this.metrics.failedEvents++
    }
  }

  private matchesFilter(event: EnhancedModuleEvent, filter?: EventFilter): boolean {
    if (!filter) return true

    // Check tag filters
    if (filter.tags && filter.tags.length > 0) {
      const eventTags = event.tags || []
      if (!filter.tags.some(tag => eventTags.includes(tag))) {
        return false
      }
    }

    // Check source module filters
    if (filter.sourceModules && filter.sourceModules.length > 0) {
      if (!filter.sourceModules.includes(event.source)) {
        return false
      }
    }

    // Check data filters
    if (filter.dataFilters && event.data) {
      for (const [key, value] of Object.entries(filter.dataFilters)) {
        if (event.data[key] !== value) {
          return false
        }
      }
    }

    // Check custom filter
    if (filter.customFilter) {
      return filter.customFilter(event)
    }

    return true
  }

  // =============================================================================
  // METRICS AND MONITORING
  // =============================================================================

  private updateEventMetrics(event: EnhancedModuleEvent): void {
    this.metrics.totalEvents++
    this.metrics.eventsByType[event.type] = (this.metrics.eventsByType[event.type] || 0) + 1
    this.metrics.eventsBySource[event.source] = (this.metrics.eventsBySource[event.source] || 0) + 1
    this.metrics.eventsByPriority[event.priority] = (this.metrics.eventsByPriority[event.priority] || 0) + 1
    this.metrics.lastEventTime = event.timestamp
  }

  private updateProcessingMetrics(processingTime: number): void {
    // Calculate rolling average processing time
    const currentAverage = this.metrics.averageProcessingTime
    const totalProcessed = this.metrics.totalEvents - this.metrics.failedEvents
    
    if (totalProcessed === 1) {
      this.metrics.averageProcessingTime = processingTime
    } else {
      this.metrics.averageProcessingTime = (currentAverage * (totalProcessed - 1) + processingTime) / totalProcessed
    }
  }

  /**
   * Get system metrics
   */
  getMetrics(): EventMetrics {
    return { ...this.metrics, queuedEvents: this.eventQueue.length }
  }

  /**
   * Get active subscriptions
   */
  getActiveSubscriptions(): Record<string, EventSubscription[]> {
    const result: Record<string, EventSubscription[]> = {}
    
    for (const [eventType, subscriptions] of this.subscriptions.entries()) {
      result[eventType] = subscriptions.filter(sub => sub.isActive)
    }
    
    return result
  }

  /**
   * Clear all subscriptions and reset metrics
   */
  reset(): void {
    this.subscriptions.clear()
    this.eventQueue = []
    this.metrics = {
      totalEvents: 0,
      eventsByType: {},
      eventsBySource: {},
      eventsByPriority: {},
      averageProcessingTime: 0,
      failedEvents: 0,
      queuedEvents: 0
    }
  }

  // =============================================================================
  // MODULE INTEGRATION HELPERS
  // =============================================================================

  /**
   * Connect a module to the communication system
   */
  connectModule(module: BaseJiGRModule): void {
    const moduleId = module.manifest.name
    
    // Subscribe module to system events
    this.subscribe(moduleId, 'system:*', async (event) => {
      if (module.isActive && typeof module.handleSystemEvent === 'function') {
        await module.handleSystemEvent(event)
      }
    })
    
    // Allow module to publish events
    const publishEvent = async (eventData: Omit<EnhancedModuleEvent, 'id' | 'timestamp' | 'source'>) => {
      await this.publish({
        ...eventData,
        source: moduleId
      })
    }
    
    // Add communication capabilities to module
    ;(module as any)._communicationSystem = {
      publish: publishEvent,
      subscribe: (eventType: string, handler: any, options?: any) => 
        this.subscribe(moduleId, eventType, handler, options),
      unsubscribe: (subscriptionId: string) => this.unsubscribe(subscriptionId)
    }
    
    console.log(`🔌 Module ${moduleId} connected to communication system`)
  }

  /**
   * Disconnect a module from the communication system
   */
  disconnectModule(module: BaseJiGRModule): void {
    const moduleId = module.manifest.name
    
    // Remove all subscriptions for this module
    for (const [eventType, subscriptions] of this.subscriptions.entries()) {
      const filtered = subscriptions.filter(sub => sub.subscriberId !== moduleId)
      if (filtered.length !== subscriptions.length) {
        this.subscriptions.set(eventType, filtered)
      }
    }
    
    // Remove communication capabilities
    delete (module as any)._communicationSystem
    
    console.log(`🔌 Module ${moduleId} disconnected from communication system`)
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let communicationSystemInstance: EnhancedModuleCommunication | null = null

export const getEnhancedCommunicationSystem = (): EnhancedModuleCommunication => {
  if (!communicationSystemInstance) {
    communicationSystemInstance = new EnhancedModuleCommunication()
  }
  
  return communicationSystemInstance
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Initialize communication system and connect all loaded modules
 */
export const initializeModuleCommunication = async (): Promise<EnhancedModuleCommunication> => {
  const communicationSystem = getEnhancedCommunicationSystem()
  // Use the imported moduleRegistry instance
  
  // Connect all currently loaded modules
  const loadedModules = moduleRegistry.getLoadedModules()
  for (const [moduleId, moduleInstance] of loadedModules.entries()) {
    communicationSystem.connectModule(moduleInstance)
  }
  
  // Listen for new modules being loaded
  moduleRegistry.on('module-loaded', ({ moduleId, module }) => {
    communicationSystem.connectModule(module)
  })
  
  // Listen for modules being unloaded
  moduleRegistry.on('module-unloaded', ({ moduleId, module }) => {
    communicationSystem.disconnectModule(module)
  })
  
  console.log('🚀 Enhanced Module Communication System initialized')
  return communicationSystem
}

export default EnhancedModuleCommunication