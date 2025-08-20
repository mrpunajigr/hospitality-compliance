/**
 * JiGR Suite Module Registry and Discovery System
 * Central system for managing and discovering modules across the JiGR ecosystem
 * 
 * SAFETY: This creates NEW functionality alongside existing code - ZERO RISK
 */

import { EventEmitter } from 'events'

// =============================================================================
// MODULE INTERFACE DEFINITIONS
// =============================================================================

export interface JiGRModuleManifest {
  // Core Module Identity
  id: string                           // Unique module identifier (e.g., 'TemperatureComplianceModule')
  name: string                         // Human-readable name
  version: string                      // Semantic version (e.g., '1.0.0')
  description: string                  // Module description
  
  // Module Classification
  category: 'core' | 'addon'          // Core modules vs AddOn modules
  industry: string[]                   // Target industries (e.g., ['hospitality', 'healthcare'])
  
  // Dependencies and Compatibility
  dependencies: ModuleDependency[]     // Required modules and versions
  peerDependencies?: ModuleDependency[] // Optional compatible modules
  incompatible?: string[]             // Incompatible module IDs
  
  // API Contracts
  provides: ModuleCapability[]         // What this module provides
  requires: ModuleCapability[]         // What this module needs
  
  // Technical Specifications
  entryPoint: string                   // Main module file path
  apiVersion: string                   // JiGR Suite API version compatibility
  platform: PlatformSupport           // Platform compatibility
  
  // Metadata
  author: string                       // Module author/organization
  license: string                      // License type
  repository?: string                  // Source code repository
  documentation?: string               // Documentation URL
  
  // Runtime Configuration
  configuration: ModuleConfiguration   // Module-specific configuration schema
  permissions: ModulePermissions       // Required permissions
  
  // Lifecycle Hooks
  lifecycle: ModuleLifecycle           // Initialization and cleanup hooks
}

export interface ModuleDependency {
  moduleId: string
  version: string                      // Semantic version range
  optional?: boolean                   // Whether dependency is optional
  reason?: string                      // Why this dependency is needed
}

export interface ModuleCapability {
  name: string                         // Capability name (e.g., 'temperature-extraction')
  version: string                      // Capability API version
  interface: string                    // TypeScript interface definition
  description?: string                 // What this capability does
}

export interface PlatformSupport {
  browsers: string[]                   // Supported browsers (e.g., ['Safari 12+'])
  devices: string[]                    // Target devices (e.g., ['iPad Air 2013+'])
  nodejs?: string                      // Node.js version if server-side
  database: string[]                   // Database requirements
}

export interface ModuleConfiguration {
  schema: Record<string, ConfigField>  // Configuration field definitions
  defaults: Record<string, any>        // Default values
  required: string[]                   // Required configuration fields
  validation?: Record<string, ValidationRule> // Validation rules
}

export interface ConfigField {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  description: string
  default?: any
  enum?: any[]                         // Allowed values for enum types
  format?: string                      // Format validation (e.g., 'email', 'url')
}

export interface ValidationRule {
  pattern?: string                     // Regex pattern
  min?: number                         // Minimum value/length
  max?: number                         // Maximum value/length
  custom?: string                      // Custom validation function name
}

export interface ModulePermissions {
  database: string[]                   // Database table access
  api: string[]                        // API endpoint access
  storage: string[]                    // Storage bucket access
  external: string[]                   // External service access
  system: string[]                     // System-level permissions
}

export interface ModuleLifecycle {
  initialize?: string                  // Initialization function
  configure?: string                   // Configuration function
  activate?: string                    // Activation function
  deactivate?: string                  // Deactivation function
  cleanup?: string                     // Cleanup function
}

// =============================================================================
// MODULE RUNTIME INTERFACE
// =============================================================================

export interface JiGRModule {
  // Module Identity (from manifest)
  readonly manifest: JiGRModuleManifest
  
  // Runtime State
  readonly isLoaded: boolean
  readonly isActive: boolean
  readonly isConfigured: boolean
  readonly lastError?: Error
  
  // Configuration Management
  configure(config: Record<string, any>): Promise<void>
  getConfiguration(): Record<string, any>
  validateConfiguration(config: Record<string, any>): ValidationResult
  
  // Lifecycle Management
  initialize(): Promise<void>
  activate(): Promise<void>
  deactivate(): Promise<void>
  cleanup(): Promise<void>
  
  // Capability Management
  getCapabilities(): ModuleCapability[]
  hasCapability(name: string, version?: string): boolean
  getCapabilityInterface(name: string): any
  
