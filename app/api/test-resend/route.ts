import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Resend configuration...')
    
    // Check if API key exists
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      return NextResponse.json({
        status: 'error',
        message: 'RESEND_API_KEY not configured in environment variables',
        hasApiKey: false
      }, { status: 400 })
    }

    // Test API key format
    const keyPreview = resendApiKey.substring(0, 10) + '...'
    
    // Try a simple API call to validate the key
    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        status: 'error',
        message: 'Resend API key is invalid or expired',
        hasApiKey: true,
        keyPreview,
        apiError: errorText
      }, { status: 400 })
    }

    const data = await response.json()
    
    return NextResponse.json({
      status: 'success',
      message: 'Resend is configured and working!',
      hasApiKey: true,
      keyPreview,
      domains: data.data || [],
      emailConfig: {
        fromAddress: process.env.EMAIL_FROM_ADDRESS || 'dev@jigr.app',
        fromName: process.env.EMAIL_FROM_NAME || 'JiGR Hospitality Compliance'
      }
    })

  } catch (error) {
    console.error('❌ Resend test error:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to test Resend configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Also support POST for sending a test email
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({
        status: 'error',
        message: 'Email address required for test'
      }, { status: 400 })
    }

    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      return NextResponse.json({
        status: 'error',
        message: 'RESEND_API_KEY not configured'
      }, { status: 400 })
    }

    // Send test email
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM_ADDRESS || 'dev@jigr.app',
        to: email,
        subject: '🧪 JiGR Resend Test Email',
        html: `
          <h2>✅ Resend is working!</h2>
          <p>This is a test email from your JiGR Hospitality Compliance platform.</p>
          <p>If you received this, your Resend integration is configured correctly.</p>
          <hr>
          <small>Test sent at: ${new Date().toISOString()}</small>
        `,
        text: 'Resend test email - if you received this, your integration is working!'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        status: 'error',
        message: 'Failed to send test email',
        apiError: errorText
      }, { status: response.status })
    }

    const result = await response.json()
    
    return NextResponse.json({
      status: 'success',
      message: 'Test email sent successfully!',
      emailId: result.id,
      sentTo: email
    })

  } catch (error) {
    console.error('❌ Test email error:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to send test email',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}