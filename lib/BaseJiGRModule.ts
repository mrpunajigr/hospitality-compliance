/**
 * Base JiGR Module Implementation
 * Abstract base class that all JiGR modules extend
 * 
 * SAFETY: This creates NEW base functionality - ZERO RISK to existing code
 */

import { EventEmitter } from 'events'
import { 
  JiGRModule, 
  JiGRModuleManifest, 
  ModuleCapability, 
  ModuleHealthStatus, 
  ModuleMetrics,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  HealthIssue
} from './ModuleRegistry'

// =============================================================================
// BASE MODULE IMPLEMENTATION
// =============================================================================

export abstract class BaseJiGRModule extends EventEmitter implements JiGRModule {
  // Module Identity
  public readonly manifest: JiGRModuleManifest
  
  // Runtime State
  private _isLoaded = false
  private _isActive = false
  private _isConfigured = false
  private _lastError?: Error
  private _configuration: Record<string, any> = {}
  private _metrics: ModuleMetrics
  private _healthStatus: ModuleHealthStatus
  private _lastActivity: Date
  private _startTime: Date
  
  constructor(manifest: JiGRModuleManifest) {
    super()
    this.manifest = manifest
    this._lastActivity = new Date()
    this._startTime = new Date()
    
    // Initialize metrics
    this._metrics = {
      requestCount: 0,
      errorCount: 0,
      avgResponseTime: 0,
      memoryUsage: 0,
      customMetrics: {}
    }
    
    // Initialize health status
    this._healthStatus = {
      status: 'unknown',
      lastCheck: new Date(),
      issues: [],
      uptime: 0
    }
    
    // Set default configuration
    this._configuration = { ...this.manifest.configuration.defaults }
  }
  
  // =============================================================================
  // RUNTIME STATE ACCESSORS
  // =============================================================================
  
  public get isLoaded(): boolean {
    return this._isLoaded
  }
  
  public get isActive(): boolean {
    return this._isActive
  }
  
  public get isConfigured(): boolean {
    return this._isConfigured
  }
  
  public get lastError(): Error | undefined {
    return this._lastError
  }
  
  // =============================================================================
  // CONFIGURATION MANAGEMENT
  // =============================================================================
  
