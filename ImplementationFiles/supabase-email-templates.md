# Supabase Email Templates for JiGR

Complete email templates for Supabase Authentication → Email Templates section.

## 1. Invite User Template

**Use for:** Authentication → Email Templates → **Invite User**

```html
<div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', Helvetica, Arial, sans-serif;">
  <!-- Header with Background -->
  <div style="
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
    border-radius: 12px 12px 0 0;
    padding: 40px 20px;
    text-align: center;
    position: relative;
    overflow: hidden;
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
    ">You're Invited! 🎉</h2>
    
    <p style="
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      margin: 0;
      font-weight: 300;
    ">Join the JiGR compliance team</p>
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
      You've been invited to join <strong>{{ .UserMetaData.company_name | default "a hospitality business" }}</strong> 
      on JiGR - New Zealand's leading digital compliance platform for hospitality businesses.
    </p>
    
    <div style="
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 1px solid #0ea5e9;
      border-radius: 12px;
      padding: 24px;
      margin: 32px 0;
    ">
      <h3 style="
        color: #0c4a6e;
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 16px 0;
      ">
        🚀 What you'll get access to:
      </h3>
      
      <ul style="
        margin: 0;
        padding-left: 20px;
        color: #075985;
        font-size: 15px;
        line-height: 1.8;
      ">
        <li>Digital delivery docket management</li>
        <li>Automated temperature monitoring</li>
        <li>Real-time compliance alerts</li>
        <li>Team collaboration tools</li>
        <li>Comprehensive reporting dashboard</li>
      </ul>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 32px; color: #4b5563;">
      Click the button below to accept your invitation and set up your account:
    </p>
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{ .ConfirmationURL }}" style="
        display: inline-block;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        font-size: 16px;
        font-weight: 600;
        text-decoration: none;
        padding: 16px 32px;
        border-radius: 12px;
        box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.4);
        transition: all 0.2s ease;
      ">
        Accept Invitation & Join Team
      </a>
    </div>
    
    <div style="
      background: #fefce8;
      border: 1px solid #eab308;
      border-radius: 8px;
      padding: 16px;
      margin: 32px 0;
    ">
      <p style="
        margin: 0;
        font-size: 14px;
        color: #92400e;
        text-align: center;
      ">
        ⏰ This invitation will expire in 7 days
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
      ">Need help?</h4>
      
      <p style="font-size: 14px; color: #6b7280; margin: 0;">
        📧 <a href="mailto:support@jigr.app" style="color: #3b82f6; text-decoration: none;">support@jigr.app</a>
        &nbsp;&nbsp;•&nbsp;&nbsp;
        📚 <a href="https://jigr.app/help" style="color: #3b82f6; text-decoration: none;">Help Center</a>
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
      New Zealand's leading digital compliance platform
    </p>
    <p style="margin: 0;">
      © 2025 JiGR. All rights reserved.
    </p>
  </div>
</div>
```

## 2. Change Email Address Template

**Use for:** Authentication → Email Templates → **Change Email Address**

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
    ">Confirm Email Change 📧</h2>
    
    <p style="
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      margin: 0;
      font-weight: 300;
    ">Secure your account update</p>
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
      You've requested to change your email address for your JiGR account. We need to verify 
      your new email address before making this change.
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
        📋 Email Change Details:
      </h3>
      
      <div style="
        background: white;
        border-radius: 8px;
        padding: 16px;
        font-size: 14px;
      ">
        <p style="margin: 0 0 8px 0; color: #6b7280;">
          <strong>Current Email:</strong> {{ .OldRecord.email | default "Your current email" }}
        </p>
        <p style="margin: 0; color: #059669; font-weight: 600;">
          <strong>New Email:</strong> {{ .NewRecord.email }}
        </p>
      </div>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 32px; color: #4b5563;">
      Click the button below to confirm your new email address:
    </p>
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{ .ConfirmationURL }}" style="
        display: inline-block;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        font-size: 16px;
        font-weight: 600;
        text-decoration: none;
        padding: 16px 32px;
        border-radius: 12px;
        box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.4);
      ">
        Confirm New Email Address
      </a>
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
        🔒 Security Notice
      </h4>
      <p style="margin: 0; font-size: 14px; color: #7f1d1d; line-height: 1.5;">
        If you didn't request this email change, please ignore this email and contact our support team immediately. 
        Your account security is important to us.
      </p>
    </div>
    
    <div style="
      background: #fefce8;
      border: 1px solid #eab308;
      border-radius: 8px;
      padding: 16px;
      margin: 32px 0;
    ">
      <p style="
        margin: 0;
        font-size: 14px;
        color: #92400e;
        text-align: center;
      ">
        ⏰ This confirmation link will expire in 24 hours
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
      ">Need help?</h4>
      
      <p style="font-size: 14px; color: #6b7280; margin: 0;">
        📧 <a href="mailto:support@jigr.app" style="color: #3b82f6; text-decoration: none;">support@jigr.app</a>
        &nbsp;&nbsp;•&nbsp;&nbsp;
        📚 <a href="https://jigr.app/help" style="color: #3b82f6; text-decoration: none;">Help Center</a>
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
      New Zealand's leading digital compliance platform
    </p>
    <p style="margin: 0;">
      © 2025 JiGR. All rights reserved.
    </p>
  </div>
