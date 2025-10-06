/**
 * Application-Level Security Provider
 * 
 * Implements multi-tenant security at the application level as an alternative to
 * Row Level Security (RLS) for databases that don't support it natively.
 */

import type {
  SecurityProvider,
  DatabaseProvider
} from './database-provider-interface'

export interface SecurityOptions {
  cacheTimeout?: number
  strictMode?: boolean
  auditLog?: boolean
  roleHierarchy?: { [role: string]: number }
}

export interface UserPermissions {
  clientId: string
  role: string
  permissions: string[]
  lastUpdated: Date
}

export interface AuditLogEntry {
  userId: string
  clientId: string
  action: string
  resource: string
  timestamp: Date
  success: boolean
  details?: any
}

/**
 * Application-Level Security Provider Implementation
 */
export class ApplicationSecurityProvider implements SecurityProvider {
  private permissionCache = new Map<string, UserPermissions>()
  private auditLogs: AuditLogEntry[] = []
  
  constructor(
    private database: DatabaseProvider,
    private options: SecurityOptions = {}
  ) {
    // Set default options
    this.options = {
      cacheTimeout: 300000, // 5 minutes
      strictMode: true,
      auditLog: true,
      roleHierarchy: {
        'STAFF': 1,
        'SUPERVISOR': 2,
        'MANAGER': 3,
        'OWNER': 4
      },
      ...options
    }

    // Clean up cache periodically
    setInterval(() => this.cleanupCache(), this.options.cacheTimeout! / 2)
  }

  // =============================================================================
  // TENANT ACCESS CONTROL
  // =============================================================================

  async enforceClientAccess(userId: string, clientId: string): Promise<boolean> {
    const cacheKey = `${userId}:${clientId}`
    
    try {
      // Check cache first
      const cached = this.permissionCache.get(cacheKey)
      if (cached && this.isCacheValid(cached)) {
        return true
      }

      // Query database
      const hasAccess = await this.checkDatabaseAccess(userId, clientId)
      
      if (hasAccess) {
        // Cache the result
        const permissions = await this.getUserPermissions(userId, clientId)
        if (permissions) {
          this.permissionCache.set(cacheKey, permissions)
        }
      }

      // Audit the access check
      if (this.options.auditLog) {
        this.logAccess(userId, clientId, 'CLIENT_ACCESS_CHECK', hasAccess)
      }

      return hasAccess
    } catch (error) {
      console.error('Error enforcing client access:', error)
      
      if (this.options.strictMode) {
        throw new Error('Access control check failed')
      }
      
      return false
    }
  }

  async getUserClientIds(userId: string): Promise<string[]> {
    try {
      const clientIds = await this.database.query<{ client_id: string }>(
        'SELECT client_id FROM client_users WHERE user_id = $1 AND status = $2',
        [userId, 'active']
      )

      const result = clientIds.map(row => row.client_id)
      
      // Audit the query
      if (this.options.auditLog) {
        this.logAccess(userId, 'ALL', 'GET_USER_CLIENTS', true, { clientCount: result.length })
      }

      return result
    } catch (error) {
      console.error('Error getting user client IDs:', error)
      return []
    }
  }

  async getUserRoleInClient(userId: string, clientId: string): Promise<string | null> {
    const cacheKey = `${userId}:${clientId}`
    
    try {
      // Check cache first
      const cached = this.permissionCache.get(cacheKey)
      if (cached && this.isCacheValid(cached)) {
        return cached.role
      }

      // Query database
      const result = await this.database.queryOne<{ role: string }>(
        'SELECT role FROM client_users WHERE user_id = $1 AND client_id = $2 AND status = $3',
        [userId, clientId, 'active']
      )

      const role = result?.role || null

      // Cache the result if we found a role
      if (role) {
        const permissions = await this.getUserPermissions(userId, clientId)
        if (permissions) {
          this.permissionCache.set(cacheKey, permissions)
        }
      }

      return role
    } catch (error) {
      console.error('Error getting user role:', error)
      return null
    }
  }

