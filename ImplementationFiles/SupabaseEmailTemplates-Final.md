# JiGR Supabase Email Templates - Final Version

## ⚠️ CRITICAL UPDATE - Domain Consistency Fixed
**FIXED**: All domains now use `jigr.app` consistently to prevent SPAM classification
- ✅ All links: `https://jigr.app`
- ✅ All mailto: `help@jigr.app` 
- ✅ Sender domain matches link domains (prevents SPAM triggers)

## Overview
Professional, spam-safe email templates for Supabase authentication system with consistent JiGR branding and improved deliverability.

## Email Template Implementation Order

### 1. Confirm Signup
### 2. Invite User  
### 3. Magic Link
### 4. Change Email Address
### 5. Reset Password
### 6. Reauthentication

---

## 1. CONFIRM SIGNUP TEMPLATE

**Template Name**: `Confirm signup`  
**Subject**: `Welcome to JiGR - Confirm Your Email`  
**Sender**: `JiGR <noreply@jigr.app>`

### HTML Template:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to JiGR - Confirm Your Email</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header-bg {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            background-image: url('https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/CafeWindow.jpg');
            background-size: cover;
            background-position: center;
            position: relative;
            padding: 40px 20px;
            text-align: center;
        }
        .header-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(30, 64, 175, 0.9) 0%, rgba(59, 130, 246, 0.8) 100%);
        }
        .header-content {
            position: relative;
            z-index: 2;
        }
        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 20px;
        }
        .header-title {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 8px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .header-subtitle {
            color: #e2e8f0;
            font-size: 16px;
            margin: 0;
            font-weight: 400;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #475569;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(16, 185, 129, 0.25);
            transition: all 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 8px rgba(16, 185, 129, 0.3);
        }
        .cta-container {
            text-align: center;
            margin: 30px 0;
        }
        .alternative-link {
            margin-top: 25px;
            padding: 20px;
            background-color: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        .alternative-title {
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 8px;
        }
        .alternative-url {
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 14px;
            color: #64748b;
            word-break: break-all;
            background-color: #f1f5f9;
            padding: 8px 12px;
            border-radius: 4px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer-links {
            margin-bottom: 20px;
        }
        .footer-link {
            color: #3b82f6;
            text-decoration: none;
            margin: 0 15px;
            font-size: 14px;
            font-weight: 500;
        }
        .footer-text {
            color: #64748b;
            font-size: 13px;
            margin: 5px 0;
        }
        .security-note {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin-top: 25px;
        }
        .security-note-title {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 5px;
        }
        .security-note-text {
            font-size: 14px;
            color: #a16207;
            margin: 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header-bg">
            <div class="header-overlay"></div>
            <div class="header-content">
                <img src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/jgr_logo_full.png" alt="JiGR Logo" class="logo">
                <h1 class="header-title">Welcome to JiGR! 🎉</h1>
                <p class="header-subtitle">New Zealand's leading digital compliance platform</p>
            </div>
        </div>
        
        <div class="content">
            <div class="greeting">Hello {{.Email}},</div>
            
            <div class="message">
                Welcome to JiGR - New Zealand's leading digital compliance platform for hospitality businesses. You're about to make compliance management so much easier!
                <br><br>
                To complete your registration and access your compliance dashboard, please confirm your email address by clicking the button below:
            </div>
            
            <div class="cta-container">
                <a href="{{.ConfirmationURL}}" class="cta-button">Confirm Email Address</a>
            </div>
            
            <div class="alternative-link">
                <div class="alternative-title">Alternative confirmation link:</div>
                <div class="alternative-url">{{.ConfirmationURL}}</div>
            </div>
            
            <div class="security-note">
                <div class="security-note-title">🔒 Security Note</div>
                <p class="security-note-text">This email was sent to {{.Email}}. If you didn't create a JiGR account, please ignore this email.</p>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-links">
                <a href="https://jigr.app" class="footer-link">Visit Dashboard</a>
                <a href="https://jigr.app/help" class="footer-link">Help Center</a>
                <a href="mailto:help@jigr.app" class="footer-link">Contact Support</a>
            </div>
            <div class="footer-text">© 2025 JiGR. Making compliance simple for New Zealand hospitality.</div>
            <div class="footer-text">This email was sent from a notification-only address. Please don't reply.</div>
        </div>
    </div>
</body>
</html>
```

---

## 2. INVITE USER TEMPLATE

**Template Name**: `Invite user`  
**Subject**: `You're invited to join {{.Data.company_name}} on JiGR`  
**Sender**: `JiGR <noreply@jigr.app>`

### HTML Template:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Team Invitation - Join JiGR</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header-bg {
            background: linear-gradient(135deg, #3730a3 0%, #4f46e5 100%);
            background-image: url('https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/CafeWindow.jpg');
            background-size: cover;
            background-position: center;
            position: relative;
            padding: 40px 20px;
            text-align: center;
        }
        .header-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(55, 48, 163, 0.9) 0%, rgba(79, 70, 229, 0.8) 100%);
        }
        .header-content {
            position: relative;
            z-index: 2;
        }
        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 20px;
        }
        .header-title {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 8px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .header-subtitle {
            color: #e2e8f0;
            font-size: 16px;
            margin: 0;
            font-weight: 400;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #475569;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        .company-highlight {
            background-color: #f0f9ff;
            border-left: 4px solid #0ea5e9;
            padding: 16px 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }
        .company-name {
            font-size: 18px;
            font-weight: 700;
            color: #0c4a6e;
            margin-bottom: 5px;
        }
        .company-description {
            font-size: 14px;
            color: #0369a1;
            margin: 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(16, 185, 129, 0.25);
            transition: all 0.2s ease;
        }
        .cta-container {
            text-align: center;
            margin: 30px 0;
        }
        .alternative-link {
            margin-top: 25px;
            padding: 20px;
            background-color: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #4f46e5;
        }
        .alternative-title {
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 8px;
        }
        .alternative-url {
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 14px;
            color: #64748b;
            word-break: break-all;
            background-color: #f1f5f9;
            padding: 8px 12px;
            border-radius: 4px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer-links {
            margin-bottom: 20px;
        }
        .footer-link {
            color: #3b82f6;
            text-decoration: none;
            margin: 0 15px;
            font-size: 14px;
            font-weight: 500;
        }
        .footer-text {
            color: #64748b;
            font-size: 13px;
            margin: 5px 0;
        }
        .invitation-details {
            background-color: #fefce8;
            border: 1px solid #eab308;
            border-radius: 6px;
            padding: 15px;
            margin-top: 25px;
        }
        .invitation-title {
            font-weight: 600;
            color: #a16207;
            margin-bottom: 5px;
        }
        .invitation-text {
            font-size: 14px;
            color: #ca8a04;
            margin: 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header-bg">
            <div class="header-overlay"></div>
            <div class="header-content">
                <img src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/jgr_logo_full.png" alt="JiGR Logo" class="logo">
                <h1 class="header-title">Team Invitation</h1>
                <p class="header-subtitle">Join the JiGR compliance team</p>
            </div>
        </div>
        
        <div class="content">
            <div class="greeting">Hello {{.Email}},</div>
            
            <div class="message">
                You have been invited to join <strong>{{.Data.company_name | default "a hospitality business"}}</strong> on JiGR - New Zealand's digital compliance platform for hospitality businesses.
            </div>
            
            <div class="company-highlight">
                <div class="company-name">{{.Data.company_name | default "Hospitality Business"}}</div>
                <div class="company-description">Managing compliance with JiGR's digital platform</div>
            </div>
            
            <div class="message">
                JiGR makes compliance management simple and efficient. You'll have access to:
                <br>• Digital delivery tracking
                <br>• Automated compliance alerts  
                <br>• Real-time reporting dashboard
                <br>• Team collaboration tools
            </div>
            
            <div class="cta-container">
                <a href="{{.ConfirmationURL}}" class="cta-button">Accept Invitation</a>
            </div>
            
            <div class="alternative-link">
                <div class="alternative-title">Alternative invitation link:</div>
                <div class="alternative-url">{{.ConfirmationURL}}</div>
            </div>
            
            <div class="invitation-details">
                <div class="invitation-title">📧 Invitation Details</div>
                <p class="invitation-text">This invitation was sent to {{.Email}} by {{.Data.company_name | default "your team administrator"}}.</p>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-links">
                <a href="https://jigr.app" class="footer-link">Visit JiGR</a>
                <a href="https://jigr.app/help" class="footer-link">Help Center</a>
                <a href="https://jigr.app/contact" class="footer-link">Contact Support</a>
            </div>
            <div class="footer-text">© 2025 JiGR. Making compliance simple for New Zealand hospitality.</div>
            <div class="footer-text">This email was sent from a notification-only address. Please don't reply.</div>
        </div>
    </div>
</body>
</html>
```

---

## 3. MAGIC LINK TEMPLATE

**Template Name**: `Magic Link`  
**Subject**: `Sign in to JiGR`  
**Sender**: `JiGR <noreply@jigr.app>`

### HTML Template:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign in to JiGR</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header-bg {
            background: linear-gradient(135deg, #065f46 0%, #059669 100%);
            background-image: url('https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/CafeWindow.jpg');
            background-size: cover;
            background-position: center;
            position: relative;
            padding: 40px 20px;
            text-align: center;
        }
        .header-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(6, 95, 70, 0.9) 0%, rgba(5, 150, 105, 0.8) 100%);
        }
        .header-content {
            position: relative;
            z-index: 2;
        }
        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 20px;
        }
        .header-title {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 8px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .header-subtitle {
            color: #d1fae5;
            font-size: 16px;
            margin: 0;
            font-weight: 400;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #475569;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(16, 185, 129, 0.25);
            transition: all 0.2s ease;
        }
        .cta-container {
            text-align: center;
            margin: 30px 0;
        }
        .alternative-link {
            margin-top: 25px;
            padding: 20px;
            background-color: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #059669;
        }
        .alternative-title {
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 8px;
        }
        .alternative-url {
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 14px;
            color: #64748b;
            word-break: break-all;
            background-color: #f1f5f9;
            padding: 8px 12px;
            border-radius: 4px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer-links {
            margin-bottom: 20px;
        }
        .footer-link {
            color: #3b82f6;
            text-decoration: none;
            margin: 0 15px;
            font-size: 14px;
            font-weight: 500;
        }
        .footer-text {
            color: #64748b;
            font-size: 13px;
            margin: 5px 0;
        }
        .security-note {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin-top: 25px;
        }
        .security-note-title {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 5px;
        }
        .security-note-text {
            font-size: 14px;
            color: #a16207;
            margin: 0;
        }
        .expiry-notice {
            background-color: #fee2e2;
            border: 1px solid #f87171;
            border-radius: 6px;
            padding: 12px;
            margin-top: 20px;
            text-align: center;
        }
        .expiry-text {
            font-size: 14px;
            color: #dc2626;
            margin: 0;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header-bg">
            <div class="header-overlay"></div>
            <div class="header-content">
                <img src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/jgr_logo_full.png" alt="JiGR Logo" class="logo">
                <h1 class="header-title">Sign In to JiGR!</h1>
                <p class="header-subtitle">Your compliance journey starts here</p>
            </div>
        </div>
        
        <div class="content">
            <div class="greeting">Hello {{.Email}},</div>
            
            <div class="message">
                Click the button below to sign in to your JiGR compliance dashboard. No password needed - just click and you're in!
            </div>
            
            <div class="cta-container">
                <a href="{{.ConfirmationURL}}" class="cta-button">Sign In to JiGR</a>
            </div>
            
            <div class="expiry-notice">
                <p class="expiry-text">⏰ This magic link expires in 1 hour for security</p>
            </div>
            
            <div class="alternative-link">
                <div class="alternative-title">Alternative sign-in link:</div>
                <div class="alternative-url">{{.ConfirmationURL}}</div>
            </div>
            
            <div class="security-note">
                <div class="security-note-title">🔒 Security Notice</div>
                <p class="security-note-text">This magic link was requested for {{.Email}}. If you didn't request this sign-in link, please ignore this email.</p>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-links">
                <a href="https://jigr.app" class="footer-link">Visit Dashboard</a>
                <a href="https://jigr.app/help" class="footer-link">Help Center</a>
                <a href="mailto:help@jigr.app" class="footer-link">Contact Support</a>
            </div>
            <div class="footer-text">© 2025 JiGR. Making compliance simple for New Zealand hospitality.</div>
            <div class="footer-text">This email was sent from a notification-only address. Please don't reply.</div>
        </div>
    </div>
</body>
</html>
```

---

## 4. CHANGE EMAIL ADDRESS TEMPLATE (Simplified)

**Template Name**: `Change Email Address`  
**Subject**: `Confirm your new email address for JiGR`  
**Sender**: `JiGR <noreply@jigr.app>`

### HTML Template:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Email Change - JiGR</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header-bg {
            background: linear-gradient(135deg, #7c2d12 0%, #ea580c 100%);
            background-image: url('https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/CafeWindow.jpg');
            background-size: cover;
            background-position: center;
            position: relative;
            padding: 40px 20px;
            text-align: center;
        }
        .header-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(124, 45, 18, 0.9) 0%, rgba(234, 88, 12, 0.8) 100%);
        }
        .header-content {
            position: relative;
            z-index: 2;
        }
        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 20px;
        }
        .header-title {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 8px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .header-subtitle {
            color: #fed7aa;
            font-size: 16px;
            margin: 0;
            font-weight: 400;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #475569;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        .email-change-box {
            background-color: #fef7f0;
            border: 1px solid #fb923c;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        .email-change-title {
            font-weight: 600;
            color: #c2410c;
            margin-bottom: 10px;
        }
        .email-old {
            font-size: 14px;
            color: #9a3412;
            margin: 5px 0;
        }
        .email-new {
            font-size: 16px;
            font-weight: 600;
            color: #ea580c;
            margin: 5px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(234, 88, 12, 0.25);
        }
        .cta-container {
            text-align: center;
            margin: 30px 0;
        }
        .alternative-link {
            margin-top: 25px;
            padding: 20px;
            background-color: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #ea580c;
        }
        .alternative-title {
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 8px;
        }
        .alternative-url {
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 14px;
            color: #64748b;
            word-break: break-all;
            background-color: #f1f5f9;
            padding: 8px 12px;
            border-radius: 4px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer-links {
            margin-bottom: 20px;
        }
        .footer-link {
            color: #3b82f6;
            text-decoration: none;
            margin: 0 15px;
            font-size: 14px;
            font-weight: 500;
        }
        .footer-text {
            color: #64748b;
            font-size: 13px;
            margin: 5px 0;
        }
        .security-note {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin-top: 25px;
        }
        .security-note-title {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 5px;
        }
        .security-note-text {
            font-size: 14px;
            color: #a16207;
            margin: 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header-bg">
            <div class="header-overlay"></div>
            <div class="header-content">
                <img src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/jgr_logo_full.png" alt="JiGR Logo" class="logo">
                <h1 class="header-title">Email Change Request</h1>
                <p class="header-subtitle">Confirm your new email address</p>
            </div>
        </div>
        
        <div class="content">
            <div class="greeting">Hello,</div>
            
            <div class="message">
                We received a request to change the email address for your JiGR account. To confirm this change, please click the button below:
            </div>
            
            <div class="email-change-box">
                <div class="email-change-title">📧 Email Address Change</div>
                <div class="email-old">Current: {{.EmailOld | default "Previous email address"}}</div>
                <div class="email-new">New: {{.Email}}</div>
            </div>
            
            <div class="cta-container">
                <a href="{{.ConfirmationURL}}" class="cta-button">Confirm Email Change</a>
            </div>
            
            <div class="alternative-link">
                <div class="alternative-title">Alternative confirmation link:</div>
                <div class="alternative-url">{{.ConfirmationURL}}</div>
            </div>
            
            <div class="security-note">
                <div class="security-note-title">🔒 Security Notice</div>
                <p class="security-note-text">If you didn't request this email change, please contact JiGR support immediately at help@jigr.app</p>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-links">
                <a href="https://jigr.app" class="footer-link">Visit Dashboard</a>
                <a href="https://jigr.app/help" class="footer-link">Help Center</a>
                <a href="mailto:help@jigr.app" class="footer-link">Contact Support</a>
            </div>
            <div class="footer-text">© 2025 JiGR. Making compliance simple for New Zealand hospitality.</div>
            <div class="footer-text">This email was sent from a notification-only address. Please don't reply.</div>
        </div>
    </div>
</body>
</html>
```

---

## 5. RESET PASSWORD TEMPLATE

**Template Name**: `Reset Password`  
**Subject**: `Reset Your JiGR Password`  
**Sender**: `JiGR <noreply@jigr.app>`

### HTML Template:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your JiGR Password</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header-bg {
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            background-image: url('https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/CafeWindow.jpg');
            background-size: cover;
            background-position: center;
            position: relative;
            padding: 40px 20px;
            text-align: center;
        }
        .header-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(220, 38, 38, 0.9) 0%, rgba(239, 68, 68, 0.8) 100%);
        }
        .header-content {
            position: relative;
            z-index: 2;
        }
        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 20px;
        }
        .header-title {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 8px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .header-subtitle {
            color: #fecaca;
            font-size: 16px;
            margin: 0;
            font-weight: 400;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #475569;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(220, 38, 38, 0.25);
        }
        .cta-container {
            text-align: center;
            margin: 30px 0;
        }
        .alternative-link {
            margin-top: 25px;
            padding: 20px;
            background-color: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #dc2626;
        }
        .alternative-title {
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 8px;
        }
        .alternative-url {
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 14px;
            color: #64748b;
            word-break: break-all;
            background-color: #f1f5f9;
            padding: 8px 12px;
            border-radius: 4px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer-links {
            margin-bottom: 20px;
        }
        .footer-link {
            color: #3b82f6;
            text-decoration: none;
            margin: 0 15px;
            font-size: 14px;
            font-weight: 500;
        }
        .footer-text {
            color: #64748b;
            font-size: 13px;
            margin: 5px 0;
        }
        .security-note {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin-top: 25px;
        }
        .security-note-title {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 5px;
        }
        .security-note-text {
            font-size: 14px;
            color: #a16207;
            margin: 0;
        }
        .expiry-notice {
            background-color: #fee2e2;
            border: 1px solid #f87171;
            border-radius: 6px;
            padding: 12px;
            margin-top: 20px;
            text-align: center;
        }
        .expiry-text {
            font-size: 14px;
            color: #dc2626;
            margin: 0;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header-bg">
            <div class="header-overlay"></div>
            <div class="header-content">
                <img src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/jgr_logo_full.png" alt="JiGR Logo" class="logo">
                <h1 class="header-title">Password Reset</h1>
                <p class="header-subtitle">Secure access to your compliance dashboard</p>
            </div>
        </div>
        
        <div class="content">
            <div class="greeting">Hello {{.Email}},</div>
            
            <div class="message">
                We received a request to reset the password for your JiGR account ({{.Email}}). If you made this request, you can reset your password using the link below.
            </div>
            
            <div class="message">
                To create a new password for your account, please use the link below:
            </div>
            
            <div class="cta-container">
                <a href="{{.ConfirmationURL}}" class="cta-button">Reset Password</a>
            </div>
            
            <div class="expiry-notice">
                <p class="expiry-text">⏰ This password reset link expires in 1 hour</p>
            </div>
            
            <div class="alternative-link">
                <div class="alternative-title">Alternative reset link:</div>
                <div class="alternative-url">{{.ConfirmationURL}}</div>
            </div>
            
            <div class="security-note">
                <div class="security-note-title">🔒 Security Notice</div>
                <p class="security-note-text">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-links">
                <a href="https://jigr.app" class="footer-link">Visit Dashboard</a>
                <a href="https://jigr.app/help" class="footer-link">Help Center</a>
                <a href="mailto:help@jigr.app" class="footer-link">Contact Support</a>
            </div>
            <div class="footer-text">© 2025 JiGR. Making compliance simple for New Zealand hospitality.</div>
            <div class="footer-text">This email was sent from a notification-only address. Please don't reply.</div>
        </div>
    </div>
</body>
</html>
```

---

## 6. REAUTHENTICATION TEMPLATE

**Template Name**: `Reauthentication`  
**Subject**: `Confirm Reauthentication`  
**Sender**: `JiGR <noreply@jigr.app>`

### HTML Template:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Reauthentication - JiGR</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            line-height: 1.6;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header-bg {
            background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
            background-image: url('https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/CafeWindow.jpg');
            background-size: cover;
            background-position: center;
            position: relative;
            padding: 40px 20px;
            text-align: center;
        }
        .header-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(124, 58, 237, 0.9) 0%, rgba(139, 92, 246, 0.8) 100%);
        }
        .header-content {
            position: relative;
            z-index: 2;
        }
        .logo {
            width: 120px;
            height: auto;
            margin-bottom: 20px;
        }
        .header-title {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 8px 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .header-subtitle {
            color: #e9d5ff;
            font-size: 16px;
            margin: 0;
            font-weight: 400;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #475569;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(124, 58, 237, 0.25);
        }
        .cta-container {
            text-align: center;
            margin: 30px 0;
        }
        .code-box {
            background-color: #f1f5f9;
            border: 2px solid #7c3aed;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 25px 0;
        }
        .code-title {
            font-weight: 600;
            color: #581c87;
            margin-bottom: 10px;
        }
        .code-value {
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 24px;
            font-weight: 700;
            color: #7c3aed;
            letter-spacing: 0.1em;
        }
        .alternative-link {
            margin-top: 25px;
            padding: 20px;
            background-color: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #7c3aed;
        }
        .alternative-title {
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 8px;
        }
        .alternative-url {
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 14px;
            color: #64748b;
            word-break: break-all;
            background-color: #f1f5f9;
            padding: 8px 12px;
            border-radius: 4px;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer-links {
            margin-bottom: 20px;
        }
        .footer-link {
            color: #3b82f6;
            text-decoration: none;
            margin: 0 15px;
            font-size: 14px;
            font-weight: 500;
        }
        .footer-text {
            color: #64748b;
            font-size: 13px;
            margin: 5px 0;
        }
        .security-note {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin-top: 25px;
        }
        .security-note-title {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 5px;
        }
        .security-note-text {
            font-size: 14px;
            color: #a16207;
            margin: 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header-bg">
            <div class="header-overlay"></div>
            <div class="header-content">
                <img src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/jgr_logo_full.png" alt="JiGR Logo" class="logo">
                <h1 class="header-title">Confirm reauthentication</h1>
                <p class="header-subtitle">Verify your identity for secure access</p>
            </div>
        </div>
        
        <div class="content">
            <div class="greeting">Hello {{.Email}},</div>
            
            <div class="message">
                For security purposes, we need to verify your identity before proceeding with this sensitive action on your JiGR account.
            </div>
            
            <div class="code-box">
                <div class="code-title">Enter the code: </div>
                <div class="code-value">{{ .Token }}</div>
            </div>
            
            <div class="message">
                Alternatively, you can click the button below to complete the verification:
            </div>
            
            <div class="cta-container">
                <a href="{{.ConfirmationURL}}" class="cta-button">Verify Identity</a>
            </div>
            
            <div class="alternative-link">
                <div class="alternative-title">Alternative verification link:</div>
                <div class="alternative-url">{{.ConfirmationURL}}</div>
            </div>
            
            <div class="security-note">
                <div class="security-note-title">🔒 Security Notice</div>
                <p class="security-note-text">This verification was requested for {{.Email}}. If you didn't initiate this request, please contact JiGR support immediately.</p>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-links">
                <a href="https://jigr.app" class="footer-link">Visit Dashboard</a>
                <a href="https://jigr.app/help" class="footer-link">Help Center</a>
                <a href="mailto:help@jigr.app" class="footer-link">Contact Support</a>
            </div>
            <div class="footer-text">© 2025 JiGR. Making compliance simple for New Zealand hospitality.</div>
            <div class="footer-text">This email was sent from a notification-only address. Please don't reply.</div>
        </div>
    </div>
</body>
</html>
```

---

## IMPLEMENTATION INSTRUCTIONS

### For Supabase Dashboard:

1. **Navigate to**: Authentication > Email Templates
2. **Replace each template** with the corresponding HTML above
3. **Update subjects** to match specified subjects
4. **Set sender** to `JiGR <noreply@jigr.app>` for all templates
5. **Test each template** using Supabase preview function

### Key Features:

✅ **Consistent JiGR branding** with logo and background  
✅ **Mobile responsive** design  
✅ **Professional styling** with proper color schemes  
✅ **Security notices** and expiry warnings  
✅ **Alternative text links** for accessibility  
✅ **Spam-safe design** with proper domain consistency  
✅ **Clear call-to-action buttons**  
✅ **Professional footer** with help links  

### Expected Results:

- **Improved deliverability** (no more spam folder)
- **Consistent brand experience** across all auth emails
- **Professional appearance** that builds trust
- **Better user engagement** with clear CTAs
- **Reduced support tickets** with clear instructions

---

## DEPLOYMENT CHECKLIST

- [ ] Copy templates to Supabase Dashboard
- [ ] Test all 6 email templates
- [ ] Verify sender domain consistency  
- [ ] Confirm all links work correctly
- [ ] Check mobile rendering
- [ ] Test spam filtering with real sends
- [ ] Monitor delivery rates in Resend
- [ ] Update any hardcoded domain references in code