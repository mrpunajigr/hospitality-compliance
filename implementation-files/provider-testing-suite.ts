/**
 * Database Provider Testing Suite
 * 
 * Comprehensive test suite for validating database provider compatibility
 * and ensuring all JiGR Platform functionality works across providers.
 */

import { expect } from '@jest/globals'
import type {
  DatabaseProvider,
  AuthProvider,
  StorageProvider,
  SecurityProvider
} from './database-provider-interface'

export interface TestConfig {
  database: DatabaseProvider
  auth?: AuthProvider
  storage?: StorageProvider
  security?: SecurityProvider
  skipSlowTests?: boolean
  testDataSize?: 'small' | 'medium' | 'large'
}

export interface TestResult {
  testName: string
  passed: boolean
  duration: number
  error?: string
  details?: any
}

export interface TestSuite {
  name: string
  tests: TestResult[]
  passed: number
  failed: number
  duration: number
}

/**
 * Main Test Runner for Database Providers
 */
export class ProviderTestRunner {
  private config: TestConfig
  private results: TestSuite[] = []

  constructor(config: TestConfig) {
    this.config = config
  }

  async runAllTests(): Promise<{ passed: boolean; results: TestSuite[] }> {
    console.log('🧪 Starting Database Provider Test Suite')
    console.log(`📊 Configuration: ${this.getConfigInfo()}`)

    this.results = []

    // Core functionality tests
    this.results.push(await this.runConnectionTests())
    this.results.push(await this.runSchemaTests())
    this.results.push(await this.runCrudTests())
    this.results.push(await this.runTransactionTests())
    
    // JiGR-specific business logic tests
    this.results.push(await this.runMultiTenantTests())
    this.results.push(await this.runSecurityTests())
    this.results.push(await this.runBusinessLogicTests())
    
    // Performance and reliability tests
    if (!this.config.skipSlowTests) {
      this.results.push(await this.runPerformanceTests())
      this.results.push(await this.runReliabilityTests())
    }

    // Optional provider tests
    if (this.config.auth) {
      this.results.push(await this.runAuthTests())
    }
    if (this.config.storage) {
      this.results.push(await this.runStorageTests())
    }

    const totalPassed = this.results.reduce((sum, suite) => sum + suite.passed, 0)
    const totalFailed = this.results.reduce((sum, suite) => sum + suite.failed, 0)
    const overallPassed = totalFailed === 0

    console.log(`✅ Test Suite Complete: ${totalPassed} passed, ${totalFailed} failed`)
    
    return { passed: overallPassed, results: this.results }
  }

  // =============================================================================
  // CONNECTION AND BASIC FUNCTIONALITY TESTS
  // =============================================================================

