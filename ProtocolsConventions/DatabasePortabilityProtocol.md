# Database Portability Documentation - Claude Code Prompt

## 🎯 PURPOSE: Vendor-Independent Database Architecture

Create comprehensive documentation that enables seamless migration from Supabase to any major database provider, ensuring business continuity and vendor independence for the JiGR platform.

## 🛡️ BUSINESS PROTECTION STRATEGY

### **VENDOR INDEPENDENCE BENEFITS:**
- **Risk Mitigation:** Platform survives vendor outages or business failures
- **Cost Control:** Negotiate from position of strength, switch if costs become unreasonable
- **Performance Optimization:** Choose optimal providers for different regions/requirements
- **Compliance Flexibility:** Select providers that meet specific regulatory requirements

### **ENTERPRISE READINESS:**
- **Due Diligence Ready:** Professional documentation for investors/acquirers
- **Client Confidence:** Enterprise customers require vendor-agnostic architecture
- **Geographic Expansion:** Choose optimal providers for different markets
- **Business Continuity:** Guaranteed platform availability regardless of vendor issues

## 📋 DOCUMENTATION REQUIREMENTS

### **COMPLETE SCHEMA DOCUMENTATION:**
- **Vendor-neutral SQL:** Standard SQL that works across all major databases
- **Table structures:** All tables with columns, data types, constraints
- **Relationships:** Foreign keys, indexes, triggers, views
- **Data types mapping:** Supabase types → Standard SQL → Other providers
- **Performance optimizations:** Indexes, partitioning, query optimization

### **MIGRATION COMPONENTS:**
- **Schema creation scripts:** For PostgreSQL, MySQL, SQL Server, Oracle
- **Data export procedures:** Complete data extraction from Supabase
- **Data import procedures:** Bulk loading into new providers
- **Configuration mapping:** Environment variables, connection strings
- **Testing validation:** Automated tests to verify migration success

## 🗄️ SUPABASE CURRENT ARCHITECTURE

### **CORE TABLES DOCUMENTATION:**
Document every table with this structure:

```sql
-- Table: clients
-- Purpose: Multi-tenant client organizations
-- Dependencies: Referenced by users, documents, configurations

CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  slug varchar(100) UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Supabase specific fields
  stripe_customer_id varchar(255),
  subscription_status varchar(50) DEFAULT 'trial',
  
  -- Standard constraints
  CONSTRAINT clients_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT clients_name_length CHECK (length(name) >= 2)
);

-- Indexes for performance
CREATE INDEX idx_clients_slug ON clients(slug);
CREATE INDEX idx_clients_stripe_customer ON clients(stripe_customer_id);
```

### **RLS POLICY DOCUMENTATION:**
```sql
-- Row Level Security Policies
-- Purpose: Multi-tenant data isolation
-- Migration Note: Convert to application-level security for non-Postgres

-- Client isolation policy
CREATE POLICY "Client data isolation" ON clients
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM client_users 
    WHERE client_id = clients.id
  )
);

-- Alternative implementation for non-Postgres databases:
-- Application-level middleware to filter by client_id
```

### **STORAGE BUCKET DOCUMENTATION:**
```sql
-- Supabase Storage Buckets
-- Purpose: File storage for delivery documents and images
-- Migration: Convert to cloud storage (AWS S3, Google Cloud, Azure Blob)

Bucket: delivery-dockets
Structure: client-id/year/month/day/filename
Policies: Client isolation, authenticated access only
Alternative: Any S3-compatible storage with folder structure preserved
```

## 🔄 MIGRATION TARGET PROVIDERS

### **POSTGRESQL (Direct Migration):**
```sql
-- Easiest migration - same database engine
-- Minimal changes required
-- RLS policies may need adjustment
-- JSON columns fully supported
-- UUID types supported

-- Connection example:
-- postgresql://username:password@host:5432/database
```

### **MYSQL/MARIADB:**
```sql
-- Data type conversions needed:
-- uuid → CHAR(36) or BINARY(16)
-- timestamp with time zone → DATETIME
-- jsonb → JSON (MySQL 5.7+) or TEXT

-- Example conversion:
CREATE TABLE clients (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata JSON -- or TEXT for older versions
);
```

