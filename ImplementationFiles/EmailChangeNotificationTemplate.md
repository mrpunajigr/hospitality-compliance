# Email Change Notification Template (Spam-Safe)

## Change Email Address Template - NOTIFICATION VERSION

**Use for:** Authentication → Email Templates → **Change Email Address**

This template notifies users that their email address has been successfully changed.

```html
<div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', Helvetica, Arial, sans-serif;">
  <!-- Header -->
  <div style="
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    border-radius: 12px 12px 0 0;
    padding: 40px 20px;
    text-align: center;
  ">
    <!-- JiGR Logo Placeholder -->
    <div style="
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 16px;
      display: inline-block;
      margin-bottom: 16px;
    ">
      <h1 style="
        color: white;
        font-size: 24px;
        font-weight: 700;
        margin: 0;
        letter-spacing: 2px;
      ">JiGR</h1>
    </div>
    
    <h2 style="
      color: white;
      font-size: 28px;
      font-weight: 600;
      margin: 0 0 8px 0;
    ">Email Address Updated</h2>
    
    <p style="
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      margin: 0;
      font-weight: 300;
    ">Account notification</p>
  </div>

  <!-- Main Content -->
  <div style="
    background: white;
    padding: 40px 30px;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  ">
    <p style="font-size: 18px; margin-bottom: 24px; color: #374151;">
      Hello <strong>{{ .UserMetaData.full_name | default "there" }}</strong>,
    </p>
    
    <p style="font-size: 16px; margin-bottom: 24px; color: #4b5563; line-height: 1.6;">
      This is a notification that your email address for your JiGR account has been successfully updated.
    </p>
    
    <!-- Email Change Details -->
    <div style="
      background: #f0f9ff;
      border: 1px solid #0ea5e9;
      border-radius: 12px;
      padding: 24px;
      margin: 32px 0;
    ">
      <h3 style="
        color: #0c4a6e;
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 16px 0;
      ">
        Account Update Summary:
      </h3>
      
      <div style="
        background: white;
        border-radius: 8px;
        padding: 16px;
        font-size: 14px;
      ">
        <p style="margin: 0 0 8px 0; color: #6b7280;">
          <strong>Previous Email:</strong> {{ .OldRecord.email | default "Your previous email" }}
        </p>
        <p style="margin: 0; color: #059669; font-weight: 600;">
          <strong>New Email:</strong> {{ .NewRecord.email }}
        </p>
        <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 12px;">
          Updated on: {{ .UpdatedAt | default "recently" }}
        </p>
      </div>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 24px; color: #4b5563;">
      Your account is now associated with your new email address. You can continue using all JiGR services as normal.
    </p>
    
    <!-- Next Steps -->
    <div style="
      background: #ecfdf5;
      border: 1px solid #10b981;
      border-radius: 8px;
      padding: 20px;
      margin: 32px 0;
    ">
      <h4 style="
        color: #065f46;
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 12px 0;
      ">
        What happens next:
      </h4>
      <ul style="margin: 0; padding-left: 20px; color: #047857; font-size: 14px; line-height: 1.6;">
        <li>Use your new email address for all future logins</li>
        <li>All notifications will be sent to your new email</li>
        <li>Your account data and settings remain unchanged</li>
        <li>Team members will see your updated email address</li>
      </ul>
    </div>
    
    <!-- Security Notice -->
    <div style="
      background: #fef2f2;
      border: 1px solid #f87171;
      border-radius: 8px;
      padding: 20px;
      margin: 32px 0;
    ">
      <h4 style="
        color: #dc2626;
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 12px 0;
      ">
        Security Notice
      </h4>
      <p style="margin: 0; font-size: 14px; color: #7f1d1d; line-height: 1.5;">
        If you did not make this change, please contact our support team immediately at support@jigr.app. 
        Your account security is our priority.
      </p>
    </div>
    
    <hr style="margin: 32px 0; border: none; height: 1px; background: #e5e7eb;">
    
    <!-- Support Section -->
    <div style="text-align: center;">
      <h4 style="
        color: #374151;
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 12px 0;
      ">Questions about this change</h4>
      
      <p style="font-size: 14px; color: #6b7280; margin: 0;">
        Email: <a href="mailto:support@jigr.app" style="color: #3b82f6; text-decoration: none;">support@jigr.app</a>
        &nbsp;&nbsp;•&nbsp;&nbsp;
        Help Center: <a href="https://jigr.app/help" style="color: #3b82f6; text-decoration: none;">jigr.app/help</a>
      </p>
    </div>
  </div>

  <!-- Footer -->
  <div style="
    background: #f8fafc;
    padding: 24px;
    text-align: center;
    color: #64748b;
    font-size: 12px;
    border-radius: 0 0 8px 8px;
  ">
    <p style="margin: 0 0 8px 0;">
      <strong>JiGR Hospitality Compliance</strong><br>
      New Zealand's digital compliance platform
    </p>
    <p style="margin: 0;">
      You received this notification because your JiGR account email was updated.
    </p>
  </div>
</div>
```

## Key Changes for Notification Template:

### Language Changes:
- ✅ "Email Address Updated" (past tense - already happened)
- ✅ "This is a notification that..." (clearly a notification)
- ✅ "has been successfully updated" (completed action)
- ✅ "Account Update Summary" (informational)
- ✅ "What happens next" (guidance, not action required)

### Removed Action Elements:
- ❌ No "confirm" or "verify" language
- ❌ No call-to-action buttons
- ❌ No "click here" or similar phrases
- ✅ Pure notification format

### Security Context:
- ✅ Clear explanation of what changed
- ✅ Contact info if unauthorized
- ✅ Professional security language

This template should not trigger phishing warnings since it's clearly a notification of a completed action, not requesting any user action.