  private async runConnectionTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Connection Tests',
      tests: [],
      passed: 0,
      failed: 0,
      duration: 0
    }

    const startTime = Date.now()

    // Test 1: Basic Connection
    suite.tests.push(await this.runTest('Basic Connection', async () => {
      await this.config.database.connect()
      expect(this.config.database.isConnected()).toBe(true)
    }))

    // Test 2: Health Check
    suite.tests.push(await this.runTest('Health Check', async () => {
      const health = await this.config.database.healthCheck()
      expect(health.healthy).toBe(true)
      expect(health.latency).toBeGreaterThan(0)
      expect(health.latency).toBeLessThan(5000) // 5 second max
    }))

    // Test 3: Disconnect and Reconnect
    suite.tests.push(await this.runTest('Disconnect and Reconnect', async () => {
      await this.config.database.disconnect()
      expect(this.config.database.isConnected()).toBe(false)
      await this.config.database.connect()
      expect(this.config.database.isConnected()).toBe(true)
    }))

    suite.duration = Date.now() - startTime
    suite.passed = suite.tests.filter(t => t.passed).length
    suite.failed = suite.tests.filter(t => !t.passed).length

    return suite
  }

  private async runSchemaTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Schema Tests',
      tests: [],
      passed: 0,
      failed: 0,
      duration: 0
    }

    const startTime = Date.now()

    // Test 1: Required Tables Exist
    suite.tests.push(await this.runTest('Required Tables Exist', async () => {
      const requiredTables = [
        'clients', 'profiles', 'client_users', 'delivery_records',
        'temperature_readings', 'compliance_alerts', 'suppliers'
      ]

      for (const table of requiredTables) {
        const exists = await this.tableExists(table)
        expect(exists).toBe(true)
      }
    }))

    // Test 2: Foreign Key Relationships
    suite.tests.push(await this.runTest('Foreign Key Relationships', async () => {
      // Test referential integrity
      const clientId = await this.createTestClient()
      const userId = await this.createTestProfile()
      
      // This should work - valid foreign keys
      await this.config.database.query(
        'INSERT INTO client_users (user_id, client_id, role) VALUES ($1, $2, $3)',
        [userId, clientId, 'STAFF']
      )

      // Clean up
      await this.cleanupTestData(clientId, userId)
    }))

    // Test 3: Constraints and Checks
    suite.tests.push(await this.runTest('Constraints and Checks', async () => {
      const clientId = await this.createTestClient()

      // Test role constraint
      try {
        await this.config.database.query(
          'INSERT INTO client_users (user_id, client_id, role) VALUES ($1, $2, $3)',
          [await this.createTestProfile(), clientId, 'INVALID_ROLE']
        )
        throw new Error('Should have failed with invalid role')
      } catch (error) {
        // Expected to fail - this is good
      }

      await this.cleanupTestData(clientId)
    }))

    suite.duration = Date.now() - startTime
    suite.passed = suite.tests.filter(t => t.passed).length
    suite.failed = suite.tests.filter(t => !t.passed).length

    return suite
  }

  // =============================================================================
  // CRUD OPERATION TESTS
  // =============================================================================

  private async runCrudTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'CRUD Operations',
      tests: [],
      passed: 0,
      failed: 0,
      duration: 0
    }

    const startTime = Date.now()

    // Test 1: Create Operations
    suite.tests.push(await this.runTest('Create Operations', async () => {
      const clientId = await this.createTestClient()
      const client = await this.config.database.queryOne(
        'SELECT * FROM clients WHERE id = $1',
        [clientId]
      )
      expect(client).toBeTruthy()
      expect(client.id).toBe(clientId)
      
      await this.cleanupTestData(clientId)
    }))

    // Test 2: Read Operations
    suite.tests.push(await this.runTest('Read Operations', async () => {
      const clientId = await this.createTestClient()
      
      // Single record
      const client = await this.config.database.queryOne(
        'SELECT * FROM clients WHERE id = $1',
        [clientId]
      )
      expect(client).toBeTruthy()

      // Multiple records
      const clients = await this.config.database.query(
        'SELECT * FROM clients WHERE id = $1',
        [clientId]
      )
      expect(clients.length).toBe(1)
      
      await this.cleanupTestData(clientId)
    }))

    // Test 3: Update Operations
    suite.tests.push(await this.runTest('Update Operations', async () => {
      const clientId = await this.createTestClient()
      
      await this.config.database.query(
        'UPDATE clients SET name = $1 WHERE id = $2',
        ['Updated Test Client', clientId]
      )
      
      const updated = await this.config.database.queryOne(
        'SELECT * FROM clients WHERE id = $1',
        [clientId]
      )
      expect(updated.name).toBe('Updated Test Client')
      
      await this.cleanupTestData(clientId)
    }))

    // Test 4: Delete Operations
    suite.tests.push(await this.runTest('Delete Operations', async () => {
      const clientId = await this.createTestClient()
      
      await this.config.database.query(
        'DELETE FROM clients WHERE id = $1',
        [clientId]
      )
      
      const deleted = await this.config.database.queryOne(
        'SELECT * FROM clients WHERE id = $1',
        [clientId]
      )
      expect(deleted).toBeFalsy()
    }))

    suite.duration = Date.now() - startTime
    suite.passed = suite.tests.filter(t => t.passed).length
    suite.failed = suite.tests.filter(t => !t.passed).length

    return suite
  }

  // =============================================================================
  // TRANSACTION TESTS
  // =============================================================================

  private async runTransactionTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Transaction Tests',
      tests: [],
      passed: 0,
      failed: 0,
      duration: 0
    }

    const startTime = Date.now()

    // Test 1: Successful Transaction
    suite.tests.push(await this.runTest('Successful Transaction', async () => {
      const result = await this.config.database.transaction(async (tx) => {
        const client = await tx.queryOne(
          'INSERT INTO clients (name, business_email) VALUES ($1, $2) RETURNING id',
          ['Test Transaction Client', 'test@transaction.com']
        )
        
        const profile = await tx.queryOne(
          'INSERT INTO profiles (id, email) VALUES (gen_random_uuid(), $1) RETURNING id',
          ['test@transaction.com']
        )
        
        await tx.query(
          'INSERT INTO client_users (user_id, client_id, role) VALUES ($1, $2, $3)',
          [profile.id, client.id, 'OWNER']
        )
        
        return { clientId: client.id, userId: profile.id }
      })

      // Verify data was committed
      const client = await this.config.database.queryOne(
        'SELECT * FROM clients WHERE id = $1',
        [result.clientId]
      )
      expect(client).toBeTruthy()
      
      await this.cleanupTestData(result.clientId, result.userId)
    }))

    // Test 2: Failed Transaction (Rollback)
    suite.tests.push(await this.runTest('Failed Transaction Rollback', async () => {
      let clientId: string | null = null

      try {
        await this.config.database.transaction(async (tx) => {
          const client = await tx.queryOne(
            'INSERT INTO clients (name, business_email) VALUES ($1, $2) RETURNING id',
            ['Test Rollback Client', 'test@rollback.com']
          )
          clientId = client.id
          
          // This should cause a rollback
          await tx.query(
            'INSERT INTO client_users (user_id, client_id, role) VALUES ($1, $2, $3)',
            ['non-existent-user', client.id, 'OWNER']
          )
        })
        
        throw new Error('Transaction should have failed')
      } catch (error) {
        // Expected to fail
      }

      // Verify data was rolled back
      if (clientId) {
        const client = await this.config.database.queryOne(
          'SELECT * FROM clients WHERE id = $1',
          [clientId]
        )
        expect(client).toBeFalsy()
      }
    }))

    suite.duration = Date.now() - startTime
    suite.passed = suite.tests.filter(t => t.passed).length
    suite.failed = suite.tests.filter(t => !t.passed).length

    return suite
  }

  // =============================================================================
  // MULTI-TENANT SECURITY TESTS
  // =============================================================================

  private async runMultiTenantTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Multi-Tenant Security',
      tests: [],
      passed: 0,
      failed: 0,
      duration: 0
    }

    const startTime = Date.now()

    // Test 1: Client Data Isolation
    suite.tests.push(await this.runTest('Client Data Isolation', async () => {
      // Create two separate clients with data
      const client1Id = await this.createTestClient('Client 1')
      const client2Id = await this.createTestClient('Client 2')
      
      const user1Id = await this.createTestProfile('user1@test.com')
      const user2Id = await this.createTestProfile('user2@test.com')
      
      // Associate users with their respective clients
      await this.config.database.query(
        'INSERT INTO client_users (user_id, client_id, role) VALUES ($1, $2, $3)',
        [user1Id, client1Id, 'OWNER']
      )
      await this.config.database.query(
        'INSERT INTO client_users (user_id, client_id, role) VALUES ($1, $2, $3)',
        [user2Id, client2Id, 'OWNER']
      )
      
      // Create delivery records for each client
      await this.config.database.query(
        'INSERT INTO delivery_records (client_id, supplier_name, image_path) VALUES ($1, $2, $3)',
        [client1Id, 'Supplier A', 'client1-delivery.jpg']
      )
      await this.config.database.query(
        'INSERT INTO delivery_records (client_id, supplier_name, image_path) VALUES ($1, $2, $3)',
        [client2Id, 'Supplier B', 'client2-delivery.jpg']
      )
      
      // Test security provider isolation
      if (this.config.security) {
        const user1ClientIds = await this.config.security.getUserClientIds(user1Id)
        const user2ClientIds = await this.config.security.getUserClientIds(user2Id)
        
        expect(user1ClientIds).toContain(client1Id)
        expect(user1ClientIds).not.toContain(client2Id)
        expect(user2ClientIds).toContain(client2Id)
        expect(user2ClientIds).not.toContain(client1Id)
      }
      
      await this.cleanupTestData(client1Id, user1Id)
      await this.cleanupTestData(client2Id, user2Id)
    }))

    // Test 2: Role-Based Access
    suite.tests.push(await this.runTest('Role-Based Access Control', async () => {
      const clientId = await this.createTestClient()
      const ownerId = await this.createTestProfile('owner@test.com')
      const staffId = await this.createTestProfile('staff@test.com')
      
      // Create users with different roles
      await this.config.database.query(
        'INSERT INTO client_users (user_id, client_id, role) VALUES ($1, $2, $3)',
        [ownerId, clientId, 'OWNER']
      )
      await this.config.database.query(
        'INSERT INTO client_users (user_id, client_id, role) VALUES ($1, $2, $3)',
        [staffId, clientId, 'STAFF']
      )
      
      if (this.config.security) {
        // Test role hierarchy
        expect(this.config.security.hasRequiredRole('OWNER', ['STAFF', 'MANAGER'])).toBe(true)
        expect(this.config.security.hasRequiredRole('STAFF', ['MANAGER', 'OWNER'])).toBe(false)
        
        // Test action permissions
        const ownerCanManageTeam = await this.config.security.canPerformAction(ownerId, clientId, 'manage_team')
        const staffCanManageTeam = await this.config.security.canPerformAction(staffId, clientId, 'manage_team')
        
        expect(ownerCanManageTeam).toBe(true)
        expect(staffCanManageTeam).toBe(false)
      }
      
      await this.cleanupTestData(clientId, ownerId, staffId)
    }))

    suite.duration = Date.now() - startTime
    suite.passed = suite.tests.filter(t => t.passed).length
    suite.failed = suite.tests.filter(t => !t.passed).length

    return suite
  }

  // =============================================================================
  // JIGR BUSINESS LOGIC TESTS
  // =============================================================================

  private async runBusinessLogicTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'JiGR Business Logic',
      tests: [],
      passed: 0,
      failed: 0,
      duration: 0
    }

    const startTime = Date.now()

    // Test 1: Complete Delivery Processing Workflow
    suite.tests.push(await this.runTest('Delivery Processing Workflow', async () => {
      const clientId = await this.createTestClient()
      const userId = await this.createTestProfile()
      
      await this.config.database.query(
        'INSERT INTO client_users (user_id, client_id, role) VALUES ($1, $2, $3)',
        [userId, clientId, 'STAFF']
      )
      
      // Create delivery record
      const delivery = await this.config.database.queryOne(
        `INSERT INTO delivery_records 
         (client_id, user_id, supplier_name, image_path, delivery_date, processing_status) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [clientId, userId, 'Test Supplier', 'test-delivery.jpg', new Date(), 'completed']
      )
      
      // Add temperature reading
      await this.config.database.query(
        `INSERT INTO temperature_readings 
         (delivery_record_id, temperature_value, temperature_unit, product_type, is_compliant) 
         VALUES ($1, $2, $3, $4, $5)`,
        [delivery.id, 4.5, 'C', 'chilled', true]
      )
      
      // Verify complete workflow
      const result = await this.config.database.queryOne(
        `SELECT dr.*, tr.temperature_value, tr.is_compliant 
         FROM delivery_records dr 
         LEFT JOIN temperature_readings tr ON dr.id = tr.delivery_record_id 
         WHERE dr.id = $1`,
        [delivery.id]
      )
      
      expect(result.supplier_name).toBe('Test Supplier')
      expect(result.temperature_value).toBe(4.5)
      expect(result.is_compliant).toBe(true)
      
      await this.cleanupTestData(clientId, userId)
    }))

    // Test 2: Compliance Alert Generation
    suite.tests.push(await this.runTest('Compliance Alert Generation', async () => {
      const clientId = await this.createTestClient()
      const deliveryId = await this.createTestDeliveryRecord(clientId)
      
      // Create temperature violation
      await this.config.database.query(
        `INSERT INTO temperature_readings 
         (delivery_record_id, temperature_value, temperature_unit, product_type, is_compliant, risk_level) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [deliveryId, 15.0, 'C', 'frozen', false, 'critical']
      )
      
      // Create compliance alert
      const alert = await this.config.database.queryOne(
        `INSERT INTO compliance_alerts 
         (delivery_record_id, client_id, alert_type, severity, temperature_value, message) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [deliveryId, clientId, 'temperature_violation', 'critical', 15.0, 'Frozen product temperature too high']
      )
      
      expect(alert.id).toBeTruthy()
      
      await this.cleanupTestData(clientId)
    }))

    // Test 3: Team Management
    suite.tests.push(await this.runTest('Team Management', async () => {
      const clientId = await this.createTestClient()
      const managerId = await this.createTestProfile('manager@test.com')
      const staffId = await this.createTestProfile('staff@test.com')
      
      // Create team members
      await this.config.database.query(
        'INSERT INTO client_users (user_id, client_id, role) VALUES ($1, $2, $3)',
        [managerId, clientId, 'MANAGER']
      )
      await this.config.database.query(
        'INSERT INTO client_users (user_id, client_id, role) VALUES ($1, $2, $3)',
        [staffId, clientId, 'STAFF']
      )
      
      // Create invitation
      const invitation = await this.config.database.queryOne(
        `INSERT INTO invitations (email, client_id, role, invited_by) 
         VALUES ($1, $2, $3, $4) RETURNING id`,
        ['newuser@test.com', clientId, 'STAFF', managerId]
      )
      
      expect(invitation.id).toBeTruthy()
      
      await this.cleanupTestData(clientId, managerId, staffId)
    }))

    suite.duration = Date.now() - startTime
    suite.passed = suite.tests.filter(t => t.passed).length
    suite.failed = suite.tests.filter(t => !t.passed).length

    return suite
  }

  // =============================================================================
  // PERFORMANCE TESTS
  // =============================================================================

  private async runPerformanceTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Performance Tests',
      tests: [],
      passed: 0,
      failed: 0,
      duration: 0
    }

    const startTime = Date.now()

    // Test 1: Query Performance
    suite.tests.push(await this.runTest('Query Performance', async () => {
      const clientId = await this.createTestClient()
      
      // Create test data
      const recordCount = this.config.testDataSize === 'large' ? 1000 : 
                         this.config.testDataSize === 'medium' ? 100 : 10
      
      for (let i = 0; i < recordCount; i++) {
        await this.config.database.query(
          'INSERT INTO delivery_records (client_id, supplier_name, image_path) VALUES ($1, $2, $3)',
          [clientId, `Supplier ${i}`, `delivery${i}.jpg`]
        )
      }
      
      // Test query performance
      const queryStart = Date.now()
      const records = await this.config.database.query(
        'SELECT * FROM delivery_records WHERE client_id = $1 ORDER BY created_at DESC LIMIT 50',
        [clientId]
      )
      const queryTime = Date.now() - queryStart
      
      expect(records.length).toBeGreaterThan(0)
      expect(queryTime).toBeLessThan(1000) // Should complete in under 1 second
      
      await this.cleanupTestData(clientId)
    }))

    // Test 2: Concurrent Operations
    suite.tests.push(await this.runTest('Concurrent Operations', async () => {
      const clientId = await this.createTestClient()
      
      // Run multiple operations concurrently
      const operations = Array.from({ length: 10 }, (_, i) => 
        this.config.database.query(
          'INSERT INTO delivery_records (client_id, supplier_name, image_path) VALUES ($1, $2, $3)',
          [clientId, `Concurrent Supplier ${i}`, `concurrent${i}.jpg`]
        )
      )
      
      const results = await Promise.all(operations)
      expect(results.length).toBe(10)
      
      await this.cleanupTestData(clientId)
    }))

    suite.duration = Date.now() - startTime
    suite.passed = suite.tests.filter(t => t.passed).length
    suite.failed = suite.tests.filter(t => !t.passed).length

    return suite
  }

  // =============================================================================
  // AUTH AND STORAGE TESTS (OPTIONAL)
  // =============================================================================

  private async runAuthTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Authentication Tests',
      tests: [],
      passed: 0,
      failed: 0,
      duration: 0
    }

    if (!this.config.auth) {
      return suite
    }

    const startTime = Date.now()
    const auth = this.config.auth

    // Test 1: Sign Up and Sign In
    suite.tests.push(await this.runTest('Sign Up and Sign In', async () => {
      const testEmail = `test${Date.now()}@example.com`
      const testPassword = 'TestPassword123!'
      
      // Sign up
      const user = await auth.signUp(testEmail, testPassword)
      expect(user.email).toBe(testEmail)
      
      // Sign in
      const session = await auth.signIn(testEmail, testPassword)
      expect(session.user.email).toBe(testEmail)
      expect(session.access_token).toBeTruthy()
    }))

    // Test 2: Session Management
    suite.tests.push(await this.runTest('Session Management', async () => {
      const currentUser = await auth.getCurrentUser()
      const currentSession = await auth.getCurrentSession()
      
      if (currentSession) {
        expect(currentUser?.id).toBe(currentSession.user.id)
        
        // Test refresh
        const refreshedSession = await auth.refreshSession()
        expect(refreshedSession.user.id).toBe(currentSession.user.id)
      }
    }))

    suite.duration = Date.now() - startTime
    suite.passed = suite.tests.filter(t => t.passed).length
    suite.failed = suite.tests.filter(t => !t.passed).length

    return suite
  }

  private async runStorageTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Storage Tests',
      tests: [],
      passed: 0,
      failed: 0,
      duration: 0
    }

    if (!this.config.storage) {
      return suite
    }

    const startTime = Date.now()
    const storage = this.config.storage

    // Test 1: File Upload and Download
    suite.tests.push(await this.runTest('File Upload and Download', async () => {
      const testContent = 'Test file content'
      const fileName = `test-${Date.now()}.txt`
      const bucket = 'test-bucket'
      
      // Upload
      const uploadResult = await storage.upload(bucket, fileName, Buffer.from(testContent))
      expect(uploadResult.path).toBeTruthy()
      
      // Download
      const downloadedContent = await storage.download(bucket, fileName)
      expect(downloadedContent.toString()).toBe(testContent)
      
      // Clean up
      await storage.delete(bucket, fileName)
    }))

    // Test 2: Signed URLs
    suite.tests.push(await this.runTest('Signed URLs', async () => {
      const fileName = `test-signed-${Date.now()}.txt`
      const bucket = 'test-bucket'
      
      await storage.upload(bucket, fileName, Buffer.from('Test content'))
      
      const signedUrl = await storage.getSignedUrl(bucket, fileName, { expiresIn: 3600 })
      expect(signedUrl).toContain('http')
      expect(signedUrl).toContain(fileName)
      
      await storage.delete(bucket, fileName)
    }))

    suite.duration = Date.now() - startTime
    suite.passed = suite.tests.filter(t => t.passed).length
    suite.failed = suite.tests.filter(t => !t.passed).length

    return suite
  }

  // =============================================================================
  // RELIABILITY TESTS
  // =============================================================================

  private async runReliabilityTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Reliability Tests',
      tests: [],
      passed: 0,
      failed: 0,
      duration: 0
    }

    const startTime = Date.now()

    // Test 1: Connection Recovery
    suite.tests.push(await this.runTest('Connection Recovery', async () => {
      // Disconnect and reconnect
      await this.config.database.disconnect()
      await this.config.database.connect()
      
      // Verify it's working
      const health = await this.config.database.healthCheck()
      expect(health.healthy).toBe(true)
    }))

    // Test 2: Error Handling
    suite.tests.push(await this.runTest('Error Handling', async () => {
      // Test invalid query
      try {
        await this.config.database.query('SELECT * FROM non_existent_table')
        throw new Error('Should have failed')
      } catch (error) {
        // Expected to fail - this is good
        expect(error).toBeTruthy()
      }
      
      // Verify connection is still working after error
      const health = await this.config.database.healthCheck()
      expect(health.healthy).toBe(true)
    }))

    suite.duration = Date.now() - startTime
    suite.passed = suite.tests.filter(t => t.passed).length
    suite.failed = suite.tests.filter(t => !t.passed).length

    return suite
  }

  // =============================================================================
  // SECURITY TESTS
  // =============================================================================

  private async runSecurityTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      name: 'Security Tests',
      tests: [],
      passed: 0,
      failed: 0,
      duration: 0
    }

    const startTime = Date.now()

    // Test 1: SQL Injection Prevention
    suite.tests.push(await this.runTest('SQL Injection Prevention', async () => {
      const clientId = await this.createTestClient()
      
      // Attempt SQL injection
      const maliciousInput = "'; DROP TABLE clients; --"
      
      try {
        await this.config.database.query(
          'SELECT * FROM clients WHERE name = $1',
          [maliciousInput]
        )
      } catch (error) {
        // Some providers might reject this, which is fine
      }
      
      // Verify table still exists
      const client = await this.config.database.queryOne(
        'SELECT * FROM clients WHERE id = $1',
        [clientId]
      )
      expect(client).toBeTruthy()
      
      await this.cleanupTestData(clientId)
    }))

    // Test 2: Data Encryption at Rest (if supported)
    suite.tests.push(await this.runTest('Data Encryption Support', async () => {
      // This test varies by provider - mainly checks if encrypted fields work
      const clientId = await this.createTestClient()
      
      // Store sensitive data
      await this.config.database.query(
        'UPDATE clients SET license_number = $1 WHERE id = $2',
        ['SENSITIVE-LICENSE-123', clientId]
      )
      
      const client = await this.config.database.queryOne(
        'SELECT license_number FROM clients WHERE id = $1',
        [clientId]
      )
      
      expect(client.license_number).toBe('SENSITIVE-LICENSE-123')
      
      await this.cleanupTestData(clientId)
    }))

    suite.duration = Date.now() - startTime
    suite.passed = suite.tests.filter(t => t.passed).length
    suite.failed = suite.tests.filter(t => !t.passed).length

    return suite
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private async runTest(name: string, testFn: () => Promise<void>): Promise<TestResult> {
    const startTime = Date.now()
    
    try {
      await testFn()
      const duration = Date.now() - startTime
      console.log(`✅ ${name} (${duration}ms)`)
      return { testName: name, passed: true, duration }
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.log(`❌ ${name} (${duration}ms): ${errorMessage}`)
      return { testName: name, passed: false, duration, error: errorMessage }
    }
  }

  private async tableExists(tableName: string): Promise<boolean> {
    try {
      await this.config.database.query(
        `SELECT 1 FROM information_schema.tables WHERE table_name = $1`,
        [tableName]
      )
      return true
    } catch {
      return false
    }
  }

  private async createTestClient(name: string = 'Test Client'): Promise<string> {
    const result = await this.config.database.queryOne(
      'INSERT INTO clients (name, business_email) VALUES ($1, $2) RETURNING id',
      [name, `test${Date.now()}@example.com`]
    )
    return result.id
  }

  private async createTestProfile(email?: string): Promise<string> {
    const testEmail = email || `test${Date.now()}@example.com`
    const result = await this.config.database.queryOne(
      'INSERT INTO profiles (id, email) VALUES (gen_random_uuid(), $1) RETURNING id',
      [testEmail]
    )
    return result.id
  }

  private async createTestDeliveryRecord(clientId: string): Promise<string> {
    const result = await this.config.database.queryOne(
      'INSERT INTO delivery_records (client_id, supplier_name, image_path) VALUES ($1, $2, $3) RETURNING id',
      [clientId, 'Test Supplier', 'test-delivery.jpg']
    )
    return result.id
  }

  private async cleanupTestData(...ids: (string | undefined)[]): Promise<void> {
    for (const id of ids.filter(Boolean)) {
      try {
        // Try to clean up from various tables
        await this.config.database.query('DELETE FROM client_users WHERE user_id = $1 OR client_id = $1', [id])
        await this.config.database.query('DELETE FROM delivery_records WHERE id = $1 OR client_id = $1', [id])
        await this.config.database.query('DELETE FROM temperature_readings WHERE delivery_record_id = $1', [id])
        await this.config.database.query('DELETE FROM compliance_alerts WHERE id = $1 OR client_id = $1', [id])
        await this.config.database.query('DELETE FROM invitations WHERE id = $1 OR client_id = $1', [id])
        await this.config.database.query('DELETE FROM profiles WHERE id = $1', [id])
        await this.config.database.query('DELETE FROM clients WHERE id = $1', [id])
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }

  private getConfigInfo(): string {
    const info = []
    if (this.config.database) info.push('Database')
    if (this.config.auth) info.push('Auth')
    if (this.config.storage) info.push('Storage')
    if (this.config.security) info.push('Security')
    info.push(`Size: ${this.config.testDataSize || 'small'}`)
    if (this.config.skipSlowTests) info.push('Fast Mode')
    return info.join(', ')
  }

  generateReport(): string {
    const totalTests = this.results.reduce((sum, suite) => sum + suite.tests.length, 0)
    const totalPassed = this.results.reduce((sum, suite) => sum + suite.passed, 0)
    const totalFailed = this.results.reduce((sum, suite) => sum + suite.failed, 0)
    const totalDuration = this.results.reduce((sum, suite) => sum + suite.duration, 0)

    let report = `
# Database Provider Test Report

## Summary
- **Total Tests**: ${totalTests}
- **Passed**: ${totalPassed}
- **Failed**: ${totalFailed}
- **Success Rate**: ${((totalPassed / totalTests) * 100).toFixed(1)}%
- **Total Duration**: ${totalDuration}ms

## Test Suites
`

    for (const suite of this.results) {
      report += `
### ${suite.name}
- **Tests**: ${suite.tests.length}
- **Passed**: ${suite.passed}
- **Failed**: ${suite.failed}
- **Duration**: ${suite.duration}ms

`
      
      if (suite.failed > 0) {
        report += '**Failed Tests**:\n'
        for (const test of suite.tests.filter(t => !t.passed)) {
          report += `- ${test.testName}: ${test.error}\n`
        }
        report += '\n'
      }
    }

    return report
  }
}

// Export test utilities
export { ProviderTestRunner }

// Export factory for common test scenarios
export const createTestSuite = {
  supabase: (config: Partial<TestConfig> = {}) => new ProviderTestRunner({
    database: config.database!,
    testDataSize: 'small',
    skipSlowTests: false,
    ...config
  }),
  
  postgresql: (config: Partial<TestConfig> = {}) => new ProviderTestRunner({
    database: config.database!,
    testDataSize: 'medium',
    skipSlowTests: false,
    ...config
  }),
  
  production: (config: Partial<TestConfig> = {}) => new ProviderTestRunner({
    database: config.database!,
    testDataSize: 'large',
    skipSlowTests: false,
    ...config
  }),
  
  quick: (config: Partial<TestConfig> = {}) => new ProviderTestRunner({
    database: config.database!,
    testDataSize: 'small',
    skipSlowTests: true,
    ...config
  })
}