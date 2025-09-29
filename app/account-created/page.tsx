'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { getVersionDisplay } from '@/lib/version'
import { getCardStyle, getTextStyle } from '@/lib/design-system'

function AccountCreatedContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  
  const email = searchParams.get('email') || ''
  const company = searchParams.get('company') || 'your company'
  const emailDomain = email.split('@')[1] || ''
  
  // Get email provider link for quick access
  const getEmailProviderLink = (domain: string) => {
    const providers: Record<string, string> = {
      'gmail.com': 'https://mail.google.com',
      'outlook.com': 'https://outlook.live.com',
      'hotmail.com': 'https://outlook.live.com',
      'yahoo.com': 'https://mail.yahoo.com',
      'icloud.com': 'https://www.icloud.com/mail'
    }
    return providers[domain.toLowerCase()] || null
  }

  const handleCheckEmail = () => {
    // Open default mail client
    window.location.href = 'mailto:';
    
    // Fallback: Try to open webmail based on domain if available
    if (emailProviderLink) {
      window.open(emailProviderLink, '_blank');
    }
  };

  const handleResendEmail = async () => {
    if (!email) return
    
    setIsResending(true)
    setResendMessage('')
    
    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResendMessage('Email sent!')
      } else {
        setResendMessage('Couldn\'t send email. Try again.')
      }
    } catch (error) {
      setResendMessage('Couldn\'t send email. Try again.')
    } finally {
      setIsResending(false)
    }
  }

  const emailProviderLink = getEmailProviderLink(emailDomain)

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cafe Window Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/CafeWindow.jpg')`,
          filter: 'brightness(0.4)'
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/15" />

      {/* Simple Header */}
      <header className="absolute top-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-24">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="w-144 h-36">
                <img 
                  src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/jgr_logo_full.png" 
                  alt="JiGR Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 pt-40">
        {/* Success Card */}
        <div className="w-full max-w-lg">
          <div className={`${getCardStyle('primary')} p-8`}>
            
            {/* Success Icon */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h1 className={`${getTextStyle('pageTitle')} mb-2 text-white`}>
                Almost done!
              </h1>
              <p className="text-white/80 mb-4">
                Click the link we sent to:
              </p>
              <p className="font-mono text-blue-200 bg-white/10 px-3 py-2 rounded-lg text-sm mb-6">
                {email}
              </p>
            </div>

            {/* Primary Action Button */}
            <button 
              onClick={handleCheckEmail}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center group mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Check Email
            </button>

            {/* Simple Resend Option */}
            <div className="text-center">
              <span className="text-white/70 text-sm">No email? </span>
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="text-blue-300 hover:text-blue-200 text-sm font-medium underline disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Send again'}
              </button>
              
              {resendMessage && (
                <div className="mt-2">
                  <p className={resendMessage.includes('Email sent') ? 'text-green-200 text-sm' : 'text-red-200 text-sm'}>
                    {resendMessage}
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-white/50 text-xs">
              JiGR Hospitality Compliance • {getVersionDisplay()}
            </p>
            <p className="text-white/40 text-xs mt-1">
              Need help? Contact our support team
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AccountCreatedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/CafeWindow.jpg')`,
            filter: 'brightness(0.4)'
          }}
        />
        <div className="absolute inset-0 bg-black/15" />
        <div className={`${getCardStyle('primary')} p-8 relative z-10`}>
          <div className="animate-pulse">
            <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4"></div>
            <div className="h-8 bg-white/20 rounded mb-4"></div>
            <div className="h-4 bg-white/20 rounded mb-2"></div>
            <div className="h-4 bg-white/20 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <AccountCreatedContent />
    </Suspense>
  )
}