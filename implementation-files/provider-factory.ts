/**
 * Database Provider Factory
 * 
 * Central factory for creating database, auth, storage, and security providers
 * based on configuration. Enables easy switching between providers.
 */

import type {
  DatabaseProvider,
  AuthProvider,
  StorageProvider,
  SecurityProvider,
  ProviderFactory,
  DatabaseProviderConfig,
  AuthProviderConfig,
  StorageProviderConfig,
  SecurityProviderConfig
} from './database-provider-interface'

import { SupabaseProvider, createSupabaseProvider } from './supabase-provider'
import { PostgreSQLProvider, createPostgreSQLProvider } from './postgresql-provider'
import { ApplicationSecurityProvider } from './application-security-provider'
import { S3StorageProvider } from './s3-storage-provider'
import { Auth0Provider } from './auth0-provider'

/**
 * Main Provider Factory Implementation
 */
export class DatabaseProviderFactory implements ProviderFactory {
  
  createDatabaseProvider(config: DatabaseProviderConfig): DatabaseProvider {
    switch (config.type) {
      case 'supabase':
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          throw new Error('Supabase configuration missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
        }
        
        return createSupabaseProvider({
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          options: config.options
        })

      case 'postgresql':
        return createPostgreSQLProvider({
          host: config.connection.host,
          port: config.connection.port,
          database: config.connection.database,
          username: config.connection.username,
          password: config.connection.password,
          ssl: config.options?.ssl || false,
          poolSize: config.options?.poolSize || 20,
          connectionTimeoutMs: config.options?.timeout || 10000
        })

      case 'mysql':
        // Future implementation
        throw new Error('MySQL provider not yet implemented')

      case 'sqlite':
        // Future implementation
        throw new Error('SQLite provider not yet implemented')

      default:
        throw new Error(`Unsupported database provider: ${config.type}`)
    }
  }

  createAuthProvider(config: AuthProviderConfig): AuthProvider {
    switch (config.type) {
      case 'supabase':
        // Auth is handled by the Supabase provider itself
        const dbProvider = this.createDatabaseProvider({
          type: 'supabase',
          connection: {} as any // Not used for Supabase
        })
        return dbProvider as SupabaseProvider

      case 'auth0':
        return new Auth0Provider({
          domain: config.credentials.domain!,
          clientId: config.credentials.clientId!,
          clientSecret: config.credentials.clientSecret!,
          options: config.options
        })

      case 'firebase':
        // Future implementation
        throw new Error('Firebase auth provider not yet implemented')

      case 'cognito':
        // Future implementation
        throw new Error('AWS Cognito auth provider not yet implemented')

      case 'custom':
        // Future implementation
        throw new Error('Custom auth provider not yet implemented')

      default:
        throw new Error(`Unsupported auth provider: ${config.type}`)
    }
  }

  createStorageProvider(config: StorageProviderConfig): StorageProvider {
    switch (config.type) {
      case 'supabase':
        // Storage is handled by the Supabase provider itself
        const dbProvider = this.createDatabaseProvider({
          type: 'supabase',
          connection: {} as any // Not used for Supabase
        })
        return dbProvider as SupabaseProvider

      case 's3':
        return new S3StorageProvider({
          accessKeyId: config.credentials.accessKey!,
          secretAccessKey: config.credentials.secretKey!,
          region: config.credentials.region!,
          bucket: config.credentials.bucket!,
          options: config.options
        })

      case 'gcs':
        // Future implementation
        throw new Error('Google Cloud Storage provider not yet implemented')

      case 'azure':
        // Future implementation
        throw new Error('Azure Blob Storage provider not yet implemented')

      case 'cloudinary':
        // Future implementation
        throw new Error('Cloudinary provider not yet implemented')

      default:
        throw new Error(`Unsupported storage provider: ${config.type}`)
    }
  }

  createSecurityProvider(config: SecurityProviderConfig): SecurityProvider {
    switch (config.type) {
      case 'rls':
        // RLS is handled by the database provider itself (Supabase)
        return config.database as SecurityProvider

      case 'application':
        return new ApplicationSecurityProvider(config.database, config.options)

      case 'hybrid':
        // Combination of RLS and application-level security
        return new HybridSecurityProvider(config.database, config.options)

      default:
        throw new Error(`Unsupported security provider: ${config.type}`)
    }
  }
}

