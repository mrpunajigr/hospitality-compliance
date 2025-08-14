'use client'

import { useState, useEffect } from 'react'
import { ThemeProvider, useTheme } from '@/lib/theme-context'
import { getCardStyle, getTextStyle, DesignTokens } from '@/lib/design-system'
import { getVersionDisplay } from '@/lib/version'
import { useDevAuth, withDevAuth } from '@/lib/dev-auth-context'
import BackgroundSelector from '@/app/components/BackgroundSelector'
import AssetUploadModal from '@/app/components/AssetUploadModal'
import AssetManagerToggle from '@/app/components/AssetManagerToggle'
import ControlPanel from '@/app/components/mood-board/ControlPanel'
import ComponentPreviewer from '@/app/components/mood-board/ComponentPreviewer'
import { TypographyCombination, typographyCombinations } from '@/app/components/mood-board/TypographyTester'
import { ColorPalette, colorPalettes } from '@/app/components/mood-board/ColorPaletteTester'
import { OverlaySettings } from '@/app/components/mood-board/AdjustmentControls'

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
  const { devUser, logAccess } = useDevAuth()
  const [viewMode, setViewMode] = useState<'enhanced' | 'split' | 'unified'>('enhanced')
  const [currentBackground, setCurrentBackground] = useState<string>('/chef-workspace1jpg.jpg')
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false)
  const [showAssetUpload, setShowAssetUpload] = useState(false)
  const [uploadType, setUploadType] = useState<'background' | 'logo'>('background')
  
  // Enhanced mode state
  const [selectedTypography, setSelectedTypography] = useState<TypographyCombination>(typographyCombinations[0])
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette>(colorPalettes[0])
  const [overlaySettings, setOverlaySettings] = useState<OverlaySettings>({
    opacity: 0.8,
    blur: 0,
    contrast: 1,
    brightness: 1
  })
  const [controlPanelCollapsed, setControlPanelCollapsed] = useState(false)
  const [previewMode, setPreviewMode] = useState<'full' | 'component' | 'layout' | 'mobile'>('full')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Log mood board access
    if (devUser) {
      logAccess('MOOD_BOARD_ACCESSED', 'enhanced-mode')
    }
  }, [devUser, logAccess])

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

  // Legacy component showcase data for split/unified modes
  const legacyShowcaseComponents = [
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

  // Enhanced mode rendering
  if (viewMode === 'enhanced') {
    const backgroundStyle = {
      backgroundImage: `url('${currentBackground}')`,
      filter: `brightness(${overlaySettings.brightness}) contrast(${overlaySettings.contrast}) blur(${overlaySettings.blur}px)`,
      opacity: overlaySettings.opacity
    }

    return (
      <div className="min-h-screen relative">
        {/* Background */}
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-300"
          style={backgroundStyle}
        />
        <div className="fixed inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/50" />

        {/* Main Content Area */}
        <div className="relative z-10 min-h-screen">
          {/* Header - Exact project style */}
          <div className="relative z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-24">
                
                {/* Logo & Title - DEV Enhanced */}
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center overflow-hidden">
                    <span className="text-white font-bold text-xl">🎨</span>
                  </div>
                  <div>
                    <span className={`${getTextStyle('pageTitle')} text-white`}>Full Page Preview Sandbox</span>
                    <p className={`${getTextStyle('version')} ${DesignTokens.colors.text.onGlassSecondary}`}>
                      DEV: {devUser?.username} • {isClient ? getVersionDisplay('dev') : 'Loading...'}
                    </p>
                  </div>
                </div>

                {/* Typography Control Pills - Right Aligned */}
                <div className="flex items-center space-x-4">
                  
                  {/* Typography Selector */}
                  <div className="flex items-center space-x-2">
                    <span className="text-white/80 text-sm font-medium">Typography:</span>
                    <div className="flex bg-black/70 backdrop-blur-sm rounded-full p-1 space-x-1 border border-white/40 shadow-lg">
                      {typographyCombinations.map((combination) => (
                        <button
                          key={combination.name}
                          onClick={() => {
                            setSelectedTypography(combination)
                            logAccess('TYPOGRAPHY_CHANGED', combination.name)
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                            selectedTypography.name === combination.name
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'text-white/80 hover:text-white hover:bg-white/25'
                          }`}
                        >
                          {combination.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Palette Selector */}
                  <div className="flex items-center space-x-2">
                    <span className="text-white/80 text-sm font-medium">Colors:</span>
                    <div className="flex bg-black/70 backdrop-blur-sm rounded-full p-1 space-x-1 border border-white/40 shadow-lg">
                      {colorPalettes.map((palette) => (
                        <button
                          key={palette.name}
                          onClick={() => {
                            setSelectedPalette(palette)
                            logAccess('PALETTE_CHANGED', palette.name)
                          }}
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                            selectedPalette.name === palette.name
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'text-white/80 hover:text-white hover:bg-white/25'
                          }`}
                        >
                          <div className="flex space-x-1">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: palette.primary }}
                            />
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: palette.success }}
                            />
                          </div>
                          <span>{palette.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Main content - Standard project pattern */}
          <main className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Full Page Layout Preview - Dummy Test Sandbox */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Left Navigation Sidebar */}
                <div className="lg:col-span-1">
                  <div className={getCardStyle('secondary')}>
                    <div className="p-6">
                      <h3 
                        className={`text-lg font-semibold text-white mb-4 ${selectedTypography.fontClasses.heading}`}
                        style={{ fontFamily: selectedTypography.heading.includes('serif') ? 'serif' : 'sans-serif' }}
                      >
                        Navigation
                      </h3>
                      
                      {/* Navigation Menu */}
                      <nav className="space-y-2">
                        {[
                          { name: 'Dashboard', icon: '📊', active: true },
                          { name: 'Upload', icon: '📤', active: false },
                          { name: 'Reports', icon: '📋', active: false },
                          { name: 'Settings', icon: '⚙️', active: false }
                        ].map((item) => (
                          <a
                            key={item.name}
                            href="#"
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${
                              item.active
                                ? 'text-white'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                            } ${selectedTypography.fontClasses.body}`}
                            style={{ 
                              backgroundColor: item.active ? selectedPalette.primary : 'transparent',
                              fontFamily: selectedTypography.body.includes('serif') ? 'serif' : 'sans-serif'
                            }}
                          >
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.name}</span>
                          </a>
                        ))}
                      </nav>

                      {/* User Info Section */}
                      <div className="mt-8 pt-6 border-t border-white/20">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: selectedPalette.primary }}>
                            <span className="text-white text-sm font-bold">JR</span>
                          </div>
                          <div>
                            <div 
                              className={`text-white text-sm font-medium ${selectedTypography.fontClasses.heading}`}
                              style={{ fontFamily: selectedTypography.heading.includes('serif') ? 'serif' : 'sans-serif' }}
                            >
                              John Restaurant
                            </div>
                            <div 
                              className={`text-white/60 text-xs ${selectedTypography.fontClasses.body}`}
                              style={{ fontFamily: selectedTypography.body.includes('serif') ? 'serif' : 'sans-serif' }}
                            >
                              Restaurant Manager
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2">
                  
                  {/* Page Header */}
                  <div className="mb-6">
                    <h1 
                      className={`text-3xl font-bold text-white drop-shadow-lg mb-2 ${selectedTypography.fontClasses.heading}`}
                      style={{ fontFamily: selectedTypography.heading.includes('serif') ? 'serif' : 'sans-serif' }}
                    >
                      Dashboard Overview
                    </h1>
                    <p 
                      className={`text-white/90 drop-shadow-md ${selectedTypography.fontClasses.body}`}
                      style={{ fontFamily: selectedTypography.body.includes('serif') ? 'serif' : 'sans-serif' }}
                    >
                      Monitor your compliance metrics and delivery performance
                    </p>
                  </div>

                  {/* Metrics Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {[
                      { title: 'Compliance Rate', value: '94%', icon: '✅', status: 'success' },
                      { title: 'Active Violations', value: '3', icon: '⚠️', status: 'warning' },
                      { title: 'Deliveries Today', value: '47', icon: '🚚', status: 'primary' }
                    ].map((metric) => (
                      <div key={metric.title} className={getCardStyle('primary')}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-2xl">{metric.icon}</div>
                          <div 
                            className="text-2xl font-bold text-white"
                            style={{ 
                              color: metric.status === 'success' ? selectedPalette.success :
                                     metric.status === 'warning' ? selectedPalette.warning :
                                     selectedPalette.primary
                            }}
                          >
                            {metric.value}
                          </div>
                        </div>
                        <h3 
                          className={`text-white/90 text-sm font-medium ${selectedTypography.fontClasses.heading}`}
                          style={{ fontFamily: selectedTypography.heading.includes('serif') ? 'serif' : 'sans-serif' }}
                        >
                          {metric.title}
                        </h3>
                      </div>
                    ))}
                  </div>

                  {/* Data Table */}
                  <div className={getCardStyle('primary')}>
                    <div className="p-6">
                      <h2 
                        className={`text-xl font-semibold text-white mb-4 ${selectedTypography.fontClasses.heading}`}
                        style={{ fontFamily: selectedTypography.heading.includes('serif') ? 'serif' : 'sans-serif' }}
                      >
                        Recent Deliveries
                      </h2>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-white/20">
                              <th 
                                className={`text-left py-3 px-4 text-white/80 text-sm font-medium ${selectedTypography.fontClasses.heading}`}
                                style={{ fontFamily: selectedTypography.heading.includes('serif') ? 'serif' : 'sans-serif' }}
                              >
                                Supplier
                              </th>
                              <th 
                                className={`text-left py-3 px-4 text-white/80 text-sm font-medium ${selectedTypography.fontClasses.heading}`}
                                style={{ fontFamily: selectedTypography.heading.includes('serif') ? 'serif' : 'sans-serif' }}
                              >
                                Temperature
                              </th>
                              <th 
                                className={`text-left py-3 px-4 text-white/80 text-sm font-medium ${selectedTypography.fontClasses.heading}`}
                                style={{ fontFamily: selectedTypography.heading.includes('serif') ? 'serif' : 'sans-serif' }}
                              >
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { supplier: 'Metro Foods', temp: '2.1°C', status: 'compliant', statusColor: selectedPalette.success },
                              { supplier: 'Fresh Supplies', temp: '5.8°C', status: 'violation', statusColor: selectedPalette.error },
                              { supplier: 'Ocean Catch', temp: '1.9°C', status: 'compliant', statusColor: selectedPalette.success }
                            ].map((delivery, index) => (
                              <tr key={index} className="border-b border-white/10">
                                <td 
                                  className={`py-3 px-4 text-white ${selectedTypography.fontClasses.body}`}
                                  style={{ fontFamily: selectedTypography.body.includes('serif') ? 'serif' : 'sans-serif' }}
                                >
                                  {delivery.supplier}
                                </td>
                                <td 
                                  className={`py-3 px-4 text-white/80 ${selectedTypography.fontClasses.accent}`}
                                  style={{ fontFamily: selectedTypography.accent.includes('mono') ? 'monospace' : 'sans-serif' }}
                                >
                                  {delivery.temp}
                                </td>
                                <td className="py-3 px-4">
                                  <span 
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${selectedTypography.fontClasses.body}`}
                                    style={{ 
                                      backgroundColor: `${delivery.statusColor}20`,
                                      color: delivery.statusColor,
                                      fontFamily: selectedTypography.body.includes('serif') ? 'serif' : 'sans-serif'
                                    }}
                                  >
                                    {delivery.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar - Quick Actions */}
                <div className="lg:col-span-1">
                  <div className="space-y-6">
                    
                    {/* Quick Actions */}
                    <div className={getCardStyle('form')}>
                      <div className="p-6">
                        <h3 
                          className={`text-lg font-semibold text-gray-900 mb-4 ${selectedTypography.fontClasses.heading}`}
                          style={{ fontFamily: selectedTypography.heading.includes('serif') ? 'serif' : 'sans-serif' }}
                        >
                          Quick Actions
                        </h3>
                        
                        <div className="space-y-3">
                          <button 
                            className={`w-full px-4 py-3 rounded-xl text-white font-medium transition-all hover:scale-105 ${selectedTypography.fontClasses.body}`}
                            style={{ 
                              backgroundColor: selectedPalette.primary,
                              fontFamily: selectedTypography.body.includes('serif') ? 'serif' : 'sans-serif'
                            }}
                          >
                            📤 Upload Delivery
                          </button>
                          <button 
                            className={`w-full px-4 py-3 rounded-xl text-white font-medium transition-all hover:scale-105 ${selectedTypography.fontClasses.body}`}
                            style={{ 
                              backgroundColor: selectedPalette.success,
                              fontFamily: selectedTypography.body.includes('serif') ? 'serif' : 'sans-serif'
                            }}
                          >
                            📋 View Reports
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Alerts */}
                    <div className={getCardStyle('secondary')}>
                      <div className="p-6">
                        <h3 
                          className={`text-lg font-semibold text-white mb-4 ${selectedTypography.fontClasses.heading}`}
                          style={{ fontFamily: selectedTypography.heading.includes('serif') ? 'serif' : 'sans-serif' }}
                        >
                          Recent Alerts
                        </h3>
                        
                        <div className="space-y-3">
                          <div 
                            className="p-3 rounded-xl border-l-4"
                            style={{ 
                              backgroundColor: `${selectedPalette.warning}20`,
                              borderLeftColor: selectedPalette.warning 
                            }}
                          >
                            <div 
                              className={`font-medium text-sm text-white ${selectedTypography.fontClasses.heading}`}
                              style={{ fontFamily: selectedTypography.heading.includes('serif') ? 'serif' : 'sans-serif' }}
                            >
                              Temperature Alert
                            </div>
                            <p 
                              className={`text-white/80 text-xs mt-1 ${selectedTypography.fontClasses.body}`}
                              style={{ fontFamily: selectedTypography.body.includes('serif') ? 'serif' : 'sans-serif' }}
                            >
                              Fresh Supplies delivery exceeded 5°C
                            </p>
                          </div>
                          
                          <div 
                            className="p-3 rounded-xl border-l-4"
                            style={{ 
                              backgroundColor: `${selectedPalette.success}20`,
                              borderLeftColor: selectedPalette.success 
                            }}
                          >
                            <div 
                              className={`font-medium text-sm text-white ${selectedTypography.fontClasses.heading}`}
                              style={{ fontFamily: selectedTypography.heading.includes('serif') ? 'serif' : 'sans-serif' }}
                            >
                              Compliance Achieved
                            </div>
                            <p 
                              className={`text-white/80 text-xs mt-1 ${selectedTypography.fontClasses.body}`}
                              style={{ fontFamily: selectedTypography.body.includes('serif') ? 'serif' : 'sans-serif' }}
                            >
                              94% weekly compliance rate reached
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Form Example */}
                    <div className={getCardStyle('form')}>
                      <div className="p-6">
                        <h3 
                          className={`text-lg font-semibold text-gray-900 mb-4 ${selectedTypography.fontClasses.heading}`}
                          style={{ fontFamily: selectedTypography.heading.includes('serif') ? 'serif' : 'sans-serif' }}
                        >
                          Quick Upload
                        </h3>
                        
                        <div className="space-y-3">
                          <input 
                            type="file" 
                            className={`w-full px-3 py-2 bg-white/30 border border-white/30 rounded-xl text-gray-900 text-sm backdrop-blur-sm focus:outline-none focus:ring-2 ${selectedTypography.fontClasses.body}`}
                            style={{ 
                              fontFamily: selectedTypography.body.includes('serif') ? 'serif' : 'sans-serif',
                              '--tw-ring-color': selectedPalette.primary
                            } as any}
                          />
                          <select 
                            className={`w-full px-3 py-2 bg-white/30 border border-white/30 rounded-xl text-gray-900 text-sm backdrop-blur-sm focus:outline-none focus:ring-2 ${selectedTypography.fontClasses.body}`}
                            style={{ 
                              fontFamily: selectedTypography.body.includes('serif') ? 'serif' : 'sans-serif',
                              '--tw-ring-color': selectedPalette.primary
                            } as any}
                          >
                            <option>Select Supplier</option>
                            <option>Metro Foods</option>
                            <option>Fresh Supplies</option>
                          </select>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Footer Section */}
              <div className="mt-12 pt-6 border-t border-white/20">
                <div className="flex items-center justify-between">
                  <div 
                    className={`text-white/60 text-sm ${selectedTypography.fontClasses.accent}`}
                    style={{ fontFamily: selectedTypography.accent.includes('mono') ? 'monospace' : 'sans-serif' }}
                  >
                    Current Theme: {selectedTypography.name} + {selectedPalette.name}
                  </div>
                  <div 
                    className={`text-white/60 text-sm ${selectedTypography.fontClasses.accent}`}
                    style={{ fontFamily: selectedTypography.accent.includes('mono') ? 'monospace' : 'sans-serif' }}
                  >
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Sidebar Control Panel */}
        <div className="fixed top-16 right-4 z-50">
          <ControlPanel
            currentBackground={currentBackground}
            onBackgroundSelectorOpen={() => setShowBackgroundSelector(true)}
            onAssetManagerOpen={() => setShowAssetUpload(true)}
            selectedTypography={selectedTypography}
            onTypographyChange={setSelectedTypography}
            selectedPalette={selectedPalette}
            onPaletteChange={setSelectedPalette}
            overlaySettings={overlaySettings}
            onOverlaySettingsChange={setOverlaySettings}
            collapsed={controlPanelCollapsed}
            onToggleCollapse={() => setControlPanelCollapsed(!controlPanelCollapsed)}
          />
        </div>

        {/* Component Previewer (Overlays) */}
        <ComponentPreviewer
          selectedPalette={selectedPalette}
          selectedTypography={selectedTypography}
          collapsed={true}
        />
      </div>
    )
  }

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
                {legacyShowcaseComponents.map((item, index) => (
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
                {legacyShowcaseComponents.map((item, index) => (
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
            <div className="w-px h-4 bg-white/20"></div>
            <button
              onClick={() => setViewMode('enhanced')}
              className="text-white/70 hover:text-white text-sm transition-colors"
            >
              Enhanced Mode
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
            {legacyShowcaseComponents.map((item, index) => (
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
          <div className="w-px h-4 bg-white/20"></div>
          <button
            onClick={() => setViewMode('enhanced')}
            className="text-white/70 hover:text-white text-sm transition-colors"
          >
            Enhanced Mode
          </button>
        </div>
      </div>
    </div>
  )
}

// Protected mood board component - DEV authentication required
function MoodBoardPageContent() {
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
        {/* DEV Portal Header */}
        <div className="bg-orange-600 text-white text-center py-2 text-sm font-medium relative z-50">
          🎨 DEV PORTAL - ENHANCED MOOD BOARD & DESIGN SYSTEM TESTING - SECURE ACCESS AUTHENTICATED 🎨
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
            moodBoardMode={true}
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

// Export with DEV authentication protection
export default withDevAuth(MoodBoardPageContent, { requiredRole: 'DEV' })