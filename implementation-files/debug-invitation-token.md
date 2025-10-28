# Debug Invitation Token Issue

## Problem
Getting "Invalid Invitation" message even though user exists in invitations table.

## Quick Debug Steps

### 1. Check Token in URL
Look at the URL in browser address bar:
```
https://jigr.app/accept-invitation?token=inv_17303...
```

### 2. Check Database Record
In Supabase invitations table, find the record and check:
- `token` field matches URL token exactly
- `status` = 'pending' (not 'accepted' or 'cancelled')
- `expires_at` is in the future
- `email` matches who you sent invitation to

### 3. Common Issues

**A) Invitation Already Used:**
- Status shows 'accepted' instead of 'pending'
- Solution: Send new invitation

**B) Invitation Expired:**
- expires_at date is in the past
- Solution: Send new invitation (extend expiry to 7 days)

**C) Token Mismatch:**
- URL token doesn't match database token field
- Solution: Use exact token from database or send new invitation

**D) Email Mismatch:**
- Invitation exists but for different email
- Solution: Send invitation to correct email

## Quick Fix
1. Delete the old invitation record from Supabase
2. Send a fresh invitation through the UI
3. Use the new email link immediately

## Debug Console Logs
Check browser console on accept-invitation page for detailed error messages.