'use client'

import { getVersionDisplay } from '@/lib/version'
import { DesignTokens, getCardStyle, getTextStyle, getFormFieldStyle } from '@/lib/design-system'

// Hospitality Compliance SaaS - Create Account Page
// Glass morphism design matching the landing page

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function CreateAccountPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    fullName: '',
    phone: '',
    businessType: 'restaurant',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }

    try {
      // Create user with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            business_name: formData.businessName,
            phone: formData.phone,
            business_type: formData.businessType
          }
        }
      })

      if (authError) {
        setError(authError.message)
        setIsLoading(false)
        return
      }

      if (data.user) {
        // Create company for the new user
        try {
          const companyResponse = await fetch('/api/create-company', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              businessName: formData.businessName,
              businessType: formData.businessType,
              phone: formData.phone,
              userId: data.user.id,
              email: formData.email,
              fullName: formData.fullName
            })
          })

          const result = await companyResponse.json()
          
          if (!companyResponse.ok) {
            console.error('Company creation failed:', result)
            setError(`Account created but company setup failed: ${result.error}`)
            setIsLoading(false)
            return
          }

          console.log('✅ Account and company created successfully')
          // Success - redirect to company settings for guided onboarding
          router.push('/admin/company-settings?onboarding=true&company=created')
        } catch (companyError) {
          console.error('Company creation error:', companyError)
          setError('Account created but company setup failed. Please contact support.')
          setIsLoading(false)
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
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
              Create Account
            </h1>
            <p className={`${getTextStyle('bodySmall')} font-light`}>
              Start your compliance journey today
            </p>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Business Name */}
            <div>
              <input
                type="text"
                name="businessName"
                placeholder="Business Name"
                value={formData.businessName}
                onChange={handleInputChange}
                required
                className={getFormFieldStyle()}
              />
            </div>

            {/* Business Type */}
            <div>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                required
                className={getFormFieldStyle()}
              >
                <option value="restaurant" className="text-gray-800">Restaurant</option>
                <option value="cafe" className="text-gray-800">Café</option>
                <option value="hotel" className="text-gray-800">Hotel</option>
                <option value="catering" className="text-gray-800">Catering</option>
                <option value="other" className="text-gray-800">Other</option>
              </select>
            </div>

            {/* Full Name */}
            <div>
              <input
                type="text"
                name="fullName"
                placeholder="Your Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className={getFormFieldStyle()}
              />
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Business Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={getFormFieldStyle()}
              />
            </div>

            {/* Phone */}
            <div>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                className={getFormFieldStyle()}
              />
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password (8+ characters)"
                value={formData.password}
                onChange={handleInputChange}
                required
                className={getFormFieldStyle()}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
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
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className={`${getTextStyle('body')} ${DesignTokens.colors.text.onGlassSecondary}`}>
              Already have an account?{' '}
              <Link 
                href="/signin" 
                className="text-blue-300 hover:text-blue-200 font-semibold transition-colors duration-200"
              >
                Sign In
              </Link>
            </p>
          </div>
          
          {/* Version */}
          <div className="text-center mt-6 pt-4 border-t border-white/10">
            <p className={`${getTextStyle('version')} ${DesignTokens.colors.text.onGlassSecondary}`}>
              {getVersionDisplay('prod')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}