'use client'

import Link from 'next/link'
import { useDevAuth } from '@/lib/dev-auth-context'
import { getVersionDisplay } from '@/lib/version'
import { getCardStyle, getTextStyle } from '@/lib/design-system'
import DevModuleBackground from '@/app/components/backgrounds/DevModuleBackground'

const devTools = [
  {
    name: 'Mood Board System',
    href: '/dev/mood-board',
    icon: '🎨',
    description: 'Enhanced design system testing with typography and color experimentation',
    status: 'Active',
    requiredRole: 'DEV' as const,
    category: 'Design Tools'
  },
  {
    name: 'Component Library',
    href: '/dev/components',
    icon: '🧩',
    description: 'Interactive component testing and variant exploration',
    status: 'Coming Soon',
    requiredRole: 'DEV' as const,
    category: 'Design Tools'
  },
  {
    name: 'API Testing Suite',
    href: '/dev/api-testing',
    icon: '⚡',
    description: 'Test API endpoints and data flows',
    status: 'Coming Soon',
    requiredRole: 'SENIOR_DEV' as const,
    category: 'Development Tools'
  },
  {
    name: 'Database Inspector',
    href: '/dev/database',
    icon: '💾',
    description: 'Database schema visualization and query testing',
    status: 'Coming Soon',
    requiredRole: 'SENIOR_DEV' as const,
    category: 'Development Tools'
  },
  {
    name: 'Performance Monitor',
    href: '/dev/performance',
    icon: '📊',
    description: 'Performance metrics and optimization tools',
    status: 'Coming Soon',
    requiredRole: 'ARCHITECT' as const,
    category: 'Architecture Tools'
  },
  {
    name: 'Deployment Pipeline',
    href: '/dev/deployment',
    icon: '🚀',
    description: 'Build and deployment management interface',
    status: 'Coming Soon',
    requiredRole: 'ARCHITECT' as const,
    category: 'Architecture Tools'
  }
]

export default function DevDashboardPage() {
  const { devUser, logout, hasRole, logAccess } = useDevAuth()

  if (!devUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading DEV dashboard...</p>
        </div>
      </div>
    )
  }

  const handleToolAccess = (toolName: string) => {
    logAccess('TOOL_ACCESS', toolName)
  }

  const handleLogout = () => {
    logAccess('LOGOUT', 'dev-dashboard')
    logout()
  }

  // Group tools by category
  const toolsByCategory = devTools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = []
    }
    acc[tool.category].push(tool)
    return acc
  }, {} as Record<string, typeof devTools>)

  return (
    <DevModuleBackground 
      headerContent={`🔧 DEVELOPMENT PORTAL - ${devUser.username.toUpperCase()} (${devUser.role}) - TOOLS ACTIVE 🔧`}
    >
      <div className="min-h-screen pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className={`${getTextStyle('pageTitle')} text-white drop-shadow-lg mb-2`}>
                Development Portal
              </h1>
              <p className={`${getTextStyle('bodySmall')} text-gray-300 drop-shadow-md`}>
                Advanced tools and utilities for the development team
              </p>
            </div>
            
            {/* User Info & Actions */}
            <div className="flex items-center space-x-4">
              <div className={getCardStyle('secondary')}>
                <div className="text-right">
                  <div className={`${getTextStyle('body')} text-white font-semibold`}>
                    {devUser.username}
                  </div>
                  <div className="text-xs text-white/60">
                    {devUser.role} Access
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tools Grid by Category */}
          {Object.entries(toolsByCategory).map(([category, tools]) => (
            <div key={category} className="mb-12">
              <h2 className={`${getTextStyle('sectionTitle')} text-white mb-6`}>
                {category}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => {
                  const hasAccess = hasRole(tool.requiredRole)
                  const isActive = tool.status === 'Active'
                  
                  return (
                    <div
                      key={tool.name}
                      className={`${getCardStyle('primary')} ${
                        !hasAccess ? 'opacity-50' : ''
                      } ${
                        isActive && hasAccess ? 'hover:scale-[1.02] transition-transform cursor-pointer' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-4xl">{tool.icon}</div>
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isActive 
                              ? 'bg-green-600/20 text-green-300 border border-green-400/30'
                              : 'bg-yellow-600/20 text-yellow-300 border border-yellow-400/30'
                          }`}>
                            {tool.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            hasAccess
                              ? 'bg-blue-600/20 text-blue-300 border border-blue-400/30'
                              : 'bg-red-600/20 text-red-300 border border-red-400/30'
                          }`}>
                            {tool.requiredRole}
                          </span>
                        </div>
                      </div>
                      
                      <h3 className={`${getTextStyle('sectionTitle')} text-white mb-2`}>
                        {tool.name}
                      </h3>
                      <p className={`${getTextStyle('body')} text-white/80 mb-4`}>
                        {tool.description}
                      </p>
                      
                      {isActive && hasAccess ? (
                        <Link
                          href={tool.href}
                          onClick={() => handleToolAccess(tool.name)}
                          className="block w-full bg-orange-600 hover:bg-orange-700 text-white text-center font-semibold py-3 px-4 rounded-xl transition-colors"
                        >
                          Launch Tool
                        </Link>
                      ) : (
                        <div className={`block w-full text-center font-semibold py-3 px-4 rounded-xl ${
                          !hasAccess 
                            ? 'bg-red-600/20 text-red-300 border border-red-400/30'
                            : 'bg-gray-600/20 text-gray-300 border border-gray-400/30'
                        }`}>
                          {!hasAccess ? 'Access Denied' : 'Coming Soon'}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Footer */}
          <div className="mt-16 text-center">
            <div className={getCardStyle('secondary')}>
              <div className="flex items-center justify-center space-x-6 text-sm text-white/80">
                <span>{getVersionDisplay('dev')}</span>
                <span>•</span>
                <span>Session Expires: {new Date(devUser.expiresAt).toLocaleString()}</span>
                <span>•</span>
                <span>Hospitality Compliance DEV Portal</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DevModuleBackground>
  )
}