'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
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
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (signInError) {
        setError(signInError.message)
        setIsLoading(false)
        return
      }

      // Successful login - redirect to dashboard
      router.push('/upload/console')
      
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleDemoAccess = async () => {
    setIsLoading(true)
    // Redirect to demo interface
    router.push('/upload/console')
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #2563eb 25%, #3730a3 50%, #2563eb 75%, #1e293b 100%)',
          backgroundAttachment: 'fixed'
        }}
      />
      
      {/* Pattern overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
          opacity: 0.3
        }}
      />
      
      {/* Content overlay */}
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }} />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-24">
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
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Hospitality Compliance
            </h1>
            <p className="text-white/70 font-light">
              AI-powered food safety compliance platform
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
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px'
                }}
                className="focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all placeholder-white/50"
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
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '16px'
                }}
                className="focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all placeholder-white/50"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3">
                <p className="text-red-200 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Sign In Button */}
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

            {/* Demo Access Button */}
            <button
              type="button"
              onClick={handleDemoAccess}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              🚀 Access Demo
            </button>
            
          </form>

          {/* Links */}
          <div className="text-center mt-6 space-y-3">
            <p className="text-white/70 text-sm">
              Don&apos;t have an account?{' '}
              <Link 
                href="/create-account" 
                className="text-blue-300 hover:text-blue-200 font-semibold transition-colors duration-200"
              >
                Create Account
              </Link>
            </p>
            
            <Link 
              href="/landing-page" 
              className="block text-blue-300 hover:text-blue-200 text-sm font-medium transition-colors duration-200"
            >
              View System Features
            </Link>
          </div>
          
          {/* Version */}
          <div className="text-center mt-6 pt-4 border-t border-white/10">
            <p className="text-xs font-medium text-white/90">
              v1.8.22.007
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}