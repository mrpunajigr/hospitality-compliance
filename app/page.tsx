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

  return (
    <div style={{ minHeight: '100vh', position: 'relative', backgroundImage: 'url("/chef-workspace1jpg.jpg"), url("/Home-Chef-Chicago-8.webp")', backgroundColor: '#1f2937', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      
      {/* Dark Overlay */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}></div>
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(20px)', borderRadius: '1.5rem', padding: '2.5rem', width: '100%', maxWidth: '30rem', border: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <img 
                src="/jgr_logo_full.png" 
                alt="JiGR Logo"
                style={{ width: '2rem', height: '2rem', marginRight: '0.5rem', objectFit: 'contain' }}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.style.cssText = 'width: 2rem; height: 2rem; background-color: #2563eb; border-radius: 0.25rem; margin-right: 0.5rem; display: inline-block;';
                  target.parentNode?.insertBefore(fallback, target);
                }}
              />
              <h1 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Hospitality Compliance</h1>
            </div>
            
            <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', margin: '0 0 0.5rem 0' }}>Welcome Back</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', margin: 0 }}>Sign in to your compliance dashboard</p>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '0.5rem', color: '#1f2937', border: 'none', fontSize: '1rem' }}
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
                style={{ width: '100%', padding: '0.75rem 1rem', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '0.5rem', color: '#1f2937', border: 'none', fontSize: '1rem' }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(248, 113, 113, 0.3)', borderRadius: '0.5rem', padding: '0.75rem' }}>
                <p style={{ color: '#fecaca', fontSize: '0.875rem', textAlign: 'center', margin: 0 }}>{error}</p>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', fontWeight: '600', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', fontSize: '1rem', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.5 : 1 }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Links */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link 
              href="/forgot-password" 
              style={{ color: '#93c5fd', fontSize: '0.875rem', textDecoration: 'none' }}
            >
              Forgot your password?
            </Link>
            
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', margin: 0 }}>
              Don&apos;t have an account?{' '}
              <Link 
                href="/create-account" 
                style={{ color: '#93c5fd', fontWeight: '600', textDecoration: 'none' }}
              >
                Sign Up
              </Link>
            </p>
          </div>
          
          {/* Version */}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
              v1.8.22.007
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}