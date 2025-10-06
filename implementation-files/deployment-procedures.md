# Database Provider Migration - Deployment & Rollback Procedures

## Overview

Complete deployment and rollback procedures for migrating the JiGR Platform from Supabase to alternative database providers with zero downtime and guaranteed rollback capability.

## Pre-Migration Checklist

### Infrastructure Preparation
- [ ] Target database provider account set up
- [ ] Network connectivity tested
- [ ] SSL certificates configured
- [ ] Monitoring and alerting configured
- [ ] Backup storage prepared
- [ ] DNS records prepared for quick switching

### Application Preparation  
- [ ] Provider abstraction layer implemented
- [ ] Configuration management ready
- [ ] Environment variables prepared
- [ ] Application secrets secured
- [ ] Load balancer configuration ready

### Testing Preparation
- [ ] Migration scripts tested on staging
- [ ] Performance benchmarks established
- [ ] Rollback procedures tested
- [ ] Team communication plan ready
- [ ] Emergency contacts identified

## Migration Deployment Procedures

### Phase 1: Preparation (No Downtime)

#### 1.1 Infrastructure Setup
```bash
# Create target database
./scripts/create-target-database.sh aws-rds

# Verify connectivity
./scripts/test-connectivity.sh aws-rds

# Set up monitoring
./scripts/configure-monitoring.sh aws-rds
```

#### 1.2 Schema Creation
```bash
# Create schema on target
psql $TARGET_DATABASE -f schema/01-core-tables.sql
psql $TARGET_DATABASE -f schema/02-compliance-module.sql
psql $TARGET_DATABASE -f schema/03-indexes.sql

# Verify schema
./scripts/validate-schema.sh
```

#### 1.3 Initial Data Sync
```bash
# Export historical data (exclude recent changes)
./scripts/export-historical-data.sh

# Import to target
./scripts/import-historical-data.sh aws-rds

# Validate data integrity
./scripts/validate-data-integrity.sh
```

### Phase 2: Preparation for Cutover (No Downtime)

#### 2.1 Application Preparation
```bash
# Update application configuration
./scripts/prepare-app-config.sh aws-rds

# Deploy provider abstraction layer
./scripts/deploy-provider-layer.sh

# Test with read-only queries
./scripts/test-read-queries.sh aws-rds
```

#### 2.2 Final Testing
```bash
# Run comprehensive test suite
./scripts/run-migration-tests.sh aws-rds

# Performance benchmark
./scripts/benchmark-performance.sh aws-rds

# Security validation
./scripts/validate-security.sh aws-rds
```

### Phase 3: Cutover Window (2-5 minutes downtime)

#### 3.1 Begin Maintenance Mode
```bash
# Enable maintenance mode
./scripts/enable-maintenance-mode.sh

# Wait for active sessions to complete
./scripts/wait-for-sessions.sh

# Verify no active writes
./scripts/verify-no-writes.sh
```

#### 3.2 Final Data Sync
```bash
# Export incremental changes
./scripts/export-incremental-data.sh

# Import incremental to target
./scripts/import-incremental-data.sh aws-rds

# Final validation
./scripts/final-validation.sh aws-rds
```

#### 3.3 Switch to New Provider
```bash
# Update application configuration
./scripts/switch-database-config.sh aws-rds

# Restart application services
./scripts/restart-application.sh

# Verify application connectivity
./scripts/verify-app-connection.sh
```

#### 3.4 End Maintenance Mode
```bash
# Disable maintenance mode
./scripts/disable-maintenance-mode.sh

# Monitor application health
./scripts/monitor-health.sh

# Verify all functionality
./scripts/verify-functionality.sh
```

### Phase 4: Post-Migration Validation

#### 4.1 Immediate Validation (First 30 minutes)
```bash
# Monitor error rates
./scripts/monitor-errors.sh

# Check performance metrics
./scripts/check-performance.sh

# Validate user workflows
./scripts/test-user-workflows.sh

# Check data consistency
./scripts/verify-data-consistency.sh
```

#### 4.2 Extended Validation (First 24 hours)
```bash
# Monitor all metrics
./scripts/extended-monitoring.sh

# Generate migration report
./scripts/generate-migration-report.sh

# Archive Supabase data (keep as backup)
./scripts/archive-supabase-backup.sh
```

## Rollback Procedures

### Emergency Rollback (Under 5 minutes)

#### Immediate Rollback (Critical Issues)
```bash
# 1. Enable maintenance mode
./scripts/enable-maintenance-mode.sh

# 2. Switch back to Supabase
./scripts/rollback-to-supabase.sh

# 3. Restart application
./scripts/restart-application.sh

# 4. Verify Supabase connectivity
./scripts/verify-supabase-connection.sh

# 5. Disable maintenance mode
./scripts/disable-maintenance-mode.sh

# 6. Monitor recovery
./scripts/monitor-rollback-health.sh
```

### Planned Rollback (10-30 minutes)

