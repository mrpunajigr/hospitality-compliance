/**
 * Supabase Database Provider Implementation
 * 
 * This wraps the existing Supabase functionality into the provider interface,
 * maintaining backward compatibility while enabling provider abstraction.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import type {
  DatabaseProvider,
  AuthProvider,
  StorageProvider,
  SecurityProvider,
  QueryOptions,
  TransactionOptions,
  TransactionContext,
  TableSchema,
  AuthUser,
  AuthSession,
  StorageOptions,
  StorageFile,
  DatabaseConnection
} from './database-provider-interface'

export class SupabaseProvider implements DatabaseProvider, AuthProvider, StorageProvider, SecurityProvider {
  private client: SupabaseClient
  private adminClient: SupabaseClient | null = null
  private connected: boolean = false

  constructor(private config: {
    url: string
    anonKey: string
    serviceKey?: string
    options?: any
  }) {
    // Create regular client
    this.client = createBrowserClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'hospitality-compliance-auth'
      },
      ...config.options
    })

    // Create admin client if service key provided
    if (config.serviceKey) {
      this.adminClient = createClient(config.url, config.serviceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    }
  }

  // =============================================================================
  // DATABASE PROVIDER IMPLEMENTATION
  // =============================================================================

  async connect(): Promise<void> {
    try {
      // Test connection with a simple query
      const { error } = await this.client.from('clients').select('count', { count: 'exact' }).limit(0)
      if (error) throw error
      this.connected = true
    } catch (error) {
      this.connected = false
      throw new Error(`Supabase connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async disconnect(): Promise<void> {
    // Supabase handles connection pooling automatically
    this.connected = false
  }

  isConnected(): boolean {
    return this.connected
  }

  async query<T = any>(sql: string, params?: any[], options?: QueryOptions): Promise<T[]> {
    // Note: Supabase doesn't support raw SQL queries directly
    // This would need to be implemented using the query builder or RPC functions
    throw new Error('Raw SQL queries not supported in Supabase. Use the query builder methods instead.')
  }

  async queryOne<T = any>(sql: string, params?: any[], options?: QueryOptions): Promise<T | null> {
    const results = await this.query<T>(sql, params, options)
    return results.length > 0 ? results[0] : null
  }

  async transaction<T>(
    callback: (tx: TransactionContext) => Promise<T>,
    options?: TransactionOptions
  ): Promise<T> {
    // Supabase doesn't support explicit transactions in the browser
    // This would need to be implemented using RPC functions or handled at the application level
    throw new Error('Explicit transactions not supported in Supabase browser client. Use RPC functions instead.')
  }

  async createTable(tableName: string, schema: TableSchema): Promise<void> {
    throw new Error('Schema operations not supported in Supabase browser client. Use migrations instead.')
  }

  async dropTable(tableName: string): Promise<void> {
    throw new Error('Schema operations not supported in Supabase browser client. Use migrations instead.')
  }

  async createIndex(tableName: string, indexName: string, columns: string[]): Promise<void> {
    throw new Error('Schema operations not supported in Supabase browser client. Use migrations instead.')
  }

  async healthCheck(): Promise<{ healthy: boolean; latency: number; error?: string }> {
    const startTime = Date.now()
    try {
      await this.client.from('clients').select('count', { count: 'exact' }).limit(0)
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
  // AUTH PROVIDER IMPLEMENTATION
  // =============================================================================

  async signUp(email: string, password: string, metadata?: any): Promise<AuthUser> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })

    if (error) throw new Error(`Sign up failed: ${error.message}`)
    if (!data.user) throw new Error('No user returned from sign up')

    return this.mapSupabaseUser(data.user)
  }

  async signIn(email: string, password: string): Promise<AuthSession> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw new Error(`Sign in failed: ${error.message}`)
    if (!data.session || !data.user) throw new Error('No session returned from sign in')

    return this.mapSupabaseSession(data.session, data.user)
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut()
    if (error) throw new Error(`Sign out failed: ${error.message}`)
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user }, error } = await this.client.auth.getUser()
    if (error) return null
    return user ? this.mapSupabaseUser(user) : null
  }

  async getCurrentSession(): Promise<AuthSession | null> {
    const { data: { session }, error } = await this.client.auth.getSession()
    if (error || !session) return null
    return this.mapSupabaseSession(session, session.user)
  }

  async refreshSession(): Promise<AuthSession> {
    const { data, error } = await this.client.auth.refreshSession()
    if (error || !data.session) throw new Error(`Session refresh failed: ${error?.message || 'No session'}`)
    return this.mapSupabaseSession(data.session, data.user)
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(email)
    if (error) throw new Error(`Password reset failed: ${error.message}`)
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await this.client.auth.updateUser({ password: newPassword })
    if (error) throw new Error(`Password update failed: ${error.message}`)
  }

  async verifyEmail(token: string): Promise<void> {
    const { error } = await this.client.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    })
    if (error) throw new Error(`Email verification failed: ${error.message}`)
  }

  async resendVerification(email: string): Promise<void> {
    const { error } = await this.client.auth.resend({
      type: 'signup',
      email
    })
    if (error) throw new Error(`Verification resend failed: ${error.message}`)
  }

  // =============================================================================
  // STORAGE PROVIDER IMPLEMENTATION
  // =============================================================================

  async upload(bucket: string, path: string, file: File | Buffer): Promise<{ path: string; url?: string }> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true
      })

    if (error) throw new Error(`Upload failed: ${error.message}`)
    if (!data) throw new Error('No data returned from upload')

    const url = this.getPublicUrl(bucket, data.path)
    return { path: data.path, url }
  }

  async download(bucket: string, path: string): Promise<Buffer> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .download(path)

    if (error) throw new Error(`Download failed: ${error.message}`)
    if (!data) throw new Error('No data returned from download')

    return Buffer.from(await data.arrayBuffer())
  }

  async delete(bucket: string, path: string): Promise<void> {
    const { error } = await this.client.storage
      .from(bucket)
      .remove([path])

    if (error) throw new Error(`Delete failed: ${error.message}`)
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.client.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  async getSignedUrl(bucket: string, path: string, options?: StorageOptions): Promise<string> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .createSignedUrl(path, options?.expiresIn || 3600)

    if (error) throw new Error(`Signed URL generation failed: ${error.message}`)
    if (!data?.signedUrl) throw new Error('No signed URL returned')

    return data.signedUrl
  }

  async createBucket(name: string, options?: { public?: boolean }): Promise<void> {
    const { error } = await this.client.storage.createBucket(name, {
      public: options?.public || false
    })

    if (error) throw new Error(`Bucket creation failed: ${error.message}`)
  }

  async listFiles(bucket: string, prefix?: string): Promise<StorageFile[]> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .list(prefix || '', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (error) throw new Error(`File listing failed: ${error.message}`)
    if (!data) return []

    return data.map(file => ({
      name: file.name,
      size: file.metadata?.size || 0,
      lastModified: new Date(file.updated_at || file.created_at),
      metadata: file.metadata
    }))
  }

  // =============================================================================
  // SECURITY PROVIDER IMPLEMENTATION
  // =============================================================================

  async enforceClientAccess(userId: string, clientId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('client_users')
      .select('id')
      .eq('user_id', userId)
      .eq('client_id', clientId)
      .eq('status', 'active')
      .single()

    return !error && !!data
  }

  async getUserClientIds(userId: string): Promise<string[]> {
    const { data, error } = await this.client
      .from('client_users')
      .select('client_id')
      .eq('user_id', userId)
      .eq('status', 'active')

    if (error) {
      console.error('Error fetching user client IDs:', error)
      return []
    }

    return (data || []).map(row => row.client_id)
  }

  async getUserRoleInClient(userId: string, clientId: string): Promise<string | null> {
    const { data, error } = await this.client
      .from('client_users')
      .select('role')
      .eq('user_id', userId)
      .eq('client_id', clientId)
      .eq('status', 'active')
      .single()

    if (error) return null
    return data?.role || null
  }

  async addClientFilter(query: string, userId: string): Promise<string> {
    // This would add WHERE clause for client filtering
    // In Supabase, this is handled by RLS policies automatically
    return query
  }

  async validateClientAccess(userId: string, resourceClientId: string): Promise<void> {
    const hasAccess = await this.enforceClientAccess(userId, resourceClientId)
    if (!hasAccess) {
      throw new Error('Access denied: User does not have access to this client')
    }
  }

  hasRequiredRole(userRole: string, requiredRole: string | string[]): boolean {
    const roleHierarchy: { [key: string]: number } = {
      'STAFF': 1,
      'SUPERVISOR': 2,
      'MANAGER': 3,
      'OWNER': 4
    }

    const userLevel = roleHierarchy[userRole] || 0
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    
    return requiredRoles.some(role => userLevel >= (roleHierarchy[role] || 0))
  }

  async canPerformAction(userId: string, clientId: string, action: string): Promise<boolean> {
    const userRole = await this.getUserRoleInClient(userId, clientId)
    if (!userRole) return false

    // Define action permissions
    const actionPermissions: { [key: string]: string[] } = {
      'view_deliveries': ['STAFF', 'SUPERVISOR', 'MANAGER', 'OWNER'],
      'create_deliveries': ['STAFF', 'SUPERVISOR', 'MANAGER', 'OWNER'],
      'manage_team': ['MANAGER', 'OWNER'],
      'manage_settings': ['OWNER'],
      'export_data': ['SUPERVISOR', 'MANAGER', 'OWNER']
    }

    const requiredRoles = actionPermissions[action] || []
    return this.hasRequiredRole(userRole, requiredRoles)
  }

  // =============================================================================
  // BUSINESS LOGIC METHODS (MAINTAINING COMPATIBILITY)
  // =============================================================================

  // These methods maintain compatibility with existing DatabaseHelpers
  async getUserClients(userId: string) {
    const { data, error } = await this.client
      .from('client_users')
      .select(`
        client_id,
        role,
        status,
        clients (
          id,
          name,
          subscription_status,
          subscription_tier
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')

    if (error) {
      console.error('Error fetching user clients:', error)
      return []
    }

    return data || []
  }

  async getDeliveryRecords(clientId: string, limit = 50) {
    const { data, error } = await this.client
      .from('delivery_records')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching delivery records:', error)
      return []
    }

    return data || []
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
    const { data, error } = await this.client
      .from('delivery_records')
      .insert({
        client_id: record.clientId,
        user_id: record.userId,
        supplier_id: record.supplierId,
        supplier_name: record.supplierName,
        image_path: record.imagePath,
        docket_number: record.docketNumber,
        delivery_date: record.deliveryDate,
        processing_status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating delivery record:', error)
      return null
    }

    return data
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private mapSupabaseUser(user: any): AuthUser {
    return {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
      user_metadata: user.user_metadata,
      app_metadata: user.app_metadata
    }
  }

  private mapSupabaseSession(session: any, user: any): AuthSession {
    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: session.expires_in,
      expires_at: session.expires_at,
      user: this.mapSupabaseUser(user)
    }
  }

  // Get the underlying Supabase client for compatibility
  getClient(): SupabaseClient {
    return this.client
  }

  getAdminClient(): SupabaseClient | null {
    return this.adminClient
  }
}

/**
 * Factory function to create Supabase provider
 */
