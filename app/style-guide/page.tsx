'use client'

import { redirect } from 'next/navigation'
import { useState } from 'react'

// SECURITY: This page is NEVER accessible in production
if (process.env.NODE_ENV === 'production') {
  redirect('/404')
}

export default function StyleGuidePage() {
  const [activeSection, setActiveSection] = useState('typography')
  const [searchTerm, setSearchTerm] = useState('')

  // Production check as backup
  if (process.env.NODE_ENV === 'production') {
    return <div>Page not found</div>
  }

  const sections = [
    { id: 'typography', name: 'Typography' },
    { id: 'colors', name: 'Color Palette' },
    { id: 'buttons', name: 'Buttons' },
    { id: 'cards', name: 'Cards & Containers' },
    { id: 'forms', name: 'Form Elements' },
    { id: 'navigation', name: 'Navigation' },
    { id: 'status', name: 'Status Indicators' },
    { id: 'layouts', name: 'Layout Patterns' }
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert(`Copied: ${text}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Landing Page Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3')",
          filter: 'brightness(0.4) blur(1px)'
        }}
      ></div>
      
      {/* Dark overlay for better readability */}
      <div className="fixed inset-0 bg-black/20 z-0"></div>
      {/* Development Only Header */}
      <div className="bg-red-600 text-white text-center py-2 text-sm font-medium relative z-50">
        🚨 DEVELOPMENT ONLY - NOT ACCESSIBLE IN PRODUCTION 🚨
      </div>

      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Design System Reference</h1>
              <p className="text-sm text-gray-600">Hospitality Compliance Platform</p>
            </div>
            
            {/* Search */}
            <div className="w-64">
              <input
                type="text"
                placeholder="Search components..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="flex gap-8">
          
          {/* Navigation Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg sticky top-24">
              <h2 className="text-xl font-semibold text-white mb-6">Sections</h2>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`block w-full text-left py-4 px-6 rounded-xl transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                  >
                    <div>
                      <h3 className="font-semibold text-lg">{section.name}</h3>
                      <p className="text-sm mt-1 opacity-90">
                        {section.id === 'typography' && 'Fonts and text styles'}
                        {section.id === 'colors' && 'Color palette system'}
                        {section.id === 'buttons' && 'Interactive elements'}
                        {section.id === 'cards' && 'Container patterns'}
                        {section.id === 'forms' && 'Input components'}
                        {section.id === 'navigation' && 'Navigation patterns'}
                        {section.id === 'status' && 'Loading and badges'}
                        {section.id === 'layouts' && 'Page structures'}
                      </p>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            
            {/* Typography Section */}
            {activeSection === 'typography' && (
              <div className="space-y-8">
                <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Typography System</h2>
                  <p className="text-white/80 text-lg">All text styles used throughout the compliance platform.</p>
                </div>
                
                {/* Font Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Current Font Stack</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-blue-800">Primary Font</p>
                      <p className="text-blue-700">Source Sans Pro</p>
                      <p className="text-blue-600 text-xs">Body text, UI elements</p>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-800">Serif Font</p>
                      <p className="text-blue-700">Lora</p>
                      <p className="text-blue-600 text-xs">Headings, emphasis</p>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-800">Brand Font</p>
                      <p className="text-blue-700">Kirgina</p>
                      <p className="text-blue-600 text-xs">Logo, brand elements</p>
                    </div>
                  </div>
                </div>

                {/* Page Headers */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Headers</h3>
                  
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h1 className="text-2xl font-bold text-white bg-gray-800 p-4 rounded">
                        Dashboard
                      </h1>
                      <div className="mt-3 text-sm text-gray-600">
                        <p><strong>Component:</strong> PageTitle</p>
                        <p><strong>Font:</strong> Source Sans Pro</p>
                        <p><strong>Classes:</strong> 
                          <button 
                            onClick={() => copyToClipboard('text-2xl font-bold text-white')}
                            className="ml-2 text-blue-600 hover:text-blue-700 underline cursor-pointer"
                          >
                            text-2xl font-bold text-white
                          </button>
                        </p>
                        <p><strong>Usage:</strong> Main page titles in all sections</p>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-white/70 text-sm bg-gray-800 p-4 rounded">
                        AI-powered delivery tracking and compliance monitoring
                      </p>
                      <div className="mt-3 text-sm text-gray-600">
                        <p><strong>Component:</strong> PageSubtitle</p>
                        <p><strong>Font:</strong> Source Sans Pro</p>
                        <p><strong>Classes:</strong> 
                          <button 
                            onClick={() => copyToClipboard('text-white/70 text-sm')}
                            className="ml-2 text-blue-600 hover:text-blue-700 underline cursor-pointer"
                          >
                            text-white/70 text-sm
                          </button>
                        </p>
                        <p><strong>Usage:</strong> Page descriptions under main titles</p>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-blue-300 text-xs bg-gray-800 p-4 rounded">
                        Demo Mode
                      </p>
                      <div className="mt-3 text-sm text-gray-600">
                        <p><strong>Component:</strong> DemoIndicator</p>
                        <p><strong>Classes:</strong> 
                          <button 
                            onClick={() => copyToClipboard('text-blue-300 text-xs')}
                            className="ml-2 text-blue-600 hover:text-blue-700 underline cursor-pointer"
                          >
                            text-blue-300 text-xs
                          </button>
                        </p>
                        <p><strong>Usage:</strong> Demo mode indicators</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Typography */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Typography</h3>
                  
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-xl font-semibold text-white bg-gray-800 p-4 rounded">
                        Quick Actions
                      </h3>
                      <div className="mt-3 text-sm text-gray-600">
                        <p><strong>Component:</strong> CardTitle</p>
                        <p><strong>Font:</strong> Source Sans Pro</p>
                        <p><strong>Classes:</strong> 
                          <button 
                            onClick={() => copyToClipboard('text-xl font-semibold text-white')}
                            className="ml-2 text-blue-600 hover:text-blue-700 underline cursor-pointer"
                          >
                            text-xl font-semibold text-white
                          </button>
                        </p>
                        <p><strong>Usage:</strong> Sidebar and card section titles</p>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-lg bg-gray-100 p-4 rounded">
                        View Dashboard
                      </h3>
                      <div className="mt-3 text-sm text-gray-600">
                        <p><strong>Component:</strong> ActionButtonTitle</p>
                        <p><strong>Classes:</strong> 
                          <button 
                            onClick={() => copyToClipboard('font-semibold text-lg')}
                            className="ml-2 text-blue-600 hover:text-blue-700 underline cursor-pointer"
                          >
                            font-semibold text-lg
                          </button>
                        </p>
                        <p><strong>Usage:</strong> Large action button titles</p>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <p className="text-sm mt-1 opacity-90 bg-gray-100 p-4 rounded">
                        Check compliance metrics
                      </p>
                      <div className="mt-3 text-sm text-gray-600">
                        <p><strong>Component:</strong> ActionButtonDescription</p>
                        <p><strong>Classes:</strong> 
                          <button 
                            onClick={() => copyToClipboard('text-sm mt-1 opacity-90')}
                            className="ml-2 text-blue-600 hover:text-blue-700 underline cursor-pointer"
                          >
                            text-sm mt-1 opacity-90
                          </button>
                        </p>
                        <p><strong>Usage:</strong> Descriptions under action button titles</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Version Typography */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Version & Meta Text</h3>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <span className="text-white/60 text-xs bg-gray-800 p-4 rounded inline-block">
                      v1.8.6
                    </span>
                    <div className="mt-3 text-sm text-gray-600">
                      <p><strong>Component:</strong> VersionNumber</p>
                      <p><strong>Classes:</strong> 
                        <button 
                          onClick={() => copyToClipboard('text-white/60 text-xs')}
                          className="ml-2 text-blue-600 hover:text-blue-700 underline cursor-pointer"
                        >
                          text-white/60 text-xs
                        </button>
                      </p>
                      <p><strong>Usage:</strong> Version numbers in page headers</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Color Palette Section */}
            {activeSection === 'colors' && (
              <div className="space-y-8">
                <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Color Palette</h2>
                  <p className="text-white/80 text-lg">All colors currently used in the compliance platform.</p>
                </div>

                {/* Glass Morphism Colors */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Glass Morphism System</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-full h-16 bg-white/15 backdrop-blur-lg border border-white/20 rounded-lg mb-2"></div>
                      <p className="text-sm font-medium">Primary Glass</p>
                      <button 
                        onClick={() => copyToClipboard('bg-white/15 backdrop-blur-lg border border-white/20')}
                        className="text-xs text-blue-600 hover:text-blue-700 underline"
                      >
                        bg-white/15 backdrop-blur-lg border border-white/20
                      </button>
                      <p className="text-xs text-gray-500 mt-1">Main cards, containers</p>
                    </div>

                    <div className="text-center">
                      <div className="w-full h-16 bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg mb-2"></div>
                      <p className="text-sm font-medium">Secondary Glass</p>
                      <button 
                        onClick={() => copyToClipboard('bg-white/20 backdrop-blur-sm border border-white/20')}
                        className="text-xs text-blue-600 hover:text-blue-700 underline"
                      >
                        bg-white/20 backdrop-blur-sm border border-white/20
                      </button>
                      <p className="text-xs text-gray-500 mt-1">Nested cards, sections</p>
                    </div>

                    <div className="text-center">
                      <div className="w-full h-16 bg-white/10 backdrop-blur-sm rounded-lg mb-2"></div>
                      <p className="text-sm font-medium">Subtle Glass</p>
                      <button 
                        onClick={() => copyToClipboard('bg-white/10 backdrop-blur-sm')}
                        className="text-xs text-blue-600 hover:text-blue-700 underline"
                      >
                        bg-white/10 backdrop-blur-sm
                      </button>
                      <p className="text-xs text-gray-500 mt-1">Light backgrounds</p>
                    </div>
                  </div>
                </div>

                {/* Status Colors */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Colors</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="w-full h-16 bg-blue-50 border border-blue-200 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-blue-700 font-medium">Info</span>
                      </div>
                      <p className="text-sm font-medium">Info/Primary</p>
                      <button 
                        onClick={() => copyToClipboard('bg-blue-50 text-blue-700')}
                        className="text-xs text-blue-600 hover:text-blue-700 underline"
                      >
                        bg-blue-50 text-blue-700
                      </button>
                      <p className="text-xs text-gray-500 mt-1">Primary actions, info</p>
                    </div>

                    <div className="text-center">
                      <div className="w-full h-16 bg-green-50 border border-green-200 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-green-700 font-medium">Success</span>
                      </div>
                      <p className="text-sm font-medium">Success</p>
                      <button 
                        onClick={() => copyToClipboard('bg-green-50 text-green-700')}
                        className="text-xs text-blue-600 hover:text-blue-700 underline"
                      >
                        bg-green-50 text-green-700
                      </button>
                      <p className="text-xs text-gray-500 mt-1">Compliant states</p>
                    </div>

                    <div className="text-center">
                      <div className="w-full h-16 bg-yellow-50 border border-yellow-200 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-yellow-700 font-medium">Warning</span>
                      </div>
                      <p className="text-sm font-medium">Warning</p>
                      <button 
                        onClick={() => copyToClipboard('bg-yellow-50 text-yellow-700')}
                        className="text-xs text-blue-600 hover:text-blue-700 underline"
                      >
                        bg-yellow-50 text-yellow-700
                      </button>
                      <p className="text-xs text-gray-500 mt-1">Caution states</p>
                    </div>

                    <div className="text-center">
                      <div className="w-full h-16 bg-red-50 border border-red-200 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-red-700 font-medium">Error</span>
                      </div>
                      <p className="text-sm font-medium">Error/Violation</p>
                      <button 
                        onClick={() => copyToClipboard('bg-red-50 text-red-700')}
                        className="text-xs text-blue-600 hover:text-blue-700 underline"
                      >
                        bg-red-50 text-red-700
                      </button>
                      <p className="text-xs text-gray-500 mt-1">Violations, errors</p>
                    </div>
                  </div>
                </div>

                {/* Text Colors */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Text Color Hierarchy</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-white bg-gray-800 px-3 py-2 rounded">Primary White Text</span>
                      <div className="text-right">
                        <button 
                          onClick={() => copyToClipboard('text-white')}
                          className="text-blue-600 hover:text-blue-700 underline text-sm"
                        >
                          text-white
                        </button>
                        <p className="text-xs text-gray-500">Main headings on dark backgrounds</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-white/70 bg-gray-800 px-3 py-2 rounded">Secondary White Text</span>
                      <div className="text-right">
                        <button 
                          onClick={() => copyToClipboard('text-white/70')}
                          className="text-blue-600 hover:text-blue-700 underline text-sm"
                        >
                          text-white/70
                        </button>
                        <p className="text-xs text-gray-500">Descriptions on dark backgrounds</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-white/60 bg-gray-800 px-3 py-2 rounded">Muted White Text</span>
                      <div className="text-right">
                        <button 
                          onClick={() => copyToClipboard('text-white/60')}
                          className="text-blue-600 hover:text-blue-700 underline text-sm"
                        >
                          text-white/60
                        </button>
                        <p className="text-xs text-gray-500">Version numbers, metadata</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-gray-900">Primary Dark Text</span>
                      <div className="text-right">
                        <button 
                          onClick={() => copyToClipboard('text-gray-900')}
                          className="text-blue-600 hover:text-blue-700 underline text-sm"
                        >
                          text-gray-900
                        </button>
                        <p className="text-xs text-gray-500">Main text on light backgrounds</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-gray-700">Secondary Dark Text</span>
                      <div className="text-right">
                        <button 
                          onClick={() => copyToClipboard('text-gray-700')}
                          className="text-blue-600 hover:text-blue-700 underline text-sm"
                        >
                          text-gray-700
                        </button>
                        <p className="text-xs text-gray-500">Body text on light backgrounds</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons Section */}
            {activeSection === 'buttons' && (
              <div className="space-y-8">
                <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Button Components</h2>
                  <p className="text-white/80 text-lg">All button styles and variants used in the platform.</p>
                </div>

                {/* Primary Buttons */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Action Buttons</h3>
                  
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                        LOGIN as Demo User
                      </button>
                      <div className="mt-3 text-sm text-gray-600">
                        <p><strong>Component:</strong> PrimaryButton</p>
                        <p><strong>Classes:</strong> 
                          <button 
                            onClick={() => copyToClipboard('bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]')}
                            className="ml-2 text-blue-600 hover:text-blue-700 underline cursor-pointer"
                          >
                            bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl...
                          </button>
                        </p>
                        <p><strong>Usage:</strong> Main actions, form submissions, primary CTA</p>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <button className="bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-white/30 backdrop-blur-sm bg-gray-600">
                        Try Demo Mode
                      </button>
                      <div className="mt-3 text-sm text-gray-600">
                        <p><strong>Component:</strong> SecondaryGlassButton</p>
                        <p><strong>Classes:</strong> 
                          <button 
                            onClick={() => copyToClipboard('bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-white/30 backdrop-blur-sm')}
                            className="ml-2 text-blue-600 hover:text-blue-700 underline cursor-pointer"
                          >
                            bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-6 rounded-xl...
                          </button>
                        </p>
                        <p><strong>Usage:</strong> Secondary actions on glass backgrounds</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Large Action Buttons */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Large Action Buttons</h3>
                  
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <button className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl transition-all duration-200 text-left">
                        <div>
                          <h3 className="font-semibold text-lg">View Dashboard</h3>
                          <p className="text-sm mt-1 opacity-90">Check compliance metrics</p>
                        </div>
                      </button>
                      <div className="mt-3 text-sm text-gray-600">
                        <p><strong>Component:</strong> LargeActionButton (Active)</p>
                        <p><strong>Classes:</strong> 
                          <button 
                            onClick={() => copyToClipboard('block w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl transition-all duration-200 text-left')}
                            className="ml-2 text-blue-600 hover:text-blue-700 underline cursor-pointer"
                          >
                            block w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6...
                          </button>
                        </p>
                        <p><strong>Usage:</strong> Primary actions in sidebars, active state</p>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <button className="block w-full bg-white/20 hover:bg-white/30 text-white py-4 px-6 rounded-xl transition-all duration-200 text-left bg-gray-600">
                        <div>
                          <h3 className="font-semibold text-lg">Upload Documents</h3>
                          <p className="text-sm mt-1 opacity-90">Add new delivery dockets</p>
                        </div>
                      </button>
                      <div className="mt-3 text-sm text-gray-600">
                        <p><strong>Component:</strong> LargeActionButton (Inactive)</p>
                        <p><strong>Classes:</strong> 
                          <button 
                            onClick={() => copyToClipboard('block w-full bg-white/20 hover:bg-white/30 text-white py-4 px-6 rounded-xl transition-all duration-200 text-left')}
                            className="ml-2 text-blue-600 hover:text-blue-700 underline cursor-pointer"
                          >
                            block w-full bg-white/20 hover:bg-white/30 text-white py-4 px-6...
                          </button>
                        </p>
                        <p><strong>Usage:</strong> Secondary actions in sidebars, inactive state</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cards Section */}
            {activeSection === 'cards' && (
              <div className="space-y-8">
                <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Cards & Containers</h2>
                  <p className="text-white/80 text-lg">Glass morphism cards and container patterns.</p>
                </div>

                {/* Main Glass Cards */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Glass Morphism Cards</h3>
                  
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-800">
                      <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-xl font-semibold text-white mb-4">Primary Glass Card</h3>
                        <p className="text-white/70 text-sm">This is the main container style used throughout the application.</p>
                      </div>
                      <div className="mt-3 text-sm text-gray-300">
                        <p><strong>Component:</strong> PrimaryGlassCard</p>
                        <p><strong>Classes:</strong> 
                          <button 
                            onClick={() => copyToClipboard('bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg')}
                            className="ml-2 text-blue-400 hover:text-blue-300 underline cursor-pointer"
                          >
                            bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg
                          </button>
                        </p>
                        <p><strong>Usage:</strong> Main content containers, dashboard cards, form sections</p>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-800">
                      <div className="bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                        <h4 className="text-lg font-semibold text-white mb-2">Secondary Glass Card</h4>
                        <p className="text-white/70 text-sm">Used for nested content within main cards.</p>
                      </div>
                      <div className="mt-3 text-sm text-gray-300">
                        <p><strong>Component:</strong> SecondaryGlassCard</p>
                        <p><strong>Classes:</strong> 
                          <button 
                            onClick={() => copyToClipboard('bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-6')}
                            className="ml-2 text-blue-400 hover:text-blue-300 underline cursor-pointer"
                          >
                            bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-6
                          </button>
                        </p>
                        <p><strong>Usage:</strong> Nested sections, info panels, instruction cards</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar Cards */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sidebar Cards</h3>
                  
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-800">
                    <div className="w-64 bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
                      <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
                      <div className="space-y-3">
                        <div className="text-white/80 text-sm">Sidebar content example</div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-300">
                      <p><strong>Component:</strong> SidebarCard</p>
                      <p><strong>Classes:</strong> 
                        <button 
                          onClick={() => copyToClipboard('w-64 bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg')}
                          className="ml-2 text-blue-400 hover:text-blue-300 underline cursor-pointer"
                        >
                          w-64 bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg
                        </button>
                      </p>
                      <p><strong>Usage:</strong> Fixed-width sidebar containers, action panels</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Layout Patterns Section */}
            {activeSection === 'layouts' && (
              <div className="space-y-8">
                <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Layout Patterns</h2>
                  <p className="text-white/80 text-lg">Standard layout structures used throughout the application.</p>
                </div>

                {/* Two-Column Layout */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Column Layout</h3>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <div className="flex gap-6">
                        <div className="flex-1 bg-white p-4 rounded border-2 border-blue-200">
                          <div className="text-sm text-gray-600 mb-2">Main Content (flex-1)</div>
                          <div className="h-20 bg-gray-100 rounded"></div>
                        </div>
                        <div className="w-64 bg-white p-4 rounded border-2 border-green-200">
                          <div className="text-sm text-gray-600 mb-2">Sidebar (w-64)</div>
                          <div className="h-20 bg-gray-100 rounded"></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      <p><strong>Component:</strong> TwoColumnLayout</p>
                      <p><strong>Classes:</strong> 
                        <button 
                          onClick={() => copyToClipboard('flex gap-6')}
                          className="ml-2 text-blue-600 hover:text-blue-700 underline cursor-pointer"
                        >
                          flex gap-6
                        </button>
                        (Container) • 
                        <button 
                          onClick={() => copyToClipboard('flex-1')}
                          className="ml-2 text-blue-600 hover:text-blue-700 underline cursor-pointer"
                        >
                          flex-1
                        </button>
                        (Main) • 
                        <button 
                          onClick={() => copyToClipboard('w-64')}
                          className="ml-2 text-blue-600 hover:text-blue-700 underline cursor-pointer"
                        >
                          w-64
                        </button>
                        (Sidebar)
                      </p>
                      <p><strong>Usage:</strong> Dashboard pages, upload pages, reports pages</p>
                    </div>
                  </div>
                </div>

                {/* Page Header Pattern */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Header Pattern</h3>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                        <p className="text-white/70 text-sm">AI-powered delivery tracking and compliance monitoring</p>
                        <p className="text-blue-300 text-xs mt-1">Demo Mode</p>
                        <p className="text-white/60 text-xs">v1.8.6</p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      <p><strong>Component:</strong> StandardPageHeader</p>
                      <p><strong>Structure:</strong></p>
                      <ul className="list-disc list-inside text-xs space-y-1 mt-2">
                        <li>Container: <code className="bg-gray-100 px-1 rounded">mb-8</code></li>
                        <li>Title: <code className="bg-gray-100 px-1 rounded">text-2xl font-bold text-white</code></li>
                        <li>Subtitle: <code className="bg-gray-100 px-1 rounded">text-white/70 text-sm</code></li>
                        <li>Status: <code className="bg-gray-100 px-1 rounded">text-blue-300 text-xs mt-1</code></li>
                        <li>Version: <code className="bg-gray-100 px-1 rounded">text-white/60 text-xs</code></li>
                      </ul>
                      <p><strong>Usage:</strong> Top of every main page in workspace and admin sections</p>
                    </div>
                  </div>
                </div>

                {/* Container Max Width */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Container System</h3>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white rounded border-2 border-blue-200">
                        <div className="text-sm text-gray-600">Content Container</div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      <p><strong>Component:</strong> MainContainer</p>
                      <p><strong>Classes:</strong> 
                        <button 
                          onClick={() => copyToClipboard('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8')}
                          className="ml-2 text-blue-600 hover:text-blue-700 underline cursor-pointer"
                        >
                          max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8
                        </button>
                      </p>
                      <p><strong>Usage:</strong> Main page content wrapper on all pages</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status Indicators Section */}
            {activeSection === 'status' && (
              <div className="space-y-8">
                <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Status Indicators</h2>
                  <p className="text-white/80 text-lg">Loading states, badges, and status indicators.</p>
                </div>

                {/* Loading States */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Loading States</h3>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span className="text-gray-600">Loading...</span>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      <p><strong>Component:</strong> LoadingSpinner</p>
                      <p><strong>Classes:</strong> 
                        <button 
                          onClick={() => copyToClipboard('animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full')}
                          className="ml-2 text-blue-600 hover:text-blue-700 underline cursor-pointer"
                        >
                          animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full
                        </button>
                      </p>
                      <p><strong>Usage:</strong> Loading states, processing indicators</p>
                    </div>
                  </div>
                </div>

                {/* Compliance Status */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h3>
                  
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-green-600">Compliant</span>
                        <span className="text-sm font-medium text-yellow-600">Processing...</span>
                        <span className="text-sm font-medium text-red-600">Violation</span>
                      </div>
                      <div className="mt-3 text-sm text-gray-600">
                        <p><strong>Component:</strong> ComplianceStatus</p>
                        <p><strong>Classes:</strong> 
                          <button 
                            onClick={() => copyToClipboard('text-sm font-medium text-green-600')}
                            className="ml-2 text-blue-600 hover:text-blue-700 underline cursor-pointer"
                          >
                            text-sm font-medium text-[status-color]
                          </button>
                        </p>
                        <p><strong>Usage:</strong> Status indicators in delivery records, dashboard metrics</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Section */}
            {activeSection === 'navigation' && (
              <div className="space-y-8">
                <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Navigation Components</h2>
                  <p className="text-white/80 text-lg">Navigation patterns and header components.</p>
                </div>

                {/* Navigation Pills */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation Pills</h3>
                  
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-800">
                    <div className="flex bg-white/10 backdrop-blur-sm rounded-full p-1 space-x-1 border border-white/20">
                      <div className="px-4 py-2 rounded-full text-sm font-medium bg-white/20 text-gray-900 backdrop-blur-sm shadow-sm">
                        Dashboard
                      </div>
                      <div className="px-4 py-2 rounded-full text-sm font-medium text-gray-800 hover:text-gray-900 hover:bg-white/10">
                        Upload
                      </div>
                      <div className="px-4 py-2 rounded-full text-sm font-medium text-gray-800 hover:text-gray-900 hover:bg-white/10">
                        Reports
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-300">
                      <p><strong>Component:</strong> NavigationPills</p>
                      <p><strong>Container:</strong> 
                        <button 
                          onClick={() => copyToClipboard('flex bg-white/10 backdrop-blur-sm rounded-full p-1 space-x-1 border border-white/20')}
                          className="ml-2 text-blue-400 hover:text-blue-300 underline cursor-pointer"
                        >
                          flex bg-white/10 backdrop-blur-sm rounded-full p-1 space-x-1 border border-white/20
                        </button>
                      </p>
                      <p><strong>Active Item:</strong> 
                        <button 
                          onClick={() => copyToClipboard('px-4 py-2 rounded-full text-sm font-medium bg-white/20 text-gray-900 backdrop-blur-sm shadow-sm')}
                          className="ml-2 text-blue-400 hover:text-blue-300 underline cursor-pointer"
                        >
                          px-4 py-2 rounded-full text-sm font-medium bg-white/20 text-gray-900...
                        </button>
                      </p>
                      <p><strong>Usage:</strong> Header navigation in admin and workspace layouts</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Forms Section */}
            {activeSection === 'forms' && (
              <div className="space-y-8">
                <div className="bg-white/15 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Form Elements</h2>
                  <p className="text-white/80 text-lg">Input fields, selects, and form patterns.</p>
                </div>

                {/* Text Inputs */}
                <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Text Inputs</h3>
                  
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <input
                        type="text"
                        placeholder="Email Address"
                        className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-xl text-gray-900 placeholder-gray-600 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{backgroundColor: '#f9f9f9'}}
                      />
                      <div className="mt-3 text-sm text-gray-600">
                        <p><strong>Component:</strong> GlassInput</p>
                        <p><strong>Classes:</strong> 
                          <button 
                            onClick={() => copyToClipboard('w-full px-4 py-3 bg-white/30 border border-white/30 rounded-xl text-gray-900 placeholder-gray-600 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent')}
                            className="ml-2 text-blue-600 hover:text-blue-700 underline cursor-pointer"
                          >
                            w-full px-4 py-3 bg-white/30 border border-white/30 rounded-xl...
                          </button>
                        </p>
                        <p><strong>Usage:</strong> Text inputs on glass morphism backgrounds</p>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <select className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-xl text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500" style={{backgroundColor: '#666', color: 'white'}}>
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>Custom range</option>
                      </select>
                      <div className="mt-3 text-sm text-gray-600">
                        <p><strong>Component:</strong> GlassSelect</p>
                        <p><strong>Classes:</strong> 
                          <button 
                            onClick={() => copyToClipboard('w-full px-3 py-2 bg-white/20 border border-white/30 rounded-xl text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500')}
                            className="ml-2 text-blue-600 hover:text-blue-700 underline cursor-pointer"
                          >
                            w-full px-3 py-2 bg-white/20 border border-white/30 rounded-xl...
                          </button>
                        </p>
                        <p><strong>Usage:</strong> Select dropdowns on dark glass backgrounds</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Default section for any remaining sections */}
            {!['typography', 'colors', 'buttons', 'cards', 'forms', 'navigation', 'status', 'layouts'].includes(activeSection) && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    {sections.find(s => s.id === activeSection)?.name}
                  </h2>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800">
                      🚧 This section is under development. More components and examples will be added shortly.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Development Footer */}
      <footer className="bg-gray-800/95 backdrop-blur-sm text-white py-4 mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            🔧 Development Only - Style Guide Reference • 
            Hospitality Compliance Platform • 
            Never deployed to production
          </p>
        </div>
      </footer>
    </div>
  )
}