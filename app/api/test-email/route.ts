// Test Email Endpoint for JiGR Email Templates
// Allows testing of email templates and delivery

import { NextRequest, NextResponse } from 'next/server'
import { resendEmailService } from '@/lib/email-templates/resend-config'
import { generatePasswordResetEmail, createTestPasswordResetEmail } from '@/lib/email-templates/templates/PasswordResetEmail'
import { generateWelcomeEmail, createTestWelcomeEmail, createTestInviteWelcomeEmail } from '@/lib/email-templates/templates/WelcomeEmail'
import { generateEmailVerificationEmail, createTestEmailVerificationEmail } from '@/lib/email-templates/templates/EmailVerificationEmail'

export async function POST(req: NextRequest) {
  try {
    const { testEmail, templateType = 'password-reset' } = await req.json()

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Test email address is required' },
        { status: 400 }
      )
    }

    console.log(`🧪 Testing ${templateType} email template to: ${testEmail}`)

    let emailTemplate

    switch (templateType) {
      case 'password-reset':
        emailTemplate = generatePasswordResetEmail({
          userEmail: testEmail,
          userName: 'Test User',
          resetUrl: `https://jigr.app/reset-password?token=test-${Date.now()}`,
          expiresInHours: 24,
          requestIpAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown',
          requestTimestamp: new Date().toLocaleString('en-NZ', {
            dateStyle: 'full',
            timeStyle: 'short'
          })
        })
        break

      case 'welcome':
        emailTemplate = generateWelcomeEmail({
          userEmail: testEmail,
          userName: 'Test User',
          confirmationUrl: `https://jigr.app/confirm?token=welcome-${Date.now()}`
        })
        break

      case 'welcome-invite':
        emailTemplate = generateWelcomeEmail({
          userEmail: testEmail,
          userName: 'Test User',
          confirmationUrl: `https://jigr.app/confirm?token=invite-${Date.now()}`,
          isInvited: true,
          inviterName: 'Manager Sarah'
        })
        break

      case 'email-verification':
        emailTemplate = generateEmailVerificationEmail({
          userEmail: testEmail,
          userName: 'Test User',
          confirmationUrl: `https://jigr.app/verify?token=verify-${Date.now()}`,
          expiresInHours: 24
        })
        break

      case 'connection-test':
        emailTemplate = {
          subject: 'JiGR Email Service Test',
          html: `
            <div style="text-align: center; padding: 40px;">
              <h1 style="color: #3b82f6;">🎉 Email Service Working!</h1>
              <p>This is a test email from the JiGR email template system.</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
              <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
            </div>
          `,
          text: `Email service is working! This is a test email from JiGR email service. Timestamp: ${new Date().toISOString()}`
        }
        break

      default:
        return NextResponse.json(
          { error: `Unknown template type: ${templateType}` },
          { status: 400 }
        )
    }

    // Send the email
    const result = await resendEmailService.send(testEmail, emailTemplate)

    if (result.success) {
      console.log(`✅ Test email sent successfully: ${result.messageId}`)
      return NextResponse.json({
        success: true,
        message: `${templateType} email sent successfully`,
        messageId: result.messageId,
        templateType,
        recipient: testEmail
      })
    } else {
      console.error(`❌ Test email failed: ${result.error}`)
      return NextResponse.json(
        { 
          error: 'Failed to send test email',
          details: result.error
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Test email API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  // Health check and available templates
  return NextResponse.json({
    status: 'ready',
    emailService: 'resend',
    availableTemplates: [
      'password-reset',
      'welcome',
      'welcome-invite', 
      'email-verification',
      'connection-test'
    ],
    environment: {
      hasResendKey: !!process.env.RESEND_API_KEY,
      fromEmail: process.env.EMAIL_FROM_ADDRESS,
      fromName: process.env.EMAIL_FROM_NAME
    },
    usage: {
      POST: 'Send test email',
      body: {
        testEmail: 'required - email address to send test to',
        templateType: 'optional - password-reset (default), welcome, welcome-invite, email-verification, or connection-test'
      }
    }
  })
}