/**
 * Configuration Builder - Helps create provider configurations
 */
export class ProviderConfigBuilder {
  
  static supabase(options?: any): DatabaseProviderConfig {
    return {
      type: 'supabase',
      connection: {} as any, // Not used for Supabase
      options
    }
  }

  static postgresql(connection: {
    host: string
    port: number
    database: string
    username: string
    password: string
  }, options?: {
    ssl?: boolean
    poolSize?: number
    timeout?: number
  }): DatabaseProviderConfig {
    return {
      type: 'postgresql',
      connection,
      options
    }
  }

  static awsRds(config: {
    host: string
    database: string
    username: string
    password: string
    port?: number
  }): DatabaseProviderConfig {
    return this.postgresql({
      host: config.host,
      port: config.port || 5432,
      database: config.database,
      username: config.username,
      password: config.password
    }, {
      ssl: true,
      poolSize: 20
    })
  }

  static googleCloudSql(config: {
    connectionName: string
    database: string
    username: string
    password: string
  }): DatabaseProviderConfig {
    return this.postgresql({
      host: `/cloudsql/${config.connectionName}`,
      port: 5432,
      database: config.database,
      username: config.username,
      password: config.password
    }, {
      ssl: true,
      poolSize: 20
    })
  }

  static azureDatabase(config: {
    server: string
    database: string
    username: string
    password: string
    port?: number
  }): DatabaseProviderConfig {
    return this.postgresql({
      host: config.server,
      port: config.port || 5432,
      database: config.database,
      username: config.username,
      password: config.password
    }, {
      ssl: true,
      poolSize: 20
    })
  }
}

/**
 * Provider Registry - Manages provider instances
 */
export class ProviderRegistry {
  private static instances = new Map<string, any>()
  private static factory = new DatabaseProviderFactory()

  static getInstance<T>(key: string, factory: () => T): T {
    if (!this.instances.has(key)) {
      this.instances.set(key, factory())
    }
    return this.instances.get(key) as T
  }

  static getDatabaseProvider(config?: DatabaseProviderConfig): DatabaseProvider {
    const key = 'database'
    return this.getInstance(key, () => {
      if (config) {
        return this.factory.createDatabaseProvider(config)
      }
      
      // Default to environment-based configuration
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        return this.factory.createDatabaseProvider(ProviderConfigBuilder.supabase())
      }
      
      throw new Error('No database configuration found')
    })
  }

  static getAuthProvider(config?: AuthProviderConfig): AuthProvider {
    const key = 'auth'
    return this.getInstance(key, () => {
      if (config) {
        return this.factory.createAuthProvider(config)
      }
      
      // Default to environment-based configuration
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        return this.factory.createAuthProvider({
          type: 'supabase',
          credentials: {}
        })
      }
      
      throw new Error('No auth configuration found')
    })
  }

  static getStorageProvider(config?: StorageProviderConfig): StorageProvider {
    const key = 'storage'
    return this.getInstance(key, () => {
      if (config) {
        return this.factory.createStorageProvider(config)
      }
      
      // Default to environment-based configuration
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        return this.factory.createStorageProvider({
          type: 'supabase',
          credentials: {}
        })
      }
      
      throw new Error('No storage configuration found')
    })
  }

  static getSecurityProvider(config?: SecurityProviderConfig): SecurityProvider {
    const key = 'security'
    return this.getInstance(key, () => {
      if (config) {
        return this.factory.createSecurityProvider(config)
      }
      
      // Default to RLS-based security (Supabase)
      const dbProvider = this.getDatabaseProvider()
      return this.factory.createSecurityProvider({
        type: 'rls',
        database: dbProvider
      })
    })
  }

  static clear(): void {
    this.instances.clear()
  }
}

/**
 * Environment-based Provider Detection
 */
export class EnvironmentProviderDetector {
  
  static detectDatabaseProvider(): DatabaseProviderConfig {
    // Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return ProviderConfigBuilder.supabase()
    }
    
    // AWS RDS
    if (process.env.AWS_DB_HOST) {
      return ProviderConfigBuilder.awsRds({
        host: process.env.AWS_DB_HOST,
        database: process.env.AWS_DB_NAME || 'jigr_platform',
        username: process.env.AWS_DB_USER || 'postgres',
        password: process.env.AWS_DB_PASSWORD || '',
        port: parseInt(process.env.AWS_DB_PORT || '5432')
      })
    }
    
