// Password Reset Email Template for JiGR
// Professional branded password reset with clear security messaging

import { getBaseEmailLayoutHTML, getBaseEmailLayoutText } from '../layouts/BaseEmailLayout'
import { getCenteredButtonHTML } from '../components/ButtonPrimary'

interface PasswordResetEmailData {
  userEmail: string
  userName?: string
  resetUrl: string
  expiresInHours?: number
  requestIpAddress?: string
  requestTimestamp?: string
}

export function generatePasswordResetEmail(data: PasswordResetEmailData) {
  const {
    userEmail,
    userName = 'User',
    resetUrl,
    expiresInHours = 24,
    requestIpAddress,
    requestTimestamp = new Date().toLocaleString('en-NZ', {
      dateStyle: 'full',
      timeStyle: 'short'
    })
  } = data

  const subject = 'Reset Your JiGR Password'
  
  const preheaderText = 'Reset your password to regain access to your JiGR compliance dashboard'

  const htmlContent = `
    <div style="margin-bottom: 24px;">
      <h2 style="
        color: #1f2937;
        font-size: 24px;
        font-weight: 700;
        margin: 0 0 16px 0;
        text-align: center;
      ">
        Password Reset Request
      </h2>
      
      <p style="font-size: 16px; margin-bottom: 20px;">
        Hello <strong>${userName}</strong>,
      </p>
      
      <p style="font-size: 16px; margin-bottom: 20px;">
        We received a request to reset the password for your JiGR account (<strong>${userEmail}</strong>). 
        If you made this request, click the button below to create a new password.
      </p>
    </div>

    ${getCenteredButtonHTML({
      href: resetUrl,
      text: 'Reset My Password',
      variant: 'primary',
      size: 'large'
    })}

    <div style="
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 20px;
      margin: 32px 0;
    ">
      <h3 style="
        color: #374151;
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 12px 0;
      ">
        🔐 Security Information
      </h3>
      
      <ul style="
        margin: 0;
        padding-left: 20px;
        color: #6b7280;
        font-size: 14px;
        line-height: 1.6;
      ">
        <li>This link will expire in <strong>${expiresInHours} hours</strong></li>
        <li>The link can only be used once</li>
        <li>Request made on: ${requestTimestamp}</li>
        ${requestIpAddress ? `<li>Request from IP: ${requestIpAddress}</li>` : ''}
      </ul>
    </div>

    <div style="
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 16px;
      margin: 24px 0;
    ">
      <p style="
        margin: 0;
        font-size: 14px;
        color: #92400e;
        font-weight: 500;
      ">
        ⚠️ <strong>Didn't request this?</strong> If you didn't ask to reset your password, 
        you can safely ignore this email. Your password will remain unchanged.
      </p>
    </div>

    <div style="margin-top: 32px;">
      <h3 style="
        color: #374151;
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 16px 0;
      ">
        Need Help?
      </h3>
      
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
        If you're having trouble with the reset link, you can copy and paste this URL into your browser:
      </p>
      
      <div style="
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 12px;
        font-family: 'Monaco', 'Courier New', monospace;
        font-size: 12px;
        color: #374151;
        word-break: break-all;
        margin-bottom: 20px;
      ">
        ${resetUrl}
      </div>

      <p style="font-size: 14px; color: #6b7280;">
        For security questions or if you continue to have problems, 
        <a href="mailto:support@jigr.app" style="color: #3b82f6; text-decoration: none;">
          contact our support team
        </a>.
      </p>
    </div>

    <hr style="
      margin: 32px 0;
      border: none;
      height: 1px;
      background: #e5e7eb;
    ">

    <div style="text-align: center; color: #6b7280; font-size: 14px;">
      <p style="margin: 0;">
        This password reset was requested for your JiGR Hospitality Compliance account.
        <br>
        Keep your compliance data secure and accessible.
      </p>
    </div>
  `

  const textContent = `
RESET YOUR JIGR PASSWORD

Hello ${userName},

We received a request to reset the password for your JiGR account (${userEmail}). 
If you made this request, use the link below to create a new password.

Reset Password Link:
${resetUrl}

SECURITY INFORMATION:
• This link will expire in ${expiresInHours} hours
• The link can only be used once  
• Request made on: ${requestTimestamp}
${requestIpAddress ? `• Request from IP: ${requestIpAddress}` : ''}

DIDN'T REQUEST THIS?
If you didn't ask to reset your password, you can safely ignore this email. 
Your password will remain unchanged.

NEED HELP?
For security questions or if you continue to have problems, contact our 
support team at support@jigr.app.

This password reset was requested for your JiGR Hospitality Compliance account.
Keep your compliance data secure and accessible.
  `

  const html = getBaseEmailLayoutHTML({
    headerTitle: 'Password Reset',
    headerSubtitle: 'Secure access to your compliance dashboard',
    headerVariant: 'default',
    children: htmlContent,
    footerInfo: 'For your security, this email was sent from a secure server.',
    includeUnsubscribe: false,
    preheaderText
  })

  const text = getBaseEmailLayoutText({
    headerTitle: 'JiGR Password Reset',
    children: textContent,
    footerInfo: 'For your security, this email was sent from a secure server.'
  })

  return {
    subject,
    html,
    text
  }
}

// Quick test function
export function createTestPasswordResetEmail(): ReturnType<typeof generatePasswordResetEmail> {
  return generatePasswordResetEmail({
    userEmail: 'test@example.com',
    userName: 'John Smith',
    resetUrl: 'https://jigr.app/reset-password?token=test123',
    expiresInHours: 24,
    requestIpAddress: '192.168.1.1',
    requestTimestamp: new Date().toLocaleString('en-NZ', {
      dateStyle: 'full',
      timeStyle: 'short'
    })
  })
}