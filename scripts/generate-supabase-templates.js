// Generate Supabase Email Templates
// Run with: node scripts/generate-supabase-templates.js

const fs = require('fs')
const path = require('path')

// Import our email templates (we'll use require since this is a Node.js script)
function generateSupabaseTemplates() {
  // We'll generate these manually since we can't easily import TS modules in Node.js script
  
  const confirmSignupTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>Welcome to JiGR</title>
    <style>
        /* Reset styles */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }

        /* JiGR Email Styles */
        .email-body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #f9fafb;
        }
        
        .email-card {
            background: white;
            margin: 20px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .email-content {
            padding: 40px 30px;
            font-size: 16px;
            line-height: 1.7;
        }

        /* Mobile responsiveness */
        @media only screen and (max-width: 600px) {
            .email-card {
                margin: 10px;
                border-radius: 8px;
            }
            .email-content {
                padding: 20px 15px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body class="email-body">
    <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all;">
        Confirm your email to start managing compliance easily
    </div>

    <div class="email-container">
        <div class="email-card">
            <div style="
              background: linear-gradient(135deg, rgba(5,150,105,0.5) 0%, rgba(16,185,129,0.5) 50%, rgba(52,211,153,0.5) 100%), url('https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/CafeGlasses.jpg');
              background-size: cover;
              background-position: center;
              background-blend-mode: overlay;
              padding: 40px 30px;
              text-align: center;
              color: white;
              border-radius: 12px 12px 0 0;
            ">
              <div style="
                width: 80px;
                height: 80px;
                margin: 0 auto 24px;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <img 
                  src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/jgr_logo_fullB.png" 
                  alt="JiGR Logo" 
                  style="
                    width: 80px;
                    height: 80px;
                  "
                />
              </div>
              <h1 style="
                font-size: 28px;
                font-weight: bold;
                margin: 0 0 8px 0;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
              ">Welcome to JiGR</h1>
              <p style="
                font-size: 16px;
                margin: 0;
                opacity: 0.9;
                font-weight: 400;
              ">Your compliance journey starts here</p>
            </div>
            
            <div class="email-content">
                <div style="margin-bottom: 24px;">
                  <h2 style="
                    color: #1f2937;
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0 0 16px 0;
                    text-align: center;
                  ">
                    🎉 Welcome to JiGR!
                  </h2>
                  
                  <p style="font-size: 16px; margin-bottom: 20px;">
                    Hello <strong>{{ if .UserMetaData.name }}{{ .UserMetaData.name }}{{ else }}User{{ end }}</strong>,
                  </p>
                  
                  <p style="font-size: 16px; margin-bottom: 20px;">
                    Welcome to JiGR! You've taken the first step toward effortless compliance management 
                    for your hospitality business.
                  </p>
                  
                  <p style="font-size: 16px; margin-bottom: 20px;">
                    To get started, please confirm your email address (<strong>{{ .Email }}</strong>) by clicking the button below:
                  </p>
                </div>

                <div style="text-align: center; margin: 24px 0;">
                  <a href="{{ .ConfirmationURL }}" style="
                    display: inline-block;
                    background: #059669;
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    text-align: center;
                    padding: 16px 32px;
                    font-size: 18px;
                    width: auto;
                    border: none;
                    cursor: pointer;
                  ">Confirm Email & Get Started</a>
                </div>

                <div style="
                  background: #f0f9ff;
                  border: 1px solid #0ea5e9;
                  border-radius: 8px;
                  padding: 20px;
                  margin: 32px 0;
                ">
                  <h3 style="
                    color: #0c4a6e;
                    font-size: 16px;
                    font-weight: 600;
                    margin: 0 0 12px 0;
                  ">
                    🚀 What's next?
                  </h3>
                  
                  <ul style="
                    margin: 0;
                    padding-left: 20px;
                    color: #075985;
                    font-size: 14px;
                    line-height: 1.6;
                  ">
                    <li>Upload your first delivery docket</li>
                    <li>Set up temperature monitoring</li>
                    <li>Invite your team members</li>
                    <li>Configure compliance alerts</li>
                  </ul>
                </div>

                <hr style="
                  margin: 32px 0;
                  border: none;
                  height: 1px;
                  background: #e5e7eb;
                ">

                <div style="text-align: center; color: #6b7280; font-size: 14px;">
                  <p style="margin: 0;">
                    Welcome to the future of hospitality compliance.
                    <br>
                    Simple. Digital. Effective.
                  </p>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="
              background: #f8fafc;
              padding: 30px 20px;
              text-align: center;
              color: #64748b;
              font-size: 14px;
              line-height: 1.6;
              border-radius: 0 0 12px 12px;
              border-top: 1px solid #e2e8f0;
            ">
              <div style="margin-bottom: 16px;">
                <strong style="color: #374151;">JiGR Hospitality Compliance</strong>
                <br />
                New Zealand's leading digital compliance platform for hospitality businesses
              </div>
              
              <div style="margin-bottom: 16px; font-style: italic;">
                You received this email because you created a JiGR account.
              </div>

              <div style="margin-bottom: 16px;">
                <a href="https://jigr.app" style="color: #3b82f6; text-decoration: none;">Visit Dashboard</a>
                •
                <a href="mailto:support@jigr.app" style="color: #3b82f6; text-decoration: none;">Contact Support</a>
                •
                <a href="https://jigr.app/help" style="color: #3b82f6; text-decoration: none;">Help Center</a>
              </div>

              <hr style="margin: 16px 0; border: none; height: 1px; background: #e2e8f0;" />

              <div style="font-size: 12px; color: #9ca3af;">
                <div style="margin-bottom: 8px;">
                  © 2025 JiGR Hospitality Compliance. All rights reserved.
                </div>
              </div>
            </div>
        </div>
    </div>
</body>
</html>
  `.trim()

  const passwordResetTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your JiGR Password</title>
    <style>
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        .email-body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
        }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #f9fafb; }
        .email-card { background: white; margin: 20px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .email-content { padding: 40px 30px; font-size: 16px; line-height: 1.7; }
        @media only screen and (max-width: 600px) {
            .email-card { margin: 10px; border-radius: 8px; }
            .email-content { padding: 20px 15px; font-size: 14px; }
        }
    </style>
</head>
<body class="email-body">
    <div class="email-container">
        <div class="email-card">
            <div style="background: linear-gradient(135deg, rgba(30,41,59,0.5) 0%, rgba(55,65,81,0.5) 50%, rgba(71,85,105,0.5) 100%), url('https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/CafeGlasses.jpg'); background-size: cover; background-position: center; background-blend-mode: overlay; padding: 40px 30px; text-align: center; color: white; border-radius: 12px 12px 0 0;">
              <div style="width: 80px; height: 80px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                <img src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/jgr_logo_fullB.png" alt="JiGR Logo" style="width: 80px; height: 80px;" />
              </div>
              <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 8px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Password Reset</h1>
              <p style="font-size: 16px; margin: 0; opacity: 0.9; font-weight: 400;">Secure access to your compliance dashboard</p>
            </div>
            
            <div class="email-content">
                <h2 style="color: #1f2937; font-size: 24px; font-weight: 700; margin: 0 0 16px 0; text-align: center;">Password Reset Request</h2>
                
                <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>{{ if .UserMetaData.name }}{{ .UserMetaData.name }}{{ else }}User{{ end }}</strong>,</p>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                  We received a request to reset the password for your JiGR account (<strong>{{ .Email }}</strong>). 
                  If you made this request, click the button below to create a new password.
                </p>

                <div style="text-align: center; margin: 24px 0;">
                  <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; text-align: center; padding: 16px 32px; font-size: 18px;">Reset My Password</a>
                </div>

                <div style="background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; padding: 20px; margin: 32px 0;">
                  <h3 style="color: #374151; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">🔐 Security Information</h3>
                  <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    <li>This link will expire in <strong>24 hours</strong></li>
                    <li>The link can only be used once</li>
                  </ul>
                </div>

                <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                  <p style="margin: 0; font-size: 14px; color: #92400e; font-weight: 500;">
                    ⚠️ <strong>Didn't request this?</strong> If you didn't ask to reset your password, 
                    you can safely ignore this email. Your password will remain unchanged.
                  </p>
                </div>
            </div>
            
            <div style="background: #f8fafc; padding: 30px 20px; text-align: center; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0;">
              <strong style="color: #374151;">JiGR Hospitality Compliance</strong><br>
              New Zealand's leading digital compliance platform for hospitality businesses
              <div style="margin-top: 16px; font-size: 12px; color: #9ca3af;">© 2025 JiGR Hospitality Compliance. All rights reserved.</div>
            </div>
        </div>
    </div>
</body>
</html>
  `.trim()

  return {
    confirmSignup: confirmSignupTemplate,
    passwordReset: passwordResetTemplate
  }
}

// Generate templates and save to files
const templates = generateSupabaseTemplates()

// Create output directory
const outputDir = path.join(__dirname, '..', 'supabase-email-templates')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Save templates
fs.writeFileSync(
  path.join(outputDir, 'confirm-signup.html'), 
  templates.confirmSignup
)

fs.writeFileSync(
  path.join(outputDir, 'password-reset.html'), 
  templates.passwordReset
)

console.log('✅ Supabase email templates generated!')
console.log('📁 Templates saved to: supabase-email-templates/')
console.log('📋 Copy and paste these into your Supabase Dashboard > Authentication > Email Templates')