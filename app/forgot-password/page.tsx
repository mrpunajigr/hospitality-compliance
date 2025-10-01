'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getCardStyle, getTextStyle } from '@/lib/design-system'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send reset email')
      }

      setIsSubmitted(true)
    } catch (error) {
      console.error('Forgot password error:', error)
      setError(error instanceof Error ? error.message : 'Failed to send reset email. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auth module form field styling (exact same as other auth pages)
  const fieldStyle = "w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-4 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg font-normal"

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* CafeWindow Background - EXACT SAME as auth module */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/CafeWindow.jpg')`,
          filter: 'brightness(0.4)'
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/15" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        
        {/* JiGR Logo */}
        <div className="mb-8">
          <div className="w-144 h-36">
            <img 
              src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/jgr_logo_full.png" 
              alt="JiGR Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Glass Morphism Card */}
        <div className={`${getCardStyle('primary')} max-w-md w-full mx-auto`}>
          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className={`${getTextStyle('pageTitle')} mb-2 tracking-tight`}>
                  Forgot Password
                </h1>
                <p className="text-white/70 text-sm font-light">
                  Enter your email to receive a password reset link
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={fieldStyle}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3">
                    <p className="text-red-200 text-sm text-center">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Sending Reset Link...
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              {/* Back to Sign In */}
              <div className="text-center mt-6">
                <Link 
                  href="/signin" 
                  className="text-blue-300 hover:text-blue-200 text-sm font-medium transition-colors duration-200"
                >
                  ← Back to Sign In
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h1 className={`${getTextStyle('pageTitle')} mb-4 tracking-tight`}>
                  Reset Link Sent
                </h1>
                
                <p className="text-white/70 text-sm mb-6">
                  We&apos;ve sent a password reset link to <strong className="text-white">{email}</strong>
                </p>
                
                <p className="text-white/60 text-xs mb-6">
                  Check your email and click the link to reset your password. The link will expire in 24 hours.
                </p>

                <Link 
                  href="/signin" 
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  Return to Sign In
                </Link>
              </div>
            </>
          )}

          {/* Version */}
          <div className="text-center mt-8 pt-4 border-t border-white/10">
            <p className="text-xs font-medium text-white/60">
              JiGR Hospitality Compliance
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}