// Email Verification Template for JiGR
// Clean verification email for email address confirmation

import { getBaseEmailLayoutHTML, getBaseEmailLayoutText } from '../layouts/BaseEmailLayout'
import { getCenteredButtonHTML } from '../components/ButtonPrimary'

interface EmailVerificationData {
  userEmail: string
  userName?: string
  confirmationUrl: string
  expiresInHours?: number
}

export function generateEmailVerificationEmail(data: EmailVerificationData) {
  const {
    userEmail,
    userName = 'User',
    confirmationUrl,
    expiresInHours = 24
  } = data

  const subject = 'Verify Your JiGR Email Address'
  
  const preheaderText = 'Confirm your email to access your JiGR compliance dashboard'

  const htmlContent = `
    <div style="margin-bottom: 24px;">
      <h2 style="
        color: #1f2937;
        font-size: 24px;
        font-weight: 700;
        margin: 0 0 16px 0;
        text-align: center;
      ">
        Verify Your Email Address
      </h2>
      
      <p style="font-size: 16px; margin-bottom: 20px;">
        Hello <strong>${userName}</strong>,
      </p>
      
      <p style="font-size: 16px; margin-bottom: 20px;">
        To complete your JiGR account setup and access your compliance dashboard, 
        please verify your email address (<strong>${userEmail}</strong>).
      </p>
      
      <p style="font-size: 16px; margin-bottom: 20px;">
        Click the button below to confirm your email address:
      </p>
    </div>

    ${getCenteredButtonHTML({
      href: confirmationUrl,
      text: 'Verify Email Address',
      variant: 'primary',
      size: 'large'
    })}

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
        ⏰ <strong>Important:</strong> This verification link will expire in <strong>${expiresInHours} hours</strong>. 
        If you don't verify your email, you won't be able to access your JiGR account.
      </p>
    </div>

    <div style="margin-top: 32px;">
      <h3 style="
        color: #374151;
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 16px 0;
      ">
        Having Trouble?
      </h3>
      
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
        If the button above doesn't work, copy and paste this URL into your browser:
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
        ${confirmationUrl}
      </div>

      <p style="font-size: 14px; color: #6b7280;">
        If you continue to have problems, 
        <a href="mailto:support@jigr.app" style="color: #3b82f6; text-decoration: none;">
          contact our support team
        </a>.
      </p>
    </div>

    <div style="
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 16px;
      margin: 32px 0;
    ">
      <p style="
        margin: 0;
        font-size: 14px;
        color: #6b7280;
        text-align: center;
      ">
        <strong>Didn't create a JiGR account?</strong><br>
        If you didn't sign up for JiGR, you can safely ignore this email.
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
        This verification was requested for your JiGR | Modular Hospitality Solution account.
        <br>
        Secure compliance management for your business.
      </p>
    </div>
  `

  const textContent = `
VERIFY YOUR EMAIL ADDRESS

Hello ${userName},

To complete your JiGR account setup and access your compliance dashboard, 
please verify your email address (${userEmail}).

Verification Link:
${confirmationUrl}

IMPORTANT: This verification link will expire in ${expiresInHours} hours. 
If you don't verify your email, you won't be able to access your JiGR account.

HAVING TROUBLE?
If you continue to have problems, contact our support team at support@jigr.app.

DIDN'T CREATE A JIGR ACCOUNT?
If you didn't sign up for JiGR, you can safely ignore this email.

This verification was requested for your JiGR | Modular Hospitality Solution account.
Secure compliance management for your business.
  `

  const html = getBaseEmailLayoutHTML({
    headerTitle: 'Email Verification',
    headerSubtitle: 'Confirm your email to get started',
    headerVariant: 'default',
    children: htmlContent,
    footerInfo: 'This email was sent because you created a JiGR account.',
    includeUnsubscribe: false,
    preheaderText
  })

  const text = getBaseEmailLayoutText({
    headerTitle: 'JiGR Email Verification',
    children: textContent,
    footerInfo: 'This email was sent because you created a JiGR account.'
  })

  return {
    subject,
    html,
    text
  }
}

// Quick test function
export function createTestEmailVerificationEmail(): ReturnType<typeof generateEmailVerificationEmail> {
  return generateEmailVerificationEmail({
    userEmail: 'test@example.com',
    userName: 'Alex Smith',
    confirmationUrl: 'https://jigr.app/verify?token=verify123',
    expiresInHours: 24
  })
}