export function createSupabaseProvider(config: {
  url: string
  anonKey: string
  serviceKey?: string
  options?: any
}): SupabaseProvider {
  return new SupabaseProvider(config)
}

/**
 * Compatibility layer - maintains existing exports
 */
export function createSupabaseCompatibilityLayer(provider: SupabaseProvider) {
  return {
    supabase: provider.getClient(),
    supabaseAdmin: provider.getAdminClient(),
    
    // Re-export all the existing methods
    getUserClients: provider.getUserClients.bind(provider),
    hasClientAccess: provider.enforceClientAccess.bind(provider),
    getUserClientRole: provider.getUserRoleInClient.bind(provider),
    getDeliveryRecords: provider.getDeliveryRecords.bind(provider),
    createDeliveryRecord: provider.createDeliveryRecord.bind(provider),
    
    // Storage methods
    getDeliveryDocketSignedUrl: provider.getSignedUrl.bind(provider),
    getImageUrl: provider.getPublicUrl.bind(provider),
    
    // Auth methods
    signUp: provider.signUp.bind(provider),
    signIn: provider.signIn.bind(provider),
    signOut: provider.signOut.bind(provider),
    getCurrentUser: provider.getCurrentUser.bind(provider),
    getCurrentSession: provider.getCurrentSession.bind(provider),
    
    // Constants
    STORAGE_BUCKET: 'bar-images',
    DELIVERY_DOCKETS_BUCKET: 'delivery-dockets'
  }
}