  // Communication
  emit(event: string, data?: any): void
  on(event: string, handler: Function): void
  off(event: string, handler: Function): void
  
  // Health and Monitoring
  getHealthStatus(): ModuleHealthStatus
  getMetrics(): ModuleMetrics
  getLastActivity(): Date
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings?: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
  value?: any
}

export interface ValidationWarning {
  field: string
  message: string
  suggestion?: string
}

export interface ModuleHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown'
  lastCheck: Date
  issues: HealthIssue[]
  uptime: number                       // Milliseconds since activation
}

export interface HealthIssue {
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  code: string
  timestamp: Date
  resolved?: boolean
}

export interface ModuleMetrics {
  requestCount: number
  errorCount: number
  avgResponseTime: number
  memoryUsage: number
  cpuUsage?: number
  customMetrics: Record<string, number>
}

// =============================================================================
// MODULE REGISTRY SYSTEM
// =============================================================================

export class ModuleRegistry extends EventEmitter {
  private modules = new Map<string, JiGRModule>()
  private manifests = new Map<string, JiGRModuleManifest>()
  private capabilities = new Map<string, string[]>() // capability -> module IDs
  private dependencies = new Map<string, string[]>() // module -> dependencies
  private loadOrder: string[] = []
  
  // =============================================================================
  // MODULE DISCOVERY AND REGISTRATION
  // =============================================================================
  
