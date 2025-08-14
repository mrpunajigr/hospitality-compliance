'use client'

import { useState, useEffect } from 'react'
import { ThemeProvider, useTheme } from '@/lib/theme-context'
import { getCardStyle, getTextStyle, DesignTokens } from '@/lib/design-system'
import BackgroundSelector from '@/app/components/BackgroundSelector'
import AssetUploadModal from '@/app/components/AssetUploadModal'
import AssetManagerToggle from '@/app/components/AssetManagerToggle'

// SECURITY: This page is NEVER accessible in production
if (process.env.NODE_ENV === 'production') {
  throw new Error('Mood board not available in production')
}

interface BackgroundAsset {
  id: string
  name: string
  file_url: string
  category: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  alt_text: string | null
}

function MoodBoardContent() {
  const { theme, toggleTheme } = useTheme()
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split')
  const [currentBackground, setCurrentBackground] = useState<string>('/chef-workspace1jpg.jpg')
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false)
  const [showAssetUpload, setShowAssetUpload] = useState(false)
  const [uploadType, setUploadType] = useState<'background' | 'logo'>('background')

  const handleBackgroundChange = (asset: BackgroundAsset) => {
    setCurrentBackground(asset.file_url)
    setShowBackgroundSelector(false)
  }

  const handleAssetManagerAction = (action: 'upload-background' | 'upload-logo' | 'select-background' | 'select-logo') => {
    switch (action) {
      case 'upload-background':
        setUploadType('background')
        setShowAssetUpload(true)
        break
      case 'upload-logo':
        setUploadType('logo')
        setShowAssetUpload(true)
        break
      case 'select-background':
        setShowBackgroundSelector(true)
        break
      case 'select-logo':
        // Future: implement logo selector
        console.log('Logo selector not implemented yet')
        break
    }
  }

  const handleAssetUploaded = () => {
    setShowAssetUpload(false)
    // Refresh background options if background was uploaded
    if (uploadType === 'background') {
      // Could trigger a refresh of background options here
    }
  }

  // Component showcase data
  const showcaseComponents = [
    {
      name: 'Glass Card',
      component: (
        <div className={getCardStyle('primary')}>
          <h3 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>Primary Glass Card</h3>
          <p className={`${getTextStyle('body')} text-white/80 mb-4`}>
            This demonstrates the glass morphism effect with backdrop blur and transparent borders.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors">
            Action Button
          </button>
        </div>
      )
    },
    {
      name: 'Form Elements',
      component: (
        <div className={getCardStyle('form')}>
          <h3 className={`${getTextStyle('sectionTitle')} text-gray-900 mb-4`}>Form Components</h3>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Email Address"
              className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-xl text-gray-900 placeholder-gray-600 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-xl text-gray-900 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Select Option</option>
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
          </div>
        </div>
      )
    },
    {
      name: 'Navigation',
      component: (
        <div className={`${getCardStyle('secondary')} p-4`}>
          <h3 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>Navigation Pills</h3>
          <div className="flex bg-black/70 backdrop-blur-sm rounded-full p-1 space-x-1 border border-white/40">
            <div className="px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-900 backdrop-blur-sm shadow-sm">
              Dashboard
            </div>
            <div className="px-4 py-2 rounded-full text-sm font-medium text-white hover:bg-white/10">
              Upload
            </div>
            <div className="px-4 py-2 rounded-full text-sm font-medium text-white hover:bg-white/10">
              Reports
            </div>
          </div>
        </div>
      )
    },
    {
      name: 'Status Indicators',
      component: (
        <div className={`${getCardStyle('secondary')} p-4`}>
          <h3 className={`${getTextStyle('sectionTitle')} text-white mb-4`}>Status System</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-white text-sm">Compliant</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-white text-sm">Processing</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-white text-sm">Violation</span>
            </div>
          </div>
        </div>
      )
    }
  ]

  if (viewMode === 'split') {
    return (
      <div className="min-h-screen relative">
        {/* Split Mode: Side by Side Comparison */}
        <div className="flex h-screen">
          
          {/* Dark Theme Side */}
          <div className="w-1/2 relative">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('${currentBackground}')`,
                filter: 'brightness(0.6)'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/50" />
            
            <div className="relative z-10 p-8 h-full overflow-y-auto">
              <div className="mb-6">
                <h2 className={`${getTextStyle('pageTitle')} text-white mb-2`}>Dark Theme</h2>
                <p className={`${getTextStyle('body')} text-white/80`}>Glass morphism on dark background</p>
              </div>
              
              <div className="space-y-6">
                {showcaseComponents.map((item, index) => (
                  <div key={`dark-${index}`}>
                    <h4 className="text-white text-sm font-medium mb-2">{item.name}</h4>
                    {item.component}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Light Theme Side */}
          <div className="w-1/2 relative border-l border-gray-300">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('${currentBackground}')`,
                filter: 'brightness(1.2) saturate(0.8)'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/70" />
            
            <div className="relative z-10 p-8 h-full overflow-y-auto">
              <div className="mb-6">
                <h2 className={`${getTextStyle('pageTitle')} text-gray-900 mb-2`}>Light Theme</h2>
                <p className={`${getTextStyle('body')} text-gray-700`}>Glass morphism on light background</p>
              </div>
              
              <div className="space-y-6">
                {showcaseComponents.map((item, index) => (
                  <div key={`light-${index}`}>
                    <h4 className="text-gray-900 text-sm font-medium mb-2">{item.name}</h4>
                    <div className="[&_.bg-white\/15]:bg-white/30 [&_.border-white\/20]:border-gray-200 [&_.text-white]:text-gray-900 [&_.text-white\/80]:text-gray-700 [&_.text-white\/70]:text-gray-600">
                      {item.component}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Split Mode Controls */}
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-black/80 backdrop-blur-lg border border-white/20 rounded-full px-6 py-3 flex items-center space-x-4">
            <span className="text-white text-sm font-medium">Split Mode</span>
            <div className="w-px h-4 bg-white/20"></div>
            <button
              onClick={() => setViewMode('unified')}
              className="text-white/70 hover:text-white text-sm transition-colors"
            >
              Switch to Unified
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Unified Mode: Single view with theme toggle
  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${currentBackground}')`,
          filter: theme === 'dark' ? 'brightness(0.6)' : 'brightness(1.2) saturate(0.8)'
        }}
      />
      <div className={`absolute inset-0 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-black/40 via-black/30 to-black/50'
          : 'bg-gradient-to-br from-white/60 via-white/40 to-white/70'
      }`} />

      {/* Content */}
      <div className="relative z-10 p-8 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className={`${getTextStyle('pageTitle')} ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            } mb-2`}>
              Mood Board - Unified Mode
            </h1>
            <p className={`${getTextStyle('body')} ${
              theme === 'dark' ? 'text-white/80' : 'text-gray-700'
            }`}>
              Interactive design system showcase with live theme switching
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {showcaseComponents.map((item, index) => (
              <div key={`unified-${index}`}>
                <h4 className={`text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.name}
                </h4>
                <div className={theme === 'light' ? 
                  '[&_.bg-white\/15]:bg-white/30 [&_.border-white\/20]:border-gray-200 [&_.text-white]:text-gray-900 [&_.text-white\/80]:text-gray-700 [&_.text-white\/70]:text-gray-600' 
                  : ''
                }>
                  {item.component}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Unified Mode Controls */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-black/80 backdrop-blur-lg border border-white/20 rounded-full px-6 py-3 flex items-center space-x-4">
          <span className="text-white text-sm font-medium">Unified Mode</span>
          <div className="w-px h-4 bg-white/20"></div>
          <button
            onClick={toggleTheme}
            className="text-white/70 hover:text-white text-sm transition-colors"
          >
            Toggle {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <div className="w-px h-4 bg-white/20"></div>
          <button
            onClick={() => setViewMode('split')}
            className="text-white/70 hover:text-white text-sm transition-colors"
          >
            Switch to Split
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MoodBoardPage() {
  const [currentBackground, setCurrentBackground] = useState<string>('/chef-workspace1jpg.jpg')
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false)
  const [showAssetUpload, setShowAssetUpload] = useState(false)
  const [uploadType, setUploadType] = useState<'background' | 'logo'>('background')

  // Production check as backup
  if (process.env.NODE_ENV === 'production') {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-600">This page is not available in production.</p>
      </div>
    </div>
  }

  const handleBackgroundChange = (asset: BackgroundAsset) => {
    setCurrentBackground(asset.file_url)
    setShowBackgroundSelector(false)
  }

  const handleAssetManagerAction = (action: 'upload-background' | 'upload-logo' | 'select-background' | 'select-logo') => {
    switch (action) {
      case 'upload-background':
        setUploadType('background')
        setShowAssetUpload(true)
        break
      case 'upload-logo':
        setUploadType('logo')
        setShowAssetUpload(true)
        break
      case 'select-background':
        setShowBackgroundSelector(true)
        break
      case 'select-logo':
        console.log('Logo selector not implemented yet')
        break
    }
  }

  const handleAssetUploaded = () => {
    setShowAssetUpload(false)
  }

  return (
    <ThemeProvider>
      <div className="relative">
        {/* Development Only Header */}
        <div className="bg-red-600 text-white text-center py-2 text-sm font-medium relative z-50">
          🎨 DEVELOPMENT ONLY - MOOD BOARD - NOT ACCESSIBLE IN PRODUCTION 🎨
        </div>

        {/* Asset Manager Controls */}
        <div className="fixed top-16 right-4 z-50">
          <AssetManagerToggle 
            onAction={handleAssetManagerAction}
            theme="dark"
          />
        </div>

        {/* Main Content */}
        <MoodBoardContent />

        {/* Modals */}
        {showBackgroundSelector && (
          <BackgroundSelector
            selectedBackground={currentBackground}
            onBackgroundChange={handleBackgroundChange}
            onClose={() => setShowBackgroundSelector(false)}
            theme="dark"
          />
        )}

        {showAssetUpload && (
          <AssetUploadModal
            isOpen={showAssetUpload}
            onClose={() => setShowAssetUpload(false)}
            uploadType={uploadType}
            onUploadSuccess={handleAssetUploaded}
            theme="dark"
          />
        )}
      </div>
    </ThemeProvider>
  )
}