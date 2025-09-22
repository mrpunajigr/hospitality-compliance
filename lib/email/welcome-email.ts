import { supabase } from '@/lib/supabase'

export interface WelcomeEmailData {
  email: string
  companyName: string  
  userFullName: string
  tempCode: string
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  try {
    console.log('📧 Sending welcome email via Resend...')
    console.log('📧 Email data:', {
      to: data.email,
      companyName: data.companyName,
      userFullName: data.userFullName,
      tempCodeLength: data.tempCode.length
    })
    
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://jigr.app'}/signin`
    console.log('📧 Login URL:', loginUrl)
    
    const payload = {
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
    }
    
    console.log('📧 Making API call to /api/send-email...')
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    console.log('📧 API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Email API error response:', errorText)
      throw new Error(`Email API failed: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Welcome email sent successfully:', result)
    return result
  } catch (error) {
    console.error('❌ Welcome email failed:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    throw error
  }
}