#### Data Sync Rollback
```bash
# 1. Enable maintenance mode
./scripts/enable-maintenance-mode.sh

# 2. Export any new data from target
./scripts/export-new-data-from-target.sh

# 3. Import new data to Supabase
./scripts/import-new-data-to-supabase.sh

# 4. Switch back to Supabase
./scripts/rollback-to-supabase.sh

# 5. Validate data consistency
./scripts/validate-rollback-data.sh

# 6. Disable maintenance mode
./scripts/disable-maintenance-mode.sh
```

## Script Implementations

### Core Migration Scripts

#### create-target-database.sh
```bash
#!/bin/bash
# Create target database with proper configuration

PROVIDER=$1
if [ -z "$PROVIDER" ]; then
  echo "Usage: $0 <provider>"
  exit 1
fi

case $PROVIDER in
  "aws-rds")
    # AWS RDS PostgreSQL setup
    aws rds create-db-instance \
      --db-name jigr_platform \
      --db-instance-identifier jigr-prod \
      --db-instance-class db.r5.large \
      --engine postgres \
      --master-username jigr_admin \
      --master-user-password $RDS_PASSWORD \
      --allocated-storage 100 \
      --storage-type gp2 \
      --vpc-security-group-ids $VPC_SECURITY_GROUP \
      --backup-retention-period 30 \
      --storage-encrypted
    ;;
  "google-cloud-sql")
    # Google Cloud SQL setup
    gcloud sql instances create jigr-prod \
      --database-version=POSTGRES_13 \
      --tier=db-custom-2-7680 \
      --region=us-central1 \
      --storage-size=100GB \
      --storage-type=SSD \
      --backup-start-time=03:00 \
      --maintenance-window-day=SUN \
      --maintenance-window-hour=4
    ;;
  "azure-database")
    # Azure Database for PostgreSQL setup
    az postgres server create \
      --name jigr-prod \
      --resource-group jigr-rg \
      --location eastus \
      --admin-user jigr_admin \
      --admin-password $AZURE_PASSWORD \
      --sku-name GP_Gen5_2 \
      --storage-size 102400 \
      --backup-retention 30 \
      --geo-redundant-backup Enabled
    ;;
esac

echo "✅ Target database created for $PROVIDER"
```

#### switch-database-config.sh
```bash
#!/bin/bash
# Switch application to use new database provider

PROVIDER=$1
if [ -z "$PROVIDER" ]; then
  echo "Usage: $0 <provider>"
  exit 1
fi

# Backup current configuration
cp .env.production .env.production.backup

# Update environment variables
case $PROVIDER in
  "aws-rds")
    export DATABASE_URL="postgresql://jigr_admin:$RDS_PASSWORD@jigr-prod.cluster-xyz.us-east-1.rds.amazonaws.com:5432/jigr_platform"
    export DB_PROVIDER="postgresql"
    ;;
  "google-cloud-sql")
    export DATABASE_URL="postgresql://jigr_admin:$GCP_PASSWORD@/jigr_platform?host=/cloudsql/project:region:jigr-prod"
    export DB_PROVIDER="postgresql"
    ;;
  "azure-database")
    export DATABASE_URL="postgresql://jigr_admin@jigr-prod:$AZURE_PASSWORD@jigr-prod.postgres.database.azure.com:5432/jigr_platform"
    export DB_PROVIDER="postgresql"
    ;;
esac

# Update application configuration files
envsubst < config.template.json > config.json

# Update Kubernetes/Docker configurations
kubectl set env deployment/jigr-app DATABASE_URL="$DATABASE_URL"
kubectl set env deployment/jigr-app DB_PROVIDER="$DB_PROVIDER"

echo "✅ Application configuration updated for $PROVIDER"
```

#### rollback-to-supabase.sh
```bash
#!/bin/bash
# Emergency rollback to Supabase

echo "🚨 Starting emergency rollback to Supabase"

# Restore Supabase configuration
export DATABASE_URL="$SUPABASE_DATABASE_URL"
export DB_PROVIDER="supabase"

# Update application configuration
kubectl set env deployment/jigr-app DATABASE_URL="$SUPABASE_DATABASE_URL"
kubectl set env deployment/jigr-app DB_PROVIDER="supabase"

# Wait for rollout
kubectl rollout status deployment/jigr-app --timeout=120s

# Verify connectivity
if curl -f http://localhost:3000/api/health; then
  echo "✅ Rollback successful - application is healthy"
else
  echo "❌ Rollback failed - manual intervention required"
  exit 1
fi
```

### Data Migration Scripts

