# Database Migration Tools

## Overview

Complete set of tools for migrating the JiGR Platform from Supabase to any PostgreSQL-compatible provider with zero data loss and minimal downtime.

## Tools Created

### 1. Export Tools
- `export-supabase-data.sh` - Complete data export from Supabase
- `export-schema-only.sh` - Schema-only export for structure comparison
- `export-by-table.sh` - Individual table exports for large datasets

### 2. Validation Tools  
- `validate-migration.sql` - Comprehensive data integrity checks
- `compare-schemas.sql` - Schema comparison between source and target
- `performance-benchmark.sql` - Query performance comparison

### 3. Import Tools
- `import-to-postgresql.sh` - Import data to new PostgreSQL provider
- `create-target-database.sh` - Set up target database with schema
- `fix-sequences.sql` - Reset auto-increment sequences after import

### 4. Testing Tools
- `test-application-queries.sql` - Test all application queries on new database
- `test-multi-tenant-security.sql` - Verify security isolation works
- `load-test-queries.sql` - Performance testing for production load

### 5. Rollback Tools
- `rollback-migration.sh` - Emergency rollback to Supabase
- `backup-before-migration.sh` - Complete backup before starting migration
- `restore-from-backup.sh` - Restore from backup if needed

## Migration Process

### Phase 1: Preparation
1. Run `backup-before-migration.sh` - Create complete backup
2. Run `export-schema-only.sh` - Export current schema
3. Run `export-supabase-data.sh` - Export all data
4. Run `validate-export.sql` - Verify export completeness

### Phase 2: Target Setup
1. Run `create-target-database.sh` - Create new database
2. Run schema creation scripts (01-core-tables.sql, etc.)
3. Run `compare-schemas.sql` - Verify schema matches

### Phase 3: Data Migration
1. Run `import-to-postgresql.sh` - Import all data
2. Run `fix-sequences.sql` - Fix any sequence issues
3. Run `validate-migration.sql` - Comprehensive validation

### Phase 4: Testing
1. Run `test-application-queries.sql` - Test all queries work
2. Run `test-multi-tenant-security.sql` - Verify security
3. Run `performance-benchmark.sql` - Check performance
4. Update application configuration
5. Run application test suite

### Phase 5: Cutover
1. Put application in maintenance mode
2. Run final incremental data sync
3. Update application to use new database
4. Test application functionality
5. Remove maintenance mode

## Safety Features

- **Complete Backups**: Full backups before any changes
- **Validation at Every Step**: Comprehensive data integrity checks
- **Rollback Capability**: Emergency rollback to original system
- **Incremental Migration**: Support for large datasets with minimal downtime
- **Test Mode**: Dry-run capabilities for all operations

## Provider Support

These tools support migration to:
- **AWS RDS PostgreSQL**
- **Google Cloud SQL PostgreSQL** 
- **Azure Database for PostgreSQL**
- **Self-hosted PostgreSQL**
- **Any PostgreSQL-compatible database**

## Usage Examples

### Quick Migration (Small Database)
```bash
# 1. Backup and export
./backup-before-migration.sh
./export-supabase-data.sh

# 2. Create target and import
./create-target-database.sh aws-rds
./import-to-postgresql.sh aws-rds

# 3. Validate
psql $TARGET_DATABASE -f validate-migration.sql
```

### Large Database Migration (Minimal Downtime)
```bash
# 1. Preparation (during business hours)
./backup-before-migration.sh
./export-schema-only.sh
./create-target-database.sh aws-rds

# 2. Initial data sync (during business hours)
./export-supabase-data.sh --exclude-recent
./import-to-postgresql.sh aws-rds --initial-load

# 3. Final sync (maintenance window)
./export-supabase-data.sh --recent-only
./import-to-postgresql.sh aws-rds --incremental

# 4. Cutover
./update-application-config.sh aws-rds
./test-application.sh
```

## Monitoring and Alerts

All migration tools include:
- Progress monitoring with detailed logs
- Error detection and reporting
- Performance metrics collection
- Automated alerting for issues
- Detailed migration reports

## Recovery Procedures

If migration fails:
1. **Immediate Recovery**: Application continues on Supabase (no downtime)
2. **Partial Recovery**: Rollback specific tables or data
3. **Full Recovery**: Complete rollback to pre-migration state
4. **Data Recovery**: Restore from backups with point-in-time recovery

This comprehensive migration toolkit ensures safe, reliable database provider migration with minimal risk and downtime.