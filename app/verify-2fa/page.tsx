'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Verify2FAPage() {
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuthState = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        // No user logged in, redirect to login
        router.push('/')
        return
      }

      // Check if user already has AAL2 (2FA verified)
      const userAal = (session.user as any).aal
      if (userAal === 'aal2') {
        // Already verified, redirect to admin
        router.push('/admin/console')
        return
      }

      // Check if user actually has 2FA enabled
      try {
        const { data: factors } = await supabase.auth.mfa.listFactors()
        if (!factors?.totp || factors.totp.length === 0) {
          // User doesn't have 2FA set up, redirect to admin
          router.push('/admin/console')
          return
        }
      } catch (mfaError) {
        console.log('MFA check failed:', mfaError)
        router.push('/admin/console')
        return
      }

      setUser(session.user)
    }

    checkAuthState()
  }, [router])

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Get the user's factors
      const { data: factors } = await supabase.auth.mfa.listFactors()
      
      if (!factors?.totp || factors.totp.length === 0) {
        setError('No 2FA factor found. Please contact support.')
        setIsLoading(false)
        return
      }

      const factor = factors.totp[0]

      // Verify the 2FA code
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: factor.id,
        code: verificationCode
      })

      if (error) {
        setError('Invalid verification code. Please try again.')
        setIsLoading(false)
        return
      }

      // Successful verification - redirect to admin console
      console.log('✅ 2FA verification successful')
      router.push('/admin/console')
      
    } catch (err) {
      console.error('❌ 2FA verification error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setVerificationCode(value)
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cafe Window Background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)),
            url("https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/CafeWindow.jpg")
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      />
      
      {/* Text readability overlay */}
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} />

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
        <div 
          className="rounded-3xl p-8 max-w-md w-full mx-auto"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Two-Factor Authentication
            </h1>
            <p className="text-white/70 font-light">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          {/* 2FA Form */}
          <form onSubmit={handleVerification} className="space-y-5">
            {/* Verification Code Input */}
            <div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="000000"
                value={verificationCode}
                onChange={handleCodeInput}
                maxLength={6}
                required
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '24px',
                  textAlign: 'center',
                  letterSpacing: '8px',
                  fontFamily: 'monospace'
                }}
                className="focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
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
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify & Continue'
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="text-center mt-6">
            <p className="text-white/60 text-sm">
              Can&apos;t access your authenticator app?<br />
              Contact your system administrator for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}