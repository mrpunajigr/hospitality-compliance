# 🔧 Fix Client ID UUID Error

## The Problem
Edge Function is using:
```typescript
client_id: 'cli-test'
```

But database expects UUID format like:
```
client_id: '550e8400-e29b-41d4-a716-446655440000'
```

## Quick Fix: Update Edge Function

Replace in the Edge Function:
```typescript
// WRONG:
client_id: 'cli-test',

// CORRECT:
client_id: '550e8400-e29b-41d4-a716-446655440000',
```

## OR Use Real Client ID
If you have a real client ID from your system, use that instead. The format needs to be a valid UUID.

## Deploy This Fix
1. **Go to Supabase Dashboard** → Edge Functions → process-delivery-docket
2. **Find line with**: `client_id: 'cli-test',`  
3. **Replace with**: `client_id: '550e8400-e29b-41d4-a716-446655440000',`
4. **Deploy** the updated function

## Test After Fix
- Upload an image again
- Should see green logs instead of red UUID errors
- Database record should be created successfully

This is the same UUID format issue we had with user_id - now it's happening with client_id!