### **SQL SERVER:**
```sql
-- Microsoft SQL Server conversions:
-- uuid → UNIQUEIDENTIFIER
-- timestamp with time zone → DATETIMEOFFSET
-- jsonb → NVARCHAR(MAX) with JSON constraints

-- Example conversion:
CREATE TABLE clients (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  name NVARCHAR(255) NOT NULL,
  created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
  metadata NVARCHAR(MAX) CHECK (ISJSON(metadata) = 1)
);
```

### **ORACLE DATABASE:**
```sql
-- Oracle Database conversions:
-- uuid → RAW(16) with custom functions
-- timestamp with time zone → TIMESTAMP WITH TIME ZONE
-- jsonb → CLOB or JSON (Oracle 12c+)

-- Example conversion:
CREATE TABLE clients (
  id RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
  name VARCHAR2(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP,
  metadata CLOB CHECK (metadata IS JSON)
);
```

## 📊 DATA MIGRATION PROCEDURES

### **EXPORT PROCEDURES:**
```bash
# Supabase data export
pg_dump --host=db.xxx.supabase.co \
        --port=5432 \
        --username=postgres \
        --password \
        --format=custom \
        --no-owner \
        --no-privileges \
        --data-only \
        your_database > supabase_data.dump

# CSV export for cross-platform compatibility
psql --host=db.xxx.supabase.co \
     --command="COPY clients TO STDOUT WITH CSV HEADER" > clients.csv
```

### **IMPORT PROCEDURES:**
```bash
# PostgreSQL import
pg_restore --host=new-postgres-host \
           --port=5432 \
           --username=new_user \
           --password \
           --dbname=new_database \
           supabase_data.dump

# MySQL import (from CSV)
mysqlimport --host=mysql-host \
            --user=mysql_user \
            --password \
            --fields-terminated-by=',' \
            --fields-enclosed-by='"' \
            --lines-terminated-by='\n' \
            --ignore-lines=1 \
            new_database clients.csv
```

### **VALIDATION PROCEDURES:**
```sql
-- Row count validation
SELECT 'clients' as table_name, COUNT(*) as row_count FROM clients
UNION ALL
SELECT 'documents' as table_name, COUNT(*) as row_count FROM documents
UNION ALL
SELECT 'users' as table_name, COUNT(*) as row_count FROM users;

-- Data integrity checks
SELECT COUNT(*) as orphaned_documents 
FROM documents d 
LEFT JOIN clients c ON d.client_id = c.id 
WHERE c.id IS NULL;

-- Sample data verification
SELECT * FROM clients ORDER BY created_at DESC LIMIT 5;
```

## 🔧 APPLICATION CODE CHANGES

### **DATABASE CONNECTION ABSTRACTION:**
```typescript
// Abstract database connection
interface DatabaseProvider {
  connect(): Promise<Connection>;
  query(sql: string, params: any[]): Promise<any[]>;
  transaction(queries: Query[]): Promise<void>;
}

class SupabaseProvider implements DatabaseProvider {
  // Current implementation
}

class PostgreSQLProvider implements DatabaseProvider {
  // Migration target implementation
}

class MySQLProvider implements DatabaseProvider {
  // Alternative provider implementation
}
```

### **QUERY ABSTRACTION:**
```typescript
// Abstract queries for cross-database compatibility
class ClientRepository {
  constructor(private db: DatabaseProvider) {}
  
  async findById(id: string): Promise<Client> {
    // Use parameterized queries that work across providers
    const query = "SELECT * FROM clients WHERE id = $1";
    const result = await this.db.query(query, [id]);
    return result[0];
  }
  
  async create(client: CreateClientData): Promise<Client> {
    // Handle UUID generation based on provider
    const id = this.generateId(); // Provider-specific implementation
    const query = "INSERT INTO clients (id, name, slug) VALUES ($1, $2, $3)";
    await this.db.query(query, [id, client.name, client.slug]);
    return this.findById(id);
  }
}
```

