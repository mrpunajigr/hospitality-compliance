'use client'

import { useState, useRef, useEffect } from 'react'
import { getCardStyle } from '@/lib/design-system'
import { ColorPalette } from './ColorPaletteTester'
import { TypographyCombination } from './TypographyTester'

interface ComponentPosition {
  x: number
  y: number
}

interface PreviewComponent {
  id: string
  name: string
  enabled: boolean
  position: ComponentPosition
  component: (palette: ColorPalette, typography: TypographyCombination) => JSX.Element
}

interface ComponentPreviewerProps {
  selectedPalette: ColorPalette
  selectedTypography: TypographyCombination
  collapsed: boolean
}

export default function ComponentPreviewer({ 
  selectedPalette, 
  selectedTypography, 
  collapsed 
}: ComponentPreviewerProps) {
  const [components, setComponents] = useState<PreviewComponent[]>([
    {
      id: 'compliance-card',
      name: 'Compliance Card',
      enabled: true,
      position: { x: 50, y: 100 },
      component: (palette, typography) => (
        <div className={`${getCardStyle('primary')} max-w-sm`}>
          <div className="flex items-center justify-between mb-3">
            <h3 
              className={`text-lg font-bold text-white ${typography.fontClasses.heading}`}
              style={{ fontFamily: typography.heading.includes('serif') ? 'serif' : 'sans-serif' }}
            >
              Delivery Compliance
            </h3>
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: palette.success }}
            />
          </div>
          <p 
            className={`text-white/80 mb-3 ${typography.fontClasses.body}`}
            style={{ fontFamily: typography.body.includes('serif') ? 'serif' : 'sans-serif' }}
          >
            Temperature: 2°C
          </p>
          <div 
            className="px-3 py-1 rounded-full text-white text-xs font-medium inline-block"
            style={{ backgroundColor: palette.success }}
          >
            ✓ Passed
          </div>
        </div>
      )
    },
    {
      id: 'upload-button',
      name: 'Upload Button',
      enabled: true,
      position: { x: 400, y: 150 },
      component: (palette, typography) => (
        <button 
          className={`px-6 py-3 rounded-xl text-white font-medium transition-all hover:scale-105 shadow-lg ${typography.fontClasses.body}`}
          style={{ 
            backgroundColor: palette.primary,
            fontFamily: typography.body.includes('serif') ? 'serif' : 'sans-serif'
          }}
        >
          📸 Upload Docket
        </button>
      )
    },
    {
      id: 'alert-banner',
      name: 'Alert Banner',
      enabled: true,
      position: { x: 100, y: 350 },
      component: (palette, typography) => (
        <div 
          className="p-4 rounded-xl border-l-4 text-white max-w-md"
          style={{ 
            backgroundColor: `${palette.warning}20`,
            borderLeftColor: palette.warning 
          }}
        >
          <div 
            className={`font-medium mb-1 ${typography.fontClasses.heading}`}
            style={{ fontFamily: typography.heading.includes('serif') ? 'serif' : 'sans-serif' }}
          >
            Temperature Alert
          </div>
          <div 
            className={`text-sm opacity-90 ${typography.fontClasses.body}`}
            style={{ fontFamily: typography.body.includes('serif') ? 'serif' : 'sans-serif' }}
          >
            Delivery temperature exceeded safe limits
          </div>
        </div>
      )
    },
    {
      id: 'dashboard-stats',
      name: 'Dashboard Stats',
      enabled: true,
      position: { x: 450, y: 300 },
      component: (palette, typography) => (
        <div className={`${getCardStyle('secondary')} text-center`}>
          <div 
            className={`text-3xl font-bold text-white mb-1 ${typography.fontClasses.heading}`}
            style={{ fontFamily: typography.heading.includes('serif') ? 'serif' : 'sans-serif' }}
          >
            94%
          </div>
          <div 
            className={`text-white/80 text-sm ${typography.fontClasses.body}`}
            style={{ fontFamily: typography.body.includes('serif') ? 'serif' : 'sans-serif' }}
          >
            Compliance Rate
          </div>
          <div className="flex items-center justify-center mt-2">
            <div 
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: palette.success }}
            />
            <span 
              className={`text-white/60 text-xs ${typography.fontClasses.accent}`}
              style={{ fontFamily: typography.accent.includes('mono') ? 'monospace' : 'sans-serif' }}
            >
              ↗ +3% this week
            </span>
          </div>
        </div>
      )
    }
  ])

  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const toggleComponent = (id: string) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, enabled: !comp.enabled } : comp
    ))
  }

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    const component = components.find(c => c.id === id)
    if (!component) return

    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setDragging(id)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const newX = e.clientX - containerRect.left - dragOffset.x
    const newY = e.clientY - containerRect.top - dragOffset.y

    setComponents(prev => prev.map(comp =>
      comp.id === dragging 
        ? { ...comp, position: { x: Math.max(0, newX), y: Math.max(0, newY) } }
        : comp
    ))
  }

  const handleMouseUp = () => {
    setDragging(null)
    setDragOffset({ x: 0, y: 0 })
  }

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove as any)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as any)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [dragging, dragOffset])

  const enabledComponents = components.filter(c => c.enabled)

  if (collapsed) {
    return (
      <div className="mb-4">
        <h3 className="text-white text-sm font-medium mb-2">🧩 Components</h3>
        <div className="text-white/70 text-xs">
          {enabledComponents.length} active overlays
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Control Panel */}
      <div className="mb-6">
        <h3 className="text-white text-sm font-medium mb-3">🧩 Component Overlays</h3>
        
        <div className="bg-black/20 border border-white/20 rounded-xl p-4">
          <div className="text-white/70 text-xs mb-3">Click components to toggle, drag to reposition:</div>
          <div className="space-y-2">
            {components.map((component) => (
              <div
                key={component.id}
                className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={component.enabled}
                    onChange={() => toggleComponent(component.id)}
                    className="mr-3 w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-white text-sm">{component.name}</span>
                </div>
                <div className="text-white/60 text-xs">
                  {Math.round(component.position.x)}, {Math.round(component.position.y)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="text-white/60 text-xs mb-2">Quick Actions:</div>
            <div className="flex space-x-2">
              <button
                onClick={() => setComponents(prev => prev.map(c => ({ ...c, enabled: true })))}
                className="text-white/60 hover:text-white text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
              >
                Enable All
              </button>
              <button
                onClick={() => setComponents(prev => prev.map(c => ({ ...c, enabled: false })))}
                className="text-white/60 hover:text-white text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
              >
                Hide All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay Components */}
      <div 
        ref={containerRef}
        className="fixed inset-0 pointer-events-none z-40"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {enabledComponents.map((component) => (
          <div
            key={component.id}
            className={`absolute pointer-events-auto cursor-move transition-all ${
              dragging === component.id ? 'scale-105 z-50' : 'hover:scale-105'
            }`}
            style={{
              left: component.position.x,
              top: component.position.y,
              opacity: dragging === component.id ? 0.8 : 1
            }}
            onMouseDown={(e) => handleMouseDown(e, component.id)}
          >
            <div className="relative">
              {/* Drag Handle */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 hover:opacity-100 transition-opacity cursor-move z-10">
                ✥
              </div>
              
              {/* Component */}
              <div className="shadow-xl">
                {component.component(selectedPalette, selectedTypography)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}