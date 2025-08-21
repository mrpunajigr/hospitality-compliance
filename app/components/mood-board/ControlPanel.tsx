'use client'

import { useState } from 'react'
import TypographyTester, { TypographyCombination, typographyCombinations } from './TypographyTester'
import ColorPaletteTester, { ColorPalette, colorPalettes } from './ColorPaletteTester'
import AdjustmentControls, { OverlaySettings } from './AdjustmentControls'
import ComponentPreviewer from './ComponentPreviewer'

interface ControlPanelProps {
  // Background
  currentBackground: string
  onBackgroundSelectorOpen: () => void
  onAssetManagerOpen: () => void
  
  // Typography
  selectedTypography: TypographyCombination
  onTypographyChange: (typography: TypographyCombination) => void
  
  // Colors
  selectedPalette: ColorPalette
  onPaletteChange: (palette: ColorPalette) => void
  
  // Adjustments
  overlaySettings: OverlaySettings
  onOverlaySettingsChange: (settings: OverlaySettings) => void
  
  // Panel state
  collapsed: boolean
  onToggleCollapse: () => void
}

export default function ControlPanel({
  currentBackground,
  onBackgroundSelectorOpen,
  onAssetManagerOpen,
  selectedTypography,
  onTypographyChange,
  selectedPalette,
  onPaletteChange,
  overlaySettings,
  onOverlaySettingsChange,
  collapsed,
  onToggleCollapse
}: ControlPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('background')

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const backgroundName = currentBackground.split('/').pop()?.replace('.jpg', '').replace('.png', '') || 'Default'

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="fixed top-20 right-4 z-50 bg-black/80 backdrop-blur-lg border border-white/20 rounded-full p-3 text-white hover:bg-white/10 transition-all"
        title={collapsed ? 'Expand Controls' : 'Collapse Controls'}
      >
        {collapsed ? '▶' : '◀'}
      </button>

      {/* Control Panel */}
      <div className={`fixed top-0 right-0 h-full bg-black/90 backdrop-blur-xl border-l border-white/20 transition-all duration-300 z-40 ${
        collapsed ? 'w-0 overflow-hidden' : 'w-80'
      }`}>
        <div className="p-6 h-full overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-white text-lg font-bold mb-2">🎨 Design Controls</h2>
            <p className="text-white/70 text-sm">Live mood board testing environment</p>
          </div>

          {/* Background Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('background')}
              className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
            >
              <div className="flex items-center">
                <span className="text-white text-sm font-medium">🖼️ Background</span>
              </div>
              <span className="text-white/60 text-sm">
                {expandedSection === 'background' ? '−' : '+'}
              </span>
            </button>
            
            {expandedSection === 'background' && (
              <div className="mt-3 bg-black/20 border border-white/20 rounded-xl p-4">
                <div className="text-white/70 text-xs mb-3">Current Background:</div>
                <div 
                  className="w-full h-20 bg-cover bg-center rounded-lg border border-white/20 mb-3"
                  style={{ backgroundImage: `url('${currentBackground}')` }}
                />
                <div className="text-white text-sm mb-3 truncate">{backgroundName}</div>
                <div className="flex space-x-2">
                  <button
                    onClick={onBackgroundSelectorOpen}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded-lg transition-colors"
                  >
                    Select Background
                  </button>
                  <button
                    onClick={onAssetManagerOpen}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded-lg transition-colors"
                  >
                    Upload New
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Typography Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('typography')}
              className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
            >
              <div className="flex items-center">
                <span className="text-white text-sm font-medium">📝 Typography</span>
              </div>
              <span className="text-white/60 text-sm">
                {expandedSection === 'typography' ? '−' : '+'}
              </span>
            </button>
            
            {expandedSection === 'typography' && (
              <div className="mt-3">
                <TypographyTester
                  selectedCombination={selectedTypography}
                  onCombinationChange={onTypographyChange}
                  collapsed={false}
                />
              </div>
            )}
          </div>

          {/* Color Palette Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('colors')}
              className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
            >
              <div className="flex items-center">
                <span className="text-white text-sm font-medium">🎨 Colors</span>
              </div>
              <span className="text-white/60 text-sm">
                {expandedSection === 'colors' ? '−' : '+'}
              </span>
            </button>
            
            {expandedSection === 'colors' && (
              <div className="mt-3">
                <ColorPaletteTester
                  selectedPalette={selectedPalette}
                  onPaletteChange={onPaletteChange}
                  collapsed={false}
                />
              </div>
            )}
          </div>

          {/* Components Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('components')}
              className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
            >
              <div className="flex items-center">
                <span className="text-white text-sm font-medium">🧩 Components</span>
              </div>
              <span className="text-white/60 text-sm">
                {expandedSection === 'components' ? '−' : '+'}
              </span>
            </button>
            
            {expandedSection === 'components' && (
              <div className="mt-3">
                <ComponentPreviewer
                  selectedPalette={selectedPalette}
                  selectedTypography={selectedTypography}
                  collapsed={false}
                />
              </div>
            )}
          </div>

          {/* Adjustments Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('adjustments')}
              className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
            >
              <div className="flex items-center">
                <span className="text-white text-sm font-medium">🔧 Adjustments</span>
              </div>
              <span className="text-white/60 text-sm">
                {expandedSection === 'adjustments' ? '−' : '+'}
              </span>
            </button>
            
            {expandedSection === 'adjustments' && (
              <div className="mt-3">
                <AdjustmentControls
                  settings={overlaySettings}
                  onSettingsChange={onOverlaySettingsChange}
                  collapsed={false}
                />
              </div>
            )}
          </div>

          {/* Export Section */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('export')}
              className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
            >
              <div className="flex items-center">
                <span className="text-white text-sm font-medium">📁 Export</span>
              </div>
              <span className="text-white/60 text-sm">
                {expandedSection === 'export' ? '−' : '+'}
              </span>
            </button>
            
            {expandedSection === 'export' && (
              <div className="mt-3 bg-black/20 border border-white/20 rounded-xl p-4">
                <div className="text-white/70 text-xs mb-3">Export Current Combination:</div>
                <div className="space-y-2">
                  <button className="w-full bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded-lg transition-colors text-left">
                    📄 Generate Style Guide
                  </button>
                  <button className="w-full bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded-lg transition-colors text-left">
                    🎨 Export CSS Variables
                  </button>
                  <button className="w-full bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded-lg transition-colors text-left">
                    ⚙️ Save as Preset
                  </button>
                  <button className="w-full bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded-lg transition-colors text-left">
                    🔗 Share Combination
                  </button>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="text-white/60 text-xs">
                    Current combination will be exported with selected background, typography, colors, and component positions.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status Footer */}
          <div className="mt-8 pt-4 border-t border-white/20">
            <div className="text-white/60 text-xs space-y-1">
              <div>🎨 Live Preview Active</div>
              <div>📱 iPad Air Optimized</div>
              <div>🔒 Development Only</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}