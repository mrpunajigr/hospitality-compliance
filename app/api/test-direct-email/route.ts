import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { testEmail } = await request.json()
    
    console.log('🧪 Testing direct email send to:', testEmail)
    console.log('🧪 Using from address:', process.env.EMAIL_FROM_ADDRESS)
    
    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      return NextResponse.json({
        success: false,
        error: 'RESEND_API_KEY not configured'
      }, { status: 500 })
    }

    // Direct Resend API call (bypassing our email service)
    const emailPayload = {
      from: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
      to: [testEmail],
      subject: 'JiGR Direct Email Test',
      html: `
        <h2>Direct Email Test Successful!</h2>
        <p>This email was sent directly from the test endpoint.</p>
        <p><strong>From:</strong> ${process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev'}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>Test Type:</strong> Direct Resend API call (bypass internal API)</p>
      `,
      text: `Direct Email Test Successful! From: ${process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev'} at ${new Date().toISOString()}`
    }
    
    console.log('🧪 Direct email payload:', {
      from: emailPayload.from,
      to: emailPayload.to,
      subject: emailPayload.subject
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
      console.error('❌ Direct Resend API error:', errorText)
      return NextResponse.json({
        success: false,
        error: `Resend API error: ${response.status}`,
        details: errorText
      }, { status: response.status })
    }

    const result = await response.json()
    console.log('✅ Direct email test result:', result)
    
    return NextResponse.json({
      success: true,
      message: 'Direct email sent successfully!',
      emailId: result.id,
      fromAddress: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Direct email test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint with {"testEmail": "your@email.com"} to test direct email sending',
    currentConfig: {
      hasApiKey: !!process.env.RESEND_API_KEY,
      apiKeyPreview: process.env.RESEND_API_KEY ? 
        `${process.env.RESEND_API_KEY.substring(0, 8)}...` : 'Not set',
      fromAddress: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }
  })
}