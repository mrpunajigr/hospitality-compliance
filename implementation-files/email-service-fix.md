# Email Service Fix - Enable Real Email Sending

## Problem
The invitation system is working but emails aren't being sent because the email service is in DEMO mode.

## Root Cause
- `EMAIL_PROVIDER` environment variable is not set
- Email service defaults to demo mode (lines 42, 364-368 in email-service.ts)
- Demo mode only logs to console instead of sending real emails

## Current Status
```typescript
// lib/email-service.ts line 42
provider: (process.env.EMAIL_PROVIDER as 'sendgrid' | 'demo') || 'demo'
```

Without EMAIL_PROVIDER set, it uses DemoEmailService which just console.logs.

## Solutions

### Option 1: Use Existing Resend Integration (Recommended)
Based on CLAUDE.md mentioning email configuration with Resend API key:

1. **Set Environment Variable in Production:**
   ```
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_XESGX... (already configured)
   ```

2. **Add Resend Service to email-service.ts:**
   ```typescript
   class ResendService {
     constructor(private apiKey: string, private config: EmailConfig) {}
     
     async send(to: string, template: EmailTemplate): Promise<EmailSendResult> {
       try {
         const response = await fetch('https://api.resend.com/emails', {
           method: 'POST',
           headers: {
             'Authorization': `Bearer ${this.apiKey}`,
             'Content-Type': 'application/json'
           },
           body: JSON.stringify({
             from: `${this.config.fromName} <${this.config.fromEmail}>`,
             to: [to],
             subject: template.subject,
             html: template.htmlContent,
             text: template.textContent
           })
         })
         
         if (!response.ok) {
           throw new Error(`Resend API error: ${response.status}`)
         }
         
         const result = await response.json()
         return { success: true, messageId: result.id }
       } catch (error) {
         return { 
           success: false, 
           error: error instanceof Error ? error.message : 'Unknown error' 
         }
       }
     }
   }
   ```

3. **Update EmailService constructor:**
   ```typescript
   switch (this.config.provider) {
     case 'resend':
       if (!this.config.apiKey) throw new Error('Resend API key required')
       this.service = new ResendService(this.config.apiKey, this.config)
       break
     case 'sendgrid':
       if (!this.config.apiKey) throw new Error('SendGrid API key required')
       this.service = new SendGridService(this.config.apiKey, this.config)
       break
     case 'demo':
     default:
       this.service = new DemoEmailService()
       break
   }
   ```

### Option 2: Force Non-Demo Mode (Quick Fix)
Change the default provider to use existing SendGrid configuration:

```typescript
// lib/email-service.ts line 42
provider: (process.env.EMAIL_PROVIDER as 'sendgrid' | 'demo') || 'sendgrid'
```

But this requires valid SENDGRID_API_KEY to be set.

## Recommended Implementation
Use Option 1 with Resend since the API key is already configured and mentioned in CLAUDE.md context.

## Testing After Fix
1. Send invitation through UI
2. Check console logs for "📧 EmailService initializing" - should show provider: 'resend'
3. Check recipient email inbox
4. Verify invitation token works for acceptance

## Notes
- User creation in Supabase Auth happens when they ACCEPT the invitation, not when invited
- The current behavior (invitation appears in frontend but no email) is expected with demo mode
- Real emails will contain acceptance links that create actual users when clicked