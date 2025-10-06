/**
 * Database Provider Interface - Vendor Agnostic Database Abstraction
 * 
 * This interface defines the contract that all database providers must implement,
 * enabling seamless switching between Supabase, AWS RDS, Google Cloud SQL, etc.
 */

export interface DatabaseConnection {
  host: string
  port: number
  database: string
  username: string
  password: string
  ssl?: boolean
  poolSize?: number
}

export interface QueryOptions {
  timeout?: number
  retries?: number
  cache?: boolean
}

export interface TransactionOptions {
  isolationLevel?: 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE'
  timeout?: number
}

export interface StorageOptions {
  bucket: string
  path: string
  expiresIn?: number
  publicAccess?: boolean
}

/**
 * Core Database Provider Interface
 */
export interface DatabaseProvider {
  // Connection Management
  connect(): Promise<void>
  disconnect(): Promise<void>
  isConnected(): boolean
  
  // Query Operations
  query<T = any>(sql: string, params?: any[], options?: QueryOptions): Promise<T[]>
  queryOne<T = any>(sql: string, params?: any[], options?: QueryOptions): Promise<T | null>
  
  // Transaction Support
  transaction<T>(
    callback: (tx: TransactionContext) => Promise<T>,
    options?: TransactionOptions
  ): Promise<T>
  
  // Schema Operations
  createTable(tableName: string, schema: TableSchema): Promise<void>
  dropTable(tableName: string): Promise<void>
  createIndex(tableName: string, indexName: string, columns: string[]): Promise<void>
  
  // Health Check
  healthCheck(): Promise<{ healthy: boolean; latency: number; error?: string }>
}

/**
 * Authentication Provider Interface
 */
export interface AuthProvider {
  // User Management
  signUp(email: string, password: string, metadata?: any): Promise<AuthUser>
  signIn(email: string, password: string): Promise<AuthSession>
  signOut(): Promise<void>
  
  // Session Management
  getCurrentUser(): Promise<AuthUser | null>
  getCurrentSession(): Promise<AuthSession | null>
  refreshSession(): Promise<AuthSession>
  
  // Password Management
  resetPassword(email: string): Promise<void>
  updatePassword(newPassword: string): Promise<void>
  
  // Email Verification
  verifyEmail(token: string): Promise<void>
  resendVerification(email: string): Promise<void>
}

/**
 * Storage Provider Interface
 */
export interface StorageProvider {
  // File Operations
  upload(bucket: string, path: string, file: File | Buffer): Promise<{ path: string; url?: string }>
  download(bucket: string, path: string): Promise<Buffer>
  delete(bucket: string, path: string): Promise<void>
  
  // URL Generation
  getPublicUrl(bucket: string, path: string): string
  getSignedUrl(bucket: string, path: string, options?: StorageOptions): Promise<string>
  
  // Bucket Management
  createBucket(name: string, options?: { public?: boolean }): Promise<void>
  listFiles(bucket: string, prefix?: string): Promise<StorageFile[]>
}

/**
 * Multi-Tenant Security Interface
 */
export interface SecurityProvider {
  // Tenant Access Control
  enforceClientAccess(userId: string, clientId: string): Promise<boolean>
  getUserClientIds(userId: string): Promise<string[]>
  getUserRoleInClient(userId: string, clientId: string): Promise<string | null>
  
  // Query Filtering
  addClientFilter(query: string, userId: string): Promise<string>
  validateClientAccess(userId: string, resourceClientId: string): Promise<void>
  
  // Role-Based Access
  hasRequiredRole(userRole: string, requiredRole: string | string[]): boolean
  canPerformAction(userId: string, clientId: string, action: string): Promise<boolean>
}

/**
 * Migration Provider Interface
 */
export interface MigrationProvider {
  // Schema Migration
  exportSchema(): Promise<SchemaDefinition>
  importSchema(schema: SchemaDefinition): Promise<void>
  
  // Data Migration
  exportData(tables?: string[]): Promise<DataExport>
  importData(data: DataExport): Promise<void>
  
  // Validation
  validateMigration(): Promise<ValidationResult>
  generateMigrationReport(): Promise<MigrationReport>
}

// Supporting Types
export interface AuthUser {
  id: string
  email: string
  email_confirmed_at?: string
  last_sign_in_at?: string
  created_at: string
  updated_at: string
  user_metadata?: any
  app_metadata?: any
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_in: number
  expires_at: number
  user: AuthUser
}

export interface TransactionContext {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>
  queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>
  rollback(): Promise<void>
}

export interface TableSchema {
  columns: ColumnDefinition[]
  primaryKey: string[]
  foreignKeys?: ForeignKeyDefinition[]
  indexes?: IndexDefinition[]
  constraints?: ConstraintDefinition[]
}

export interface ColumnDefinition {
  name: string
  type: string
  nullable?: boolean
  default?: any
  unique?: boolean
}

