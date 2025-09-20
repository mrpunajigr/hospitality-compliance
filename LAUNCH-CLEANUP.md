# 🚀 Launch Cleanup Procedure - JiGR Hospitality Compliance

## Overview
Complete procedure for cleaning all test data before production launch.

## ⚠️ CRITICAL WARNING
**This procedure will permanently delete ALL user accounts, companies, and test data.**  
**This action is IRREVERSIBLE.**  
**Only execute when ready for production launch.**

---

## 📋 Pre-Launch Cleanup Checklist

### 1. 🗃️ Database Cleanup
**Method: Supabase SQL Editor**

1. Go to: https://supabase.com/dashboard/project/rggdywqnvpuwssluzfud/sql
2. Copy and paste the entire contents of `scripts/launch-cleanup.sql`
3. Click "Run" to execute
4. Verify all counts show 0 in the final verification

**What gets deleted:**
- ✅ All auth users (`auth.users`)
- ✅ All user profiles (`profiles`) 
- ✅ All companies (`clients`)
- ✅ All user-company relationships (`client_users`)
- ✅ All invitations (`invitations`)
- ✅ All uploaded assets (`assets`)
- ✅ All document data (`document_analyses`, `delivery_dockets`)

**What gets preserved:**
- ✅ Database schema and table structure
- ✅ RLS policies and security rules
- ✅ System assets and icons
- ✅ All application functionality

### 2. 🗂️ Storage Cleanup
**Method: Supabase Dashboard**

1. Go to: https://supabase.com/dashboard/project/rggdywqnvpuwssluzfud/storage/buckets
2. **company-logos bucket**: Delete all uploaded company logos
3. **document-uploads bucket**: Delete all test documents
4. **Keep module-assets bucket**: Contains system icons (JiGR logos, etc.)

### 3. 🔐 Security Reset (Launch Day)
1. **Rotate API Keys**: Generate new Supabase service role key
2. **Update Environment Variables**: Update all production environment variables
3. **Test Integrations**: Verify email service, storage, auth still work

### 4. ✅ Post-Cleanup Verification
1. **Test Account Creation**: Create first account (should get ID #1)
2. **Test All Features**: 
   - Account creation with new fields
   - Email invitations
   - Business info display
   - File uploads
3. **Performance Check**: Verify clean database performs well

---

## 🎯 Success Criteria

After cleanup, you should see:
- ✅ **Auth Users**: 0
- ✅ **Profiles**: 0  
- ✅ **Clients**: 0
- ✅ **Client Users**: 0
- ✅ **Invitations**: 0
- ✅ **Clean IDs**: Next account gets ID #1
- ✅ **All Features Working**: Full functionality preserved

---

## 🆘 Emergency Rollback

If cleanup goes wrong:
1. **Stop immediately** - don't run additional cleanup
2. **Check backups** - restore from any available backups
3. **Contact support** - Supabase support for data recovery
4. **Rebuild from source** - worst case: fresh database with proper schema

---

## 📅 Launch Day Timeline

**T-1 Day:**
- [ ] Final backup of any important test data
- [ ] Notify team of cleanup schedule
- [ ] Prepare new environment variables

**T-Day (Launch):**
- [ ] Execute database cleanup script
- [ ] Clear storage buckets
- [ ] Update environment variables  
- [ ] Test first account creation
- [ ] Verify all functionality
- [ ] Monitor for issues

**T+1 Hour:**
- [ ] Create first real customer accounts
- [ ] Monitor system performance
- [ ] Check email deliverability
- [ ] Verify clean analytics/logs

---

## 🔧 Alternative Methods

If SQL script fails:
1. **Manual Dashboard Cleanup**: Delete records table by table in Supabase dashboard
2. **API Cleanup**: Use Supabase management API (requires additional setup)
3. **Fresh Database**: Create new database and migrate schema (extreme case)

---

**✅ This procedure ensures a completely clean, production-ready database with all functionality intact and optimal performance.**