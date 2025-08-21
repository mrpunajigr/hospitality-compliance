'use client'

import { useState } from 'react'

export interface TypographyCombination {
  name: string
  heading: string
  body: string
  accent: string
  fontClasses: {
    heading: string
    body: string
    accent: string
  }
}

export const typographyCombinations: TypographyCombination[] = [
  {
    name: 'Current System',
    heading: 'Lora (serif)',
    body: 'Source Sans Pro (sans-serif)',
    accent: 'Inter (sans-serif)',
    fontClasses: {
      heading: 'font-serif',
      body: 'font-sans',
      accent: 'font-sans'
    }
  },
  {
    name: 'Modern Clean',
    heading: 'Inter (sans-serif)',
    body: 'Inter (sans-serif)',
    accent: 'JetBrains Mono (monospace)',
    fontClasses: {
      heading: 'font-sans',
      body: 'font-sans',
      accent: 'font-mono'
    }
  },
  {
    name: 'Professional',
    heading: 'Playfair Display (serif)',
    body: 'Source Sans Pro (sans-serif)',
    accent: 'Inter (sans-serif)',
    fontClasses: {
      heading: 'font-serif',
      body: 'font-sans',
      accent: 'font-sans'
    }
  },
  {
    name: 'Friendly',
    heading: 'Nunito Sans (sans-serif)',
    body: 'Nunito Sans (sans-serif)',
    accent: 'Space Mono (monospace)',
    fontClasses: {
      heading: 'font-sans',
      body: 'font-sans',
      accent: 'font-mono'
    }
  }
]

interface TypographyTesterProps {
  selectedCombination: TypographyCombination
  onCombinationChange: (combination: TypographyCombination) => void
  collapsed: boolean
}

export default function TypographyTester({ 
  selectedCombination, 
  onCombinationChange, 
  collapsed 
}: TypographyTesterProps) {
  if (collapsed) {
    return (
      <div className="mb-4">
        <h3 className="text-white text-sm font-medium mb-2">📝 Typography</h3>
        <div className="text-white/70 text-xs">
          {selectedCombination.name}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <h3 className="text-white text-sm font-medium mb-3">📝 Typography Combinations</h3>
      
      <div className="space-y-2 mb-4">
        {typographyCombinations.map((combination, index) => (
          <button
            key={index}
            onClick={() => onCombinationChange(combination)}
            className={`w-full text-left p-3 rounded-xl border transition-all ${
              selectedCombination.name === combination.name
                ? 'bg-white/20 border-white/40 text-white'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="font-medium text-sm mb-1">{combination.name}</div>
            <div className="text-xs space-y-1">
              <div>H: {combination.heading}</div>
              <div>B: {combination.body}</div>
              <div>A: {combination.accent}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Typography Preview */}
      <div className="bg-black/20 border border-white/20 rounded-xl p-4">
        <div className="text-white/70 text-xs mb-3">Live Preview:</div>
        <div 
          className={`space-y-3 ${selectedCombination.fontClasses.heading}`}
          style={{ fontFamily: selectedCombination.heading.includes('serif') ? 'serif' : 'sans-serif' }}
        >
          <h1 className="text-2xl font-bold text-white">
            Compliance Dashboard
          </h1>
          <h2 className="text-lg font-semibold text-white/90">
            Recent Deliveries
          </h2>
          <p 
            className={`text-white/80 ${selectedCombination.fontClasses.body}`}
            style={{ fontFamily: selectedCombination.body.includes('serif') ? 'serif' : 'sans-serif' }}
          >
            Your delivery compliance rate this week is 94%. Temperature violations detected in 3 deliveries from Metro Foods.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors">
            Upload New Docket
          </button>
          <div 
            className={`text-white/60 text-sm ${selectedCombination.fontClasses.accent}`}
            style={{ fontFamily: selectedCombination.accent.includes('mono') ? 'monospace' : 'sans-serif' }}
          >
            Last updated 2 minutes ago
          </div>
        </div>
      </div>
    </div>
  )
}