  public async configure(config: Record<string, any>): Promise<void> {
    try {
      // Validate configuration
      const validation = this.validateConfiguration(config)
      if (!validation.isValid) {
        throw new Error(`Configuration validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
      }
      
      // Merge with existing configuration
      this._configuration = { ...this._configuration, ...config }
      
      // Apply configuration
      await this.applyConfiguration(this._configuration)
      
      this._isConfigured = true
      this.updateActivity()
      this.emit('configured', { configuration: this._configuration })
      
    } catch (error) {
      this._lastError = error instanceof Error ? error : new Error(String(error))
      this.emit('configuration-error', error)
      throw error
    }
  }
  
  public getConfiguration(): Record<string, any> {
    return { ...this._configuration }
  }
  
  public validateConfiguration(config: Record<string, any>): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    
    // Check required fields
    for (const requiredField of this.manifest.configuration.required) {
      if (!(requiredField in config)) {
        errors.push({
          field: requiredField,
          message: `Required field '${requiredField}' is missing`,
          code: 'REQUIRED_FIELD_MISSING'
        })
      }
    }
    
    // Validate field types and values
    for (const [fieldName, fieldConfig] of Object.entries(this.manifest.configuration.schema)) {
      if (fieldName in config) {
        const value = config[fieldName]
        const validation = this.validateField(fieldName, value, fieldConfig)
        
        errors.push(...validation.errors)
        warnings.push(...(validation.warnings || []))
      }
    }
    
    // Custom validation
    const customValidation = this.customConfigurationValidation(config)
    errors.push(...customValidation.errors)
    warnings.push(...(customValidation.warnings || []))
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }
  
  // =============================================================================
  // LIFECYCLE MANAGEMENT
  // =============================================================================
  
  public async initialize(): Promise<void> {
    try {
      this.emit('initializing')
      
      // Perform module-specific initialization
      await this.onInitialize()
      
      this._isLoaded = true
      this.updateActivity()
      this.updateHealthStatus()
      
      this.emit('initialized')
      
    } catch (error) {
      this._lastError = error instanceof Error ? error : new Error(String(error))
      this.emit('initialization-error', error)
      throw error
    }
  }
  
  public async activate(): Promise<void> {
    try {
      if (!this._isLoaded) {
        throw new Error('Module must be initialized before activation')
      }
      
      this.emit('activating')
      
      // Perform module-specific activation
      await this.onActivate()
      
      this._isActive = true
      this.updateActivity()
      this.updateHealthStatus()
      
      this.emit('activated')
      
    } catch (error) {
      this._lastError = error instanceof Error ? error : new Error(String(error))
      this.emit('activation-error', error)
      throw error
    }
  }
  
  public async deactivate(): Promise<void> {
    try {
      if (!this._isActive) {
        return // Already deactivated
      }
      
      this.emit('deactivating')
      
      // Perform module-specific deactivation
      await this.onDeactivate()
      
      this._isActive = false
      this.updateActivity()
      this.updateHealthStatus()
      
      this.emit('deactivated')
      
    } catch (error) {
      this._lastError = error instanceof Error ? error : new Error(String(error))
      this.emit('deactivation-error', error)
      throw error
    }
  }
  
  public async cleanup(): Promise<void> {
    try {
      this.emit('cleaning-up')
      
      // Deactivate if still active
      if (this._isActive) {
        await this.deactivate()
      }
      
      // Perform module-specific cleanup
      await this.onCleanup()
      
      this._isLoaded = false
      this._isConfigured = false
      this.updateActivity()
      
      this.emit('cleaned-up')
      
    } catch (error) {
      this._lastError = error instanceof Error ? error : new Error(String(error))
      this.emit('cleanup-error', error)
      throw error
    }
  }
  
  // =============================================================================
  // CAPABILITY MANAGEMENT
  // =============================================================================
  
  public getCapabilities(): ModuleCapability[] {
    return [...this.manifest.provides]
  }
  
  public hasCapability(name: string, version?: string): boolean {
    const capability = this.manifest.provides.find(cap => cap.name === name)
    
    if (!capability) {
      return false
    }
    
    if (!version) {
      return true
    }
    
    // Simple version compatibility check
    return this.isVersionCompatible(capability.version, version)
  }
  
  public getCapabilityInterface(name: string): any {
    const capability = this.manifest.provides.find(cap => cap.name === name)
    
    if (!capability) {
      throw new Error(`Capability '${name}' not provided by this module`)
    }
    
    if (!this._isActive) {
      throw new Error(`Module must be active to access capability '${name}'`)
    }
    
    return this.getCapabilityImplementation(name)
  }
  
  // =============================================================================
  // HEALTH AND MONITORING
  // =============================================================================
  
  public getHealthStatus(): ModuleHealthStatus {
    this.updateHealthStatus()
    return { ...this._healthStatus }
  }
  
  public getMetrics(): ModuleMetrics {
    this.updateMetrics()
    return { ...this._metrics }
  }
  
  public getLastActivity(): Date {
    return new Date(this._lastActivity)
  }
  
  // =============================================================================
  // PROTECTED METHODS FOR SUBCLASSES
  // =============================================================================
  
  /**
   * Called during module initialization
   * Override in subclasses for module-specific initialization logic
   */
  protected abstract onInitialize(): Promise<void>
  
  /**
   * Called during module activation
   * Override in subclasses for module-specific activation logic
   */
  protected abstract onActivate(): Promise<void>
  
  /**
   * Called during module deactivation
   * Override in subclasses for module-specific deactivation logic
   */
  protected abstract onDeactivate(): Promise<void>
  
  /**
   * Called during module cleanup
   * Override in subclasses for module-specific cleanup logic
   */
  protected abstract onCleanup(): Promise<void>
  
  /**
   * Apply configuration changes
   * Override in subclasses to handle configuration updates
   */
  protected abstract applyConfiguration(config: Record<string, any>): Promise<void>
  
  /**
   * Get capability implementation
   * Override in subclasses to return actual capability interfaces
   */
  protected abstract getCapabilityImplementation(name: string): any
  
  /**
   * Custom configuration validation
   * Override in subclasses for module-specific validation logic
   */
  protected customConfigurationValidation(config: Record<string, any>): ValidationResult {
    return { isValid: true, errors: [] }
  }
  
  /**
   * Update custom metrics
   * Override in subclasses to provide module-specific metrics
   */
  protected updateCustomMetrics(): Record<string, number> {
    return {}
  }
  
  /**
   * Perform health check
   * Override in subclasses for module-specific health checks
   */
  protected performHealthCheck(): HealthIssue[] {
    return []
  }
  
  // =============================================================================
  // UTILITY METHODS FOR SUBCLASSES
  // =============================================================================
  
  /**
   * Record a request for metrics
   */
  protected recordRequest(responseTime: number): void {
    this._metrics.requestCount++
    
    // Update average response time
    const totalTime = this._metrics.avgResponseTime * (this._metrics.requestCount - 1) + responseTime
    this._metrics.avgResponseTime = totalTime / this._metrics.requestCount
    
    this.updateActivity()
  }
  
  /**
   * Record an error for metrics
   */
  protected recordError(error: Error): void {
    this._metrics.errorCount++
    this._lastError = error
    this.updateActivity()
    
    // Add to health issues
    this._healthStatus.issues.push({
      severity: 'medium',
      message: error.message,
      code: 'MODULE_ERROR',
      timestamp: new Date(),
      resolved: false
    })
    
    this.emit('error', error)
  }
  
  /**
   * Log module activity
   */
  protected logActivity(message: string, data?: any): void {
    this.updateActivity()
    this.emit('activity', { message, data, timestamp: new Date() })
  }
  
  // =============================================================================
  // PRIVATE IMPLEMENTATION
  // =============================================================================
  
  private updateActivity(): void {
    this._lastActivity = new Date()
  }
  
  private updateMetrics(): void {
    // Update memory usage
    if (typeof process !== 'undefined' && process.memoryUsage) {
      this._metrics.memoryUsage = process.memoryUsage().heapUsed
    }
    
    // Update custom metrics
    this._metrics.customMetrics = this.updateCustomMetrics()
  }
  
  private updateHealthStatus(): void {
    const now = new Date()
    
    // Calculate uptime
    this._healthStatus.uptime = now.getTime() - this._startTime.getTime()
    this._healthStatus.lastCheck = now
    
    // Perform health check
    const newIssues = this.performHealthCheck()
    this._healthStatus.issues.push(...newIssues)
    
    // Determine overall health status
    const criticalIssues = this._healthStatus.issues.filter(issue => 
      issue.severity === 'critical' && !issue.resolved
    )
    const highIssues = this._healthStatus.issues.filter(issue => 
      issue.severity === 'high' && !issue.resolved
    )
    
    if (criticalIssues.length > 0) {
      this._healthStatus.status = 'unhealthy'
    } else if (highIssues.length > 0) {
      this._healthStatus.status = 'degraded'
    } else if (this._isActive && this._isLoaded) {
      this._healthStatus.status = 'healthy'
    } else {
      this._healthStatus.status = 'unknown'
    }
    
    // Clean up old resolved issues (keep for 24 hours)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    this._healthStatus.issues = this._healthStatus.issues.filter(issue =>
      !issue.resolved || issue.timestamp > twentyFourHoursAgo
    )
  }
  
  private validateField(fieldName: string, value: any, fieldConfig: any): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    
    // Type validation
    if (fieldConfig.type === 'string' && typeof value !== 'string') {
      errors.push({
        field: fieldName,
        message: `Field '${fieldName}' must be a string`,
        code: 'INVALID_TYPE',
        value
      })
    } else if (fieldConfig.type === 'number' && typeof value !== 'number') {
      errors.push({
        field: fieldName,
        message: `Field '${fieldName}' must be a number`,
        code: 'INVALID_TYPE',
        value
      })
    } else if (fieldConfig.type === 'boolean' && typeof value !== 'boolean') {
      errors.push({
        field: fieldName,
        message: `Field '${fieldName}' must be a boolean`,
        code: 'INVALID_TYPE',
        value
      })
    }
    
    // Enum validation
    if (fieldConfig.enum && !fieldConfig.enum.includes(value)) {
      errors.push({
        field: fieldName,
        message: `Field '${fieldName}' must be one of: ${fieldConfig.enum.join(', ')}`,
        code: 'INVALID_ENUM_VALUE',
        value
      })
    }
    
    return { isValid: errors.length === 0, errors, warnings }
  }
  
  private isVersionCompatible(version1: string, version2: string): boolean {
    // Simple semantic version compatibility check
    const v1Parts = version1.split('.').map(Number)
    const v2Parts = version2.split('.').map(Number)
    
    // Major version must match
    return v1Parts[0] === v2Parts[0]
  }
}

export default BaseJiGRModule