    // Google Cloud SQL
    if (process.env.GOOGLE_CLOUD_SQL_CONNECTION_NAME) {
      return ProviderConfigBuilder.googleCloudSql({
        connectionName: process.env.GOOGLE_CLOUD_SQL_CONNECTION_NAME,
        database: process.env.GOOGLE_CLOUD_SQL_DATABASE || 'jigr_platform',
        username: process.env.GOOGLE_CLOUD_SQL_USER || 'postgres',
        password: process.env.GOOGLE_CLOUD_SQL_PASSWORD || ''
      })
    }
    
    // Standard PostgreSQL
    if (process.env.DATABASE_URL) {
      const url = new URL(process.env.DATABASE_URL)
      return ProviderConfigBuilder.postgresql({
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        database: url.pathname.slice(1),
        username: url.username,
        password: url.password
      })
    }
    
    throw new Error('No database configuration detected in environment')
  }

  static detectAuthProvider(): AuthProviderConfig {
    // Supabase Auth
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return {
        type: 'supabase',
        credentials: {}
      }
    }
    
    // Auth0
    if (process.env.AUTH0_DOMAIN) {
      return {
        type: 'auth0',
        credentials: {
          domain: process.env.AUTH0_DOMAIN,
          clientId: process.env.AUTH0_CLIENT_ID || '',
          clientSecret: process.env.AUTH0_CLIENT_SECRET || ''
        }
      }
    }
    
    throw new Error('No auth configuration detected in environment')
  }

  static detectStorageProvider(): StorageProviderConfig {
    // Supabase Storage
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return {
        type: 'supabase',
        credentials: {}
      }
    }
    
    // AWS S3
    if (process.env.AWS_ACCESS_KEY_ID) {
      return {
        type: 's3',
        credentials: {
          accessKey: process.env.AWS_ACCESS_KEY_ID,
          secretKey: process.env.AWS_SECRET_ACCESS_KEY || '',
          region: process.env.AWS_REGION || 'us-east-1',
          bucket: process.env.AWS_S3_BUCKET || 'jigr-storage'
        }
      }
    }
    
    throw new Error('No storage configuration detected in environment')
  }
}

/**
 * Convenience functions for common use cases
 */
export const createProviders = {
  // Current production setup (Supabase)
  production: () => ({
    database: ProviderRegistry.getDatabaseProvider(ProviderConfigBuilder.supabase()),
    auth: ProviderRegistry.getAuthProvider({ type: 'supabase', credentials: {} }),
    storage: ProviderRegistry.getStorageProvider({ type: 'supabase', credentials: {} }),
    security: ProviderRegistry.getSecurityProvider({ type: 'rls', database: ProviderRegistry.getDatabaseProvider() })
  }),

  // AWS RDS migration target
  awsRds: (config: { host: string; database: string; username: string; password: string }) => ({
    database: ProviderRegistry.getDatabaseProvider(ProviderConfigBuilder.awsRds(config)),
    auth: ProviderRegistry.getAuthProvider({ type: 'auth0', credentials: { domain: '', clientId: '', clientSecret: '' } }),
    storage: ProviderRegistry.getStorageProvider({ type: 's3', credentials: { accessKey: '', secretKey: '', region: '', bucket: '' } }),
    security: ProviderRegistry.getSecurityProvider({ type: 'application', database: ProviderRegistry.getDatabaseProvider() })
  }),

  // Auto-detect from environment
  fromEnvironment: () => ({
    database: ProviderRegistry.getDatabaseProvider(EnvironmentProviderDetector.detectDatabaseProvider()),
    auth: ProviderRegistry.getAuthProvider(EnvironmentProviderDetector.detectAuthProvider()),
    storage: ProviderRegistry.getStorageProvider(EnvironmentProviderDetector.detectStorageProvider()),
    security: ProviderRegistry.getSecurityProvider({ type: 'application', database: ProviderRegistry.getDatabaseProvider() })
  })
}

// Export factory instance
export const providerFactory = new DatabaseProviderFactory()

// Export default registry for convenience
export default ProviderRegistry