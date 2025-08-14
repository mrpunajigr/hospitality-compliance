'use client'

import { useState } from 'react'
import { getVersionDisplay } from '@/lib/version'
import { DesignTokens, getCardStyle, getTextStyle } from '@/lib/design-system'
import BackgroundSelector from '@/app/components/BackgroundSelector'

interface BackgroundAsset {
  id: string
  name: string
  file_url: string
  category: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  alt_text: string | null
}

export default function HomePage() {
  const [currentBackground, setCurrentBackground] = useState<string>('https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3')
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false)

  const handleBackgroundChange = (asset: BackgroundAsset) => {
    setCurrentBackground(asset.file_url)
    setShowBackgroundSelector(false)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${currentBackground}')`,
          filter: 'brightness(0.6)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/50" />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className={`${getCardStyle('form')} text-center`}>
          <div className="w-16 h-16 mx-auto mb-6">
            <img 
              src="/JiGR_Logo-full_figma_circle.png" 
              alt="JiGR Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">
            Hospitality Compliance
          </h1>
          
          <p className={`${getTextStyle('bodySecondary')} ${DesignTokens.colors.text.formInput} opacity-70 mb-8`}>
            AI-powered food safety compliance platform
          </p>
          
          <div className="space-y-4">
            <a
              href="/console/dashboard"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 block shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              ACCESS DEMO
            </a>
            
            <a
              href="/signin"
              className={`w-full ${DesignTokens.colors.glass.cardSecondary} hover:bg-white/20 ${DesignTokens.colors.text.formInput} font-semibold py-3 px-6 ${DesignTokens.layout.rounded} transition-all duration-200 block ${DesignTokens.colors.glass.borderMedium} border ${DesignTokens.effects.blur}`}
            >
              SIGN IN
            </a>
            
            <a
              href="/create-account"
              className={`text-blue-600 hover:text-blue-700 underline ${getTextStyle('caption')}`}
            >
              Create Account
            </a>
          </div>
          
          <p className={`${getTextStyle('version')} text-black opacity-50 mt-6`}>{getVersionDisplay('short')}</p>
        </div>
        
        {/* Background Settings Button */}
        <button
          onClick={() => setShowBackgroundSelector(true)}
          className="absolute top-4 right-4 z-20 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full p-3 text-white hover:bg-white/20 transition-all duration-200"
          title="Change Background"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
      </div>

      {/* Background Selector Modal */}
      {showBackgroundSelector && (
        <BackgroundSelector
          selectedBackground={currentBackground}
          onBackgroundChange={handleBackgroundChange}
          onClose={() => setShowBackgroundSelector(false)}
          theme="dark"
        />
      )}
    </div>
  )
}