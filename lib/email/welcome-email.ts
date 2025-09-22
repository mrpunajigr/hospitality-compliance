/**
 * Welcome email service for new user onboarding
 */

interface WelcomeEmailData {
  email: string
  companyName: string
  userFullName: string
  tempCode: string
  loginUrl?: string
}

/**
 * Send welcome email with login credentials
 */
export async function sendWelcomeEmail(data: WelcomeEmailData) {
  const loginUrl = data.loginUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/signin`
  
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: data.email,
        subject: `Welcome to JiGR Hospitality Compliance - ${data.companyName}`,
        template: 'welcome',
        data: {
          companyName: data.companyName,
          userFullName: data.userFullName,
          email: data.email,
          tempCode: data.tempCode,
          loginUrl
        }
      }),
    })

    if (!response.ok) {
      throw new Error(`Email send failed: ${response.status}`)
    }

    const result = await response.json()
    console.log('✅ Welcome email sent successfully:', result)
    return result
  } catch (error) {
    console.error('❌ Welcome email failed:', error)
    throw error
  }
}

/**
 * Generate welcome email HTML template
 */
export function generateWelcomeEmailHTML(data: WelcomeEmailData): string {
  const loginUrl = data.loginUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/signin`
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to JiGR Hospitality Compliance</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 40px;">
    <img src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/jgr_logo_full.png" alt="JiGR Logo" style="max-width: 200px; height: auto;">
  </div>
  
  <!-- Main Content -->
  <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; margin-bottom: 32px;">
    <h1 style="color: #1f2937; margin-bottom: 16px;">Welcome to JiGR, ${data.userFullName}! 👋</h1>
    
    <p style="font-size: 16px; margin-bottom: 24px;">
      Your compliance management account for <strong>${data.companyName}</strong> has been created successfully. 
      You're now ready to start tracking deliveries and maintaining food safety compliance.
    </p>
    
    <!-- Login Credentials -->
    <div style="background: white; border-radius: 8px; padding: 24px; margin: 24px 0; border-left: 4px solid #10b981;">
      <h3 style="margin-top: 0; color: #059669;">Your Login Credentials</h3>
      <p style="margin: 8px 0;"><strong>Email:</strong> ${data.email}</p>
      <p style="margin: 8px 0;"><strong>Access Code:</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: 'Monaco', 'Menlo', monospace;">${data.tempCode}</code></p>
    </div>
    
    <!-- Action Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${loginUrl}" style="background: #10b981; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
        🚀 Access Your Dashboard
      </a>
    </div>
    
    <!-- What's Next -->
    <div style="background: #eff6ff; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <h4 style="margin-top: 0; color: #1e40af;">What's Next?</h4>
      <ol style="margin: 12px 0; padding-left: 20px;">
        <li>Complete your profile setup</li>
        <li>Configure your company details</li>
        <li>Process your first delivery document</li>
      </ol>
    </div>
    
    <!-- Security Note -->
    <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; font-size: 14px;">
        <strong>🔐 Security Tip:</strong> We recommend updating your login credentials after first access. 
        You can do this from your profile settings.
      </p>
    </div>
  </div>
  
  <!-- Footer -->
  <div style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 40px;">
    <p>Need help? Contact us at <a href="mailto:dev@jigr.app" style="color: #10b981;">dev@jigr.app</a></p>
    <p style="margin-top: 16px;">
      JiGR Hospitality Compliance<br>
      Food Safety Made Simple
    </p>
  </div>
  
</body>
</html>
  `.trim()
}

/**
 * Generate welcome email text version
 */
export function generateWelcomeEmailText(data: WelcomeEmailData): string {
  const loginUrl = data.loginUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/signin`
  
  return `
Welcome to JiGR Hospitality Compliance!

Hi ${data.userFullName},

Your compliance management account for ${data.companyName} has been created successfully.

LOGIN CREDENTIALS:
Email: ${data.email}
Access Code: ${data.tempCode}

Access your dashboard: ${loginUrl}

WHAT'S NEXT:
1. Complete your profile setup
2. Configure your company details  
3. Process your first delivery document

SECURITY TIP: We recommend updating your login credentials after first access from your profile settings.

Need help? Contact us at dev@jigr.app

JiGR Hospitality Compliance
Food Safety Made Simple
  `.trim()
}