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
    
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://jigr.app'}/signin`
    
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Email API failed: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Welcome email sent successfully:', result)
    return result
  } catch (error) {
    console.error('❌ Welcome email failed:', error)
    throw error
  }
}