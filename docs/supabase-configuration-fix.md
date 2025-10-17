# Supabase Configuration Fix for Password Reset Emails

## Problem
Password reset emails are redirecting to `http://jigr.app` (main domain, HTTP) instead of `https://app.jigr.app/reset-password` (app subdomain, HTTPS)

## Root Cause
The Supabase project's site URL configuration is set to the main domain `jigr.app` instead of the app subdomain `app.jigr.app`.

## Fix Required in Supabase Dashboard

### Step 1: Access Supabase Project Settings
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `hospitality-compliance` 
3. Navigate to **Settings** → **Authentication**

### Step 2: Update Site URL Configuration
Look for these settings and update them:

**Current (Incorrect) Settings:**
- Site URL: `http://jigr.app` or `https://jigr.app` (main domain)
- Redirect URLs: May only include main `jigr.app` domain

**Required (Correct) Settings:**
- **Site URL**: `https://app.jigr.app` (app subdomain)
- **Redirect URLs**: Add/Update to include:
  - `https://app.jigr.app/**`
  - `https://app.jigr.app/reset-password`
  - `https://app.jigr.app/login`
  - Keep existing `https://jigr.app/**` for backwards compatibility

### Step 3: Update Additional Redirect URLs
In the **Redirect URLs** section, ensure these are listed:
```
https://app.jigr.app/reset-password
https://app.jigr.app/login
https://app.jigr.app/auth/callback
https://app.jigr.app/**
```

### Step 4: Save and Test
1. **Save** the configuration changes
2. **Wait 2-3 minutes** for changes to propagate
3. Test the forgot-password flow again

## Verification
After making these changes, password reset emails should:
1. Redirect to: `https://app.jigr.app/reset-password?token=...&type=recovery`
2. Load the reset password form properly
3. Allow successful password changes

## Current Email Link Analysis
**Problematic URL:**
```
https://rggdywqnvpuwssluzfud.supabase.co/auth/v1/verify?token=pkce_8950f82c8a25ae62ede0c74d333b184783e456528fd2718389a7923f&type=recovery&redirect_to=http://jigr.app
```

**Expected URL after fix:**
```
https://rggdywqnvpuwssluzfud.supabase.co/auth/v1/verify?token=...&type=recovery&redirect_to=https://app.jigr.app/reset-password
```

## Notes
- This is a **one-time configuration fix** in Supabase dashboard
- Our code is correctly setting `redirectTo: 'https://app.jigr.app/reset-password'`
- Supabase's default Site URL setting overrides our API parameter
- Changes may take a few minutes to take effect