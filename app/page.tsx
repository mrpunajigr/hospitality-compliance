'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getBrandingAsset, getChefWorkspaceBackground } from '@/lib/image-storage'

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

  const backgroundUrl = getChefWorkspaceBackground()
  const logoUrl = getBrandingAsset('jigr-logo.png')

  return (
    <div 
      style={{
        minHeight: '100vh',
        position: 'relative',
        backgroundImage: `url("${backgroundUrl}")`,
        backgroundColor: '#1f2937',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark Overlay */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)'
        }}
      />
      
      {/* Content */}
      <div 
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
      >
        <div 
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            borderRadius: '1rem',
            padding: '2rem',
            width: '100%',
            maxWidth: '28rem',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img 
                src={logoUrl}
                alt="JiGR Logo"
                style={{
                  width: '2rem',
                  height: '2rem',
                  marginRight: '0.5rem',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none'
                  const fallback = document.createElement('div')
                  fallback.style.cssText = 'width: 2rem; height: 2rem; background-color: #2563eb; border-radius: 0.25rem; margin-right: 0.5rem;'
                  e.currentTarget.parentNode?.insertBefore(fallback, e.currentTarget)
                }}
              />
              <h1 className="text-white text-xl font-semibold">Hospitality Compliance</h1>
            </div>
            
            <h2 className="text-white text-2xl font-bold mb-2">Welcome Back</h2>
            <p className="text-white text-opacity-80 text-sm">Sign in to your compliance dashboard</p>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white bg-opacity-90 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-3 bg-white bg-opacity-90 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-400 border-opacity-30 rounded-lg p-3">
                <p className="text-red-200 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Links */}
          <div className="text-center mt-6 space-y-3">
            <Link 
              href="/forgot-password" 
              className="block text-blue-300 hover:text-blue-200 text-sm transition-colors duration-200"
            >
              Forgot your password?
            </Link>
            
            <p className="text-white text-opacity-80 text-sm">
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
          <div className="text-center mt-8">
            <p className="text-xs text-white text-opacity-60">
              v1.8.22.007
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}