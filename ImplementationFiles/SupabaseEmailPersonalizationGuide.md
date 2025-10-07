# Supabase Email Personalization Guide

## Overview
How to personalize the password reset email template in Supabase to show the user's actual name instead of "Hello User".

## Steps to Implement

### 1. Access Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `rggdywqnvpuwssluzfud`
3. Navigate to: **Authentication** → **Email Templates**

### 2. Edit Password Reset Template
1. Click on **"Reset Password"** template
2. Find the greeting line that currently says: `Hello User,`
3. Replace with one of these options:

#### Option A: Use Full Name from User Metadata (RECOMMENDED)
```html
Hello {{ .UserMetaData.full_name | default "there" }},
```

#### Option B: Use First Name Only (if available)
```html
Hello {{ .UserMetaData.full_name | split " " | first | default "there" }},
```

#### Option C: Use Email Username (fallback)
```html
Hello {{ .Email | split "@" | first | title }},
```

### 3. Complete Template Example
```html
<h2>Password Reset Request</h2>

<p>Hello {{ .UserMetaData.full_name | default "there" }},</p>

<p>We received a request to reset the password for your JiGR account 
({{ .Email }}). If you made this request, click the link below:</p>

<p><a href="{{ .ConfirmationURL }}">Reset your password</a></p>

<p>If you didn't request this, you can safely ignore this email.</p>

<p>Best regards,<br>
The JiGR Team</p>
```

### 4. User Metadata Requirements
For this to work, users need to have metadata stored in their Supabase auth profile:

```typescript
// Your app already stores this during signup:
const { data, error } = await supabase.auth.signUp({
  email: formData.email,
  password: tempPassword,
  options: {
    data: {
      full_name: formData.fullName,
      company_name: formData.companyName
    }
  }
})
```

### 5. Testing
1. Save the template changes
2. Test password reset with a user who has metadata
3. Check email shows personalized greeting

## Fallback Strategy
The `| default "there"` ensures if no metadata exists, it will show:
- "Hello there," instead of "Hello ," (empty)
- Graceful degradation for users without stored names

## Alternative: Email Prefix Method
If user metadata isn't available, you can extract name from email:
```html
Hello {{ .Email | split "@" | first | title }},
```

This would turn `john.doe@company.com` into "Hello John.doe,"