// Email Service for JiGR Hospitality Compliance Platform
// Handles all email notifications including invitations, role changes, and system alerts

import { UserRole } from './navigation-permissions'

export interface EmailConfig {
  provider: 'sendgrid' | 'aws-ses' | 'resend' | 'demo'
  apiKey?: string
  fromEmail: string
  fromName: string
  replyTo?: string
}

export interface EmailTemplate {
  subject: string
  htmlContent: string
  textContent: string
}

export interface InvitationEmailData {
  inviteeEmail: string
  inviteeName: string
  inviterName: string
  organizationName: string
  role: UserRole
  invitationToken: string
  expiresAt: string
  personalMessage?: string
  acceptUrl: string
}

export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
}

// Default email configuration
const DEFAULT_CONFIG: EmailConfig = {
  provider: process.env.EMAIL_PROVIDER as 'sendgrid' | 'aws-ses' | 'resend' || 'demo',
  apiKey: process.env.EMAIL_API_KEY,
  fromEmail: process.env.EMAIL_FROM_ADDRESS || 'noreply@hospitality-compliance.com',
  fromName: process.env.EMAIL_FROM_NAME || 'JiGR Hospitality Compliance',
  replyTo: process.env.EMAIL_REPLY_TO
}

// Role display helpers
function getRoleDisplayName(role: UserRole): string {
  const roleMap = {
    'STAFF': 'Staff Member',
    'SUPERVISOR': 'Supervisor', 
    'MANAGER': 'Manager',
    'OWNER': 'Owner'
  }
  return roleMap[role]
}

function getRoleDescription(role: UserRole): string {
  const descriptions = {
    'STAFF': 'Upload documents and view your own records',
    'SUPERVISOR': 'Manage shifts, access reports and team oversight',
    'MANAGER': 'Full operations access and team management',
    'OWNER': 'Complete system access including billing and settings'
  }
  return descriptions[role]
}

