# Fix Set-Password API - Enhanced Error Logging

## 🎯 Problem
Getting 500 error from `/api/set-password` but need detailed error message to debug.

## 🔧 Solution
Add enhanced error logging to the set-password API to capture the exact error.

## 📝 Code Changes

### Update app/api/set-password/route.ts

Add this enhanced error logging after line 75:

```typescript
    if (passwordError) {
      console.error('❌ Error setting password:', passwordError)
      console.error('❌ Full password error:', JSON.stringify(passwordError, null, 2))
      console.error('❌ User ID being used:', user.id)
      return NextResponse.json(
        { 
          error: 'Failed to set password', 
          details: passwordError.message,
          userId: user.id,
          errorCode: passwordError.code || 'unknown'
        },
        { status: 500, headers: securityHeaders }
      )
    }
```

And after line 100:

```typescript
      if (basicProfileError) {
        console.error('❌ Error creating basic profile:', basicProfileError)
        console.error('❌ Full profile error:', JSON.stringify(basicProfileError, null, 2))
        console.error('❌ User ID for profile:', user.id)
        return NextResponse.json(
          { 
            error: 'Failed to create user profile', 
            details: basicProfileError.message,
            userId: user.id,
            errorCode: basicProfileError.code || 'unknown'
          },
          { status: 500, headers: securityHeaders }
        )
      }
```

## 🚀 Deploy Steps
1. Make these changes to set-password API
2. Commit and push
3. Wait for deployment
4. Test again and check Network tab for detailed error

## 🔍 Expected Result
This will give us the exact error message and help identify:
- User authentication issues
- Profile creation problems  
- Permission errors
- Database constraint violations

## Alternative Quick Check
Instead of code changes, you can:
1. Check Supabase dashboard for user `af912968-350b-4f5a-bbbb-eb7a053c529a`
2. If user doesn't exist, that's the root cause
3. If user exists, we need the enhanced logging to debug further