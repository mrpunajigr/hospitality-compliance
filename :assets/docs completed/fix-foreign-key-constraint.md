# Foreign Key Constraint Fix - client_users table

## 🚨 Issue Identified

**Error:** `23503: insert or update on table "client_users" violates foreign key constraint "client_users_user_id_fkey"`

**Root Cause:** The `client_users` table has a foreign key constraint that references the `profiles` table, but the user ID `2815053e-c7bc-407f-9bf8-fbab2e744f25` doesn't exist in the `profiles` table.

## 🔍 Analysis

The issue occurs in this sequence:
1. User registers and gets authenticated (exists in `auth.users`)
2. User sets password → **Should create profile in `profiles` table**
3. User creates company → Tries to insert into `client_users` table
4. **FAILS** because user ID not found in `profiles` table

## 🛠️ Immediate Fix

The `create-company` API (lines 78-129) already has logic to handle this by checking for existing profiles and creating them if missing. However, the logic may not be working correctly.

### API Testing Commands

```bash
# Test the set-password API to see if it creates profiles correctly
curl -X POST http://localhost:3000/api/set-password \
  -H "Content-Type: application/json" \
  -d '{
    "password": "TestPassword123!",
    "profileData": {
      "preferredName": "Test User",
      "mobileNumber": "021234567",
      "jobTitle": "Manager",
      "department": "Kitchen"
    }
  }'

# Check if create-company handles missing profiles
curl -X POST http://localhost:3000/api/create-company \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Business",
    "businessType": "restaurant", 
    "phone": "021234567",
    "userId": "2815053e-c7bc-407f-9bf8-fbab2e744f25",
    "email": "test@example.com",
    "fullName": "Test User"
  }'
```

## 🔧 Code Analysis

### set-password API (app/api/set-password/route.ts)
- **Line 48-69**: Updates `profiles` table with upsert
- **Should handle**: Creating profile if it doesn't exist
- **Problem**: May not be working due to authentication context

### create-company API (app/api/create-company/route.ts)  
- **Line 78-129**: Checks for existing profile and creates if missing
- **Line 327-338**: Inserts into `client_users` table with foreign key reference
- **Problem**: Profile creation logic may have edge cases

## ✅ Solutions

### Option 1: Fix Authentication Context in set-password
The `set-password` API uses `supabase.auth.getUser()` which may not work properly if called without proper authentication context.

### Option 2: Enhance create-company Profile Creation
The `create-company` API profile creation logic should be more robust to handle all edge cases.

### Option 3: Add Profile Creation Trigger
Create a database trigger that automatically creates a profile when a user is inserted into `auth.users`.

## 🧪 Testing Steps

1. **Test Authentication Flow**:
   - Register user
   - Set password via `/update-profile`
   - Check if profile exists in database
   - Create company and verify success

2. **Test Error Scenario**:
   - Directly call create-company with user ID that doesn't have profile
   - Verify the error handling and profile creation works

3. **Database Verification**:
   - Check foreign key constraints
   - Verify profile creation triggers
   - Ensure data consistency

## 🎯 Next Steps

1. Test the complete authentication flow to identify where the profile creation is failing
2. Add better error handling and logging to track the issue
3. Consider implementing a database trigger for automatic profile creation
4. Update the authentication system to ensure profiles are always created

## 🔒 Security Considerations

- Ensure user authentication is properly validated before profile creation
- Maintain foreign key constraints for data integrity
- Log authentication attempts for debugging

The authentication system is working correctly, but there's a data consistency issue that needs to be resolved to ensure smooth user onboarding.