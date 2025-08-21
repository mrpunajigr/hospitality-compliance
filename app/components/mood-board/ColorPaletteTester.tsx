'use client'

export interface ColorPalette {
  name: string
  primary: string
  success: string
  warning: string
  error: string
  background: string
  surface: string
  text: string
}

export const colorPalettes: ColorPalette[] = [
  {
    name: 'Current Compliance',
    primary: '#2563EB', // Blue
    success: '#10B981', // Green
    warning: '#F59E0B', // Orange
    error: '#EF4444',   // Red
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#111827'
  },
  {
    name: 'Warm Professional',
    primary: '#7C3AED', // Purple
    success: '#059669', // Emerald
    warning: '#D97706', // Amber
    error: '#DC2626',   // Red
    background: '#FEF7F0',
    surface: '#FFFFFF',
    text: '#1F2937'
  },
  {
    name: 'Cool Modern',
    primary: '#0891B2', // Cyan
    success: '#16A34A', // Green
    warning: '#CA8A04', // Yellow
    error: '#E11D48',   // Rose
    background: '#F1F5F9',
    surface: '#FFFFFF', 
    text: '#0F172A'
  },
  {
    name: 'Dark Mode',
    primary: '#60A5FA', // Light Blue
    success: '#34D399', // Light Green
    warning: '#FBBF24', // Light Orange
    error: '#F87171',   // Light Red
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB'
  }
]

interface ColorPaletteTesterProps {
  selectedPalette: ColorPalette
  onPaletteChange: (palette: ColorPalette) => void
  collapsed: boolean
}

export default function ColorPaletteTester({ 
  selectedPalette, 
  onPaletteChange, 
  collapsed 
}: ColorPaletteTesterProps) {
  if (collapsed) {
    return (
      <div className="mb-4">
        <h3 className="text-white text-sm font-medium mb-2">🎨 Color Palette</h3>
        <div className="flex space-x-1 mb-2">
          <div 
            className="w-4 h-4 rounded" 
            style={{ backgroundColor: selectedPalette.primary }}
          />
          <div 
            className="w-4 h-4 rounded" 
            style={{ backgroundColor: selectedPalette.success }}
          />
          <div 
            className="w-4 h-4 rounded" 
            style={{ backgroundColor: selectedPalette.warning }}
          />
          <div 
            className="w-4 h-4 rounded" 
            style={{ backgroundColor: selectedPalette.error }}
          />
        </div>
        <div className="text-white/70 text-xs">
          {selectedPalette.name}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <h3 className="text-white text-sm font-medium mb-3">🎨 Color Palettes</h3>
      
      <div className="space-y-2 mb-4">
        {colorPalettes.map((palette, index) => (
          <button
            key={index}
            onClick={() => onPaletteChange(palette)}
            className={`w-full text-left p-3 rounded-xl border transition-all ${
              selectedPalette.name === palette.name
                ? 'bg-white/20 border-white/40'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-medium">{palette.name}</span>
            </div>
            <div className="flex space-x-1">
              <div 
                className="w-6 h-6 rounded border border-white/20" 
                style={{ backgroundColor: palette.primary }}
                title="Primary"
              />
              <div 
                className="w-6 h-6 rounded border border-white/20" 
                style={{ backgroundColor: palette.success }}
                title="Success"
              />
              <div 
                className="w-6 h-6 rounded border border-white/20" 
                style={{ backgroundColor: palette.warning }}
                title="Warning"
              />
              <div 
                className="w-6 h-6 rounded border border-white/20" 
                style={{ backgroundColor: palette.error }}
                title="Error"
              />
            </div>
          </button>
        ))}
      </div>

      {/* Color Components Preview */}
      <div className="bg-black/20 border border-white/20 rounded-xl p-4">
        <div className="text-white/70 text-xs mb-3">Component Preview:</div>
        <div className="space-y-3">
          
          {/* Buttons */}
          <div className="flex flex-wrap gap-2">
            <button 
              className="px-4 py-2 rounded-xl text-white text-sm font-medium transition-colors"
              style={{ backgroundColor: selectedPalette.primary }}
            >
              Primary Button
            </button>
            <button 
              className="px-4 py-2 rounded-xl text-white text-sm font-medium transition-colors"
              style={{ backgroundColor: selectedPalette.success }}
            >
              Success
            </button>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <div 
              className="px-3 py-1 rounded-full text-white text-xs font-medium"
              style={{ backgroundColor: selectedPalette.success }}
            >
              ✓ Compliant
            </div>
            <div 
              className="px-3 py-1 rounded-full text-white text-xs font-medium"
              style={{ backgroundColor: selectedPalette.warning }}
            >
              ⚠ Processing
            </div>
            <div 
              className="px-3 py-1 rounded-full text-white text-xs font-medium"
              style={{ backgroundColor: selectedPalette.error }}
            >
              ✗ Violation
            </div>
          </div>

          {/* Alert Banner */}
          <div 
            className="p-3 rounded-xl border-l-4 text-white text-sm"
            style={{ 
              backgroundColor: `${selectedPalette.warning}20`,
              borderLeftColor: selectedPalette.warning 
            }}
          >
            <div className="font-medium mb-1">Temperature Alert</div>
            <div className="text-sm opacity-90">Delivery temperature exceeded safe limits</div>
          </div>

          {/* Navigation Active State */}
          <div className="bg-black/70 backdrop-blur-sm rounded-full p-1 flex space-x-1 border border-white/40">
            <div 
              className="px-4 py-2 rounded-full text-sm font-medium text-gray-900 backdrop-blur-sm shadow-sm"
              style={{ backgroundColor: selectedPalette.primary, color: 'white' }}
            >
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
      </div>
    </div>
  )
}