  // =============================================================================
  // QUERY FILTERING
  // =============================================================================

  async addClientFilter(query: string, userId: string): Promise<string> {
    try {
      const clientIds = await this.getUserClientIds(userId)
      
      if (clientIds.length === 0) {
        // User has no client access - return a query that returns no results
        return `${query} AND FALSE`
      }
      
      // Add client filter to the query
      const clientIdList = clientIds.map(id => `'${id}'`).join(', ')
      const filteredQuery = `${query} AND client_id IN (${clientIdList})`
      
      // Audit the filter application
      if (this.options.auditLog) {
        this.logAccess(userId, 'QUERY', 'ADD_CLIENT_FILTER', true, { 
          clientCount: clientIds.length,
          originalQuery: query.substring(0, 100) + '...'
        })
      }

      return filteredQuery
    } catch (error) {
      console.error('Error adding client filter:', error)
      
      if (this.options.strictMode) {
        throw new Error('Query filtering failed')
      }
      
      // Fail securely - return a query that returns no results
      return `${query} AND FALSE`
    }
  }

  async validateClientAccess(userId: string, resourceClientId: string): Promise<void> {
    const hasAccess = await this.enforceClientAccess(userId, resourceClientId)
    
    if (!hasAccess) {
      // Audit the failed access attempt
      if (this.options.auditLog) {
        this.logAccess(userId, resourceClientId, 'VALIDATE_CLIENT_ACCESS', false)
      }
      
      throw new Error('Access denied: User does not have access to this client')
    }
  }

  // =============================================================================
  // ROLE-BASED ACCESS
  // =============================================================================

  hasRequiredRole(userRole: string, requiredRole: string | string[]): boolean {
    if (!this.options.roleHierarchy) {
      // Simple string comparison if no hierarchy defined
      const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      return requiredRoles.includes(userRole)
    }

    const userLevel = this.options.roleHierarchy[userRole] || 0
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    
    return requiredRoles.some(role => {
      const requiredLevel = this.options.roleHierarchy![role] || 0
      return userLevel >= requiredLevel
    })
  }

  async canPerformAction(userId: string, clientId: string, action: string): Promise<boolean> {
    try {
      // First check if user has access to the client
      const hasAccess = await this.enforceClientAccess(userId, clientId)
      if (!hasAccess) {
        return false
      }

      // Get user role in the client
      const userRole = await this.getUserRoleInClient(userId, clientId)
      if (!userRole) {
        return false
      }

      // Check if role can perform the action
      const canPerform = this.checkActionPermission(userRole, action)
      
      // Audit the permission check
      if (this.options.auditLog) {
        this.logAccess(userId, clientId, `CAN_PERFORM_${action}`, canPerform, { userRole })
      }

      return canPerform
    } catch (error) {
      console.error('Error checking action permission:', error)
      return false
    }
  }

  // =============================================================================
  // PERMISSION DEFINITIONS
  // =============================================================================

  private checkActionPermission(userRole: string, action: string): boolean {
    const actionPermissions: { [action: string]: string[] } = {
      // Basic operations
      'view_deliveries': ['STAFF', 'SUPERVISOR', 'MANAGER', 'OWNER'],
      'create_deliveries': ['STAFF', 'SUPERVISOR', 'MANAGER', 'OWNER'],
      'edit_deliveries': ['SUPERVISOR', 'MANAGER', 'OWNER'],
      'delete_deliveries': ['MANAGER', 'OWNER'],
      
      // Team management
      'view_team': ['SUPERVISOR', 'MANAGER', 'OWNER'],
      'invite_team': ['MANAGER', 'OWNER'],
      'remove_team': ['MANAGER', 'OWNER'],
      'change_roles': ['OWNER'],
      
      // Settings and configuration
      'view_settings': ['MANAGER', 'OWNER'],
      'edit_settings': ['OWNER'],
      'manage_subscription': ['OWNER'],
      
      // Data and reporting
      'export_data': ['SUPERVISOR', 'MANAGER', 'OWNER'],
      'view_analytics': ['SUPERVISOR', 'MANAGER', 'OWNER'],
      'generate_reports': ['MANAGER', 'OWNER'],
      
      // Compliance and alerts
      'view_alerts': ['STAFF', 'SUPERVISOR', 'MANAGER', 'OWNER'],
      'acknowledge_alerts': ['SUPERVISOR', 'MANAGER', 'OWNER'],
      'configure_alerts': ['MANAGER', 'OWNER'],
      
      // Audit and logs
      'view_audit_logs': ['MANAGER', 'OWNER'],
      'export_audit_logs': ['OWNER']
    }

    const requiredRoles = actionPermissions[action]
    if (!requiredRoles) {
      console.warn(`Unknown action: ${action}`)
      return false
    }

    return this.hasRequiredRole(userRole, requiredRoles)
  }

