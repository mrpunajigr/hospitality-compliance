'use client'

export interface OverlaySettings {
  opacity: number
  blur: number
  contrast: number
  brightness: number
}

interface AdjustmentControlsProps {
  settings: OverlaySettings
  onSettingsChange: (settings: OverlaySettings) => void
  collapsed: boolean
}

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (value: number) => void
}

function Slider({ label, value, min, max, step, unit, onChange }: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-white text-xs font-medium">{label}:</span>
        <span className="text-white/70 text-xs">{value}{unit}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #60A5FA 0%, #60A5FA ${percentage}%, rgba(255,255,255,0.1) ${percentage}%, rgba(255,255,255,0.1) 100%)`
          }}
        />
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #60A5FA;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          .slider::-moz-range-thumb {
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #60A5FA;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
        `}</style>
      </div>
    </div>
  )
}

export default function AdjustmentControls({ 
  settings, 
  onSettingsChange, 
  collapsed 
}: AdjustmentControlsProps) {
  const updateSetting = (key: keyof OverlaySettings, value: number) => {
    onSettingsChange({
      ...settings,
      [key]: value
    })
  }

  const resetToDefaults = () => {
    onSettingsChange({
      opacity: 0.8,
      blur: 0,
      contrast: 1,
      brightness: 1
    })
  }

  if (collapsed) {
    return (
      <div className="mb-4">
        <h3 className="text-white text-sm font-medium mb-2">🔧 Adjustments</h3>
        <div className="text-white/70 text-xs space-y-1">
          <div>Opacity: {Math.round(settings.opacity * 100)}%</div>
          <div>Blur: {settings.blur}px</div>
          <div>Contrast: {Math.round(settings.contrast * 100)}%</div>
          <div>Brightness: {Math.round(settings.brightness * 100)}%</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white text-sm font-medium">🔧 Adjustments</h3>
        <button
          onClick={resetToDefaults}
          className="text-white/60 hover:text-white text-xs transition-colors"
        >
          Reset
        </button>
      </div>
      
      <div className="bg-black/20 border border-white/20 rounded-xl p-4">
        <Slider
          label="Opacity"
          value={settings.opacity}
          min={0}
          max={1}
          step={0.1}
          unit=""
          onChange={(value) => updateSetting('opacity', value)}
        />
        
        <Slider
          label="Blur"
          value={settings.blur}
          min={0}
          max={10}
          step={1}
          unit="px"
          onChange={(value) => updateSetting('blur', value)}
        />
        
        <Slider
          label="Contrast"
          value={settings.contrast}
          min={0.5}
          max={2}
          step={0.1}
          unit=""
          onChange={(value) => updateSetting('contrast', value)}
        />
        
        <Slider
          label="Brightness"
          value={settings.brightness}
          min={0.5}
          max={2}
          step={0.1}
          unit=""
          onChange={(value) => updateSetting('brightness', value)}
        />

        {/* Live Preview Indicator */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="text-white/60 text-xs mb-2">Live Preview Active</div>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-white/60 text-xs">Background adjustments applied in real-time</span>
          </div>
        </div>
      </div>
    </div>
  )
}