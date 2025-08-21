'use client'

// Hospitality Compliance SaaS - Sign In Page
// Glass morphism design matching the landing and signup pages

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

import { getVersionDisplay } from '@/lib/version'
import { DesignTokens, getCardStyle, getTextStyle, getFormFieldStyle } from '@/lib/design-system'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (authError) {
        setError(authError.message)
        setIsLoading(false)
        return
      }

      if (data.user) {
        // Success - redirect to console dashboard  
        console.log('✅ Sign in successful, redirecting...')
        setIsLoading(false)
        
        // Use setTimeout to ensure state is updated before redirect
        setTimeout(() => {
          const redirectTo = new URLSearchParams(window.location.search).get('redirectTo')
          const destination = redirectTo || '/console/dashboard'
          console.log('🔄 Redirecting to:', destination)
          window.location.replace(destination)
        }, 100)
      } else {
        console.log('❌ No user returned from sign in')
        setError('Sign in failed - please try again')
        setIsLoading(false)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    } finally {
      // Safety timeout to prevent infinite loading
      setTimeout(() => {
        setIsLoading(false)
      }, 5000)
    }
  }

  const handleDemoSignIn = async () => {
    console.log('🎯 Demo button clicked!')
    setError('')
    setIsLoading(true)

    try {
      console.log('🚀 Demo mode - bypassing authentication')
      console.log('Current URL:', window.location.href)
      
      // Direct redirect to upload console - it has its own demo auth
      console.log('🔄 Redirecting to /console/upload...')
      window.location.href = '/console/upload'
      
    } catch (error) {
      console.error('Demo sign-in failed:', error)
      setError('Demo mode failed to load')
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Same Background as Landing Page */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3')`,
          filter: 'brightness(0.6)'
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Simple Header */}
      <header className="absolute top-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-24">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12">
                <img 
                  src="/JiGR_Logo-full_figma_circle.png" 
                  alt="JiGR Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <span className="text-white font-bold text-2xl">Hospitality Compliance</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-40">
        {/* Glass Morphism Card */}
        <div className={`${getCardStyle('primary')} max-w-md w-full mx-auto`}>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className={`${getTextStyle('pageTitle')} mb-2 tracking-tight`}>
              Welcome Back
            </h1>
            <p className={`${getTextStyle('bodySmall')} font-light`}>
              Sign in to your compliance dashboard
            </p>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSignIn} className="space-y-5">
            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={getFormFieldStyle()}
              />
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className={getFormFieldStyle()}
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
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none mb-4"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
            
          </form>


          {/* Forgot Password & Sign Up Links */}
          <div className="text-center mt-6 space-y-3">
            <Link 
              href="/forgot-password" 
              className="block text-blue-300 hover:text-blue-200 text-sm font-medium transition-colors duration-200"
            >
              Forgot your password?
            </Link>
            
            <p className={`${getTextStyle('body')} ${DesignTokens.colors.text.onGlassSecondary}`}>
              Don&apos;t have an account?{' '}
              <Link 
                href="/create-account" 
                className="text-blue-300 hover:text-blue-200 font-semibold transition-colors duration-200"
              >
                Sign Up
              </Link>
            </p>
          </div>
          
          {/* Version */}
          <div className="text-center mt-6 pt-4 border-t border-white/10">
            <p className="text-xs font-medium text-white/90">
              v1.8.18a
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}