  // =============================================================================
  // MIDDLEWARE FUNCTIONS
  // =============================================================================

  /**
   * Express middleware factory for route protection
   */
  requireClientAccess(requiredRole?: string | string[]) {
    return async (req: any, res: any, next: any) => {
      try {
        const userId = req.user?.id
        const clientId = req.params.clientId || req.body.client_id

        if (!userId) {
          return res.status(401).json({ error: 'Authentication required' })
        }

        if (!clientId) {
          return res.status(400).json({ error: 'Client ID required' })
        }

        // Check client access
        const hasAccess = await this.enforceClientAccess(userId, clientId)
        if (!hasAccess) {
          return res.status(403).json({ error: 'Access denied: Invalid client access' })
        }

        // Check role requirements if specified
        if (requiredRole) {
          const userRole = await this.getUserRoleInClient(userId, clientId)
          if (!userRole || !this.hasRequiredRole(userRole, requiredRole)) {
            return res.status(403).json({ error: 'Access denied: Insufficient permissions' })
          }
        }

        // Add client info to request for downstream use
        req.clientAccess = {
          clientId,
          userRole: await this.getUserRoleInClient(userId, clientId)
        }

        next()
      } catch (error) {
        console.error('Client access middleware error:', error)
        res.status(500).json({ error: 'Access control check failed' })
      }
    }
  }

  /**
   * Action-based permission middleware
   */
  requireAction(action: string) {
    return async (req: any, res: any, next: any) => {
      try {
        const userId = req.user?.id
        const clientId = req.params.clientId || req.body.client_id

        if (!userId || !clientId) {
          return res.status(400).json({ error: 'User ID and Client ID required' })
        }

        const canPerform = await this.canPerformAction(userId, clientId, action)
        if (!canPerform) {
          return res.status(403).json({ error: `Access denied: Cannot perform action '${action}'` })
        }

        next()
      } catch (error) {
        console.error('Action permission middleware error:', error)
        res.status(500).json({ error: 'Permission check failed' })
      }
    }
  }

  // =============================================================================
  // CACHE MANAGEMENT
  // =============================================================================

  private isCacheValid(permissions: UserPermissions): boolean {
    const now = new Date()
    const cacheAge = now.getTime() - permissions.lastUpdated.getTime()
    return cacheAge < (this.options.cacheTimeout || 300000)
  }

  private cleanupCache(): void {
    const now = new Date()
    const timeout = this.options.cacheTimeout || 300000
    
    for (const [key, permissions] of this.permissionCache.entries()) {
      const age = now.getTime() - permissions.lastUpdated.getTime()
      if (age > timeout) {
        this.permissionCache.delete(key)
      }
    }
  }

  clearCache(userId?: string, clientId?: string): void {
    if (userId && clientId) {
      // Clear specific user-client cache
      this.permissionCache.delete(`${userId}:${clientId}`)
    } else if (userId) {
      // Clear all cache entries for a user
      for (const key of this.permissionCache.keys()) {
        if (key.startsWith(`${userId}:`)) {
          this.permissionCache.delete(key)
        }
      }
    } else {
      // Clear all cache
      this.permissionCache.clear()
    }
  }

