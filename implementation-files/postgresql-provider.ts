/**
 * PostgreSQL Database Provider Implementation
 * 
 * This implements the provider interface for standard PostgreSQL databases
 * (AWS RDS, Google Cloud SQL, Azure Database, self-hosted)
 */

import { Pool, PoolClient, PoolConfig } from 'pg'
import type {
  DatabaseProvider,
  QueryOptions,
  TransactionOptions,
  TransactionContext,
  TableSchema,
  DatabaseConnection
} from './database-provider-interface'

export class PostgreSQLProvider implements DatabaseProvider {
  private pool: Pool | null = null
  private connected: boolean = false

  constructor(private config: DatabaseConnection & {
    ssl?: boolean
    poolSize?: number
    connectionTimeoutMs?: number
    idleTimeoutMs?: number
    statementTimeoutMs?: number
  }) {}

  // =============================================================================
  // CONNECTION MANAGEMENT
  // =============================================================================

  async connect(): Promise<void> {
    try {
      const poolConfig: PoolConfig = {
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password,
        max: this.config.poolSize || 20,
        min: 2,
        idleTimeoutMillis: this.config.idleTimeoutMs || 30000,
        connectionTimeoutMillis: this.config.connectionTimeoutMs || 10000,
        statement_timeout: this.config.statementTimeoutMs || 30000,
        ssl: this.config.ssl ? { rejectUnauthorized: false } : false,
        
        // Connection pool optimization
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
        
        // Error handling
        allowExitOnIdle: true
      }

      this.pool = new Pool(poolConfig)

      // Test connection
      const client = await this.pool.connect()
      await client.query('SELECT NOW()')
      client.release()

      this.connected = true
      console.log('✅ PostgreSQL connection established')
    } catch (error) {
      this.connected = false
      throw new Error(`PostgreSQL connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end()
      this.pool = null
    }
    this.connected = false
    console.log('🔌 PostgreSQL connection closed')
  }

  isConnected(): boolean {
    return this.connected && this.pool !== null
  }

  // =============================================================================
  // QUERY OPERATIONS
  // =============================================================================

  async query<T = any>(sql: string, params?: any[], options?: QueryOptions): Promise<T[]> {
    if (!this.pool) {
      throw new Error('Database not connected')
    }

    const client = await this.pool.connect()
    try {
      // Set query timeout if specified
      if (options?.timeout) {
        await client.query(`SET statement_timeout = ${options.timeout}`)
      }

      const result = await client.query(sql, params)
      return result.rows as T[]
    } catch (error) {
      if (options?.retries && options.retries > 0) {
        console.warn(`Query failed, retrying... (${options.retries} attempts left)`)
        return this.query<T>(sql, params, { ...options, retries: options.retries - 1 })
      }
      throw new Error(`Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      client.release()
    }
  }

  async queryOne<T = any>(sql: string, params?: any[], options?: QueryOptions): Promise<T | null> {
    const results = await this.query<T>(sql, params, options)
    return results.length > 0 ? results[0] : null
  }

  // =============================================================================
  // TRANSACTION SUPPORT
  // =============================================================================

  async transaction<T>(
    callback: (tx: TransactionContext) => Promise<T>,
    options?: TransactionOptions
  ): Promise<T> {
    if (!this.pool) {
      throw new Error('Database not connected')
    }

    const client = await this.pool.connect()
    
    try {
      await client.query('BEGIN')
      
      // Set isolation level if specified
      if (options?.isolationLevel) {
        await client.query(`SET TRANSACTION ISOLATION LEVEL ${options.isolationLevel}`)
      }
      
      // Set transaction timeout if specified
      if (options?.timeout) {
        await client.query(`SET statement_timeout = ${options.timeout}`)
      }

      const txContext: TransactionContext = {
        query: async <U = any>(sql: string, params?: any[]) => {
          const result = await client.query(sql, params)
          return result.rows as U[]
        },
        queryOne: async <U = any>(sql: string, params?: any[]) => {
          const result = await client.query(sql, params)
          return result.rows.length > 0 ? result.rows[0] as U : null
        },
        rollback: async () => {
          await client.query('ROLLBACK')
        }
      }

      const result = await callback(txContext)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  // =============================================================================
  // SCHEMA OPERATIONS
  // =============================================================================

  async createTable(tableName: string, schema: TableSchema): Promise<void> {
    const columnDefinitions = schema.columns.map(col => {
      let definition = `${col.name} ${col.type}`
      if (!col.nullable) definition += ' NOT NULL'
      if (col.default !== undefined) definition += ` DEFAULT ${col.default}`
      if (col.unique) definition += ' UNIQUE'
      return definition
    }).join(', ')

    let sql = `CREATE TABLE ${tableName} (${columnDefinitions}`
    
    // Add primary key
    if (schema.primaryKey.length > 0) {
      sql += `, PRIMARY KEY (${schema.primaryKey.join(', ')})`
    }
    
    sql += ')'

    await this.query(sql)

    // Create foreign keys
    if (schema.foreignKeys) {
      for (const fk of schema.foreignKeys) {
        const fkSql = `
          ALTER TABLE ${tableName} 
          ADD CONSTRAINT fk_${tableName}_${fk.columns.join('_')}
          FOREIGN KEY (${fk.columns.join(', ')}) 
          REFERENCES ${fk.referencedTable}(${fk.referencedColumns.join(', ')})
          ${fk.onDelete ? `ON DELETE ${fk.onDelete}` : ''}
          ${fk.onUpdate ? `ON UPDATE ${fk.onUpdate}` : ''}
        `
        await this.query(fkSql)
      }
    }

    // Create indexes
    if (schema.indexes) {
      for (const idx of schema.indexes) {
        await this.createIndex(tableName, idx.name, idx.columns)
      }
    }

    // Create constraints
    if (schema.constraints) {
      for (const constraint of schema.constraints) {
        const constraintSql = `
          ALTER TABLE ${tableName} 
          ADD CONSTRAINT ${constraint.name} 
          ${constraint.type} (${constraint.definition})
        `
        await this.query(constraintSql)
      }
    }
  }

  async dropTable(tableName: string): Promise<void> {
    await this.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`)
  }

  async createIndex(tableName: string, indexName: string, columns: string[]): Promise<void> {
    const sql = `CREATE INDEX ${indexName} ON ${tableName} (${columns.join(', ')})`
    await this.query(sql)
  }

  // =============================================================================
  // HEALTH CHECK
  // =============================================================================

  async healthCheck(): Promise<{ healthy: boolean; latency: number; error?: string }> {
    const startTime = Date.now()
    try {
      await this.query('SELECT 1')
      const latency = Date.now() - startTime
      return { healthy: true, latency }
    } catch (error) {
      const latency = Date.now() - startTime
      return {
        healthy: false,
        latency,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // =============================================================================
  // BUSINESS LOGIC METHODS (JiGR SPECIFIC)
  // =============================================================================

  async getUserClients(userId: string) {
    const sql = `
      SELECT 
        cu.client_id,
        cu.role,
        cu.status,
        c.id,
        c.name,
        c.subscription_status,
        c.subscription_tier
      FROM client_users cu
      JOIN clients c ON cu.client_id = c.id
      WHERE cu.user_id = $1 AND cu.status = 'active'
      ORDER BY c.name
    `
    
    const rows = await this.query(sql, [userId])
    
    // Transform to match Supabase format
    return rows.map(row => ({
      client_id: row.client_id,
      role: row.role,
      status: row.status,
      clients: {
        id: row.id,
        name: row.name,
        subscription_status: row.subscription_status,
        subscription_tier: row.subscription_tier
      }
    }))
  }

  async hasClientAccess(userId: string, clientId: string): Promise<boolean> {
    const sql = `
      SELECT 1 FROM client_users 
      WHERE user_id = $1 AND client_id = $2 AND status = 'active'
    `
    
    const result = await this.queryOne(sql, [userId, clientId])
    return !!result
  }

  async getUserClientRole(userId: string, clientId: string): Promise<string | null> {
    const sql = `
      SELECT role FROM client_users 
      WHERE user_id = $1 AND client_id = $2 AND status = 'active'
    `
    
    const result = await this.queryOne<{ role: string }>(sql, [userId, clientId])
    return result?.role || null
  }

  async getDeliveryRecords(clientId: string, limit = 50) {
    const sql = `
      SELECT * FROM delivery_records 
      WHERE client_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `
    
    return await this.query(sql, [clientId, limit])
  }

  async createDeliveryRecord(record: {
    clientId: string
    userId: string
    supplierId?: string
    supplierName: string
    imagePath: string
    docketNumber?: string
    deliveryDate?: string
  }) {
    const sql = `
      INSERT INTO delivery_records (
        client_id, user_id, supplier_id, supplier_name, 
        image_path, docket_number, delivery_date, processing_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING *
    `
    
    const result = await this.queryOne(sql, [
      record.clientId,
      record.userId,
      record.supplierId,
      record.supplierName,
      record.imagePath,
      record.docketNumber,
      record.deliveryDate
    ])
    
    return result
  }

  async getSuppliers(clientId: string) {
    const sql = `
      SELECT * FROM suppliers 
      WHERE client_id = $1 AND status = 'active'
      ORDER BY name
    `
    
    return await this.query(sql, [clientId])
  }

  async createSupplier(supplier: {
    clientId: string
    name: string
    contactEmail?: string
    contactPhone?: string
    deliverySchedule?: string[]
    productTypes?: string[]
  }) {
    const sql = `
      INSERT INTO suppliers (
        client_id, name, contact_email, contact_phone, 
        delivery_schedule, product_types, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'active')
      RETURNING *
    `
    
    return await this.queryOne(sql, [
      supplier.clientId,
      supplier.name,
      supplier.contactEmail,
      supplier.contactPhone,
      JSON.stringify(supplier.deliverySchedule),
      JSON.stringify(supplier.productTypes)
    ])
  }

  async getTeamMembers(clientId: string) {
    const sql = `
      SELECT 
        cu.*,
        p.full_name,
        p.email,
        p.phone,
        p.avatar_url
      FROM client_users cu
      JOIN profiles p ON cu.user_id = p.id
      WHERE cu.client_id = $1
      ORDER BY cu.created_at
    `
    
    const rows = await this.query(sql, [clientId])
    
    // Transform to match Supabase format
    return rows.map(row => ({
      ...row,
      profiles: {
        full_name: row.full_name,
        email: row.email,
        phone: row.phone,
        avatar_url: row.avatar_url
      }
    }))
  }

  async createInvitation(invitation: {
    email: string
    clientId: string
    role: string
    invitedBy: string
  }) {
    const sql = `
      INSERT INTO invitations (email, client_id, role, invited_by)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `
    
    return await this.queryOne(sql, [
      invitation.email,
      invitation.clientId,
      invitation.role,
      invitation.invitedBy
    ])
  }

  async getComplianceAlerts(clientId: string) {
    const sql = `
      SELECT * FROM compliance_alerts 
      WHERE client_id = $1 
      ORDER BY created_at DESC
    `
    
    return await this.query(sql, [clientId])
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<boolean> {
    const sql = `
      UPDATE compliance_alerts 
      SET acknowledged_by = $1, acknowledged_at = NOW()
      WHERE id = $2
      RETURNING id
    `
    
    const result = await this.queryOne(sql, [userId, alertId])
    return !!result
  }

  async createAuditLog(log: {
    clientId: string
    userId?: string
    action: string
    resourceType?: string
    resourceId?: string
    details?: any
  }) {
    const sql = `
      INSERT INTO audit_logs (
        client_id, user_id, action, resource_type, resource_id, details
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `
    
    await this.query(sql, [
      log.clientId,
      log.userId,
      log.action,
      log.resourceType,
      log.resourceId,
      JSON.stringify(log.details)
    ])
  }

  // =============================================================================
  // MULTI-TENANT SECURITY (APPLICATION LEVEL)
  // =============================================================================

  async enforceClientAccess(userId: string, clientId: string): Promise<boolean> {
    return await this.hasClientAccess(userId, clientId)
  }

  async getUserClientIds(userId: string): Promise<string[]> {
    const sql = `
      SELECT client_id FROM client_users 
      WHERE user_id = $1 AND status = 'active'
    `
    
    const rows = await this.query<{ client_id: string }>(sql, [userId])
    return rows.map(row => row.client_id)
  }

  async addClientFilter(query: string, userId: string): Promise<string> {
    const clientIds = await this.getUserClientIds(userId)
    
    if (clientIds.length === 0) {
      return `${query} AND FALSE` // No access to any clients
    }
    
    const clientIdList = clientIds.map(id => `'${id}'`).join(', ')
    return `${query} AND client_id IN (${clientIdList})`
  }

  async validateClientAccess(userId: string, resourceClientId: string): Promise<void> {
    const hasAccess = await this.enforceClientAccess(userId, resourceClientId)
    if (!hasAccess) {
      throw new Error('Access denied: User does not have access to this client')
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Execute a query with automatic client access filtering
   */
  async queryWithClientFilter<T = any>(
    userId: string,
    baseQuery: string,
    params?: any[]
  ): Promise<T[]> {
    const filteredQuery = await this.addClientFilter(baseQuery, userId)
    return this.query<T>(filteredQuery, params)
  }

  /**
   * Get database statistics for monitoring
   */
  async getDatabaseStats() {
    const queries = [
      'SELECT COUNT(*) as total_connections FROM pg_stat_activity',
      'SELECT COUNT(*) as active_connections FROM pg_stat_activity WHERE state = \'active\'',
      'SELECT pg_database_size(current_database()) as database_size',
      'SELECT version() as postgres_version'
    ]

    const results = await Promise.all(
      queries.map(query => this.queryOne(query))
    )

    return {
      totalConnections: results[0]?.total_connections,
      activeConnections: results[1]?.active_connections,
      databaseSize: results[2]?.database_size,
      version: results[3]?.postgres_version
    }
  }

  /**
   * Get connection pool stats
   */
  getPoolStats() {
    if (!this.pool) return null

    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount
    }
  }
}

/**
 * Factory function to create PostgreSQL provider
 */
export function createPostgreSQLProvider(config: DatabaseConnection & {
  ssl?: boolean
  poolSize?: number
  connectionTimeoutMs?: number
  idleTimeoutMs?: number
  statementTimeoutMs?: number
}): PostgreSQLProvider {
  return new PostgreSQLProvider(config)
}

/**
 * Compatibility layer - maintains existing exports for easy migration
 */
export function createPostgreSQLCompatibilityLayer(provider: PostgreSQLProvider) {
  return {
    // Database operations (no direct client access like Supabase)
    query: provider.query.bind(provider),
    queryOne: provider.queryOne.bind(provider),
    transaction: provider.transaction.bind(provider),
    
    // Business logic methods
    getUserClients: provider.getUserClients.bind(provider),
    hasClientAccess: provider.hasClientAccess.bind(provider),
    getUserClientRole: provider.getUserClientRole.bind(provider),
    getDeliveryRecords: provider.getDeliveryRecords.bind(provider),
    createDeliveryRecord: provider.createDeliveryRecord.bind(provider),
    getSuppliers: provider.getSuppliers.bind(provider),
    createSupplier: provider.createSupplier.bind(provider),
    getTeamMembers: provider.getTeamMembers.bind(provider),
    createInvitation: provider.createInvitation.bind(provider),
    getComplianceAlerts: provider.getComplianceAlerts.bind(provider),
    acknowledgeAlert: provider.acknowledgeAlert.bind(provider),
    createAuditLog: provider.createAuditLog.bind(provider),
    
    // Security methods
    enforceClientAccess: provider.enforceClientAccess.bind(provider),
    getUserClientIds: provider.getUserClientIds.bind(provider),
    validateClientAccess: provider.validateClientAccess.bind(provider),
    
    // Utility methods
    queryWithClientFilter: provider.queryWithClientFilter.bind(provider),
    getDatabaseStats: provider.getDatabaseStats.bind(provider),
    getPoolStats: provider.getPoolStats.bind(provider),
    
    // Health check
    healthCheck: provider.healthCheck.bind(provider),
    
    // Constants (PostgreSQL doesn't have built-in storage)
    STORAGE_BUCKET: 'external-storage', // Would need separate storage provider
    DELIVERY_DOCKETS_BUCKET: 'external-storage'
  }
}