</div>
```

## 3. Email Confirmation Template (Optional Enhancement)

**Use for:** Authentication → Email Templates → **Confirm signup**

```html
<div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', Helvetica, Arial, sans-serif;">
  <!-- Header -->
  <div style="
    background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
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
    ">Welcome to JiGR! 🎉</h2>
    
    <p style="
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      margin: 0;
      font-weight: 300;
    ">Confirm your email to get started</p>
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
      Welcome to JiGR - New Zealand's leading digital compliance platform for hospitality businesses. 
      You're about to make compliance management so much easier!
    </p>
    
    <p style="font-size: 16px; margin-bottom: 32px; color: #4b5563;">
      To complete your registration and access your compliance dashboard, please confirm your email address:
    </p>
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{ .ConfirmationURL }}" style="
        display: inline-block;
        background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
        color: white;
        font-size: 16px;
        font-weight: 600;
        text-decoration: none;
        padding: 16px 32px;
        border-radius: 12px;
        box-shadow: 0 4px 14px 0 rgba(168, 85, 247, 0.4);
      ">
        Confirm Email & Start Journey
      </a>
    </div>
    
    <div style="
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 1px solid #0ea5e9;
      border-radius: 12px;
      padding: 24px;
      margin: 32px 0;
    ">
      <h3 style="
        color: #0c4a6e;
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 16px 0;
      ">
        🚀 What's waiting for you:
      </h3>
      
      <ul style="
        margin: 0;
        padding-left: 20px;
        color: #075985;
        font-size: 15px;
        line-height: 1.8;
      ">
        <li>Digital delivery docket management</li>
        <li>Automated temperature monitoring</li>
        <li>Real-time compliance alerts</li>
        <li>Team collaboration tools</li>
        <li>Comprehensive reporting dashboard</li>
      </ul>
    </div>
    
    <hr style="margin: 32px 0; border: none; height: 1px; background: #e5e7eb;">
    
    <!-- Support Section -->
    <div style="text-align: center;">
      <h4 style="
        color: #374151;
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 12px 0;
      ">Need help getting started?</h4>
      
      <p style="font-size: 14px; color: #6b7280; margin: 0;">
        📧 <a href="mailto:support@jigr.app" style="color: #3b82f6; text-decoration: none;">support@jigr.app</a>
        &nbsp;&nbsp;•&nbsp;&nbsp;
        📚 <a href="https://jigr.app/help" style="color: #3b82f6; text-decoration: none;">Help Center</a>
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
      New Zealand's leading digital compliance platform
    </p>
    <p style="margin: 0;">
      © 2025 JiGR. All rights reserved.
    </p>
  </div>
</div>
```

## Implementation Instructions

### 1. Access Supabase Dashboard
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: `rggdywqnvpuwssluzfud`
3. Navigate: **Authentication** → **Email Templates**

### 2. Update Each Template
1. **Invite User**: Copy the first template above
2. **Change Email Address**: Copy the second template above  
3. **Confirm signup** (optional): Copy the third template above

### 3. Template Variables Used
These templates use the existing metadata from your app:
- `{{ .UserMetaData.full_name }}` - User's full name
- `{{ .UserMetaData.company_name }}` - Company name (for invites)
- `{{ .Email }}` - User's email address
- `{{ .ConfirmationURL }}` - Action URL (confirm/invite link)
- `{{ .OldRecord.email }}` - Current email (for change email)
- `{{ .NewRecord.email }}` - New email (for change email)

### 4. Key Features
- **Responsive design** with mobile-friendly styling
- **Brand consistency** with JiGR colors and messaging
- **Security awareness** with clear expiration notices
- **Support information** readily available
- **Professional appearance** with gradient headers and clear CTAs
- **Personalization** using stored user metadata

All templates follow the same design system and will provide a consistent, professional experience for your users.