#### export-supabase-data.sh
```bash
#!/bin/bash
# Export data from Supabase with options for incremental sync

MODE=${1:-full}  # full, incremental, historical

case $MODE in
  "full")
    pg_dump "$SUPABASE_DATABASE_URL" \
      --data-only \
      --inserts \
      --no-owner \
      --no-privileges \
      > supabase-full-data.sql
    ;;
  "incremental")
    # Export only data changed in last hour
    pg_dump "$SUPABASE_DATABASE_URL" \
      --data-only \
      --inserts \
      --no-owner \
      --no-privileges \
      --where="created_at > NOW() - INTERVAL '1 hour' OR updated_at > NOW() - INTERVAL '1 hour'" \
      > supabase-incremental-data.sql
    ;;
  "historical")
    # Export data older than 1 hour
    pg_dump "$SUPABASE_DATABASE_URL" \
      --data-only \
      --inserts \
      --no-owner \
      --no-privileges \
      --where="created_at <= NOW() - INTERVAL '1 hour' AND (updated_at IS NULL OR updated_at <= NOW() - INTERVAL '1 hour')" \
      > supabase-historical-data.sql
    ;;
esac

echo "✅ Supabase data exported in $MODE mode"
```

#### validate-migration.sh
```bash
#!/bin/bash
# Comprehensive migration validation

TARGET_DB=$1

echo "🔍 Starting migration validation for $TARGET_DB"

# 1. Row count validation
echo "Checking row counts..."
psql "$SUPABASE_DATABASE_URL" -t -c "
  SELECT 'clients' as table_name, COUNT(*) FROM clients
  UNION ALL SELECT 'profiles', COUNT(*) FROM profiles
  UNION ALL SELECT 'delivery_records', COUNT(*) FROM delivery_records
" > source_counts.txt

psql "$TARGET_DB" -t -c "
  SELECT 'clients' as table_name, COUNT(*) FROM clients
  UNION ALL SELECT 'profiles', COUNT(*) FROM profiles
  UNION ALL SELECT 'delivery_records', COUNT(*) FROM delivery_records
" > target_counts.txt

if diff source_counts.txt target_counts.txt > /dev/null; then
  echo "✅ Row counts match"
else
  echo "❌ Row count mismatch detected"
  diff source_counts.txt target_counts.txt
  exit 1
fi

# 2. Data integrity validation
echo "Checking data integrity..."
psql "$TARGET_DB" -c "
  SELECT 
    'delivery_records -> clients' as relationship,
    COUNT(*) as orphaned_records
  FROM delivery_records dr 
  LEFT JOIN clients c ON dr.client_id = c.id 
  WHERE c.id IS NULL
" > integrity_check.txt

ORPHANED=$(grep -o '[0-9]\+' integrity_check.txt | tail -1)
if [ "$ORPHANED" -eq 0 ]; then
  echo "✅ Data integrity validated"
else
  echo "❌ Found $ORPHANED orphaned records"
  exit 1
fi

# 3. Performance validation
echo "Checking query performance..."
QUERY_TIME=$(psql "$TARGET_DB" -c "\timing on" -c "
  SELECT COUNT(*) FROM delivery_records dr
  JOIN clients c ON dr.client_id = c.id
  WHERE dr.created_at >= CURRENT_DATE - INTERVAL '30 days'
" 2>&1 | grep "Time:" | grep -o '[0-9.]\+ ms')

if (( $(echo "$QUERY_TIME < 1000" | bc -l) )); then
  echo "✅ Query performance acceptable ($QUERY_TIME)"
else
  echo "⚠️ Query performance degraded ($QUERY_TIME)"
fi

echo "✅ Migration validation complete"
```

## Monitoring and Alerting

### Health Check Endpoints
```typescript
// Add to application
app.get('/api/health/database', async (req, res) => {
  try {
    const startTime = Date.now()
    await database.query('SELECT 1')
    const latency = Date.now() - startTime
    
    res.json({
      status: 'healthy',
      provider: process.env.DB_PROVIDER,
      latency,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})
```

### Automated Monitoring
```bash
#!/bin/bash
# Continuous monitoring during migration

while true; do
  # Check application health
  if ! curl -f http://localhost:3000/api/health/database; then
    echo "🚨 Database health check failed at $(date)"
    # Trigger alert
    ./scripts/send-alert.sh "Database health check failed"
  fi
  
  # Check error rates
  ERROR_RATE=$(curl -s http://localhost:3000/api/metrics | jq '.error_rate')
  if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
    echo "🚨 Error rate elevated: $ERROR_RATE at $(date)"
    ./scripts/send-alert.sh "Error rate elevated: $ERROR_RATE"
  fi
  
  sleep 30
done
```

## Success Criteria

### Migration Considered Successful When:
- [ ] All application functionality works correctly
- [ ] Performance meets or exceeds baseline metrics
- [ ] Error rates remain below 0.1%
- [ ] Data integrity 100% validated
- [ ] Security controls functioning properly
- [ ] Monitoring and alerting operational
- [ ] Team confident in new system

### Rollback Triggered When:
- [ ] Error rate exceeds 1%
- [ ] Performance degrades >50% from baseline
- [ ] Any data corruption detected
- [ ] Critical application features fail
- [ ] Security breach or misconfiguration
- [ ] Team loses confidence in migration

This comprehensive deployment procedure ensures safe, reliable database provider migration with minimal risk and guaranteed rollback capability.