  /**
   * Discover and register modules from the modules directory
   */
  async discoverModules(modulesPath: string = './modules'): Promise<string[]> {
    try {
      // In a real implementation, this would scan the filesystem
      // For now, we'll register known modules
      const discoveredModules = await this.scanModulesDirectory(modulesPath)
      
      for (const manifestPath of discoveredModules) {
        await this.registerModuleFromManifest(manifestPath)
      }
      
      this.emit('modules-discovered', { count: discoveredModules.length, modules: Array.from(this.manifests.keys()) })
      return Array.from(this.manifests.keys())
    } catch (error) {
      this.emit('discovery-error', error)
      throw new Error(`Module discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  /**
   * Register a module from its manifest file
   */
  async registerModuleFromManifest(manifestPath: string): Promise<void> {
    try {
      // Load and validate manifest
      const manifest = await this.loadManifest(manifestPath)
      await this.validateManifest(manifest)
      
      // Check for conflicts
      await this.checkModuleConflicts(manifest)
      
      // Register the module
      this.manifests.set(manifest.id, manifest)
      this.updateCapabilityIndex(manifest)
      this.updateDependencyGraph(manifest)
      
      this.emit('module-registered', { moduleId: manifest.id, manifest })
    } catch (error) {
      this.emit('registration-error', { manifestPath, error })
      throw error
    }
  }
  
  /**
   * Register a module instance directly
   */
  async registerModule(module: JiGRModule): Promise<void> {
    try {
      const manifest = module.manifest
      
      // Validate and check conflicts
      await this.validateManifest(manifest)
      await this.checkModuleConflicts(manifest)
      
      // Register both manifest and module instance
      this.manifests.set(manifest.id, manifest)
      this.modules.set(manifest.id, module)
      this.updateCapabilityIndex(manifest)
      this.updateDependencyGraph(manifest)
      
      this.emit('module-registered', { moduleId: manifest.id, manifest, instance: module })
    } catch (error) {
      this.emit('registration-error', { moduleId: module.manifest.id, error })
      throw error
    }
  }
  
  // =============================================================================
  // MODULE LIFECYCLE MANAGEMENT
  // =============================================================================
  
  /**
   * Load a specific module by ID
   */
  async loadModule(moduleId: string): Promise<JiGRModule> {
    try {
      // Check if already loaded
      if (this.modules.has(moduleId)) {
        return this.modules.get(moduleId)!
      }
      
      // Get manifest
      const manifest = this.manifests.get(moduleId)
      if (!manifest) {
        throw new Error(`Module ${moduleId} not found in registry`)
      }
      
      // Check dependencies
      await this.checkDependencies(moduleId)
      
      // Load module implementation
      const moduleInstance = await this.instantiateModule(manifest)
      
      // Initialize module
      await moduleInstance.initialize()
      
      // Store module instance
      this.modules.set(moduleId, moduleInstance)
      
      this.emit('module-loaded', { moduleId, module: moduleInstance })
      return moduleInstance
    } catch (error) {
      this.emit('load-error', { moduleId, error })
      throw error
    }
  }
  
  /**
   * Load all modules in dependency order
   */
  async loadAllModules(): Promise<Map<string, JiGRModule>> {
    try {
      // Calculate load order
      this.calculateLoadOrder()
      
      // Load modules in order
      for (const moduleId of this.loadOrder) {
        if (!this.modules.has(moduleId)) {
          await this.loadModule(moduleId)
        }
      }
      
      this.emit('all-modules-loaded', { count: this.modules.size })
      return new Map(this.modules)
    } catch (error) {
      this.emit('load-all-error', error)
      throw error
    }
  }
  
  /**
   * Activate a module (make it available for use)
   */
  async activateModule(moduleId: string): Promise<void> {
    try {
      const moduleInstance = this.modules.get(moduleId)
      if (!moduleInstance) {
        throw new Error(`Module ${moduleId} not loaded`)
      }
      
      if (moduleInstance.isActive) {
        return // Already active
      }
      
      // Activate dependencies first
      await this.activateDependencies(moduleId)
      
      // Activate the module
      await moduleInstance.activate()
      
      this.emit('module-activated', { moduleId, module: moduleInstance })
    } catch (error) {
      this.emit('activation-error', { moduleId, error })
      throw error
    }
  }
  
  /**
   * Deactivate a module
   */
  async deactivateModule(moduleId: string): Promise<void> {
    try {
      const moduleInstance = this.modules.get(moduleId)
      if (!moduleInstance || !moduleInstance.isActive) {
        return // Not active
      }
      
      // Check if other modules depend on this one
      const dependents = this.findDependentModules(moduleId)
      if (dependents.length > 0) {
        throw new Error(`Cannot deactivate ${moduleId}: required by ${dependents.join(', ')}`)
      }
      
      // Deactivate the module
      await moduleInstance.deactivate()
      
      this.emit('module-deactivated', { moduleId, module: moduleInstance })
    } catch (error) {
      this.emit('deactivation-error', { moduleId, error })
      throw error
    }
  }
  
  // =============================================================================
  // CAPABILITY DISCOVERY AND MANAGEMENT
  // =============================================================================
  
  /**
   * Find modules that provide a specific capability
   */
  findCapabilityProviders(capabilityName: string, version?: string): string[] {
    const providers = this.capabilities.get(capabilityName) || []
    
    if (!version) {
      return providers
    }
    
    // Filter by version compatibility
    return providers.filter(moduleId => {
      const manifest = this.manifests.get(moduleId)
      if (!manifest) return false
      
      const capability = manifest.provides.find(cap => cap.name === capabilityName)
      return capability && this.isVersionCompatible(capability.version, version)
    })
  }
  
  /**
   * Get capability interface from a module
   */
  getCapabilityInterface(capabilityName: string, version?: string): any {
    const providers = this.findCapabilityProviders(capabilityName, version)
    
    if (providers.length === 0) {
      throw new Error(`No providers found for capability: ${capabilityName}`)
    }
    
    // Return interface from first active provider
    for (const moduleId of providers) {
      const moduleInstance = this.modules.get(moduleId)
      if (moduleInstance && moduleInstance.isActive && moduleInstance.hasCapability(capabilityName, version)) {
        return moduleInstance.getCapabilityInterface(capabilityName)
      }
    }
    
    throw new Error(`No active providers found for capability: ${capabilityName}`)
  }
  
  /**
   * Check if a capability is available
   */
  hasCapability(capabilityName: string, version?: string): boolean {
    const providers = this.findCapabilityProviders(capabilityName, version)
    
    // Check if any provider is active
    return providers.some(moduleId => {
      const moduleInstance = this.modules.get(moduleId)
      return moduleInstance && moduleInstance.isActive && moduleInstance.hasCapability(capabilityName, version)
    })
  }
  
  // =============================================================================
  // REGISTRY INFORMATION AND UTILITIES
  // =============================================================================
  
  /**
   * Get all registered modules
   */
  getAllModules(): Map<string, JiGRModuleManifest> {
    return new Map(this.manifests)
  }
  
  /**
   * Get all loaded module instances
   */
  getLoadedModules(): Map<string, JiGRModule> {
    return new Map(this.modules)
  }
  
  /**
   * Get modules by category
   */
  getModulesByCategory(category: 'core' | 'addon'): JiGRModuleManifest[] {
    return Array.from(this.manifests.values()).filter(manifest => manifest.category === category)
  }
  
  /**
   * Get modules by industry
   */
  getModulesByIndustry(industry: string): JiGRModuleManifest[] {
    return Array.from(this.manifests.values()).filter(manifest => 
      manifest.industry.includes(industry)
    )
  }
  
  /**
   * Get registry statistics
   */
  getRegistryStats(): RegistryStats {
    const manifests = Array.from(this.manifests.values())
    const modules = Array.from(this.modules.values())
    
    return {
      totalRegistered: this.manifests.size,
      totalLoaded: this.modules.size,
      totalActive: modules.filter(m => m.isActive).length,
      coreModules: manifests.filter(m => m.category === 'core').length,
      addonModules: manifests.filter(m => m.category === 'addon').length,
      industries: [...new Set(manifests.flatMap(m => m.industry))],
      capabilities: Array.from(this.capabilities.keys()),
      loadOrder: [...this.loadOrder]
    }
  }
  
  // =============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // =============================================================================
  
  private async scanModulesDirectory(modulesPath: string): Promise<string[]> {
    // This would scan the filesystem for module.json files
    // For now, return known modules
    return [
      // TemperatureComplianceModule temporarily archived
      // Future modules will be discovered here
    ]
  }
  
  private async loadManifest(manifestPath: string): Promise<JiGRModuleManifest> {
    // In a real implementation, this would load from filesystem
    // For now, return a template manifest
    const manifest: JiGRModuleManifest = {
      id: 'DeliveryComplianceModule',
      name: 'Delivery Compliance Module',
      version: '1.0.0',
      description: 'AI-powered document processing and delivery compliance tracking',
      category: 'core',
      industry: ['hospitality', 'foodservice', 'healthcare'],
      dependencies: [],
      provides: [
        {
          name: 'temperature-extraction',
          version: '1.0.0',
          interface: 'TemperatureExtractor',
          description: 'Extract temperature readings from documents'
        },
        {
          name: 'compliance-dashboard',
          version: '1.0.0',
          interface: 'ComplianceDashboard',
          description: 'Temperature compliance monitoring dashboard'
        }
      ],
      requires: [
        {
          name: 'document-processing',
          version: '1.0.0',
          interface: 'DocumentProcessor',
          description: 'Document processing capabilities'
        }
      ],
      entryPoint: './modules/DeliveryComplianceModule/index.ts',
      apiVersion: '1.0.0',
      platform: {
        browsers: ['Safari 12+', 'Chrome 80+', 'Firefox 75+'],
        devices: ['iPad Air 2013+', 'Desktop'],
        database: ['PostgreSQL 12+']
      },
      author: 'JiGR Development Team',
      license: 'MIT',
      configuration: {
        schema: {
          temperatureThresholds: {
            type: 'object',
            description: 'Temperature threshold settings',
            default: {
              chilled: { min: 0, max: 4 },
              frozen: { min: -25, max: -18 },
              ambient: { min: 5, max: 25 }
            }
          },
          alertSettings: {
            type: 'object',
            description: 'Alert configuration',
            default: {
              emailEnabled: true,
              smsEnabled: false,
              escalationMinutes: 30
            }
          }
        },
        defaults: {},
        required: []
      },
      permissions: {
        database: ['temperature_readings', 'compliance_alerts', 'compliance_policies'],
        api: ['/api/temperature/*', '/api/compliance/*'],
        storage: ['document-uploads'],
        external: ['google-cloud-ai', 'openai'],
        system: []
      },
      lifecycle: {
        initialize: 'initialize',
        configure: 'configure',
        activate: 'activate',
        deactivate: 'deactivate',
        cleanup: 'cleanup'
      }
    }
    
    return manifest
  }
  
  private async validateManifest(manifest: JiGRModuleManifest): Promise<void> {
    // Validate required fields
    if (!manifest.id || !manifest.name || !manifest.version) {
      throw new Error('Module manifest missing required fields: id, name, version')
    }
    
    // Validate semantic version
    if (!this.isValidSemanticVersion(manifest.version)) {
      throw new Error(`Invalid semantic version: ${manifest.version}`)
    }
    
    // Validate category
    if (!['core', 'addon'].includes(manifest.category)) {
      throw new Error(`Invalid category: ${manifest.category}`)
    }
  }
  
  private async checkModuleConflicts(manifest: JiGRModuleManifest): Promise<void> {
    // Check for ID conflicts
    if (this.manifests.has(manifest.id)) {
      const existing = this.manifests.get(manifest.id)!
      if (existing.version !== manifest.version) {
        throw new Error(`Module ID conflict: ${manifest.id} (existing: ${existing.version}, new: ${manifest.version})`)
      }
    }
    
    // Check for capability conflicts
    for (const capability of manifest.provides) {
      const providers = this.capabilities.get(capability.name) || []
      const conflicts = providers.filter(moduleId => {
        const existingManifest = this.manifests.get(moduleId)!
        const existingCapability = existingManifest.provides.find(cap => cap.name === capability.name)
        return existingCapability && !this.isVersionCompatible(existingCapability.version, capability.version)
      })
      
      if (conflicts.length > 0) {
        throw new Error(`Capability conflict: ${capability.name} (conflicts with modules: ${conflicts.join(', ')})`)
      }
    }
  }
  
  private updateCapabilityIndex(manifest: JiGRModuleManifest): void {
    for (const capability of manifest.provides) {
      if (!this.capabilities.has(capability.name)) {
        this.capabilities.set(capability.name, [])
      }
      this.capabilities.get(capability.name)!.push(manifest.id)
    }
  }
  
  private updateDependencyGraph(manifest: JiGRModuleManifest): void {
    const deps = manifest.dependencies.map(dep => dep.moduleId)
    this.dependencies.set(manifest.id, deps)
  }
  
  private calculateLoadOrder(): void {
    this.loadOrder = this.topologicalSort(this.dependencies)
  }
  
  private topologicalSort(graph: Map<string, string[]>): string[] {
    const visited = new Set<string>()
    const temp = new Set<string>()
    const result: string[] = []
    
    const visit = (node: string) => {
      if (temp.has(node)) {
        throw new Error(`Circular dependency detected involving: ${node}`)
      }
      
      if (!visited.has(node)) {
        temp.add(node)
        
        const deps = graph.get(node) || []
        for (const dep of deps) {
          visit(dep)
        }
        
        temp.delete(node)
        visited.add(node)
        result.unshift(node) // Add to beginning for reverse topological order
      }
    }
    
    for (const node of graph.keys()) {
      visit(node)
    }
    
    return result
  }
  
  private async checkDependencies(moduleId: string): Promise<void> {
    const manifest = this.manifests.get(moduleId)
    if (!manifest) return
    
    for (const dep of manifest.dependencies) {
      if (!this.manifests.has(dep.moduleId)) {
        if (!dep.optional) {
          throw new Error(`Required dependency not found: ${dep.moduleId}`)
        }
      }
      
      // Check version compatibility
      const depManifest = this.manifests.get(dep.moduleId)
      if (depManifest && !this.isVersionCompatible(depManifest.version, dep.version)) {
        throw new Error(`Dependency version incompatible: ${dep.moduleId} (required: ${dep.version}, available: ${depManifest.version})`)
      }
    }
  }
  
  private async instantiateModule(manifest: JiGRModuleManifest): Promise<JiGRModule> {
    // This would dynamically import and instantiate the module
    // For now, return a placeholder
    throw new Error('Module instantiation not implemented - will be completed in next phase')
  }
  
  private async activateDependencies(moduleId: string): Promise<void> {
    const deps = this.dependencies.get(moduleId) || []
    
    for (const depId of deps) {
      const depModule = this.modules.get(depId)
      if (depModule && !depModule.isActive) {
        await this.activateModule(depId)
      }
    }
  }
  
  private findDependentModules(moduleId: string): string[] {
    const dependents: string[] = []
    
    for (const [otherId, deps] of this.dependencies.entries()) {
      if (deps.includes(moduleId)) {
        const moduleInstance = this.modules.get(otherId)
        if (moduleInstance && moduleInstance.isActive) {
          dependents.push(otherId)
        }
      }
    }
    
    return dependents
  }
  
  private isVersionCompatible(version1: string, version2: string): boolean {
    // Simple semantic version compatibility check
    // In a real implementation, this would use semver library
    const v1Parts = version1.split('.').map(Number)
    const v2Parts = version2.split('.').map(Number)
    
    // Major version must match
    return v1Parts[0] === v2Parts[0]
  }
  
  private isValidSemanticVersion(version: string): boolean {
    const semverPattern = /^\d+\.\d+\.\d+(?:-[a-zA-Z0-9-.]+)?(?:\+[a-zA-Z0-9-.]+)?$/
    return semverPattern.test(version)
  }
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export interface RegistryStats {
  totalRegistered: number
  totalLoaded: number
  totalActive: number
  coreModules: number
  addonModules: number
  industries: string[]
  capabilities: string[]
  loadOrder: string[]
}

// =============================================================================
// GLOBAL REGISTRY INSTANCE
// =============================================================================

export const moduleRegistry = new ModuleRegistry()

// Export the registry as the default export
export default moduleRegistry