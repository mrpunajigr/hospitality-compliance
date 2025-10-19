'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DesignTokens } from '@/lib/design-system'

interface ChampionWelcomeOverlayProps {
  userClient: {
    name?: string
    companyName?: string
    fullName?: string
  }
  isVisible: boolean
  onDismiss: () => void
}

export default function ChampionWelcomeOverlay({ 
  userClient, 
  isVisible, 
  onDismiss 
}: ChampionWelcomeOverlayProps) {
  const router = useRouter()
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      // Small delay to ensure smooth animation
      const timer = setTimeout(() => {
        setIsAnimating(true)
      }, 50)
      return () => clearTimeout(timer)
    } else {
      setIsAnimating(false)
    }
  }, [isVisible])

  const handleLearnMore = () => {
    onDismiss()
    router.push('/champion/program')
  }

  const handleDismiss = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onDismiss()
    }, 300) // Allow animation to complete
  }

  if (!isVisible) return null

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isAnimating ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={handleDismiss}
    >
      <div 
        className={`relative max-w-lg mx-4 transition-all duration-300 transform ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Champion Badge Header */}
        <div className="text-center p-8 pb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-lg">
            <span className="text-3xl">🏆</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to the Champion Program!
          </h2>
          
          <div className="text-gray-700 text-lg leading-relaxed">
            <p className="mb-3">
              Hi <strong>{userClient.fullName || 'there'}</strong>!
            </p>
            <p>
              As the first team member to register <strong>{userClient.companyName || 'your company'}</strong>, 
              you've been automatically enrolled in our exclusive Champion Program.
            </p>
          </div>
        </div>

        {/* Benefits Preview */}
        <div className="px-8 pb-6">
          <div className="bg-white/40 rounded-lg p-4 mb-6 border border-white/20">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">✨</span>
              What does this mean for you?
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="mr-2 text-green-600">•</span>
                <span>30-day premium evaluation period</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-600">•</span>
                <span>Full system configuration access</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-600">•</span>
                <span>Exclusive Champion rewards & recognition</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-600">•</span>
                <span>Direct owner invitation tools</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 px-8 pb-8">
          <button
            onClick={handleLearnMore}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md"
          >
            Learn More About the Program
          </button>
          <button
            onClick={handleDismiss}
            className="px-6 py-3 bg-white/60 hover:bg-white/80 text-gray-700 font-medium rounded-lg transition-all duration-200 border border-white/40"
          >
            Got it!
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-colors duration-200 text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}