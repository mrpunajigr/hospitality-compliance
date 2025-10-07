# Ultra-Conservative Email Change Notification

## Minimal Template to Avoid Phishing Detection

```html
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  
  <div style="background: #f8f9fa; padding: 20px; text-align: center;">
    <h1 style="color: #1e40af; font-size: 24px; margin: 0;">JiGR</h1>
  </div>

  <div style="background: white; padding: 30px;">
    
    <p style="font-size: 16px; color: #374151;">
      Hello {{ .UserMetaData.full_name | default "User" }},
    </p>
    
    <p style="font-size: 16px; color: #4b5563; line-height: 1.6;">
      Your account contact information has been updated in our system.
    </p>
    
    <div style="background: #f0f9ff; padding: 20px; margin: 20px 0; border-radius: 8px;">
      <p style="margin: 0; font-size: 14px; color: #1e40af;">
        <strong>Account:</strong> {{ .NewRecord.email }}<br>
        <strong>Updated:</strong> Today
      </p>
    </div>
    
    <p style="font-size: 14px; color: #6b7280;">
      If you have questions, contact support@jigr.app
    </p>
    
  </div>

  <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">JiGR Hospitality Compliance<br>Account notification</p>
  </div>

</div>
```

## Alternative: Text-Only Version

If HTML still triggers warnings, use this plain text version:

```
JiGR Account Update

Hello {{ .UserMetaData.full_name | default "User" }},

Your account contact information has been updated.

Account: {{ .NewRecord.email }}
Updated: Today

Questions? Contact support@jigr.app

---
JiGR Hospitality Compliance
Account notification
```

## Even Simpler Option:

Consider **disabling** the Change Email template entirely in Supabase if it keeps triggering warnings. Email changes are rare, and you could:

1. **Disable the template** in Supabase Authentication settings
2. **Handle notifications** through your own email system (Resend)
3. **Show in-app notifications** instead of email

This might be the safest approach since ANY email about email changes triggers phishing detection.