/**
 * Database Core Module - Type Definitions
 * Centralized type definitions for database operations
 * 
 * SAFETY: This creates NEW type definitions - ZERO RISK to existing code
 */

// Re-export existing database types for backward compatibility
export type { Database } from '@/types/database'

// =============================================================================
// DATABASE CONFIGURATION
// =============================================================================

export interface DatabaseCoreConfig {
  // Connection settings
  connectionTimeout: number
  requestTimeout: number
  maxRetries: number
  retryDelay: number
  
  // Connection pooling
  maxConnections: number
  minConnections: number
  acquireTimeout: number
  
  // Query optimization
  enableQueryCache: boolean
  cacheTimeout: number
  maxCacheSize: number
  
  // Security
  enableRLS: boolean
  requireAuth: boolean
  enableAuditLogging: boolean
  
  // Storage
  enableStorage: boolean
  defaultBucket: string
  maxFileSize: number
  allowedFileTypes: string[]
  
  // Demo mode support
  enableDemoMode: boolean
  demoClientId: string
  fallbackToPlaceholders: boolean
}

// =============================================================================
// QUERY INTERFACES
// =============================================================================

export interface QueryOptions {
  timeout?: number
  retries?: number
  useCache?: boolean
  cacheKey?: string
  abortSignal?: AbortSignal
}

export interface QueryResult<T = any> {
  data: T | null
  error: DatabaseError | null
  count?: number | null
  status: 'success' | 'error' | 'timeout'
  executionTime?: number
  fromCache?: boolean
}

export interface DatabaseError {
  message: string
  code?: string
  details?: any
  hint?: string
  statusCode?: number
  isRetryable?: boolean
}

export interface TableQuery<T = any> {
  select(columns?: string | string[]): TableQuery<T>
  insert(values: Partial<T> | Partial<T>[]): TableQuery<T>
  update(values: Partial<T>): TableQuery<T>
  delete(): TableQuery<T>
  eq(column: keyof T, value: any): TableQuery<T>
  neq(column: keyof T, value: any): TableQuery<T>
  gt(column: keyof T, value: any): TableQuery<T>
  gte(column: keyof T, value: any): TableQuery<T>
  lt(column: keyof T, value: any): TableQuery<T>
  lte(column: keyof T, value: any): TableQuery<T>
  like(column: keyof T, pattern: string): TableQuery<T>
  ilike(column: keyof T, pattern: string): TableQuery<T>
  in(column: keyof T, values: any[]): TableQuery<T>
  is(column: keyof T, value: any): TableQuery<T>
  order(column: keyof T, options?: { ascending?: boolean }): TableQuery<T>
  range(from: number, to: number): TableQuery<T>
  limit(count: number): TableQuery<T>
  single(): TableQuery<T>
  maybeSingle(): TableQuery<T>
  execute(options?: QueryOptions): Promise<QueryResult<T>>
}

// =============================================================================
// STORAGE INTERFACES
// =============================================================================

export interface StorageOptions {
  bucket?: string
  path?: string
  metadata?: Record<string, any>
  contentType?: string
  cacheControl?: string
  upsert?: boolean
}

export interface SignedUrlOptions {
  expiresIn?: number
  download?: boolean | string
  transform?: {
    width?: number
    height?: number
    resize?: 'cover' | 'contain' | 'fill'
    format?: 'webp' | 'avif' | 'jpeg' | 'png'
    quality?: number
  }
}

export interface StorageResult {
  path?: string
  id?: string
  fullPath?: string
  error?: DatabaseError | null
}

export interface StorageBucket {
  name: string
  public: boolean
  allowedMimeTypes?: string[]
  fileSizeLimit?: number
  createdAt?: string
  updatedAt?: string
}

// =============================================================================
// MODULE CAPABILITIES
// =============================================================================

export interface DatabaseQueryCapability {
  // Table operations
  from<T = any>(table: string): TableQuery<T>
  
  // Raw queries
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>
  
  // Batch operations
  batch<T = any>(queries: Array<() => Promise<QueryResult<T>>>): Promise<QueryResult<T>[]>
  
  // Transactions
  transaction<T = any>(
    queries: (client: DatabaseQueryCapability) => Promise<T>
  ): Promise<QueryResult<T>>
}

export interface DatabaseStorageCapability {
  // File operations
  upload(bucket: string, path: string, file: File | Blob, options?: StorageOptions): Promise<StorageResult>
  download(bucket: string, path: string): Promise<Blob | null>
  delete(bucket: string, path: string): Promise<boolean>
  list(bucket: string, path?: string): Promise<string[]>
  
