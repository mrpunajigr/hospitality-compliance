'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getCardStyle, getTextStyle } from '@/lib/design-system'

function ResetPasswordContent() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' })
  const [isValidToken, setIsValidToken] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Password validation function (same as update-profile)
  const validatePassword = (password: string) => {
    let score = 0
    let feedback = ''

    if (password.length === 0) {
      return { score: 0, feedback: '' }
    }

    if (password.length < 8) {
      feedback = 'Password must be at least 8 characters'
      return { score: 1, feedback }
    }

    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    if (score < 3) {
      feedback = 'Include uppercase, lowercase, and numbers'
    } else if (score < 4) {
      feedback = 'Strong password!'
    } else {
      feedback = 'Very strong password!'
    }

    return { score, feedback }
  }

  // Check for valid reset token on mount
  useEffect(() => {
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const token = searchParams.get('token')
    const type = searchParams.get('type')
    const error = searchParams.get('error')
    const errorCode = searchParams.get('error_code')
    const errorDescription = searchParams.get('error_description')
    
    console.log('🔧 Reset password page loaded with params:', {
      accessToken: !!accessToken,
      refreshToken: !!refreshToken,
      token: !!token,
      type,
      error,
      errorCode,
      errorDescription,
      allParams: Object.fromEntries(searchParams.entries())
    })
    
    // Check for Supabase error first
    if (error) {
      setIsValidToken(false)
      if (errorCode === 'otp_expired') {
        setError('Password reset link has expired. Please request a new one.')
      } else {
        setError(errorDescription || 'Invalid reset link. Please request a new one.')
      }
      return
    }
    
    // Check for either new format (token + type=recovery) or old format (access_token + refresh_token)
    const hasNewFormat = token && type === 'recovery'
    const hasOldFormat = accessToken && refreshToken
    
    if (!hasNewFormat && !hasOldFormat) {
      setIsValidToken(false)
      setError('Invalid or expired reset link. Please request a new one.')
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Update password strength when password changes
    if (name === 'password') {
      const strength = validatePassword(value)
      setPasswordStrength(strength)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      // Validate passwords
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        setIsSubmitting(false)
        return
      }

      if (passwordStrength.score < 3) {
        setError('Password is too weak. Please include uppercase, lowercase, and numbers.')
        setIsSubmitting(false)
        return
      }

      const accessToken = searchParams.get('access_token')
      const refreshToken = searchParams.get('refresh_token')
      const token = searchParams.get('token')
      const type = searchParams.get('type')

      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: formData.password,
          accessToken,
          refreshToken,
          token,
          type
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reset password')
      }

      // Redirect to signin with success message
      router.push('/signin?message=password-reset-success')
    } catch (error) {
      console.error('Reset password error:', error)
      setError(error instanceof Error ? error.message : 'Failed to reset password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auth module form field styling (exact same as other auth pages)
  const fieldStyle = "w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-4 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg font-normal"

  if (!isValidToken) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* CafeWindow Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/CafeWindow.jpg')`,
            filter: 'brightness(0.4)'
          }}
        />
        <div className="absolute inset-0 bg-black/15" />

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
          <div className={`${getCardStyle('primary')} max-w-md w-full mx-auto text-center`}>
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <h1 className={`${getTextStyle('pageTitle')} mb-4 tracking-tight`}>
              Invalid Reset Link
            </h1>
            
            <p className="text-white/70 text-sm mb-6">
              This password reset link is invalid or has expired.
            </p>

            <Link 
              href="/forgot-password"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] mr-3"
            >
              Request New Link
            </Link>

            <Link 
              href="/signin"
              className="inline-block text-blue-300 hover:text-blue-200 font-medium py-3 px-6 transition-colors duration-200"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* CafeWindow Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/CafeWindow.jpg')`,
          filter: 'brightness(0.4)'
        }}
      />
      <div className="absolute inset-0 bg-black/15" />

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
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className={`${getTextStyle('pageTitle')} mb-2 tracking-tight`}>
              Reset Password
            </h1>
            <p className="text-white/70 text-sm font-light">
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password */}
            <div>
              <input
                type="password"
                name="password"
                placeholder="New Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className={fieldStyle}
              />
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex space-x-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= passwordStrength.score
                            ? passwordStrength.score <= 2
                              ? 'bg-red-400'
                              : passwordStrength.score <= 3
                              ? 'bg-yellow-400'
                              : 'bg-green-400'
                            : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-white/70">{passwordStrength.feedback}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className={fieldStyle}
              />
              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-1">
                  {formData.password === formData.confirmPassword ? (
                    <p className="text-xs text-green-400">✓ Passwords match</p>
                  ) : (
                    <p className="text-xs text-red-400">✗ Passwords do not match</p>
                  )}
                </div>
              )}
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
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}