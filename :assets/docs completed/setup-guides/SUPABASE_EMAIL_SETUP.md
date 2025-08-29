# Supabase Email Verification Setup

## Required Configuration in Supabase Dashboard

### 1. Email Authentication Settings
Navigate to **Authentication > Settings** in your Supabase dashboard:

- ✅ **Enable email confirmations**: ON
- ✅ **Confirm email on sign up**: ON  
- ✅ **Double confirm email changes**: ON
- ⚠️ **Secure email change enabled**: ON (recommended)

### 2. Email Templates
Configure email templates in **Authentication > Email Templates**:

#### Confirm signup template:
```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your account:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your mail</a></p>
```

#### Magic Link template:
```html
<h2>Magic Link</h2>
<p>Follow this link to login:</p>
<p><a href="{{ .ConfirmationURL }}">Log In</a></p>
```

### 3. Redirect URLs
Add these URLs to **Authentication > URL Configuration**:

**Site URL:**
```
https://your-domain.com
```

**Redirect URLs:**
```
http://localhost:3000/console/dashboard
https://your-domain.com/console/dashboard
```

### 4. SMTP Settings (Production)
For production, configure SMTP in **Settings > Auth**:

- **SMTP Host**: Your email provider's SMTP server
- **SMTP Port**: 587 (TLS) or 465 (SSL)
- **SMTP User**: Your email address
- **SMTP Pass**: Your email password or app password
- **SMTP Admin Email**: admin@yourdomain.com

### 5. Testing Email Verification

#### Development Testing:
1. Register a new account
2. Check your email for confirmation link
3. Click link to verify email
4. User should be redirected to `/console/dashboard`

#### Production Testing:
1. Test with real email addresses
2. Verify SMTP configuration is working
3. Check spam folders for confirmation emails
4. Test email template formatting

## Code Integration Status ✅

The application is already configured to work with email verification:

- ✅ **Registration flow** creates company automatically after email confirmation
- ✅ **Login redirects** properly handle verified users
- ✅ **Dashboard access** requires authenticated users
- ✅ **Profile creation** happens automatically on signup

## Next Steps

1. **Configure Supabase dashboard** settings above
2. **Test registration flow** with real email
3. **Deploy changes** to production
4. **Update environment variables** with SMTP settings if needed

## Troubleshooting

**Email not received:**
- Check spam folder
- Verify SMTP configuration
- Check Supabase logs for email delivery errors

**Confirmation link not working:**
- Verify redirect URLs are correct
- Check if email confirmation is enabled
- Ensure user isn't already confirmed

**User can't access dashboard:**
- Verify email confirmation is complete
- Check if profile was created properly
- Ensure client_users relationship exists