  // URL generation
  getPublicUrl(bucket: string, path: string): string
  getSignedUrl(bucket: string, path: string, options?: SignedUrlOptions): Promise<string>
  
  // Bucket management
  createBucket(bucket: string, options?: { public?: boolean }): Promise<boolean>
  deleteBucket(bucket: string): Promise<boolean>
  listBuckets(): Promise<StorageBucket[]>
  
  // Demo mode support
  getDemoUrl(path: string, options?: { fallback?: string }): Promise<string>
}

export interface DatabaseSchemaCapability {
  // Schema operations
  createTable(tableName: string, schema: TableSchema): Promise<boolean>
  dropTable(tableName: string): Promise<boolean>
  alterTable(tableName: string, changes: TableChanges): Promise<boolean>
  
  // Index management
  createIndex(tableName: string, columns: string[], options?: IndexOptions): Promise<boolean>
  dropIndex(tableName: string, indexName: string): Promise<boolean>
  
  // Migration support
  runMigration(migration: Migration): Promise<boolean>
  getMigrationStatus(): Promise<Migration[]>
}

export interface DatabaseConnectionCapability {
  // Connection management
  connect(): Promise<boolean>
  disconnect(): Promise<void>
  isConnected(): boolean
  
  // Health monitoring
  ping(): Promise<boolean>
  getConnectionInfo(): ConnectionInfo
  
  // Pool management
  getPoolStatus(): PoolStatus
  resetPool(): Promise<void>
}

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

export interface TableSchema {
  columns: Column[]
  primaryKey?: string[]
  indexes?: Index[]
  constraints?: Constraint[]
  rls?: boolean
}

export interface Column {
  name: string
  type: string
  nullable?: boolean
  defaultValue?: any
  unique?: boolean
  references?: {
    table: string
    column: string
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT'
    onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT'
  }
}

export interface Index {
  name: string
  columns: string[]
  unique?: boolean
  type?: 'btree' | 'hash' | 'gin' | 'gist'
}

export interface Constraint {
  name: string
  type: 'CHECK' | 'UNIQUE' | 'FOREIGN_KEY'
  definition: string
}

export interface TableChanges {
  addColumns?: Column[]
  dropColumns?: string[]
  alterColumns?: { name: string; changes: Partial<Column> }[]
  addIndexes?: Index[]
  dropIndexes?: string[]
}

export interface IndexOptions {
  unique?: boolean
  type?: 'btree' | 'hash' | 'gin' | 'gist'
  concurrently?: boolean
}

export interface Migration {
  id: string
  name: string
  version: string
  sql: string
  appliedAt?: string
  checksum?: string
}

// =============================================================================
// CONNECTION INFORMATION
// =============================================================================

export interface ConnectionInfo {
  host: string
  database: string
  user: string
  ssl: boolean
  connected: boolean
  version?: string
  timezone?: string
}

export interface PoolStatus {
  total: number
  active: number
  idle: number
  waiting: number
  maxConnections: number
  minConnections: number
}

// =============================================================================
// MODULE EVENTS
// =============================================================================

export interface DatabaseEvents {
  // Connection events
  'connection:established': { connectionInfo: ConnectionInfo }
  'connection:lost': { error: DatabaseError }
  'connection:restored': { connectionInfo: ConnectionInfo }
  
  // Query events
  'query:started': { table?: string; operation: string; queryId: string }
  'query:completed': { queryId: string; executionTime: number; rowCount?: number }
  'query:failed': { queryId: string; error: DatabaseError }
  
  // Storage events
  'storage:upload-started': { bucket: string; path: string; size: number }
  'storage:upload-completed': { bucket: string; path: string; url?: string }
  'storage:upload-failed': { bucket: string; path: string; error: DatabaseError }
  
  // Schema events
  'schema:migration-started': { migrationId: string; version: string }
  'schema:migration-completed': { migrationId: string; version: string }
  'schema:migration-failed': { migrationId: string; error: DatabaseError }
  
  // Performance events
  'performance:slow-query': { query: string; executionTime: number; threshold: number }
  'performance:connection-pool-exhausted': { poolStatus: PoolStatus }
  
  // Security events
  'security:rls-policy-violated': { table: string; userId?: string; policy: string }
  'security:unauthorized-access': { table: string; operation: string; userId?: string }
}