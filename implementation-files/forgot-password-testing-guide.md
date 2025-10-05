# Forgot Password Testing Guide

## 🧪 Complete Testing Flow

### Test Setup
- **Forgot Password Page**: https://jigr.app/forgot-password
- **Test Email**: Use an existing account email (e.g., mrpuna+beach2020@gmail.com)
- **Expected Flow**: Forgot Password → Email → Reset Password → Sign In

### Test Steps

#### 1. Access Forgot Password Page
```
URL: https://jigr.app/forgot-password
Expected: Clean form with email input and "Send Reset Link" button
```

#### 2. Submit Email Request
```
Action: Enter email address and click "Send Reset Link"
Expected: 
- Loading state with spinner
- Success message: "Reset Link Sent"
- Email should arrive within 1-2 minutes
```

#### 3. Check Email Content
```
Look for:
- Subject: Password reset request
- From: dev@jigr.app  
- Reset link should contain access_token and refresh_token parameters
- Link format: https://jigr.app/reset-password?access_token=...&refresh_token=...
```

#### 4. Test Reset Link
```
Action: Click reset link from email
Expected:
- Redirects to https://jigr.app/reset-password
- Form appears with password and confirm password fields
- Password strength indicator shows
```

#### 5. Test Password Reset
```
Action: Enter new password and confirm
Requirements:
- Minimum 8 characters
- Include uppercase, lowercase, numbers
- Passwords must match
Expected: Success redirect to sign in page
```

#### 6. Test New Password
```
Action: Sign in with new password
Expected: Successful login to dashboard
```

## 🔧 Test Commands

### Manual Email Test (if needed)
```bash
curl -X POST https://jigr.app/api/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test-email@domain.com"}'
```

### Expected API Response
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

## 🚨 Common Issues to Check

1. **Email Not Received**
   - Check spam folder
   - Verify Supabase email settings
   - Check API logs for errors

2. **Invalid Reset Link**
   - Tokens expire after 24 hours
   - Each token can only be used once
   - Check URL parameters are complete

3. **Password Requirements**
   - Minimum 8 characters
   - Must include: uppercase, lowercase, numbers
   - Special characters recommended

## ✅ Success Criteria

- [ ] Email is sent within 2 minutes
- [ ] Reset link works correctly
- [ ] Password validation functions properly
- [ ] New password allows successful login
- [ ] Old password no longer works
- [ ] UI feedback is clear throughout process

## 📧 Email Configuration Status

- **Provider**: Resend
- **From Address**: dev@jigr.app
- **Service**: Supabase Auth (resetPasswordForEmail)
- **Redirect URL**: https://jigr.app/reset-password

## 🔐 Security Features

- Email enumeration protection (always returns success)
- Token expiration (24 hours)
- Single-use tokens
- Password strength validation
- Secure redirect handling