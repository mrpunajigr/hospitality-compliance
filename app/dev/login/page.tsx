'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDevAuth } from '@/lib/dev-auth-context'
import { getVersionDisplay } from '@/lib/version'
import { getCardStyle, getTextStyle } from '@/lib/design-system'

export default function DevLoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading } = useDevAuth()
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dev')
    }
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const success = await login(credentials.username, credentials.password)
    
    if (success) {
      router.push('/dev')
    } else {
      setError('Invalid credentials. Please check your username and password.')
    }
    
    setIsSubmitting(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Checking DEV session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('/chef-workspace1jpg.jpg')`,
          backgroundPosition: '50% 50%',
          backgroundAttachment: 'fixed',
          filter: 'brightness(0.4)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/80" />

      {/* DEV Header */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="bg-orange-600 text-white text-center py-2 text-sm font-medium">
          🔧 DEVELOPMENT TEAM ACCESS PORTAL - SECURE LOGIN REQUIRED 🔧
        </div>
      </div>

      {/* Login Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center px-4 pt-12">
        <div className="max-w-md w-full">
          
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">DEV</span>
            </div>
            <h1 className={`${getTextStyle('pageTitle')} text-white mb-2`}>
              Development Portal
            </h1>
            <p className={`${getTextStyle('body')} text-gray-300`}>
              Secure access for development team
            </p>
          </div>

          {/* Login Form */}
          <div className={getCardStyle('form')}>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {error && (
                <div className="bg-red-600/20 border border-red-400/30 rounded-xl p-4">
                  <div className="flex items-center">
                    <span className="text-red-400 mr-2">⚠</span>
                    <p className="text-red-200 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  DEV Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={credentials.username}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-xl text-gray-900 placeholder-gray-600 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your dev username"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  DEV Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-xl text-gray-900 placeholder-gray-600 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter your dev password"
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Authenticating...
                  </div>
                ) : (
                  'Access DEV Portal'
                )}
              </button>

            </form>

            {/* Development Credentials Info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 bg-blue-600/20 border border-blue-400/30 rounded-xl p-4">
                <h4 className="font-medium text-blue-200 mb-2 text-sm">Development Mode - Test Credentials:</h4>
                <div className="text-xs text-blue-300 space-y-1">
                  <div><code>dev / dev123</code> - DEV role</div>
                  <div><code>senior / senior123</code> - SENIOR_DEV role</div>
                  <div><code>architect / arch123</code> - ARCHITECT role</div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
              <span>{getVersionDisplay('short')}</span>
              <span>•</span>
              <span>Hospitality Compliance SaaS</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              For development team access only
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}