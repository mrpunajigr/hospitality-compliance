# Supabase Email Override Configuration

## Overview
This configuration routes ALL Supabase auth emails through our branded Resend system instead of using Supabase's default email service.

## Implementation Steps

### 1. Supabase Auth Settings Override

In your Supabase Dashboard:
1. Go to **Authentication > Settings**
2. Scroll to **SMTP Settings**
3. Enable **Enable custom SMTP**

#### SMTP Configuration:
```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend  
SMTP Pass: [Your Resend API Key]
Sender Email: dev@jigr.app
Sender Name: JiGR Hospitality Compliance
```

### 2. Custom Email Templates in Supabase

Replace default templates in **Authentication > Email Templates**:

#### Confirm Signup Template:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your JiGR Account</title>
</head>
<body>
  <!-- Use our WelcomeEmail template HTML here -->
  <!-- Replace {{ .ConfirmationURL }} with actual confirmation link -->
</body>
</html>
```

#### Reset Password Template:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your JiGR Password</title>
</head>
<body>
  <!-- Use our PasswordResetEmail template HTML here -->
  <!-- Replace {{ .ConfirmationURL }} with actual reset link -->
</body>
</html>
```

### 3. Alternative: Supabase Edge Function Hook

Create an Edge Function to intercept auth emails and send via Resend:

```typescript
// supabase/functions/send-auth-email/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, email, data } = await req.json()
    
    // Route to appropriate JiGR template based on type
    let templateType = 'welcome'
    switch (type) {
      case 'signup':
        templateType = 'welcome'
        break
      case 'recovery':
        templateType = 'password-reset'
        break
      case 'email_change':
        templateType = 'email-verification'
        break
    }

    // Send via our Resend API endpoint
    const response = await fetch('https://jigr.app/api/auth-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('FUNCTION_SECRET')}`
      },
      body: JSON.stringify({
        email,
        templateType,
        data
      })
    })

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
```

### 4. Auth Email API Endpoint

Create `/app/api/auth-email/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { resendEmailService } from '@/lib/email-templates/resend-config'
import { generatePasswordResetEmail } from '@/lib/email-templates/templates/PasswordResetEmail'
import { generateWelcomeEmail } from '@/lib/email-templates/templates/WelcomeEmail'
import { generateEmailVerificationEmail } from '@/lib/email-templates/templates/EmailVerificationEmail'

export async function POST(req: NextRequest) {
  try {
    // Verify request is from Supabase
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.includes(process.env.SUPABASE_FUNCTION_SECRET || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, templateType, data } = await req.json()

    let emailTemplate
    switch (templateType) {
      case 'welcome':
        emailTemplate = generateWelcomeEmail({
          userEmail: email,
          userName: data.userName || 'User',
          confirmationUrl: data.confirmationUrl
        })
        break
      
      case 'password-reset':
        emailTemplate = generatePasswordResetEmail({
          userEmail: email,
          userName: data.userName || 'User',
          resetUrl: data.resetUrl,
          expiresInHours: 24
        })
        break
      
      case 'email-verification':
        emailTemplate = generateEmailVerificationEmail({
          userEmail: email,
          userName: data.userName || 'User',
          confirmationUrl: data.confirmationUrl,
          expiresInHours: 24
        })
        break
      
      default:
        return NextResponse.json({ error: 'Invalid template type' }, { status: 400 })
    }

    const result = await resendEmailService.send(email, emailTemplate)
    
    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

  } catch (error) {
    console.error('Auth email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

## Current Status

✅ **Transactional Emails**: Fully working with JiGR branding via Resend
✅ **Auth Email Templates**: Created and tested (welcome, verification, password reset)  
🔄 **Supabase Override**: Ready to implement - choose method above

## Testing

Test all auth email templates:
```bash
# Welcome email
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "you@email.com", "templateType": "welcome"}'

# Email verification  
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "you@email.com", "templateType": "email-verification"}'

# Password reset
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "you@email.com", "templateType": "password-reset"}'
```

## Next Steps

Choose implementation method:
1. **SMTP Override** (simpler) - Configure Supabase to use Resend SMTP
2. **Edge Function Hook** (more control) - Intercept and route via our API

Both methods ensure clients only see JiGR branding, never Supabase.