  // =============================================================================
  // AUDIT LOGGING
  // =============================================================================

  private logAccess(
    userId: string,
    clientId: string,
    action: string,
    success: boolean,
    details?: any
  ): void {
    const entry: AuditLogEntry = {
      userId,
      clientId,
      action,
      resource: 'SECURITY_CHECK',
      timestamp: new Date(),
      success,
      details
    }

    this.auditLogs.push(entry)

    // Keep only last 1000 entries in memory
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(-1000)
    }

    // Optionally persist to database
    if (this.options.auditLog) {
      this.persistAuditLog(entry).catch(error => {
        console.error('Failed to persist audit log:', error)
      })
    }
  }

  private async persistAuditLog(entry: AuditLogEntry): Promise<void> {
    try {
      await this.database.query(
        `INSERT INTO audit_logs (user_id, client_id, action, resource_type, timestamp, details) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          entry.userId,
          entry.clientId,
          entry.action,
          entry.resource,
          entry.timestamp,
          JSON.stringify({ success: entry.success, ...entry.details })
        ]
      )
    } catch (error) {
      // Don't throw - audit logging should not break the main flow
      console.error('Failed to persist audit log to database:', error)
    }
  }

  getAuditLogs(userId?: string, clientId?: string, limit = 100): AuditLogEntry[] {
    let filtered = this.auditLogs

    if (userId) {
      filtered = filtered.filter(entry => entry.userId === userId)
    }

    if (clientId) {
      filtered = filtered.filter(entry => entry.clientId === clientId)
    }

    return filtered
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private async checkDatabaseAccess(userId: string, clientId: string): Promise<boolean> {
    const result = await this.database.queryOne<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM client_users WHERE user_id = $1 AND client_id = $2 AND status = $3) as exists',
      [userId, clientId, 'active']
    )

    return result?.exists || false
  }

  private async getUserPermissions(userId: string, clientId: string): Promise<UserPermissions | null> {
    const result = await this.database.queryOne<{ role: string, permissions?: string }>(
      'SELECT role, permissions FROM client_users WHERE user_id = $1 AND client_id = $2 AND status = $3',
      [userId, clientId, 'active']
    )

    if (!result) return null

    return {
      clientId,
      role: result.role,
      permissions: result.permissions ? JSON.parse(result.permissions) : [],
      lastUpdated: new Date()
    }
  }

  // =============================================================================
  // STATISTICS AND MONITORING
  // =============================================================================

  getSecurityStats() {
    return {
      cacheSize: this.permissionCache.size,
      auditLogCount: this.auditLogs.length,
      cacheHitRate: this.calculateCacheHitRate(),
      recentFailedAccess: this.getRecentFailedAccess(),
      settings: {
        cacheTimeout: this.options.cacheTimeout,
        strictMode: this.options.strictMode,
        auditLog: this.options.auditLog
      }
    }
  }

  private calculateCacheHitRate(): number {
    // This would require more sophisticated tracking in a real implementation
    return 0.85 // Placeholder
  }

  private getRecentFailedAccess(): AuditLogEntry[] {
    const oneHourAgo = new Date(Date.now() - 3600000)
    return this.auditLogs
      .filter(entry => !entry.success && entry.timestamp > oneHourAgo)
      .slice(0, 10)
  }
}

/**
 * Hybrid Security Provider - Combines RLS with Application-level security
 */
export class HybridSecurityProvider extends ApplicationSecurityProvider {
  constructor(database: DatabaseProvider, options?: SecurityOptions) {
    super(database, { ...options, strictMode: true })
  }

  async enforceClientAccess(userId: string, clientId: string): Promise<boolean> {
    // First check application-level security
    const appLevelAccess = await super.enforceClientAccess(userId, clientId)
    
    // For Supabase, RLS provides an additional layer
    // For other providers, application-level is the primary security
    return appLevelAccess
  }
}