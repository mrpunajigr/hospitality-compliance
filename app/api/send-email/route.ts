import { NextResponse } from 'next/server'
import { generateWelcomeEmailHTML, generateWelcomeEmailText } from '@/lib/email/welcome-email'

interface EmailRequest {
  to: string
  subject: string
  template: 'welcome' | 'invitation' | 'general'
  data: any
  html?: string
  text?: string
}

export async function POST(request: Request) {
  try {
    const emailData: EmailRequest = await request.json()
    
    // Validate required fields
    if (!emailData.to || !emailData.subject) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject' },
        { status: 400 }
      )
    }
    
    // Check if Resend is configured
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }
    
    // Generate email content based on template
    let html = emailData.html
    let text = emailData.text
    
    if (emailData.template === 'welcome' && emailData.data) {
      html = generateWelcomeEmailHTML({
        email: emailData.to,
        companyName: emailData.data.companyName,
        userFullName: emailData.data.userFullName,
        tempPassword: emailData.data.tempPassword,
        loginUrl: emailData.data.loginUrl
      })
      
      text = generateWelcomeEmailText({
        email: emailData.to,
        companyName: emailData.data.companyName,
        userFullName: emailData.data.userFullName,
        tempPassword: emailData.data.tempPassword,
        loginUrl: emailData.data.loginUrl
      })
    }
    
    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM_ADDRESS || 'dev@jigr.app',
        to: emailData.to,
        subject: emailData.subject,
        html: html,
        text: text
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      console.error('Resend API error:', error)
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      )
    }
    
    const result = await response.json()
    console.log('✅ Email sent successfully via Resend:', result.id)
    
    return NextResponse.json({
      success: true,
      emailId: result.id,
      message: 'Email sent successfully'
    })
    
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}