### **CONFIGURATION MANAGEMENT:**
```typescript
// Environment-based provider selection
const dbConfig = {
  provider: process.env.DB_PROVIDER || 'supabase',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: process.env.DB_SSL === 'true'
};

// Provider factory
function createDatabaseProvider(config: DbConfig): DatabaseProvider {
  switch (config.provider) {
    case 'supabase':
      return new SupabaseProvider(config);
    case 'postgresql':
      return new PostgreSQLProvider(config);
    case 'mysql':
      return new MySQLProvider(config);
    default:
      throw new Error(`Unsupported database provider: ${config.provider}`);
  }
}
```

## 🧪 TESTING FRAMEWORK

### **MIGRATION TESTING:**
```typescript
// Automated migration testing
describe('Database Migration Tests', () => {
  test('Schema compatibility', async () => {
    // Test schema creation on target database
    await targetDb.createSchema(migrationSchema);
    
    // Verify all tables exist
    const tables = await targetDb.listTables();
    expect(tables).toContain('clients');
    expect(tables).toContain('documents');
  });
  
  test('Data migration integrity', async () => {
    // Export from source
    const sourceData = await sourceDb.exportData();
    
    // Import to target
    await targetDb.importData(sourceData);
    
    // Verify row counts match
    const sourceCount = await sourceDb.query('SELECT COUNT(*) FROM clients');
    const targetCount = await targetDb.query('SELECT COUNT(*) FROM clients');
    expect(sourceCount).toEqual(targetCount);
  });
  
  test('Application functionality', async () => {
    // Test core application features work with new database
    const client = await clientRepository.create(testClientData);
    expect(client.id).toBeDefined();
    
    const document = await documentRepository.create(testDocumentData);
    expect(document.client_id).toEqual(client.id);
  });
});
```

## 📋 IMPLEMENTATION CHECKLIST

### **DOCUMENTATION PHASE:**
- [ ] Complete schema documentation with vendor-neutral SQL
- [ ] Document all RLS policies and security requirements
- [ ] Map Supabase-specific features to alternatives
- [ ] Create data type conversion guides
- [ ] Document storage bucket structure and policies

### **CODE PREPARATION PHASE:**
- [ ] Abstract database connections into provider pattern
- [ ] Convert RLS policies to application-level security
- [ ] Create vendor-agnostic query interfaces
- [ ] Implement configuration-based provider selection
- [ ] Add database health checks and monitoring

### **TESTING PHASE:**
- [ ] Create automated migration test suite
- [ ] Test schema creation on all target providers
- [ ] Verify data migration procedures
- [ ] Validate application functionality post-migration
- [ ] Performance test new database configurations

### **DEPLOYMENT PREPARATION:**
- [ ] Create migration runbooks for each provider
- [ ] Document rollback procedures
- [ ] Prepare monitoring and alerting
- [ ] Train team on new provider management
- [ ] Establish backup and disaster recovery procedures

## 🏗️ REAL-WORLD IMPLEMENTATION EXAMPLES

### **CURRENT JIGR SCHEMA (Production-Ready)**

Based on our actual implementation with multi-tenant RBAC system:

```sql
-- CLIENTS TABLE (Multi-tenant organizations)
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  business_name varchar(255),
  owner_name varchar(255),
  owner_position varchar(100),
  phone varchar(20),
  address text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- CLIENT_USERS TABLE (User-Organization relationships with RBAC)
CREATE TABLE client_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  role varchar(20) NOT NULL DEFAULT 'STAFF',
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT valid_roles CHECK (role IN ('OWNER', 'MANAGER', 'SUPERVISOR', 'STAFF')),
  UNIQUE(user_id, client_id)
);

-- INVITATIONS TABLE (Token-based user invitation system)  
CREATE TABLE invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  email varchar(255) NOT NULL,
  role varchar(20) NOT NULL DEFAULT 'STAFF',
  token varchar(32) NOT NULL UNIQUE,
  invited_by uuid REFERENCES auth.users(id),
  expires_at timestamp with time zone NOT NULL,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT valid_invitation_roles CHECK (role IN ('MANAGER', 'SUPERVISOR', 'STAFF'))
);

-- ONBOARDING_PROGRESS TABLE (User onboarding workflow tracking)
CREATE TABLE onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  step varchar(50) NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, client_id, step)
);
```

