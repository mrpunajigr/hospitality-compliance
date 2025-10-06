'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getCardStyle, getTextStyle } from '@/lib/design-system'

export default function SimpleResetPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' })

  // Password validation function (same as other pages)
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

      const response = await fetch('/api/simple-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          newPassword: formData.password
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reset password')
      }

      setIsSuccess(true)
    } catch (error) {
      console.error('Password reset error:', error)
      setError(error instanceof Error ? error.message : 'Failed to reset password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auth module form field styling
  const fieldStyle = "w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-4 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm font-normal"

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
          {!isSuccess ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className={`${getTextStyle('pageTitle')} mb-2 tracking-tight`}>
                  Reset Password
                </h1>
                <p className="text-white/70 text-sm font-light">
                  Enter your email and new password
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={fieldStyle}
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter new password"
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
                                ? level <= 2
                                  ? 'bg-red-500'
                                  : level <= 3
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                                : 'bg-white/20'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${
                        passwordStrength.score <= 2 ? 'text-red-300' : 
                        passwordStrength.score <= 3 ? 'text-yellow-300' : 
                        'text-green-300'
                      }`}>
                        {passwordStrength.feedback}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className={fieldStyle}
                  />
                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <p className={`text-xs mt-1 ${
                      formData.password === formData.confirmPassword ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
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
                  Password Reset Successfully
                </h1>
                
                <p className="text-white/70 text-sm mb-6">
                  Your password has been updated. You can now sign in with your new password.
                </p>

                <Link 
                  href="/signin" 
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  Sign In Now
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