// Email Templates
export function generateInvitationTemplate(data: InvitationEmailData): EmailTemplate {
  const roleDisplay = getRoleDisplayName(data.role)
  const roleDescription = getRoleDescription(data.role)
  
  const subject = `You're invited to join ${data.organizationName} - JiGR Hospitality Compliance`
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Team Invitation</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            margin: 20px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #1e293b 0%, #374151 50%, #1e293b 100%);
            padding: 30px;
            text-align: center;
            color: white;
        }
        .logo {
            width: 60px;
            height: 60px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
        }
        .content {
            padding: 30px;
        }
        .role-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin: 10px 0;
            ${data.role === 'OWNER' ? 'background: #fbbf24; color: #92400e;' : 
              data.role === 'MANAGER' ? 'background: #a855f7; color: white;' :
              data.role === 'SUPERVISOR' ? 'background: #10b981; color: white;' :
              'background: #3b82f6; color: white;'}
        }
        .cta-button {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin: 20px 0;
            transition: background 0.2s;
        }
        .cta-button:hover {
            background: #2563eb;
        }
        .details {
            background: #f1f5f9;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
        }
        .expires {
            color: #ef4444;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">JiGR</div>
            <h1>You've been invited!</h1>
            <p>Join ${data.organizationName} on JiGR Hospitality Compliance</p>
        </div>
        
        <div class="content">
            <p>Hello <strong>${data.inviteeName}</strong>,</p>
            
            <p>${data.inviterName} has invited you to join <strong>${data.organizationName}</strong> as a <span class="role-badge">${roleDisplay}</span></p>
            
            ${data.personalMessage ? `
            <div class="details">
                <h3>Personal Message:</h3>
                <p><em>"${data.personalMessage}"</em></p>
            </div>
            ` : ''}
            
            <div class="details">
                <h3>Your Role: ${roleDisplay}</h3>
                <p>${roleDescription}</p>
                
                <h3>What You'll Have Access To:</h3>
                <ul>
                    <li>Document upload and processing</li>
                    ${data.role !== 'STAFF' ? '<li>Reports and analytics dashboard</li>' : ''}
                    ${data.role === 'MANAGER' || data.role === 'OWNER' ? '<li>Team management and invitations</li>' : ''}
                    ${data.role === 'OWNER' ? '<li>Billing and administrative settings</li>' : ''}
                </ul>
            </div>
            
            <div style="text-align: center;">
                <a href="${data.acceptUrl}" class="cta-button">Accept Invitation</a>
            </div>
            
            <p><small class="expires">⏰ This invitation expires on ${new Date(data.expiresAt).toLocaleDateString('en-NZ', {
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}</small></p>
            
            <hr style="margin: 30px 0; border: none; height: 1px; background: #e2e8f0;">
            
            <h3>About JiGR Hospitality Compliance</h3>
            <p>JiGR is New Zealand's leading digital compliance platform for hospitality businesses. We help restaurants, cafes, and food service operators maintain food safety standards, manage deliveries, and ensure regulatory compliance through intelligent document processing.</p>
        </div>
        
        <div class="footer">
            <p>If you have any questions, please contact ${data.inviterName} or reply to this email.</p>
            <p>JiGR Hospitality Compliance Platform | <a href="https://jigr.co.nz">jigr.co.nz</a></p>
            <p><small>This email was sent to ${data.inviteeEmail}. If you weren't expecting this invitation, you can safely ignore this email.</small></p>
        </div>
    </div>
</body>
</html>
  `

  const textContent = `
You're invited to join ${data.organizationName}!

Hello ${data.inviteeName},

${data.inviterName} has invited you to join ${data.organizationName} as a ${roleDisplay} on JiGR Hospitality Compliance.

Your Role: ${roleDisplay}
${roleDescription}

${data.personalMessage ? `Personal Message: "${data.personalMessage}"` : ''}

Accept your invitation: ${data.acceptUrl}

⏰ This invitation expires on ${new Date(data.expiresAt).toLocaleDateString('en-NZ')}

About JiGR:
JiGR is New Zealand's leading digital compliance platform for hospitality businesses, helping maintain food safety standards and regulatory compliance.

If you have questions, contact ${data.inviterName} or reply to this email.

---
JiGR Hospitality Compliance Platform
https://jigr.co.nz
  `

  return { subject, htmlContent, textContent }
}

// Email service implementations
class DemoEmailService {
  async send(to: string, template: EmailTemplate): Promise<EmailSendResult> {
    console.log('📧 DEMO EMAIL SERVICE - Email would be sent:')
    console.log('To:', to)
    console.log('Subject:', template.subject)
    console.log('---')
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      success: true,
      messageId: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  }
}

class ResendService {
  constructor(private apiKey: string, private config: EmailConfig) {}

  async send(to: string, template: EmailTemplate): Promise<EmailSendResult> {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(this.apiKey)

      const response = await resend.emails.send({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: [to],
        subject: template.subject,
        html: template.htmlContent,
        replyTo: this.config.replyTo
      })

      if (response.error) {
        console.error('❌ Resend API Error:', response.error)
        return {
          success: false,
          error: response.error.message || 'Resend API error'
        }
      }

      console.log('✅ Resend Email sent successfully:', response.data?.id)
      return {
        success: true,
        messageId: response.data?.id
      }
    } catch (error) {
      console.error('❌ Resend Service Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Resend error'
      }
    }
  }
}

class SendGridService {
  constructor(private apiKey: string, private config: EmailConfig) {}

  async send(to: string, template: EmailTemplate): Promise<EmailSendResult> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { 
            email: this.config.fromEmail,
            name: this.config.fromName
          },
          reply_to: this.config.replyTo ? { email: this.config.replyTo } : undefined,
          subject: template.subject,
          content: [
            {
              type: 'text/html',
              value: template.htmlContent
            },
            {
              type: 'text/plain', 
              value: template.textContent
            }
          ]
        })
      })

      if (response.ok) {
        return {
          success: true,
          messageId: response.headers.get('x-message-id') || undefined
        }
      } else {
        const error = await response.text()
        return {
          success: false,
          error: `SendGrid error: ${error}`
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `SendGrid request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}

// Main email service
export class EmailService {
  private service: DemoEmailService | SendGridService | ResendService
  private config: EmailConfig

  constructor(config: Partial<EmailConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    
    switch (this.config.provider) {
      case 'sendgrid':
        if (!this.config.apiKey) throw new Error('SendGrid API key required')
        this.service = new SendGridService(this.config.apiKey, this.config)
        break
      case 'resend':
        if (!this.config.apiKey) throw new Error('Resend API key required')
        this.service = new ResendService(this.config.apiKey, this.config)
        break
      case 'demo':
      default:
        this.service = new DemoEmailService()
        break
    }
  }

  async sendInvitation(data: InvitationEmailData): Promise<EmailSendResult> {
    try {
      console.log('📧 EmailService.sendInvitation called with:', {
        recipientEmail: data.inviteeEmail,
        organizationName: data.organizationName,
        role: data.role
      })

      // Create email template for invitation
      const template: EmailTemplate = {
        subject: `Invitation to join ${data.organizationName}`,
        htmlContent: this.generateInvitationHTML(data),
        textContent: this.generateInvitationText(data)
      }

      console.log('📧 Sending invitation email via service...')
      const result = await this.service.send(data.inviteeEmail, template)
      console.log('📧 Invitation email result:', result)
      
      return result
    } catch (error) {
      console.error('❌ Error in sendInvitation:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in sendInvitation'
      }
    }
  }

  // Generate HTML content for invitation email
  private generateInvitationHTML(data: InvitationEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invitation to ${data.organizationName}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">You're invited to join ${data.organizationName}</h2>
          
          <p>Hi ${data.inviteeName},</p>
          
          <p>${data.inviterName} has invited you to join <strong>${data.organizationName}</strong> as a <strong>${data.role}</strong>.</p>
          
          ${data.personalMessage ? `<p><em>"${data.personalMessage}"</em></p>` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.acceptUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            This invitation will expire on ${new Date(data.expiresAt).toLocaleDateString()}.
            If you have any questions, please contact ${data.inviterName}.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">
            JiGR Hospitality Compliance System
          </p>
        </div>
      </body>
      </html>
    `
  }

  // Generate plain text content for invitation email
  private generateInvitationText(data: InvitationEmailData): string {
    return `
You're invited to join ${data.organizationName}

Hi ${data.inviteeName},

${data.inviterName} has invited you to join ${data.organizationName} as a ${data.role}.

${data.personalMessage ? `"${data.personalMessage}"` : ''}

To accept this invitation, please visit: ${data.acceptUrl}

This invitation will expire on ${new Date(data.expiresAt).toLocaleDateString()}.

If you have any questions, please contact ${data.inviterName}.

---
JiGR Hospitality Compliance System
    `.trim()
  }

  async sendWelcome(userEmail: string, userName: string, organizationName: string): Promise<EmailSendResult> {
    const template: EmailTemplate = {
      subject: `Welcome to ${organizationName} - JiGR Hospitality Compliance`,
      htmlContent: `
        <h1>Welcome ${userName}!</h1>
        <p>You've successfully joined ${organizationName} on JiGR Hospitality Compliance.</p>
        <p>You can now access your dashboard and start managing compliance documents.</p>
      `,
      textContent: `Welcome ${userName}! You've successfully joined ${organizationName} on JiGR Hospitality Compliance.`
    }
    
    return this.service.send(userEmail, template)
  }

  async sendRoleChanged(userEmail: string, userName: string, newRole: UserRole, changedBy: string): Promise<EmailSendResult> {
    const roleDisplay = getRoleDisplayName(newRole)
    
    const template: EmailTemplate = {
      subject: `Your role has been updated - JiGR Hospitality Compliance`,
      htmlContent: `
        <h1>Role Updated</h1>
        <p>Hi ${userName},</p>
        <p>Your role has been changed to <strong>${roleDisplay}</strong> by ${changedBy}.</p>
        <p>This change is effective immediately.</p>
      `,
      textContent: `Hi ${userName}, your role has been changed to ${roleDisplay} by ${changedBy}.`
    }
    
    return this.service.send(userEmail, template)
  }
}

// Default instance
export const emailService = new EmailService()