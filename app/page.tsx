'use client'
// Cache bust: Emergency fix deployment

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getChefWorkspaceBackground, getBrandingAsset, getModuleAsset } from '@/lib/image-storage'
import { getStaticVersion } from '@/lib/version-static'

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

  const backgroundUrl = "https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/CafeWindow.jpg"
  
  console.log('Background URL:', backgroundUrl)
  
  return (
    <>
      {/* Landing page specific background - overrides global */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url("${backgroundUrl}")`,
        backgroundColor: '#1f2937',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: -5
      }} />
      
      <div style={{
        minHeight: '100vh',
        position: 'relative'
      }}>
      
      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        {/* JiGR Logo Above Container */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img 
            src={getBrandingAsset('jgr_logo_full', { width: 120, height: 120 })} 
            alt="JiGR Logo" 
            style={{ width: '120px', height: 'auto', maxWidth: '120px' }}
          />
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '1rem',
          padding: '2rem',
          width: '100%',
          maxWidth: '24rem',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <h1 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600' }}>Hospitality Compliance</h1>
            </div>
            
            <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Welcome Back</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>Sign in to your compliance dashboard</p>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '0.375rem',
                border: 'none',
                color: '#374151',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            {/* Password */}
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '0.375rem',
                border: 'none',
                color: '#374151',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            {/* Error Message */}
            {error && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                borderRadius: '0.5rem',
                padding: '0.75rem'
              }}>
                <p style={{ color: '#fecaca', fontSize: '0.875rem', textAlign: 'center' }}>{error}</p>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                backgroundColor: isLoading ? '#6b7280' : '#2563eb',
                color: 'white',
                fontWeight: '600',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.875rem',
                marginTop: '0.5rem'
              }}
              onMouseOver={e => !isLoading && ((e.target as HTMLButtonElement).style.backgroundColor = '#1d4ed8')}
              onMouseOut={e => !isLoading && ((e.target as HTMLButtonElement).style.backgroundColor = '#2563eb')}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Demo Access Button */}
            <button
              type="button"
              onClick={() => router.push('/dev/login')}
              style={{
                width: '100%',
                backgroundColor: '#16a34a',
                color: 'white',
                fontWeight: '600',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.875rem'
              }}
              onMouseOver={e => ((e.target as HTMLButtonElement).style.backgroundColor = '#15803d')}
              onMouseOut={e => ((e.target as HTMLButtonElement).style.backgroundColor = '#16a34a')}
            >
              ✓ Demo Access
            </button>
          </form>

          {/* Links */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link 
              href="/forgot-password" 
              style={{ 
                color: '#93c5fd', 
                fontSize: '0.875rem', 
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseOver={e => ((e.target as HTMLAnchorElement).style.color = '#bfdbfe')}
              onMouseOut={e => ((e.target as HTMLAnchorElement).style.color = '#93c5fd')}
            >
              Forgot your password?
            </Link>
            
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', margin: 0 }}>
              Don&apos;t have an account?{' '}
              <Link 
                href="/create-account" 
                style={{ 
                  color: '#93c5fd', 
                  fontWeight: '600', 
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
                onMouseOver={e => ((e.target as HTMLAnchorElement).style.color = '#bfdbfe')}
                onMouseOut={e => ((e.target as HTMLAnchorElement).style.color = '#93c5fd')}
              >
                Sign Up
              </Link>
            </p>
          </div>
          
          {/* Version */}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
              {getStaticVersion()}d
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}