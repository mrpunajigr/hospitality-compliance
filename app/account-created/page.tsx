'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { getVersionDisplay } from '@/lib/version'

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
        setResendMessage('✅ Verification email sent successfully! Please check your inbox.')
      } else {
        setResendMessage(`❌ ${data.message || 'Failed to resend email. Please try again.'}`)
      }
    } catch (error) {
      setResendMessage('❌ Network error. Please check your connection and try again.')
    } finally {
      setIsResending(false)
    }
  }

  const emailProviderLink = getEmailProviderLink(emailDomain)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6">
        {/* Success Card */}
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-lg border border-gray-200/50 rounded-3xl p-8 shadow-2xl">
            
            {/* Success Icon */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Account Created Successfully! 🎉
              </h1>
              <p className="text-gray-600">
                Welcome to JiGR Hospitality Compliance, <strong>{company}</strong>!
              </p>
            </div>

            {/* Verification Instructions */}
            <div className="bg-blue-50 border border-blue-200/50 rounded-2xl p-6 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Please Verify Your Email
                  </h3>
                  <p className="text-blue-800 mb-3">
                    We&apos;ve sent a verification email to:
                  </p>
                  <p className="font-mono text-blue-700 bg-white/50 px-3 py-2 rounded-lg text-sm mb-3">
                    {email}
                  </p>
                  <p className="text-blue-700 text-sm">
                    Click the verification link in your email to complete your account setup and access your dashboard.
                  </p>
                </div>
              </div>
            </div>

            {/* Email Provider Quick Link */}
            {emailProviderLink && (
              <div className="mb-6">
                <a 
                  href={emailProviderLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center group"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Check Your Email
                  <svg className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}

            {/* Resend Email Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="text-center mb-4">
                <p className="text-gray-600 text-sm mb-3">
                  Didn&apos;t receive the email? Check your spam folder or request a new one.
                </p>
                
                <button
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium py-2 px-4 rounded-lg transition-all duration-200"
                >
                  {isResending ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>

                {resendMessage && (
                  <div className="mt-4 p-3 rounded-lg text-sm">
                    <p className={resendMessage.startsWith('✅') ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'}
                       style={{ padding: '12px', borderRadius: '8px' }}>
                      {resendMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-4 mt-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-amber-800">
                    <strong>Important:</strong> The verification link expires in 24 hours. 
                    Make sure to verify your email soon to access all features.
                  </p>
                </div>
              </div>
            </div>

            {/* Alternative Access */}
            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-sm mb-3">
                Already verified? Continue to your dashboard:
              </p>
              <Link 
                href="/admin/profile?onboarding=true"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
              >
                Go to Profile Setup
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-xs">
              JiGR Hospitality Compliance • {getVersionDisplay()}
            </p>
            <p className="text-gray-400 text-xs mt-1">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-lg border border-gray-200/50 rounded-3xl p-8 shadow-2xl">
          <div className="animate-pulse">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <AccountCreatedContent />
    </Suspense>
  )
}