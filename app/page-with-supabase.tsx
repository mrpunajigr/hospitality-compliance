'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getTextStyle } from '@/lib/design-system'

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDemoAccess = async () => {
    setIsLoading(true)
    
    try {
      // Try anonymous sign in first
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
      
      if (!anonError && anonData.user) {
        console.log('Anonymous demo user signed in successfully')
        router.push('/console/dashboard')
        return
      }

      // Fallback - just navigate to dashboard (it will handle demo auth)
      router.push('/console/dashboard')
      
    } catch (err) {
      console.log('Auth flow - navigating to dashboard for demo setup')
      router.push('/console/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Beautiful Restaurant Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3')`,
          filter: 'brightness(0.6)'
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20">
        <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm overflow-hidden">
                  <img 
                    src="/jgr_logo_full.png" 
                    alt="JGR Logo" 
                    className="w-6 h-6 object-contain opacity-80"
                  />
                </div>
                <h1 className={`text-white ${getTextStyle('cardTitle')}`}>Hospitality Compliance</h1>
              </div>
              
              <nav className="flex items-center space-x-4">
                <a 
                  href="/signin"
                  className={`text-white/80 hover:text-white ${getTextStyle('body')} transition-colors duration-200`}
                >
                  Sign In
                </a>
                <a 
                  href="/create-account"
                  className={`bg-blue-600 hover:bg-blue-700 text-white ${getTextStyle('body')} py-2 px-4 rounded-lg transition-all duration-200`}
                >
                  Get Started
                </a>
              </nav>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-16">
        {/* Glass Morphism Card - Logan Bar Style */}
        <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-3xl p-10 max-w-lg w-full mx-auto shadow-2xl">
          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h2 className={`text-white/80 ${getTextStyle('sectionTitle')} mb-3 tracking-wide`}>
              Welcome to
            </h2>
            <h1 className="text-white text-4xl font-bold mb-8 leading-tight tracking-tight">
              Hospitality Compliance
            </h1>
            
            {/* Main CTA Button */}
            <button
              onClick={handleDemoAccess}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none mb-6"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
                  Accessing Demo...
                </div>
              ) : (
                'ACCESS DEMO'
              )}
            </button>
          </div>
          
          {/* Subtitle */}
          <div className="text-center">
            <p className={`text-white/90 ${getTextStyle('body')} leading-relaxed`}>
              Streamline your food safety compliance
            </p>
            <p className={`text-white/90 ${getTextStyle('body')} leading-relaxed`}>
              with AI-powered delivery tracking
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer - Logan Bar Style with JGR Logo */}
      <div className="absolute bottom-8 left-0 right-0 z-10">
        <div className={`flex items-center justify-center space-x-4 text-white/60 ${getTextStyle('bodySmall')}`}>
          <span>v1.8.6</span>
          <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm overflow-hidden">
            <img 
              src="/jgr_logo_full.png" 
              alt="JGR Logo" 
              className="w-6 h-6 object-contain opacity-80"
            />
          </div>
          <div className="w-1.5 h-1.5 bg-white/40 rounded-full"></div>
          <button 
            onClick={handleDemoAccess}
            className="hover:text-white transition-colors duration-200"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}