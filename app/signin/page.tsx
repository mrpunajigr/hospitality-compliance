'use client'

// Hospitality Compliance SaaS - Sign In Page
// Glass morphism design matching the landing and signup pages

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

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
        // Success - redirect to dashboard
        router.push('/workspace/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleDemoAccess = async () => {
    setIsLoading(true)
    
    try {
      // Try anonymous sign in first
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
      
      if (!anonError && anonData.user) {
        console.log('Anonymous demo user signed in successfully')
        router.push('/workspace/dashboard')
        return
      }

      // Fallback - just navigate to dashboard (it will handle demo auth)
      router.push('/workspace/dashboard')
      
    } catch (err) {
      console.log('Auth flow - navigating to dashboard for demo setup')
      router.push('/workspace/dashboard')
    } finally {
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
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <img 
                  src="/jgr_logo_full.png" 
                  alt="JGR Logo" 
                  className="w-7 h-7 object-contain filter brightness-0 invert"
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
        <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-8 max-w-md w-full mx-auto shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-white text-3xl font-bold mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-white/60 text-xs mb-4">
              v1.8.6
            </p>
            <p className="text-white/80 text-sm font-light">
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
                className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-xl text-gray-900 placeholder-gray-600 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-xl text-gray-900 placeholder-gray-600 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
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

          {/* Demo Access */}
          <div className="mt-6">
            <div className="text-center mb-4">
              <p className="text-white/70 text-sm">or</p>
            </div>
            
            <button
              onClick={handleDemoAccess}
              disabled={isLoading}
              className="w-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-white/30 backdrop-blur-sm transform hover:scale-[1.02] disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Accessing...
                </div>
              ) : (
                'Try Demo Mode'
              )}
            </button>
          </div>

          {/* Forgot Password & Sign Up Links */}
          <div className="text-center mt-6 space-y-3">
            <Link 
              href="/forgot-password" 
              className="block text-blue-300 hover:text-blue-200 text-sm font-medium transition-colors duration-200"
            >
              Forgot your password?
            </Link>
            
            <p className="text-white/80 text-sm">
              Don't have an account?{' '}
              <Link 
                href="/create-account" 
                className="text-blue-300 hover:text-blue-200 font-semibold transition-colors duration-200"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}