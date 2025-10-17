// Resend Email Service Configuration for JiGR
// Handles all transactional emails with JiGR branding

import { Resend } from 'resend'

export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
}

export interface EmailConfig {
  apiKey: string
  fromEmail: string
  fromName: string
  replyTo?: string
}

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// Default email configuration
const DEFAULT_CONFIG: EmailConfig = {
  apiKey: process.env.RESEND_API_KEY || '',
  fromEmail: process.env.EMAIL_FROM_ADDRESS || 'dev@jigr.app',
  fromName: process.env.EMAIL_FROM_NAME || 'JiGR | Modular Hospitality Solution',
  replyTo: process.env.EMAIL_FROM_ADDRESS || 'dev@jigr.app'
}

export class ResendEmailService {
  private resend: Resend
  private config: EmailConfig

  constructor(config: Partial<EmailConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    
    if (!this.config.apiKey) {
      throw new Error('Resend API key is required. Set RESEND_API_KEY environment variable.')
    }

    this.resend = new Resend(this.config.apiKey)
    
    console.log('📧 ResendEmailService initialized:', {
      fromEmail: this.config.fromEmail,
      fromName: this.config.fromName,
      hasApiKey: !!this.config.apiKey
    })
  }

  async send(to: string, template: EmailTemplate): Promise<EmailSendResult> {
    try {
      console.log(`📧 Sending email via Resend to: ${to}`)
      console.log(`📧 Subject: ${template.subject}`)

      const response = await this.resend.emails.send({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: [to],
        subject: template.subject,
        html: template.html,
        text: template.text,
        replyTo: this.config.replyTo
      })

      if (response.error) {
        console.error('❌ Resend error:', response.error)
        return {
          success: false,
          error: `Resend error: ${response.error.message || 'Unknown error'}`
        }
      }

      console.log('✅ Email sent successfully:', response.data?.id)
      return {
        success: true,
        messageId: response.data?.id
      }

    } catch (error) {
      console.error('❌ Email send failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async sendBatch(emails: Array<{ to: string; template: EmailTemplate }>): Promise<EmailSendResult[]> {
    const results: EmailSendResult[] = []
    
    for (const email of emails) {
      const result = await this.send(email.to, email.template)
      results.push(result)
      
      // Add small delay between emails to avoid rate limiting
      if (emails.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    return results
  }

  // Test email delivery
  async testConnection(): Promise<EmailSendResult> {
    return this.send(
      this.config.fromEmail,
      {
        subject: 'JiGR Email Service Test',
        html: '<h1>Email service is working!</h1><p>This is a test email from JiGR email service.</p>',
        text: 'Email service is working! This is a test email from JiGR email service.'
      }
    )
  }
}

// Default instance
export const resendEmailService = new ResendEmailService()