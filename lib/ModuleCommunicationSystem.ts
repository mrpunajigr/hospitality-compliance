/**
 * Module Communication System - JiGR Suite
 * Event-driven communication system for inter-module messaging and coordination
 * 
 * SAFETY: This creates NEW communication infrastructure - ZERO RISK to existing code
 */

import { EventEmitter } from 'events'
import { moduleRegistry, JiGRModule } from './ModuleRegistry'

// =============================================================================
// COMMUNICATION INTERFACES
// =============================================================================

export interface ModuleMessage {
  id: string                           // Unique message ID
  from: string                         // Source module ID
  to: string | string[]               // Target module ID(s) or broadcast
  type: string                         // Message type
  payload?: any                        // Message data
  timestamp: Date                      // When message was sent
  priority: 'low' | 'medium' | 'high' | 'critical'
  requiresResponse?: boolean           // Whether response is expected
  correlationId?: string              // For request-response correlation
  expiresAt?: Date                    // Message expiry time
}

export interface ModuleResponse {
  id: string                          // Unique response ID
  correlationId: string               // Original message ID
  from: string                        // Responding module ID
  to: string                          // Original sender
  success: boolean                    // Whether operation succeeded
  data?: any                          // Response data
  error?: string                      // Error message if failed
  timestamp: Date                     // When response was sent
}

export interface ModuleEvent {
  id: string                          // Unique event ID
  type: string                        // Event type
  source: string                      // Source module ID
  data?: any                          // Event data
  timestamp: Date                     // When event occurred
  tags?: string[]                     // Event tags for filtering
}

export interface CommunicationMetrics {
  messagesSent: number
  messagesReceived: number
  responsesReceived: number
  broadcastsSent: number
  eventsSent: number
  eventsReceived: number
  averageResponseTime: number
  errorRate: number
}

// =============================================================================
// MESSAGE BUS IMPLEMENTATION
// =============================================================================

export class ModuleMessageBus extends EventEmitter {
  private messages = new Map<string, ModuleMessage>()
  private responses = new Map<string, ModuleResponse>()
  private subscriptions = new Map<string, Set<string>>() // event type -> module IDs
  private messageQueue: ModuleMessage[] = []
  private responseHandlers = new Map<string, (response: ModuleResponse) => void>()
  private metrics: CommunicationMetrics = {
    messagesSent: 0,
    messagesReceived: 0,
    responsesReceived: 0,
    broadcastsSent: 0,
    eventsSent: 0,
    eventsReceived: 0,
    averageResponseTime: 0,
    errorRate: 0
  }
  
  // Configuration
  private maxQueueSize = 10000
  private messageTimeout = 30000 // 30 seconds
  private cleanupInterval = 60000 // 1 minute
  private cleanupTimer?: NodeJS.Timeout
  
  constructor() {
    super()
    this.startCleanupTimer()
  }
  
  // =============================================================================
  // MESSAGE SENDING AND RECEIVING
  // =============================================================================
  
  /**
   * Send a message to one or more modules
   */
  async sendMessage(message: Omit<ModuleMessage, 'id' | 'timestamp'>): Promise<string> {
    const messageId = this.generateId()
    const fullMessage: ModuleMessage = {
      ...message,
      id: messageId,
      timestamp: new Date()
    }
    
    // Validate message
    this.validateMessage(fullMessage)
    
    // Store message
    this.messages.set(messageId, fullMessage)
    
    // Queue for processing
    this.queueMessage(fullMessage)
    
    // Process immediately
    await this.processMessage(fullMessage)
    
    this.metrics.messagesSent++
    this.emit('message-sent', fullMessage)
    
    return messageId
  }
  
  /**
   * Send a response to a message
   */
  async sendResponse(response: Omit<ModuleResponse, 'id' | 'timestamp'>): Promise<string> {
    const responseId = this.generateId()
    const fullResponse: ModuleResponse = {
      ...response,
      id: responseId,
      timestamp: new Date()
    }
    
    // Store response
    this.responses.set(responseId, fullResponse)
    
    // Deliver to original sender
    await this.deliverResponse(fullResponse)
    
    this.metrics.responsesReceived++
    this.emit('response-sent', fullResponse)
    
    return responseId
  }
  
