'use client'

import { DesignTokens, getCardStyle, getTextStyle, getFormFieldStyle, getNavPillStyle, ComponentPatterns, Theme, ThemeVariants, getThemeTokens } from '@/lib/design-system'
import { getVersionDisplay } from '@/lib/version'
import ThemeProvider, { useTheme } from '@/lib/theme-context'
import ThemeToggle from '@/app/components/ThemeToggle'
import AssetManagerToggle from '@/app/components/AssetManagerToggle'
import BackgroundSelector from '@/app/components/BackgroundSelector'
import AssetUploadModal from '@/app/components/AssetUploadModal'
import { useState } from 'react'
import Link from 'next/link'

interface BackgroundAsset {
  id: string
  name: string
  file_url: string
  category: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  alt_text: string | null
}

function MoodBoardContent() {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split')
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadType, setUploadType] = useState<'background' | 'logo'>('background')
  const [selectedBackground, setSelectedBackground] = useState<BackgroundAsset>({
    id: 'default',
    name: 'Chef Workspace',
    file_url: '/chef-workspace1jpg.jpg',
    category: 'kitchen',
    difficulty: 'medium',
    alt_text: 'Professional chef workspace with cooking equipment'
  })
  const { theme, toggleTheme } = useTheme()
  
  const navigation = [
    { name: 'Style Guide', href: '#style-guide' },
    { name: 'Components', href: '#components' },
    { name: 'Forms', href: '#forms' },
    { name: 'Navigation', href: '#navigation' },
  ]

  const handleAssetAction = (action: string) => {
    switch (action) {
      case 'select-background':
        setShowBackgroundSelector(true)
        break
      case 'upload-background':
        setUploadType('background')
        setShowUploadModal(true)
        break
      case 'upload-logo':
        setUploadType('logo')
        setShowUploadModal(true)
        break
      case 'select-logo':
        // TODO: Implement logo selector
        console.log('Select logo modal')
        break
    }
  }

  const handleBackgroundChange = (background: BackgroundAsset) => {
    setSelectedBackground(background)
    setShowBackgroundSelector(false)
  }

  const handleUploadSuccess = (asset: any) => {
    // Refresh background selector if it was a background upload
    if (uploadType === 'background') {
      // The BackgroundSelector will automatically refresh when reopened
      console.log('Background uploaded successfully:', asset)
    }
    setShowUploadModal(false)
  }

  if (viewMode === 'split') {
    return (
      <>
        <SplitThemeView 
          navigation={navigation} 
          viewMode={viewMode} 
          setViewMode={setViewMode}
          selectedBackground={selectedBackground}
          onAssetAction={handleAssetAction}
        />
        
        {showBackgroundSelector && (
          <BackgroundSelector
            selectedBackground={selectedBackground.file_url}
            onBackgroundChange={handleBackgroundChange}
            onClose={() => setShowBackgroundSelector(false)}
            theme={theme}
          />
        )}
        
        {showUploadModal && (
          <AssetUploadModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            uploadType={uploadType}
            onUploadSuccess={handleUploadSuccess}
            theme={theme}
          />
        )}
      </>
    )
  }

  return (
    <>
      <UnifiedThemeView 
        navigation={navigation} 
        theme={theme} 
        viewMode={viewMode} 
        setViewMode={setViewMode}
        selectedBackground={selectedBackground}
        onAssetAction={handleAssetAction}
      />
      
      {showBackgroundSelector && (
        <BackgroundSelector
          selectedBackground={selectedBackground.file_url}
          onBackgroundChange={handleBackgroundChange}
          onClose={() => setShowBackgroundSelector(false)}
          theme={theme}
        />
      )}
      
      {showUploadModal && (
        <AssetUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          uploadType={uploadType}
          onUploadSuccess={handleUploadSuccess}
          theme={theme}
        />
      )}
    </>
  )
}