### **PRODUCTION RLS POLICIES**

Our actual multi-tenant security implementation:

```sql
-- CLIENT ISOLATION POLICY
CREATE POLICY "Client data isolation" ON clients
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM client_users 
    WHERE client_id = clients.id
  )
);

-- USER-CLIENT RELATIONSHIP POLICY
CREATE POLICY "User can see own client relationships" ON client_users
FOR ALL USING (
  auth.uid() = user_id OR
  auth.uid() IN (
    SELECT cu.user_id FROM client_users cu 
    WHERE cu.client_id = client_users.client_id 
    AND cu.role IN ('OWNER', 'MANAGER')
  )
);

-- INVITATION MANAGEMENT POLICY
CREATE POLICY "Managers can manage invitations" ON invitations
FOR ALL USING (
  auth.uid() IN (
    SELECT cu.user_id FROM client_users cu 
    WHERE cu.client_id = invitations.client_id 
    AND cu.role IN ('OWNER', 'MANAGER')
  )
);
```

### **MIGRATION CONSIDERATIONS FOR RBAC SYSTEMS**

**Challenge**: RLS policies don't exist in MySQL/SQL Server/Oracle
**Solution**: Application-level security middleware

```typescript
// Application-level tenant isolation (replaces RLS)
class TenantSecurityMiddleware {
  async enforceClientAccess(userId: string, clientId: string): Promise<boolean> {
    const membership = await this.db.query(`
      SELECT role FROM client_users 
      WHERE user_id = ? AND client_id = ?
    `, [userId, clientId]);
    
    return membership.length > 0;
  }
  
  async enforceRoleAccess(userId: string, clientId: string, requiredRole: string[]): Promise<boolean> {
    const membership = await this.db.query(`
      SELECT role FROM client_users 
      WHERE user_id = ? AND client_id = ? 
      AND role IN (${requiredRole.map(() => '?').join(',')})
    `, [userId, clientId, ...requiredRole]);
    
    return membership.length > 0;
  }
}

// Usage in API routes
app.use('/api/clients/:clientId', async (req, res, next) => {
  const hasAccess = await tenantSecurity.enforceClientAccess(
    req.user.id, 
    req.params.clientId
  );
  
  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  next();
});
```

### **AUTHENTICATION PROVIDER ABSTRACTION**

**Current**: Supabase Auth
**Migration Strategy**: Provider abstraction layer

```typescript
interface AuthProvider {
  signUp(email: string, password: string): Promise<User>;
  signIn(email: string, password: string): Promise<Session>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  sendPasswordReset(email: string): Promise<void>;
}

class SupabaseAuthProvider implements AuthProvider {
  // Current implementation
}

class Auth0Provider implements AuthProvider {
  // Auth0 implementation
}

class FirebaseAuthProvider implements AuthProvider {
  // Firebase implementation
}

// Provider factory
function createAuthProvider(config: AuthConfig): AuthProvider {
  switch (config.provider) {
    case 'supabase': return new SupabaseAuthProvider(config);
    case 'auth0': return new Auth0Provider(config);
    case 'firebase': return new FirebaseAuthProvider(config);
    default: throw new Error(`Unknown auth provider: ${config.provider}`);
  }
}
```

### **EDGE FUNCTION ALTERNATIVES**

**Current**: Supabase Edge Functions
**Migration Options**:

```typescript
// 1. Netlify Functions
export const handler = async (event, context) => {
  // OCR processing logic
};

// 2. Vercel Functions  
export default async function handler(req, res) {
  // OCR processing logic
}

// 3. AWS Lambda
exports.handler = async (event) => {
  // OCR processing logic
};

// 4. Standard API Routes (Next.js/Express)
app.post('/api/process-document', async (req, res) => {
  // OCR processing logic
});
```

---
**This database portability documentation ensures the JiGR platform remains vendor-independent and enterprise-ready for any future database requirements. Updated with real-world RBAC implementation examples from production system.**