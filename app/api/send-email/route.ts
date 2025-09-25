import { NextRequest, NextResponse } from 'next/server'

// CRITICAL: Add security headers to prevent CSRF issues
const securityHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Content-Type': 'application/json'
}

// CRITICAL: Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

interface EmailRequest {
  to: string
  subject: string
  template?: string
  data?: Record<string, any>
}

interface WelcomeEmailData {
  email: string
  companyName: string
  userFullName: string
  tempCode: string
  loginUrl: string
}

function generateWelcomeEmailHTML(data: WelcomeEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to JiGR Hospitality Compliance</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #374151;
      margin: 0;
      padding: 0;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #1e293b 0%, #3730a3 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .logo {
      width: 80px;
      height: 80px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .welcome-card {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border: 1px solid #bfdbfe;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
      text-align: center;
    }
    .login-details {
      background: #f1f5f9;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      border-left: 4px solid #3b82f6;
    }
    .cta-button {
      display: inline-block;
      background: #3b82f6;
      color: white;
      padding: 14px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      margin: 20px 0;
      transition: background 0.2s;
    }
    .cta-button:hover {
      background: #2563eb;
    }
    .footer {
      background: #f8fafc;
      padding: 30px;
      text-align: center;
      color: #64748b;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">JiGR</div>
      <h1>Welcome to JiGR!</h1>
      <p>Your hospitality compliance journey starts here</p>
    </div>
    
    <div class="content">
      <h2>Hello ${data.userFullName}! 👋</h2>
      
      <p>Welcome to <strong>${data.companyName}</strong> on the JiGR Hospitality Compliance platform!</p>
      
      <div class="welcome-card">
        <h3>🎉 Your account is ready!</h3>
        <p>We've created your secure account and you can start managing compliance immediately.</p>
      </div>
      
      <div class="login-details">
        <h4>🔐 Your Login Details</h4>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Temporary Access Code:</strong> <code style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${data.tempCode}</code></p>
        <p><small>⚠️ Please change this code after your first login for security</small></p>
      </div>
      
      <div style="text-align: center;">
        <a href="${data.loginUrl}" class="cta-button">Access Your Dashboard</a>
      </div>
      
      <h3>🚀 What's Next?</h3>
      <ul>
        <li>Complete your profile setup</li>
        <li>Upload your first delivery documents</li>
        <li>Set up compliance alerts</li>
        <li>Invite your team members</li>
      </ul>
      
      <p>If you have any questions or need assistance, our support team is here to help!</p>
    </div>
    
    <div class="footer">
      <p><strong>JiGR Hospitality Compliance</strong></p>
      <p>New Zealand's leading digital compliance platform</p>
      <p><a href="https://jigr.co.nz" style="color: #3b82f6;">jigr.co.nz</a> | <a href="mailto:support@jigr.co.nz" style="color: #3b82f6;">support@jigr.co.nz</a></p>
    </div>
  </div>
</body>
</html>
  `
}

function generateWelcomeEmailText(data: WelcomeEmailData): string {
  return `
Welcome to JiGR Hospitality Compliance!

Hello ${data.userFullName},

Welcome to ${data.companyName} on the JiGR Hospitality Compliance platform!

Your account is ready and you can start managing compliance immediately.

LOGIN DETAILS:
Email: ${data.email}
Temporary Access Code: ${data.tempCode}

⚠️ Please change this code after your first login for security.

Access your dashboard: ${data.loginUrl}

What's Next:
• Complete your profile setup
• Upload your first delivery documents  
• Set up compliance alerts
• Invite your team members

If you have any questions, our support team is here to help!

---
JiGR Hospitality Compliance
New Zealand's leading digital compliance platform
https://jigr.co.nz | support@jigr.co.nz
  `.trim()
}

// Email configuration
const getEmailFromAddress = () => {
  if (process.env.EMAIL_FROM_ADDRESS) {
    return process.env.EMAIL_FROM_ADDRESS
  }
  return 'onboarding@resend.dev' // Fallback for development
}

export async function POST(request: NextRequest) {
  try {
    // Log all environment info for debugging
    console.log('📧 Email API called with environment:', {
      nodeEnv: process.env.NODE_ENV,
      hasResendKey: !!process.env.RESEND_API_KEY,
      fromAddress: getEmailFromAddress(),
      timestamp: new Date().toISOString()
    })

    const emailData: EmailRequest = await request.json()
    console.log('📧 Email request body:', emailData)
    
    // Validate required fields
    if (!emailData.to || !emailData.subject) {
      throw new Error('Missing required fields: to, subject')
    }
    
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      return NextResponse.json(
        { error: 'RESEND_API_KEY not configured' },
        { status: 500, headers: securityHeaders }
      )
    }

    let html = ''
    let text = ''

    // Simplify for debugging - just send basic welcome email
    html = `
      <h2>Welcome to JiGR!</h2>
      <p>Hello ${emailData.data?.userFullName || 'there'},</p>
      <p>Your account has been created successfully for ${emailData.data?.companyName || 'your company'}.</p>
      <p>Your temporary access code: <strong>${emailData.data?.tempCode || 'N/A'}</strong></p>
      <p>Login at: <a href="${emailData.data?.loginUrl || 'https://jigr.app/signin'}">JiGR Platform</a></p>
    `
    text = `Welcome to JiGR! Your account is ready. Access code: ${emailData.data?.tempCode || 'N/A'}`

    const emailPayload = {
      from: getEmailFromAddress(),
      to: emailData.to,
      subject: emailData.subject,
      html: html,
      text: text
    }
    
    console.log('📧 Sending to Resend API:', {
      from: emailPayload.from,
      to: emailPayload.to,
      subject: emailPayload.subject,
      hasApiKey: !!resendApiKey,
      apiKeyPrefix: resendApiKey?.substring(0, 8)
    })

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Resend API error:', errorText)
      return NextResponse.json(
        { error: `Resend API error: ${errorText}` },
        { status: response.status, headers: securityHeaders }
      )
    }

    const result = await response.json()
    console.log('✅ Email sent via Resend:', result)
    
    return NextResponse.json({ success: true, data: result }, { headers: securityHeaders })
  } catch (error) {
    console.error('❌ Email API Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
      timestamp: new Date().toISOString()
    }, { status: 500, headers: securityHeaders })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint with email data to send welcome emails',
    currentConfig: {
      hasApiKey: !!process.env.RESEND_API_KEY,
      apiKeyPreview: process.env.RESEND_API_KEY ? 
        `${process.env.RESEND_API_KEY.substring(0, 8)}...` : 'Not set',
      fromAddress: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }
  }, { headers: securityHeaders })
}