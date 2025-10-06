# Debug Profile Update Failure

## 🚨 Current Issue
User gets "Failed to update profile" error when trying to complete profile with password on production.

## 📸 Evidence from Screenshots
1. ✅ Password fields are working and visible
2. ✅ Form submits (shows loading state)
3. ❌ Update fails with red error message
4. ⚠️ Email shows as `dev@jigr.app` instead of user's actual email

## 🔍 Debugging Steps

### Step 1: Check API Endpoint Response
Test the set-password API directly to see the error:

```bash
curl -X POST https://jigr.app/api/set-password \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID_FROM_REGISTRATION",
    "password": "TestPassword123!",
    "profileData": {
      "preferredName": "Test User",
      "mobileNumber": "0224332749",
      "jobTitle": "Head Chef",
      "department": "Kitchen"
    }
  }'
```

### Step 2: Check Environment Variables
Verify these are set correctly in Netlify:
- `SUPABASE_SERVICE_ROLE_KEY` - Required for admin operations
- `NEXT_PUBLIC_SUPABASE_URL` - Should match production Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Should match production

### Step 3: Check User Authentication
The API needs to verify the user exists in Supabase auth.users table.
The error might be at this check:

```typescript
const { data: existingUser, error: userCheckError } = await supabaseAdmin.auth.admin.getUserById(user.id)
```

### Step 4: Check Profile Creation Logic
The API tries to upsert into profiles table. Error might be:
- Foreign key constraint (user doesn't exist in auth.users)
- Missing required fields
- Permission issues with service role

## 🔧 Likely Root Causes

### Cause 1: User ID Mismatch
- User registered with test email but system expects different user ID
- Need to check what user ID is being passed from frontend

### Cause 2: Service Role Key Issue
- Service role key not configured properly in Netlify
- Admin client can't perform auth operations

### Cause 3: Database Constraint Issue
- Same foreign key constraint we saw earlier
- User exists in registration but not in auth.users table

## 🎯 Immediate Actions Needed

1. **Check Netlify Environment Variables**
   - Verify SUPABASE_SERVICE_ROLE_KEY is set
   - Verify it has correct permissions

2. **Test API Endpoint Directly**
   - Get actual error response from production API
   - Check what user ID is being used

3. **Check Database State**
   - Verify user exists in auth.users table
   - Check if profile creation is working

4. **Fix Email Issue**
   - User should have registered with proper email
   - May need to update email in Supabase auth

## 🔍 Debug Commands

### Check User in Database
```sql
-- Check if user exists in auth.users
SELECT id, email, created_at FROM auth.users 
WHERE email = 'user-actual-email@domain.com';

-- Check if profile exists
SELECT * FROM profiles 
WHERE id = 'USER_ID_HERE';
```

### Test API Response
```bash
# Get detailed error from production API
curl -X POST https://jigr.app/api/set-password \
  -H "Content-Type: application/json" \
  -d '{"userId":"actual-user-id","password":"Test123!"}' \
  -v
```

## ✅ Expected Fix
Once we identify the root cause:
1. Fix user authentication issue
2. Ensure service role permissions
3. Update email if needed
4. Test complete flow again

The password functionality is working - we just need to fix the backend API issue.