'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PublicPageBackgroundWithGradient } from '@/app/components/backgrounds/PublicPageBackground'

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [lastLoginInfo, setLastLoginInfo] = useState<{email: string, name?: string, lastLogin?: string} | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const message = searchParams.get('message')
    if (message === 'password-reset-success') {
      setSuccessMessage('Password reset successful! You can now login with your new password.')
    }

    // Load personalization data from localStorage
    const lastEmail = localStorage.getItem('jigr_last_email')
    const lastLoginData = localStorage.getItem('jigr_last_login_info')
    
    if (lastEmail) {
      setFormData(prev => ({ ...prev, email: lastEmail }))
    }

    if (lastLoginData) {
      try {
        const loginInfo = JSON.parse(lastLoginData)
        setLastLoginInfo(loginInfo)
        
        // Generate time-based greeting
        const hour = new Date().getHours()
        let greeting = 'Good evening'
        if (hour < 12) greeting = 'Good morning'
        else if (hour < 17) greeting = 'Good afternoon'
        
        const name = loginInfo.name || loginInfo.email.split('@')[0]
        const lastLoginDate = loginInfo.lastLogin ? new Date(loginInfo.lastLogin).toLocaleDateString('en-NZ') : 'recently'
        
        setWelcomeMessage(`${greeting}, ${name}! Last login: ${lastLoginDate}`)
      } catch (error) {
        console.warn('Failed to parse last login info:', error)
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        setError(error.message)
        setIsLoading(false)
        return
      }

      if (data.user) {
        // Save personalization data for next visit
        localStorage.setItem('jigr_last_email', formData.email)
        
        // Get user display name from metadata or email
        const userName = data.user.user_metadata?.full_name || 
                        data.user.user_metadata?.name || 
                        formData.email.split('@')[0]
        
        const loginInfo = {
          email: formData.email,
          name: userName,
          lastLogin: new Date().toISOString()
        }
        localStorage.setItem('jigr_last_login_info', JSON.stringify(loginInfo))
        
        router.push('/admin/profile')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <PublicPageBackgroundWithGradient>
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        
        {/* JiGR Logo above login container */}
        <div className="mb-8">
          <div className="w-144 h-36">
            <img 
              src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/jgr_logo_full.png" 
              alt="JiGR Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Glass morphism container */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-auto">
          
          {/* Welcome Back Message */}
          {welcomeMessage && (
            <div className="mb-6 text-center">
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
                <p className="text-blue-200 text-sm font-medium">{welcomeMessage}</p>
              </div>
            </div>
          )}
          
          {/* LOGIN Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="email" className="block text-white text-sm font-medium">
                  Email
                </label>
                {lastLoginInfo && formData.email && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, email: '' }))
                      localStorage.removeItem('jigr_last_email')
                      localStorage.removeItem('jigr_last_login_info')
                      setWelcomeMessage('')
                      setLastLoginInfo(null)
                    }}
                    className="text-xs text-blue-300 hover:text-blue-200 underline transition-colors"
                  >
                    Use different email
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-4 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg font-normal"
                  placeholder="Enter your email"
                />
                {lastLoginInfo && formData.email && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-4 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg font-normal"
                placeholder="Enter your password"
              />
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-3">
                <p className="text-green-200 text-sm text-center">{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3">
                <p className="text-red-200 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none text-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'LOGIN'
              )}
            </button>
          </form>

          {/* Links */}
          <div className="text-center mt-6 space-y-3">
            <Link 
              href="/forgot-password" 
              className="block text-blue-300 hover:text-blue-200 text-sm font-medium transition-colors duration-200"
            >
              Forgot your password?
            </Link>
            
            <p className="text-white/70 text-sm">
              Don&apos;t have an account?{' '}
              <Link 
                href="/register" 
                className="text-blue-300 hover:text-blue-200 font-semibold transition-colors duration-200"
              >
                Register
              </Link>
            </p>
          </div>
          
          {/* Version */}
          <div className="text-center mt-6 pt-4 border-t border-white/10">
            <p className="text-xs font-medium text-white/90">
              v1.11.1.001
            </p>
          </div>
        </div>
      </div>
    </PublicPageBackgroundWithGradient>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}