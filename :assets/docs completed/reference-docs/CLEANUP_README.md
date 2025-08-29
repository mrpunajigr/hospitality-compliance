# Database and Storage Cleanup Guide

This guide provides comprehensive scripts to purge all data from the hospitality compliance platform for clean Google Cloud AI testing.

## 🎯 Purpose

After debugging and testing, the database contains old test data that prevents us from seeing genuine Google Cloud AI processing results. This cleanup ensures:

- ✅ **Clean slate** for testing Google Cloud AI
- ✅ **Dashboard shows only real data** from new processing
- ✅ **Preserved user accounts** and company setup
- ✅ **Fresh storage buckets** without old uploads

## 🧹 Cleanup Components

### 1. **PURGE_ALL_DATA.sql** - Database Cleanup
Comprehensive SQL script that removes all processing data while preserving core setup.

**Deletes:**
- All delivery records and analysis results
- All temperature readings and compliance alerts  
- All audit logs and notifications
- All processing artifacts

**Preserves:**
- User accounts (`auth.users`, `profiles`)
- Company setup (`clients`, `client_users`)
- Supplier master data
- System configuration

### 2. **storage-cleanup.js** - Supabase Storage Cleanup
Node.js script that cleans all uploaded files from Supabase storage buckets.

**Cleans:**
- `delivery-documents` - Uploaded files
- `processed-images` - AI processing artifacts
- `temp-uploads` - Temporary files
- `document-processing` - Processing cache

### 3. **verify-cleanup.sql** - Post-Cleanup Verification
Verification queries to confirm cleanup was successful and system is ready for testing.

**Verifies:**
- All processing data is deleted
- Core setup data is preserved
- Database is ready for Google Cloud AI testing
- Provides readiness checklist

## 🚀 Execution Instructions

### Prerequisites

1. **Database Access**: Supabase SQL Editor or database connection
2. **Environment Variables**: For storage cleanup
   ```bash
   export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-key"
   ```
3. **Node.js Dependencies**: 
   ```bash
   npm install @supabase/supabase-js
   ```

### Step 1: Database Cleanup

```sql
-- Execute in Supabase SQL Editor
-- File: PURGE_ALL_DATA.sql
```

1. **Open Supabase Dashboard** → Your Project → SQL Editor
2. **Copy contents** of `PURGE_ALL_DATA.sql`
3. **Paste and execute** the script
4. **Verify output** shows success messages
5. **Confirm** all processing data counts are 0

**Expected Output:**
```
✅ SUCCESS: All delivery data purged successfully
✅ SUCCESS: Core setup data preserved (1 clients, 1 profiles)
🧹 DATABASE PURGE COMPLETE
📊 Ready for fresh Google Cloud AI testing
```

### Step 2: Storage Cleanup

```bash
# Execute storage cleanup script
node storage-cleanup.js
```

**Expected Output:**
```
🚀 Starting Supabase Storage Cleanup
🧹 Processing bucket: delivery-documents
   ✅ Deleted 15 files from 'delivery-documents'
🧹 Processing bucket: processed-images
   📭 Bucket 'processed-images' is already empty

📊 CLEANUP SUMMARY
✅ delivery-documents: 15 files deleted
📭 processed-images: 0 files deleted

🎯 Total files deleted: 15
✅ Storage cleanup completed successfully
```

### Step 3: Verification

```sql
-- Execute in Supabase SQL Editor
-- File: verify-cleanup.sql
```

**Expected Results:**
- All processing tables show 0 records
- Core setup tables show preserved data
- Readiness status shows "✅ READY"

## 🔍 Verification Checklist

After running all scripts, verify:

- [ ] **Database**: `delivery_records` count = 0
- [ ] **Database**: `violation_alerts` count = 0  
- [ ] **Database**: `temperature_readings` count = 0
- [ ] **Storage**: All buckets empty or non-existent
- [ ] **Dashboard**: Shows "No delivery records found"
- [ ] **Login**: `dev@jigr.app` authentication still works
- [ ] **Upload**: Upload interface accessible and functional

## 🧪 Testing Workflow

After cleanup, test the complete Google Cloud AI workflow:

### 1. Access Application
```bash
# Go to custom domain
https://compliance.jigr.app
```

### 2. Authenticate
```
Email: dev@jigr.app
Password: dev123
```

### 3. Test Upload
1. **Navigate** to Upload tab
2. **Select** a delivery docket image
3. **Click** "Processing..."
4. **Wait** for Google Cloud AI processing

### 4. Verify Results
1. **Switch** to Dashboard tab
2. **Check** for ConfigurableResultsCard display
3. **Verify** thumbnail and analysis data
4. **Confirm** temperature compliance analysis

## ⚠️ Important Notes

### Safety Measures
- ✅ **Development Only**: These scripts are for development environments
- ✅ **Backup Available**: Supabase provides point-in-time recovery
- ✅ **Atomic Operations**: Database cleanup uses transactions
- ✅ **Verification Required**: Always run verification after cleanup

### Rollback Plan
If you need to restore data:

1. **Supabase Backup**: Dashboard → Settings → Database → Point-in-time recovery
2. **Re-run Setup**: Execute `CREATE_TEST_COMPANY.sql` again
3. **Import Data**: Restore from backup if available

### Known Issues
- **API Routes 404**: Vercel platform bug affects backend processing
- **Frontend Only**: Upload interface works but processing may fail
- **Manual Verification**: Always verify results manually

## 📁 File Summary

| File | Purpose | Location |
|------|---------|----------|
| `PURGE_ALL_DATA.sql` | Database cleanup | Project root |
| `storage-cleanup.js` | Storage cleanup | Project root |
| `verify-cleanup.sql` | Post-cleanup verification | Project root |
| `CLEANUP_README.md` | This guide | Project root |

## 🎉 Expected Outcome

After successful cleanup:

✅ **Clean Environment**: Zero old test data  
✅ **Preserved Setup**: User accounts and company data intact  
✅ **Fresh Storage**: Empty storage buckets  
✅ **Ready for Testing**: Dashboard shows empty state  
✅ **Functional Authentication**: Login and upload interface working  

The platform is now ready for genuine Google Cloud AI testing with results that will display accurately on the dashboard.

## 🐛 Troubleshooting

### Database Cleanup Issues
```sql
-- Check for foreign key constraints
SELECT * FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY';

-- Manual cleanup if script fails
DELETE FROM violation_alerts;
DELETE FROM temperature_readings;
DELETE FROM delivery_records;
```

### Storage Cleanup Issues
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Test connection
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('Connection test:', supabase ? 'OK' : 'Failed');
"
```

### Verification Issues
```sql
-- Quick status check
SELECT 
    (SELECT COUNT(*) FROM delivery_records) as deliveries,
    (SELECT COUNT(*) FROM clients) as clients,
    (SELECT COUNT(*) FROM profiles) as users;
```

For additional support, check the browser console for debugging information and verify all environment variables are correctly set.