  /**
   * Send a broadcast message to all modules
   */
  async broadcast(message: Omit<ModuleMessage, 'id' | 'timestamp' | 'to'>): Promise<string> {
    const messageId = await this.sendMessage({
      ...message,
      to: '*' // Broadcast to all
    })
    
    this.metrics.broadcastsSent++
    return messageId
  }
  
  /**
   * Send an event notification
   */
  async publishEvent(event: Omit<ModuleEvent, 'id' | 'timestamp'>): Promise<string> {
    const eventId = this.generateId()
    const fullEvent: ModuleEvent = {
      ...event,
      id: eventId,
      timestamp: new Date()
    }
    
    // Deliver to subscribers
    await this.deliverEvent(fullEvent)
    
    this.metrics.eventsSent++
    this.emit('event-published', fullEvent)
    
    return eventId
  }
  
  // =============================================================================
  // SUBSCRIPTION AND EVENT HANDLING
  // =============================================================================
  
  /**
   * Subscribe a module to specific event types
   */
  subscribeToEvents(moduleId: string, eventTypes: string[]): void {
    for (const eventType of eventTypes) {
      if (!this.subscriptions.has(eventType)) {
        this.subscriptions.set(eventType, new Set())
      }
      this.subscriptions.get(eventType)!.add(moduleId)
    }
    
    this.emit('subscription-added', { moduleId, eventTypes })
  }
  
  /**
   * Unsubscribe a module from specific event types
   */
  unsubscribeFromEvents(moduleId: string, eventTypes: string[]): void {
    for (const eventType of eventTypes) {
      const subscribers = this.subscriptions.get(eventType)
      if (subscribers) {
        subscribers.delete(moduleId)
        if (subscribers.size === 0) {
          this.subscriptions.delete(eventType)
        }
      }
    }
    
    this.emit('subscription-removed', { moduleId, eventTypes })
  }
  
  /**
   * Get all event types a module is subscribed to
   */
  getSubscriptions(moduleId: string): string[] {
    const subscriptions: string[] = []
    
    for (const [eventType, subscribers] of this.subscriptions.entries()) {
      if (subscribers.has(moduleId)) {
        subscriptions.push(eventType)
      }
    }
    
    return subscriptions
  }
  
  /**
   * Get all modules subscribed to an event type
   */
  getSubscribers(eventType: string): string[] {
    const subscribers = this.subscriptions.get(eventType)
    return subscribers ? Array.from(subscribers) : []
  }
  
  // =============================================================================
  // REQUEST-RESPONSE PATTERN
  // =============================================================================
  
