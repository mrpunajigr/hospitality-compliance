&apos;use client&apos;

import { DesignTokens, getCardStyle, getTextStyle, getFormFieldStyle, getNavPillStyle, ComponentPatterns, Theme, ThemeVariants, getThemeTokens } from &apos;@/lib/design-system&apos;
import { getVersionDisplay } from &apos;@/lib/version&apos;
import ThemeProvider, { useTheme } from &apos;@/lib/theme-context&apos;
import ThemeToggle from &apos;@/app/components/ThemeToggle&apos;
import AssetManagerToggle from &apos;@/app/components/AssetManagerToggle&apos;
import BackgroundSelector from &apos;@/app/components/BackgroundSelector&apos;
import AssetUploadModal from &apos;@/app/components/AssetUploadModal&apos;
import { useState } from &apos;react&apos;
import Link from &apos;next/link&apos;

interface BackgroundAsset {
  id: string
  name: string
  file_url: string
  category: string | null
  difficulty: &apos;easy&apos; | &apos;medium&apos; | &apos;hard&apos;
  alt_text: string | null
}

function MoodBoardContent() {
  const [viewMode, setViewMode] = useState<&apos;split&apos; | &apos;unified&apos;>(&apos;split&apos;)
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadType, setUploadType] = useState<&apos;background&apos; | &apos;logo&apos;>(&apos;background&apos;)
  const [selectedBackground, setSelectedBackground] = useState<BackgroundAsset>({
    id: &apos;default&apos;,
    name: &apos;Chef Workspace&apos;,
    file_url: &apos;/chef-workspace1jpg.jpg&apos;,
    category: &apos;kitchen&apos;,
    difficulty: &apos;medium&apos;,
    alt_text: &apos;Professional chef workspace with cooking equipment&apos;
  })
  const { theme, toggleTheme } = useTheme()
  
  const navigation = [
    { name: &apos;Style Guide&apos;, href: &apos;#style-guide&apos; },
    { name: &apos;Components&apos;, href: &apos;#components&apos; },
    { name: &apos;Forms&apos;, href: &apos;#forms&apos; },
    { name: &apos;Navigation&apos;, href: &apos;#navigation&apos; },
  ]

  const handleAssetAction = (action: string) => {
    switch (action) {
      case &apos;select-background&apos;:
        setShowBackgroundSelector(true)
        break
      case &apos;upload-background&apos;:
        setUploadType(&apos;background&apos;)
        setShowUploadModal(true)
        break
      case &apos;upload-logo&apos;:
        setUploadType(&apos;logo&apos;)
        setShowUploadModal(true)
        break
      case &apos;select-logo&apos;:
        // TODO: Implement logo selector
        console.log(&apos;Select logo modal&apos;)
        break
    }
  }

  const handleBackgroundChange = (background: BackgroundAsset) => {
    setSelectedBackground(background)
    setShowBackgroundSelector(false)
  }

  const handleUploadSuccess = (asset: any) => {
    // Refresh background selector if it was a background upload
    if (uploadType === &apos;background&apos;) {
      // The BackgroundSelector will automatically refresh when reopened
      console.log(&apos;Background uploaded successfully:&apos;, asset)
    }
    setShowUploadModal(false)
  }

  if (viewMode === &apos;split&apos;) {
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
  viewMode: &apos;split&apos; | &apos;unified&apos;,
  setViewMode: (mode: &apos;split&apos; | &apos;unified&apos;) => void,
  selectedBackground: BackgroundAsset,
  onAssetAction: (action: string) => void
}) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url(&apos;${selectedBackground.file_url}&apos;)`,
          backgroundPosition: &apos;50% 50%&apos;,
          backgroundAttachment: &apos;fixed&apos;,
          filter: &apos;brightness(0.9)&apos;
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/30" />

      {/* Controls */}
      <div className="relative z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
            <div>
              <h1 className={`${getTextStyle(&apos;pageTitle&apos;)} text-white drop-shadow-lg`}>
                🌗 Light & Dark Mode Comparison
              </h1>
              <p className={`${getTextStyle(&apos;body&apos;)} text-white/90 drop-shadow-md`}>
                Split Mode - Visual showcase on {selectedBackground.name}
              </p>
              <p className="text-blue-300 text-xs mt-1">
                Version: {getVersionDisplay(&apos;dev&apos;)}
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
              <h2 className={`${getTextStyle(&apos;sectionTitle&apos;)} text-white mb-2`}>
                🌙 Dark Mode
              </h2>
              <p className={`${getTextStyle(&apos;body&apos;)} text-white/80`}>
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
              <h2 className={`${getTextStyle(&apos;sectionTitle&apos;, &apos;light&apos;)} text-gray-900 mb-2`}>
                ☀️ Light Mode
              </h2>
              <p className={`${getTextStyle(&apos;body&apos;, &apos;light&apos;)} text-gray-700`}>
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
  viewMode: &apos;split&apos; | &apos;unified&apos;,
  setViewMode: (mode: &apos;split&apos; | &apos;unified&apos;) => void,
  selectedBackground: BackgroundAsset,
  onAssetAction: (action: string) => void
}) {
  const bgClass = theme === &apos;light&apos; ? &apos;bg-gradient-to-br from-gray-50 to-gray-100&apos; : &apos;&apos;
  
  return (
    <div className={`${ComponentPatterns.mainContainer} ${bgClass}`}>
      {/* Dynamic Background */}
      {theme === &apos;dark&apos; && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-no-repeat"
            style={{
              backgroundImage: `url(&apos;${selectedBackground.file_url}&apos;)`,
              backgroundPosition: &apos;50% 50%&apos;,
              backgroundAttachment: &apos;fixed&apos;,
              filter: &apos;brightness(0.9)&apos;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/30" />
        </>
      )}

      {/* Light mode background overlay */}
      {theme === &apos;light&apos; && selectedBackground.id !== &apos;default-light&apos; && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-no-repeat opacity-30"
            style={{
              backgroundImage: `url(&apos;${selectedBackground.file_url}&apos;)`,
              backgroundPosition: &apos;50% 50%&apos;,
              backgroundAttachment: &apos;fixed&apos;
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
                <h1 className={`${getTextStyle(&apos;pageTitle&apos;, theme)} ${theme === &apos;dark&apos; ? &apos;text-white drop-shadow-lg&apos; : &apos;text-gray-900&apos;}`}>
                  🎨 Design System Mood Board
                </h1>
                <p className={`${getTextStyle(&apos;body&apos;, theme)} ${theme === &apos;dark&apos; ? &apos;text-white/90 drop-shadow-md&apos; : &apos;text-gray-700&apos;}`}>
                  {theme === &apos;dark&apos; ? &apos;Dark Mode&apos; : &apos;Light Mode&apos;} on {selectedBackground.name}
                </p>
                <p className={`text-xs mt-1 ${theme === &apos;dark&apos; ? &apos;text-blue-300&apos; : &apos;text-blue-600&apos;}`}>
                  Version: {getVersionDisplay(&apos;dev&apos;)}
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
  viewMode: &apos;split&apos; | &apos;unified&apos;
  setViewMode: (mode: &apos;split&apos; | &apos;unified&apos;) => void 
}) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-white/90 text-xs font-medium">
        View:
      </span>
      
      <button
        onClick={() => setViewMode(viewMode === &apos;split&apos; ? &apos;unified&apos; : &apos;split&apos;)}
        className="relative inline-flex h-8 w-20 items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-white/20 border border-white/30"
        aria-label={`Switch to ${viewMode === &apos;split&apos; ? &apos;unified&apos; : &apos;split&apos;} mode`}
      >
        <div
          className={`absolute inset-1 flex h-6 w-9 items-center justify-center rounded-full shadow-sm transition-all duration-200 bg-gray-800 ${
            viewMode === &apos;split&apos;
              ? &apos;translate-x-0&apos;
              : &apos;translate-x-9&apos;
          }`}
        >
          {viewMode === &apos;split&apos; ? (
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
  const textClass = theme === &apos;dark&apos; ? &apos;text-white&apos; : &apos;text-gray-900&apos;
  const textSecondaryClass = theme === &apos;dark&apos; ? &apos;text-white/90&apos; : &apos;text-gray-700&apos;
  const textMutedClass = theme === &apos;dark&apos; ? &apos;text-white/70&apos; : &apos;text-gray-500&apos;
  
  return (
    <>
      {/* Design System Overview */}
      <div className={`${getCardStyle(&apos;form&apos;, theme)} mb-8`}>
        <h2 className={`${getTextStyle(&apos;sectionTitle&apos;, theme)} ${textClass} mb-4`}>
          🏗️ Design System Overview - {theme === &apos;dark&apos; ? &apos;Dark Mode&apos; : &apos;Light Mode&apos;}
        </h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <h3 className={`${getTextStyle(&apos;cardTitle&apos;, theme)} ${textClass} mb-2`}>Design Tokens</h3>
            <ul className={`${textSecondaryClass} space-y-1`}>
              <li>• Color System ({theme === &apos;dark&apos; ? &apos;glass morphism&apos; : &apos;solid backgrounds&apos;})</li>
              <li>• Typography Scale (4 levels)</li>
              <li>• Spacing System (consistent gaps)</li>
              <li>• Effects Library ({theme === &apos;dark&apos; ? &apos;blur, shadows&apos; : &apos;subtle shadows&apos;})</li>
            </ul>
          </div>
          <div>
            <h3 className={`${getTextStyle(&apos;cardTitle&apos;, theme)} ${textClass} mb-2`}>Utility Functions</h3>
            <ul className={`${textSecondaryClass} space-y-1`}>
              <li>• getCardStyle(variant, theme)</li>
              <li>• getTextStyle(type, theme)</li>
              <li>• getFormFieldStyle(type, theme)</li>
              <li>• getNavPillStyle(isActive, theme)</li>
            </ul>
          </div>
          <div>
            <h3 className={`${getTextStyle(&apos;cardTitle&apos;, theme)} ${textClass} mb-2`}>Component Patterns</h3>
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
      <div className={`${getCardStyle(&apos;primary&apos;, theme)} mb-8`}>
        <h2 className={`${getTextStyle(&apos;sectionTitle&apos;, theme)} ${textClass} mb-6`}>
          🎨 Color Palette - {theme === &apos;dark&apos; ? &apos;Dark Mode&apos; : &apos;Light Mode&apos;}
        </h2>
            
        <div className="grid md:grid-cols-2 gap-8">
          {/* Theme-specific Colors */}
          <div>
            <h3 className={`${getTextStyle(&apos;cardTitle&apos;, theme)} ${textClass} mb-4`}>
              {theme === &apos;dark&apos; ? &apos;Glass Morphism&apos; : &apos;Solid Backgrounds&apos;}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 ${tokens.colors.glass.cardPrimary} ${tokens.colors.glass.borderLight} border rounded`}></div>
                <span className={`${textSecondaryClass} font-mono text-xs`}>
                  {theme === &apos;dark&apos; ? &apos;bg-white/15&apos; : &apos;bg-white/95&apos;} - Card Primary
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 ${tokens.colors.glass.cardSecondary} ${tokens.colors.glass.borderLight} border rounded`}></div>
                <span className={`${textSecondaryClass} font-mono text-xs`}>
                  {theme === &apos;dark&apos; ? &apos;bg-white/10&apos; : &apos;bg-gray-50/90&apos;} - Card Secondary
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 ${tokens.colors.glass.cardSolid} ${tokens.colors.glass.borderMedium} border rounded`}></div>
                <span className={`${textSecondaryClass} font-mono text-xs`}>
                  {theme === &apos;dark&apos; ? &apos;bg-white/90&apos; : &apos;bg-white&apos;} - Form Fields
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 ${tokens.colors.glass.cardSidebar} ${tokens.colors.glass.borderLight} border rounded`}></div>
                <span className={`${textSecondaryClass} font-mono text-xs`}>
                  {theme === &apos;dark&apos; ? &apos;bg-white/20&apos; : &apos;bg-gray-100/80&apos;} - Sidebar
                </span>
              </div>
            </div>
          </div>

          {/* Text Colors */}
          <div>
            <h3 className={`${getTextStyle(&apos;cardTitle&apos;, theme)} ${textClass} mb-4`}>Text Colors</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <span className={tokens.colors.text.onGlass}>Primary Text</span>
                <span className={`${textMutedClass} font-mono text-xs`}>
                  {theme === &apos;dark&apos; ? &apos;text-white&apos; : &apos;text-gray-900&apos;}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className={tokens.colors.text.onGlassSecondary}>Secondary Text</span>
                <span className={`${textMutedClass} font-mono text-xs`}>
                  {theme === &apos;dark&apos; ? &apos;text-white/90&apos; : &apos;text-gray-700&apos;}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className={tokens.colors.text.onGlassMuted}>Muted Text</span>
                <span className={`${textMutedClass} font-mono text-xs`}>
                  {theme === &apos;dark&apos; ? &apos;text-white/70&apos; : &apos;text-gray-500&apos;}
                </span>
              </div>
              <div className={`${tokens.colors.glass.cardSolid} px-3 py-1 rounded ${tokens.colors.glass.borderLight} border`}>
                <span className={tokens.colors.text.formInput}>Form Input Text</span>
                <span className={`${textMutedClass} font-mono text-xs ml-4`}>
                  {theme === &apos;dark&apos; ? &apos;text-black&apos; : &apos;text-gray-900&apos;}
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
          <h3 className={`${getTextStyle(&apos;cardTitle&apos;, theme)} ${textClass} mb-4`}>
            🃏 Card Variants
          </h3>
          
          {/* Primary Card */}
          <div className={`${getCardStyle(&apos;primary&apos;, theme)} mb-4`}>
            <div className="text-center mb-4">
              <div className={`w-12 h-12 ${theme === &apos;dark&apos; ? &apos;bg-blue-500/20&apos; : &apos;bg-blue-100&apos;} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <span className="text-2xl">📊</span>
              </div>
              <h4 className={`${getTextStyle(&apos;cardTitle&apos;, theme)} ${textClass}`}>Business Info</h4>
              <p className={`${getTextStyle(&apos;body&apos;, theme)} ${textSecondaryClass} mt-2`}>
                Demo Restaurant Ltd
              </p>
            </div>
            <div className={`${getTextStyle(&apos;bodySmall&apos;, theme)} ${textSecondaryClass} space-y-1`}>
              <p><strong>Type:</strong> Restaurant</p>
              <p><strong>License:</strong> AL123456</p>
              <p><strong>Phone:</strong> +64 9 123 4567</p>
            </div>
            <div className={`${textMutedClass} font-mono text-xs mt-2`}>
              getCardStyle(&apos;primary&apos;, &apos;{theme}&apos;)
            </div>
          </div>
        </div>

        {/* Navigation Pills */}
        <div>
          <h3 className={`${getTextStyle(&apos;cardTitle&apos;, theme)} ${textClass} mb-4`}>
            🧭 Navigation
          </h3>
          
          <div className={`flex ${theme === &apos;dark&apos; ? &apos;bg-black/70&apos; : &apos;bg-gray-200&apos;} ${theme === &apos;dark&apos; ? &apos;backdrop-blur-sm&apos; : &apos;&apos;} rounded-full p-1 space-x-1 border ${tokens.colors.glass.borderLight}`}>
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
            getNavPillStyle(isActive, &apos;{theme}&apos;)
          </div>
        </div>

        {/* Form Elements */}
        <div>
          <h3 className={`${getTextStyle(&apos;cardTitle&apos;, theme)} ${textClass} mb-4`}>
            📝 Form Elements
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className={`block ${getTextStyle(&apos;label&apos;, theme)} ${textClass} mb-2`}>Business Name</label>
              <input 
                type="text" 
                defaultValue="Demo Restaurant Ltd"
                className={getFormFieldStyle(&apos;input&apos;, theme)}
              />
            </div>
            
            <div>
              <label className={`block ${getTextStyle(&apos;label&apos;, theme)} ${textClass} mb-2`}>Business Type</label>
              <select className={getFormFieldStyle(&apos;select&apos;, theme)}>
                <option>Restaurant</option>
                <option>Café</option>
                <option>Hotel</option>
              </select>
            </div>
          </div>
          
          <div className={`${textMutedClass} font-mono text-xs mt-4`}>
            getFormFieldStyle(&apos;input&apos;, &apos;{theme}&apos;)
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