export interface ForeignKeyDefinition {
  columns: string[]
  referencedTable: string
  referencedColumns: string[]
  onDelete?: 'CASCADE' | 'RESTRICT' | 'SET NULL'
  onUpdate?: 'CASCADE' | 'RESTRICT' | 'SET NULL'
}

export interface IndexDefinition {
  name: string
  columns: string[]
  unique?: boolean
  type?: 'BTREE' | 'HASH' | 'GIN' | 'GIST'
}

export interface ConstraintDefinition {
  name: string
  type: 'CHECK' | 'UNIQUE' | 'NOT NULL'
  definition: string
}

export interface StorageFile {
  name: string
  size: number
  lastModified: Date
  metadata?: any
}

export interface SchemaDefinition {
  tables: { [tableName: string]: TableSchema }
  functions?: string[]
  triggers?: string[]
  version: string
}

export interface DataExport {
  tables: { [tableName: string]: any[] }
  metadata: {
    exportedAt: string
    version: string
    totalRows: number
  }
}

export interface ValidationResult {
  success: boolean
  errors: string[]
  warnings: string[]
  rowCounts: { [tableName: string]: { source: number; target: number } }
}

export interface MigrationReport {
  summary: {
    tablesCreated: number
    dataRowsMigrated: number
    errorsEncountered: number
    migrationTime: number
  }
  details: {
    tables: { [tableName: string]: { status: 'success' | 'error'; message?: string } }
    data: { [tableName: string]: { rowsMigrated: number; errors: string[] } }
  }
}

/**
 * Provider Factory Interface
 */
export interface ProviderFactory {
  createDatabaseProvider(config: DatabaseProviderConfig): DatabaseProvider
  createAuthProvider(config: AuthProviderConfig): AuthProvider
  createStorageProvider(config: StorageProviderConfig): StorageProvider
  createSecurityProvider(config: SecurityProviderConfig): SecurityProvider
}

export interface DatabaseProviderConfig {
  type: 'supabase' | 'postgresql' | 'mysql' | 'sqlite'
  connection: DatabaseConnection
  options?: {
    ssl?: boolean
    poolSize?: number
    timeout?: number
    retries?: number
  }
}

export interface AuthProviderConfig {
  type: 'supabase' | 'auth0' | 'firebase' | 'cognito' | 'custom'
  credentials: {
    clientId?: string
    clientSecret?: string
    domain?: string
    apiKey?: string
  }
  options?: {
    session?: {
      cookieName?: string
      maxAge?: number
    }
    redirectUrls?: {
      signIn?: string
      signOut?: string
      error?: string
    }
  }
}

export interface StorageProviderConfig {
  type: 'supabase' | 's3' | 'gcs' | 'azure' | 'cloudinary'
  credentials: {
    accessKey?: string
    secretKey?: string
    region?: string
    bucket?: string
  }
  options?: {
    cdn?: string
    publicAccess?: boolean
    encryption?: boolean
  }
}

export interface SecurityProviderConfig {
  type: 'rls' | 'application' | 'hybrid'
  database: DatabaseProvider
  options?: {
    cacheTimeout?: number
    strictMode?: boolean
    auditLog?: boolean
  }
}

/**
 * Repository Pattern Interface for Business Logic
 */
export interface Repository<T> {
  findById(id: string): Promise<T | null>
  findByClientId(clientId: string): Promise<T[]>
  create(data: Partial<T>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
  count(filter?: any): Promise<number>
}

/**
 * Specific Repository Interfaces for JiGR Platform
 */
export interface ClientRepository extends Repository<Client> {
  findByUserId(userId: string): Promise<Client[]>
  findBySubscriptionStatus(status: string): Promise<Client[]>
}

export interface DeliveryRecordRepository extends Repository<DeliveryRecord> {
  findBySupplier(clientId: string, supplierName: string): Promise<DeliveryRecord[]>
  findByDateRange(clientId: string, startDate: Date, endDate: Date): Promise<DeliveryRecord[]>
  findWithAlerts(clientId: string): Promise<DeliveryRecord[]>
}

export interface UserRepository extends Repository<User> {
  findByEmail(email: string): Promise<User | null>
  findByClientId(clientId: string): Promise<User[]>
  createWithClient(userData: Partial<User>, clientId: string, role: string): Promise<User>
}

// Domain Models
export interface Client {
  id: string
  name: string
  subscription_status: string
  subscription_tier: string
  created_at: string
  updated_at: string
}

export interface DeliveryRecord {
  id: string
  client_id: string
  supplier_name: string
  delivery_date: string
  image_path: string
  processing_status: string
  created_at: string
}

export interface User {
  id: string
  email: string
  full_name?: string
  created_at: string
  updated_at: string
}

export interface ClientUser {
  id: string
  user_id: string
  client_id: string
  role: string
  status: string
  created_at: string
}