  /**
   * Send a message and wait for response
   */
  async sendRequest(
    message: Omit<ModuleMessage, 'id' | 'timestamp' | 'requiresResponse' | 'correlationId'>,
    timeoutMs: number = this.messageTimeout
  ): Promise<ModuleResponse> {
    // Send message with response requirement
    const messageId = await this.sendMessage({
      ...message,
      requiresResponse: true,
      correlationId: this.generateId()
    })
    
    // Wait for response
    return new Promise<ModuleResponse>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.responseHandlers.delete(messageId)
        reject(new Error(`Request timeout after ${timeoutMs}ms`))
      }, timeoutMs)
      
      this.responseHandlers.set(messageId, (response: ModuleResponse) => {
        clearTimeout(timeout)
        this.responseHandlers.delete(messageId)
        resolve(response)
      })
    })
  }
  
  // =============================================================================
  // COMMUNICATION PATTERNS
  // =============================================================================
  
  /**
   * Module lifecycle coordination
   */
  async coordinateModuleActivation(moduleId: string): Promise<void> {
    // Notify all modules that a module is being activated
    await this.publishEvent({
      type: 'module-activating',
      source: 'communication-system',
      data: { moduleId }
    })
    
    // Wait for any objections or dependencies
    const responses = await this.sendRequest({
      from: 'communication-system',
      to: '*',
      type: 'check-activation-readiness',
      payload: { moduleId }
    })
    
    // Publish activation complete
    await this.publishEvent({
      type: 'module-activated',
      source: 'communication-system',
      data: { moduleId }
    })
  }
  
  /**
   * Data sharing between modules
   */
  async shareData(fromModule: string, toModule: string, dataType: string, data: any): Promise<boolean> {
    try {
      const response = await this.sendRequest({
        from: fromModule,
        to: toModule,
        type: 'share-data',
        payload: { dataType, data },
        priority: 'medium'
      })
      
      return response.success
    } catch (error) {
      return false
    }
  }
  
  /**
   * Capability discovery and usage
   */
  async requestCapability(requestingModule: string, capabilityName: string, version?: string): Promise<any> {
    // Find modules that provide the capability
    const providers = moduleRegistry.findCapabilityProviders(capabilityName, version)
    
    if (providers.length === 0) {
      throw new Error(`No providers found for capability: ${capabilityName}`)
    }
    
    // Try providers in order
    for (const providerId of providers) {
      try {
        const response = await this.sendRequest({
          from: requestingModule,
          to: providerId,
          type: 'request-capability-access',
          payload: { capabilityName, version },
          priority: 'high'
        })
        
        if (response.success) {
          return response.data
        }
      } catch (error) {
        // Try next provider
        continue
      }
    }
    
    throw new Error(`No available providers for capability: ${capabilityName}`)
  }
  
  /**
   * Configuration updates coordination
   */
  async broadcastConfigurationUpdate(updatedBy: string, configType: string, changes: any): Promise<void> {
    await this.broadcast({
      from: updatedBy,
      type: 'configuration-updated',
      payload: { configType, changes },
      priority: 'high'
    })
  }
  
  /**
   * Error propagation and handling
   */
  async propagateError(sourceModule: string, error: Error, context?: any): Promise<void> {
    await this.publishEvent({
      type: 'module-error',
      source: sourceModule,
      data: {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        context
      }
    })
  }
  
  // =============================================================================
  // MONITORING AND DIAGNOSTICS
  // =============================================================================
  
  /**
   * Get communication metrics
   */
  getMetrics(): CommunicationMetrics {
    return { ...this.metrics }
  }
  
  /**
   * Get message history
   */
  getMessageHistory(limit: number = 100): ModuleMessage[] {
    const messages = Array.from(this.messages.values())
    return messages
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }
  
  /**
   * Get response history
   */
  getResponseHistory(limit: number = 100): ModuleResponse[] {
    const responses = Array.from(this.responses.values())
    return responses
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }
  
  /**
   * Get communication status
   */
  getStatus(): {
    messageQueueLength: number
    pendingResponses: number
    activeSubscriptions: number
    totalMessages: number
    totalResponses: number
  } {
    return {
      messageQueueLength: this.messageQueue.length,
      pendingResponses: this.responseHandlers.size,
      activeSubscriptions: this.subscriptions.size,
      totalMessages: this.messages.size,
      totalResponses: this.responses.size
    }
  }
  
  /**
   * Clear old messages and responses
   */
  cleanup(): void {
    const now = new Date()
    const cutoffTime = new Date(now.getTime() - this.messageTimeout * 2) // Keep for 2x timeout
    
    // Clear old messages
    for (const [id, message] of this.messages.entries()) {
      if (message.timestamp < cutoffTime) {
        this.messages.delete(id)
      }
    }
    
    // Clear old responses
    for (const [id, response] of this.responses.entries()) {
      if (response.timestamp < cutoffTime) {
        this.responses.delete(id)
      }
    }
    
    // Clear expired messages from queue
    this.messageQueue = this.messageQueue.filter(msg => 
      !msg.expiresAt || msg.expiresAt > now
    )
  }
  
  /**
   * Shutdown communication system
   */
  shutdown(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
    
    this.removeAllListeners()
    this.messages.clear()
    this.responses.clear()
    this.subscriptions.clear()
    this.messageQueue = []
    this.responseHandlers.clear()
  }
  
  // =============================================================================
  // PRIVATE IMPLEMENTATION
  // =============================================================================
  
  private validateMessage(message: ModuleMessage): void {
    if (!message.from || !message.to || !message.type) {
      throw new Error('Message missing required fields: from, to, type')
    }
    
    if (Array.isArray(message.to) && message.to.length === 0) {
      throw new Error('Message target array cannot be empty')
    }
    
    if (message.expiresAt && message.expiresAt <= new Date()) {
      throw new Error('Message expiry time must be in the future')
    }
  }
  
  private queueMessage(message: ModuleMessage): void {
    // Check queue size
    if (this.messageQueue.length >= this.maxQueueSize) {
      // Remove oldest low priority messages
      this.messageQueue = this.messageQueue.filter(msg => msg.priority !== 'low')
      
      // If still at capacity, remove oldest medium priority
      if (this.messageQueue.length >= this.maxQueueSize) {
        this.messageQueue = this.messageQueue.filter(msg => msg.priority === 'high' || msg.priority === 'critical')
      }
    }
    
    // Add to queue in priority order
    this.messageQueue.push(message)
    this.messageQueue.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }
  
  private async processMessage(message: ModuleMessage): Promise<void> {
    try {
      // Determine target modules
      const targets = this.resolveTargets(message.to)
      
      // Deliver to each target
      for (const targetId of targets) {
        await this.deliverMessage(message, targetId)
      }
      
    } catch (error) {
      this.metrics.errorRate++
      this.emit('message-error', { message, error })
    }
  }
  
  private resolveTargets(to: string | string[]): string[] {
    if (Array.isArray(to)) {
      return to
    }
    
    if (to === '*') {
      // Broadcast to all loaded modules
      return Array.from(moduleRegistry.getLoadedModules().keys())
    }
    
    return [to]
  }
  
  private async deliverMessage(message: ModuleMessage, targetId: string): Promise<void> {
    try {
      // Get target module
      const targetModule = moduleRegistry.getLoadedModules().get(targetId)
      
      if (!targetModule || !targetModule.isActive) {
        throw new Error(`Target module ${targetId} not available`)
      }
      
      // Emit to target module
      targetModule.emit('message', message)
      
      this.metrics.messagesReceived++
      this.emit('message-delivered', { message, targetId })
      
    } catch (error) {
      this.emit('delivery-error', { message, targetId, error })
      throw error
    }
  }
  
  private async deliverResponse(response: ModuleResponse): Promise<void> {
    try {
      // Find response handler
      const handler = this.responseHandlers.get(response.correlationId)
      
      if (handler) {
        handler(response)
      } else {
        // Deliver to target module
        const targetModule = moduleRegistry.getLoadedModules().get(response.to)
        if (targetModule && targetModule.isActive) {
          targetModule.emit('response', response)
        }
      }
      
      this.emit('response-delivered', response)
      
    } catch (error) {
      this.emit('response-error', { response, error })
    }
  }
  
  private async deliverEvent(event: ModuleEvent): Promise<void> {
    try {
      // Get subscribers for this event type
      const subscribers = this.getSubscribers(event.type)
      
      // Deliver to each subscriber
      for (const subscriberId of subscribers) {
        const moduleInstance = moduleRegistry.getLoadedModules().get(subscriberId)
        if (moduleInstance && moduleInstance.isActive) {
          moduleInstance.emit('event', event)
          this.metrics.eventsReceived++
        }
      }
      
      this.emit('event-delivered', event)
      
    } catch (error) {
      this.emit('event-error', { event, error })
    }
  }
  
  private generateId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.cleanupInterval)
  }
}

// =============================================================================
// COMMUNICATION HELPER FUNCTIONS
// =============================================================================

/**
 * Helper function to create standardized module messages
 */
export function createMessage(
  from: string,
  to: string | string[],
  type: string,
  payload?: any,
  priority: ModuleMessage['priority'] = 'medium'
): Omit<ModuleMessage, 'id' | 'timestamp'> {
  return {
    from,
    to,
    type,
    payload,
    priority
  }
}

/**
 * Helper function to create standardized module responses
 */
export function createResponse(
  correlationId: string,
  from: string,
  to: string,
  success: boolean,
  data?: any,
  error?: string
): Omit<ModuleResponse, 'id' | 'timestamp'> {
  return {
    correlationId,
    from,
    to,
    success,
    data,
    error
  }
}

/**
 * Helper function to create standardized module events
 */
export function createEvent(
  type: string,
  source: string,
  data?: any,
  tags?: string[]
): Omit<ModuleEvent, 'id' | 'timestamp'> {
  return {
    type,
    source,
    data,
    tags
  }
}

// =============================================================================
// GLOBAL COMMUNICATION SYSTEM INSTANCE
// =============================================================================

export const moduleCommunication = new ModuleMessageBus()

// Export the communication system as the default export
export default moduleCommunication