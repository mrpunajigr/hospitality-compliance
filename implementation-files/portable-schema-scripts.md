# Portable Database Schema Scripts

## Overview

These scripts create the complete JiGR Platform database schema in a vendor-agnostic way, supporting migration to any PostgreSQL-compatible database provider.

## Files Created

### Core Schema Scripts
1. `schema/01-core-tables.sql` - Core business tables
2. `schema/02-compliance-module.sql` - Temperature compliance module tables  
3. `schema/03-indexes.sql` - Performance indexes
4. `schema/04-functions.sql` - Database functions (PostgreSQL specific)
5. `schema/05-rls-policies.sql` - Row Level Security policies (Supabase/PostgreSQL)

### Provider-Specific Scripts
1. `schema/providers/postgresql.sql` - PostgreSQL-specific features
2. `schema/providers/mysql.sql` - MySQL conversion script (future)
3. `schema/providers/sqlite.sql` - SQLite conversion script (future)

### Migration Scripts
1. `migration/export-supabase.sql` - Export data from Supabase
2. `migration/import-postgresql.sql` - Import data to PostgreSQL
3. `migration/validate-migration.sql` - Validation queries

### Utility Scripts
1. `utils/create-database.sql` - Database creation
2. `utils/drop-database.sql` - Database cleanup
3. `utils/backup-restore.sql` - Backup and restore procedures

## Usage

### Creating New Database
```bash
# 1. Create database
psql -h host -U user -c "CREATE DATABASE jigr_platform"

# 2. Create schema
psql -h host -U user -d jigr_platform -f schema/01-core-tables.sql
psql -h host -U user -d jigr_platform -f schema/02-compliance-module.sql
psql -h host -U user -d jigr_platform -f schema/03-indexes.sql

# 3. Add PostgreSQL-specific features (optional)
psql -h host -U user -d jigr_platform -f schema/04-functions.sql
psql -h host -U user -d jigr_platform -f schema/05-rls-policies.sql
```

### Migrating from Supabase
```bash
# 1. Export data from Supabase
pg_dump "postgresql://postgres:password@db.project.supabase.co:5432/postgres" \
  --data-only --inserts > supabase-data.sql

# 2. Create new database with schema
./scripts/create-database.sh

# 3. Import data
psql -h new-host -U user -d jigr_platform -f supabase-data.sql

# 4. Validate migration
psql -h new-host -U user -d jigr_platform -f migration/validate-migration.sql
```

## Features

- **Vendor Agnostic**: Uses standard PostgreSQL SQL that works across providers
- **Modular Design**: Separate files for different components
- **Migration Ready**: Complete export/import procedures
- **Validation**: Automated checks for data integrity
- **Performance Optimized**: Comprehensive indexing strategy
- **Security Ready**: Multi-tenant RLS policies included

## Next Steps

After running these scripts:
1. Update application configuration to use new database
2. Test all functionality with new provider
3. Implement monitoring and alerting
4. Set up backup procedures
5. Update deployment scripts