function SplitThemeView({ navigation, viewMode, setViewMode, selectedBackground, onAssetAction }: { 
  navigation: any[], 
  viewMode: 'split' | 'unified',
  setViewMode: (mode: 'split' | 'unified') => void,
  selectedBackground: BackgroundAsset,
  onAssetAction: (action: string) => void
}) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('${selectedBackground.file_url}')`,
          backgroundPosition: '50% 50%',
          backgroundAttachment: 'fixed',
          filter: 'brightness(0.9)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/30" />

      {/* Controls */}
      <div className="relative z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
            <div>
              <h1 className={`${getTextStyle('pageTitle')} text-white drop-shadow-lg`}>
                🌗 Light & Dark Mode Comparison
              </h1>
              <p className={`${getTextStyle('body')} text-white/90 drop-shadow-md`}>
                Split Mode - Visual showcase on {selectedBackground.name}
              </p>
              <p className="text-blue-300 text-xs mt-1">
                Version: {getVersionDisplay('dev')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <AssetManagerToggle onAction={onAssetAction} theme="dark" />
            <ThemeToggle showLabels={true} />
          </div>
        </div>
      </div>

      {/* Split view container */}
      <div className="relative z-10 flex h-[calc(100vh-120px)]">
        {/* Dark Mode Side */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="text-center mb-4">
              <h2 className={`${getTextStyle('sectionTitle')} text-white mb-2`}>
                🌙 Dark Mode
              </h2>
              <p className={`${getTextStyle('body')} text-white/80`}>
                Glass morphism with blur effects
              </p>
            </div>
            <ThemeShowcase theme="dark" navigation={navigation} />
          </div>
        </div>

        {/* Divider */}
        <div className="w-px bg-white/20 relative">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
            <span className="text-white text-xs">VS</span>
          </div>
        </div>

        {/* Light Mode Side */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="p-4">
            <div className="text-center mb-4">
              <h2 className={`${getTextStyle('sectionTitle', 'light')} text-gray-900 mb-2`}>
                ☀️ Light Mode
              </h2>
              <p className={`${getTextStyle('body', 'light')} text-gray-700`}>
                Clean solid backgrounds with subtle shadows
              </p>
            </div>
            <ThemeShowcase theme="light" navigation={navigation} />
          </div>
        </div>
      </div>
    </div>
  )
}

function UnifiedThemeView({ navigation, theme, viewMode, setViewMode, selectedBackground, onAssetAction }: { 
  navigation: any[], 
  theme: Theme,
  viewMode: 'split' | 'unified',
  setViewMode: (mode: 'split' | 'unified') => void,
  selectedBackground: BackgroundAsset,
  onAssetAction: (action: string) => void
}) {
  const bgClass = theme === 'light' ? 'bg-gradient-to-br from-gray-50 to-gray-100' : ''
  
  return (
    <div className={`${ComponentPatterns.mainContainer} ${bgClass}`}>
      {/* Dynamic Background */}
      {theme === 'dark' && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-no-repeat"
            style={{
              backgroundImage: `url('${selectedBackground.file_url}')`,
              backgroundPosition: '50% 50%',
              backgroundAttachment: 'fixed',
              filter: 'brightness(0.9)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/30" />
        </>
      )}

      {/* Light mode background overlay */}
      {theme === 'light' && selectedBackground.id !== 'default-light' && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-no-repeat opacity-30"
            style={{
              backgroundImage: `url('${selectedBackground.file_url}')`,
              backgroundPosition: '50% 50%',
              backgroundAttachment: 'fixed'
            }}
          />
          <div className="absolute inset-0 bg-white/80" />
        </>
      )}

      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
              <div>
                <h1 className={`${getTextStyle('pageTitle', theme)} ${theme === 'dark' ? 'text-white drop-shadow-lg' : 'text-gray-900'}`}>
                  🎨 Design System Mood Board
                </h1>
                <p className={`${getTextStyle('body', theme)} ${theme === 'dark' ? 'text-white/90 drop-shadow-md' : 'text-gray-700'}`}>
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'} on {selectedBackground.name}
                </p>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
                  Version: {getVersionDisplay('dev')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <AssetManagerToggle onAction={onAssetAction} theme={theme} />
              <ThemeToggle showLabels={true} />
            </div>
          </div>
        </div>

        <div className={ComponentPatterns.contentWrapper}>
          <ThemeShowcase theme={theme} navigation={navigation} />
        </div>
      </div>
    </div>
  )
}

function ViewModeToggle({ viewMode, setViewMode }: { 
  viewMode: 'split' | 'unified'
  setViewMode: (mode: 'split' | 'unified') => void 
}) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-white/90 text-xs font-medium">
        View:
      </span>
      
      <button
        onClick={() => setViewMode(viewMode === 'split' ? 'unified' : 'split')}
        className="relative inline-flex h-8 w-20 items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-white/20 border border-white/30"
        aria-label={`Switch to ${viewMode === 'split' ? 'unified' : 'split'} mode`}
      >
        <div
          className={`absolute inset-1 flex h-6 w-9 items-center justify-center rounded-full shadow-sm transition-all duration-200 bg-gray-800 ${
            viewMode === 'split'
              ? 'translate-x-0'
              : 'translate-x-9'
          }`}
        >
          {viewMode === 'split' ? (
            // Split icon - two panels
            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h3a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zM13 3a1 1 0 011-1h3a1 1 0 011 1v14a1 1 0 01-1 1h-3a1 1 0 01-1-1V3z" />
            </svg>
          ) : (
            // Unified icon - single panel
            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
            </svg>
          )}
        </div>
      </button>
      
      <span className="text-white/70 text-xs capitalize">
        {viewMode}
      </span>
    </div>
  )
}

function ThemeShowcase({ theme, navigation }: { theme: Theme, navigation: any[] }) {
  const tokens = getThemeTokens(theme)
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const textSecondaryClass = theme === 'dark' ? 'text-white/90' : 'text-gray-700'
  const textMutedClass = theme === 'dark' ? 'text-white/70' : 'text-gray-500'
  
  return (
    <>
      {/* Design System Overview */}
      <div className={`${getCardStyle('form', theme)} mb-8`}>
        <h2 className={`${getTextStyle('sectionTitle', theme)} ${textClass} mb-4`}>
          🏗️ Design System Overview - {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
        </h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <h3 className={`${getTextStyle('cardTitle', theme)} ${textClass} mb-2`}>Design Tokens</h3>
            <ul className={`${textSecondaryClass} space-y-1`}>
              <li>• Color System ({theme === 'dark' ? 'glass morphism' : 'solid backgrounds'})</li>
              <li>• Typography Scale (4 levels)</li>
              <li>• Spacing System (consistent gaps)</li>
              <li>• Effects Library ({theme === 'dark' ? 'blur, shadows' : 'subtle shadows'})</li>
            </ul>
          </div>
          <div>
            <h3 className={`${getTextStyle('cardTitle', theme)} ${textClass} mb-2`}>Utility Functions</h3>
            <ul className={`${textSecondaryClass} space-y-1`}>
              <li>• getCardStyle(variant, theme)</li>
              <li>• getTextStyle(type, theme)</li>
              <li>• getFormFieldStyle(type, theme)</li>
              <li>• getNavPillStyle(isActive, theme)</li>
            </ul>
          </div>
          <div>
            <h3 className={`${getTextStyle('cardTitle', theme)} ${textClass} mb-2`}>Component Patterns</h3>
            <ul className={`${textSecondaryClass} space-y-1`}>
              <li>• Navigation containers</li>
              <li>• Card variants (4 types)</li>
              <li>• Form elements</li>
              <li>• Layout patterns</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div className={`${getCardStyle('primary', theme)} mb-8`}>
        <h2 className={`${getTextStyle('sectionTitle', theme)} ${textClass} mb-6`}>
          🎨 Color Palette - {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
        </h2>
            
        <div className="grid md:grid-cols-2 gap-8">
          {/* Theme-specific Colors */}
          <div>
            <h3 className={`${getTextStyle('cardTitle', theme)} ${textClass} mb-4`}>
              {theme === 'dark' ? 'Glass Morphism' : 'Solid Backgrounds'}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 ${tokens.colors.glass.cardPrimary} ${tokens.colors.glass.borderLight} border rounded`}></div>
                <span className={`${textSecondaryClass} font-mono text-xs`}>
                  {theme === 'dark' ? 'bg-white/15' : 'bg-white/95'} - Card Primary
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 ${tokens.colors.glass.cardSecondary} ${tokens.colors.glass.borderLight} border rounded`}></div>
                <span className={`${textSecondaryClass} font-mono text-xs`}>
                  {theme === 'dark' ? 'bg-white/10' : 'bg-gray-50/90'} - Card Secondary
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 ${tokens.colors.glass.cardSolid} ${tokens.colors.glass.borderMedium} border rounded`}></div>
                <span className={`${textSecondaryClass} font-mono text-xs`}>
                  {theme === 'dark' ? 'bg-white/90' : 'bg-white'} - Form Fields
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 ${tokens.colors.glass.cardSidebar} ${tokens.colors.glass.borderLight} border rounded`}></div>
                <span className={`${textSecondaryClass} font-mono text-xs`}>
                  {theme === 'dark' ? 'bg-white/20' : 'bg-gray-100/80'} - Sidebar
                </span>
              </div>
            </div>
          </div>

          {/* Text Colors */}
          <div>
            <h3 className={`${getTextStyle('cardTitle', theme)} ${textClass} mb-4`}>Text Colors</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <span className={tokens.colors.text.onGlass}>Primary Text</span>
                <span className={`${textMutedClass} font-mono text-xs`}>
                  {theme === 'dark' ? 'text-white' : 'text-gray-900'}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className={tokens.colors.text.onGlassSecondary}>Secondary Text</span>
                <span className={`${textMutedClass} font-mono text-xs`}>
                  {theme === 'dark' ? 'text-white/90' : 'text-gray-700'}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className={tokens.colors.text.onGlassMuted}>Muted Text</span>
                <span className={`${textMutedClass} font-mono text-xs`}>
                  {theme === 'dark' ? 'text-white/70' : 'text-gray-500'}
                </span>
              </div>
              <div className={`${tokens.colors.glass.cardSolid} px-3 py-1 rounded ${tokens.colors.glass.borderLight} border`}>
                <span className={tokens.colors.text.formInput}>Form Input Text</span>
                <span className={`${textMutedClass} font-mono text-xs ml-4`}>
                  {theme === 'dark' ? 'text-black' : 'text-gray-900'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Component Gallery */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        
        {/* Card Variants */}
        <div>
          <h3 className={`${getTextStyle('cardTitle', theme)} ${textClass} mb-4`}>
            🃏 Card Variants
          </h3>
          
          {/* Primary Card */}
          <div className={`${getCardStyle('primary', theme)} mb-4`}>
            <div className="text-center mb-4">
              <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <span className="text-2xl">📊</span>
              </div>
              <h4 className={`${getTextStyle('cardTitle', theme)} ${textClass}`}>Business Info</h4>
              <p className={`${getTextStyle('body', theme)} ${textSecondaryClass} mt-2`}>
                Demo Restaurant Ltd
              </p>
            </div>
            <div className={`${getTextStyle('bodySmall', theme)} ${textSecondaryClass} space-y-1`}>
              <p><strong>Type:</strong> Restaurant</p>
              <p><strong>License:</strong> AL123456</p>
              <p><strong>Phone:</strong> +64 9 123 4567</p>
            </div>
            <div className={`${textMutedClass} font-mono text-xs mt-2`}>
              getCardStyle('primary', '{theme}')
            </div>
          </div>
        </div>

        {/* Navigation Pills */}
        <div>
          <h3 className={`${getTextStyle('cardTitle', theme)} ${textClass} mb-4`}>
            🧭 Navigation
          </h3>
          
          <div className={`flex ${theme === 'dark' ? 'bg-black/70' : 'bg-gray-200'} ${theme === 'dark' ? 'backdrop-blur-sm' : ''} rounded-full p-1 space-x-1 border ${tokens.colors.glass.borderLight}`}>
            {navigation.map((item, index) => (
              <div
                key={item.name}
                className={getNavPillStyle(index === 0, theme)}
              >
                {item.name}
              </div>
            ))}
          </div>
          <div className={`${textMutedClass} font-mono text-xs mt-2`}>
            getNavPillStyle(isActive, '{theme}')
          </div>
        </div>

        {/* Form Elements */}
        <div>
          <h3 className={`${getTextStyle('cardTitle', theme)} ${textClass} mb-4`}>
            📝 Form Elements
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className={`block ${getTextStyle('label', theme)} ${textClass} mb-2`}>Business Name</label>
              <input 
                type="text" 
                defaultValue="Demo Restaurant Ltd"
                className={getFormFieldStyle('input', theme)}
              />
            </div>
            
            <div>
              <label className={`block ${getTextStyle('label', theme)} ${textClass} mb-2`}>Business Type</label>
              <select className={getFormFieldStyle('select', theme)}>
                <option>Restaurant</option>
                <option>Café</option>
                <option>Hotel</option>
              </select>
            </div>
          </div>
          
          <div className={`${textMutedClass} font-mono text-xs mt-4`}>
            getFormFieldStyle('input', '{theme}')
          </div>
        </div>
      </div>
    </>
  )
}

export default function MoodBoardPage() {
  return (
    <ThemeProvider defaultTheme="dark">
      <MoodBoardContent />
    </ThemeProvider>
  )
}
