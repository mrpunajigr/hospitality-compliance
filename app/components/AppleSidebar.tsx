'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DesignTokens, getTextStyle } from '@/lib/design-system'

interface SidebarNavItem {
  name: string
  href: string
  icon: string
  section: 'quickActions' | 'modules' | 'settings'
  context?: 'admin' | 'console' | 'both' | 'upload'
  subItems?: SidebarSubItem[]
}

interface SidebarSubItem {
  name: string
  href: string
  icon?: string
}

interface AppleSidebarProps {
  user?: any
  userClient?: any
  onSignOut?: () => void
  logoUrl?: string
  activeSection: 'admin' | 'console' | 'upload'
  onBackgroundSelectorToggle?: () => void
}

const sidebarNavigation: SidebarNavItem[] = [
  // Modules - Following Three-Page One-Word Convention
  { 
    name: 'Upload', 
    href: '/upload/console', 
    icon: '/ModuleIcons/JiGRtemps.png', 
    section: 'modules', 
    context: 'both',
    subItems: [
      { name: 'Console', href: '/upload/console', icon: '📊' },
      { name: 'Action', href: '/upload/action', icon: '📤' },
      { name: 'Reports', href: '/upload/reports', icon: '📋' }
    ]
  },
  
  // Legacy Quick Actions (for backward compatibility)
  { name: 'Dashboard', href: '/console/dashboard', icon: '/icons/JiGRdiaryWhite.png', section: 'quickActions', context: 'console' },
  { name: 'Upload', href: '/console/upload', icon: '/icons/JiGRuploadWhite.png', section: 'quickActions', context: 'console' },
  { name: 'Reports', href: '/console/reports', icon: '/icons/JiGRcamera.png', section: 'quickActions', context: 'console' },
  { name: 'Company', href: '/admin/company', icon: '/icons/JiGRadmin.png', section: 'quickActions', context: 'admin' },
  
  // Future Modules
  { name: 'Temperature', href: '/modules/temperature', icon: '/ModuleIcons/JiGRtemps.png', section: 'modules', context: 'both' },
  { name: 'Analytics', href: '/modules/analytics', icon: '/ModuleIcons/JiGRstock.png', section: 'modules', context: 'both' },
  
  // Settings
  { name: 'Settings', href: '/admin/company-settings', icon: '/icons/JiGRadmin.png', section: 'settings', context: 'both' },
  { name: 'Profile', href: '/admin/profile', icon: '/icons/JiGRadmin.png', section: 'settings', context: 'both' },
]

export default function AppleSidebar({ 
  user, 
  userClient, 
  onSignOut, 
  logoUrl, 
  activeSection,
  onBackgroundSelectorToggle 
}: AppleSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      
      // Auto-collapse on mobile, expand on tablet+
      if (mobile) {
        setIsCollapsed(true)
      } else if (window.innerWidth >= 1024) {
        // Auto-expand on desktop
        setIsCollapsed(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Filter items by section and context
  const quickActionItems = sidebarNavigation.filter(item => 
    item.section === 'quickActions' && 
    (item.context === activeSection || item.context === 'both')
  )
  
  const moduleItems = sidebarNavigation.filter(item => 
    item.section === 'modules' && 
    (item.context === activeSection || item.context === 'both')
  )
  
  const settingsItems = sidebarNavigation.filter(item => 
    item.section === 'settings' && 
    (item.context === activeSection || item.context === 'both')
  )

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-black/10 backdrop-blur-xl transition-all duration-300 ease-in-out z-40 ${
        isCollapsed ? 'w-[150px] shadow-lg' : 'w-[400px] shadow-[0_0_50px_rgba(0,0,0,0.5)]'
      }`}>
        
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {/* Client Avatar & Title */}
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div 
                className={`bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 overflow-hidden flex-shrink-0 ${
                  isCollapsed ? 'w-10 h-10 cursor-pointer hover:bg-white/30 transition-all duration-200' : 'w-12 h-12'
                }`}
                onClick={isCollapsed ? () => setIsCollapsed(false) : undefined}
                title={isCollapsed ? 'Expand Sidebar' : undefined}
              >
                <span className={`text-white font-bold ${isCollapsed ? 'text-base' : 'text-lg'}`}>
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              {!isCollapsed && (
                <div>
                  <span className={`${getTextStyle('body')} text-white font-semibold`}>
                    {user?.user_metadata?.full_name || user?.email || 'User'}
                  </span>
                  <p className={`${getTextStyle('meta')} ${DesignTokens.colors.text.onGlassSecondary}`}>
                    {activeSection === 'admin' ? 'Admin Portal' : 'Console'}
                  </p>
                </div>
              )}
            </div>

            {/* Collapse Toggle - Only show when expanded */}
            {!isMobile && !isCollapsed && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                title="Collapse Sidebar"
              >
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-4">
          
          {/* QUICK ACTIONS Section */}
          <div className={isCollapsed ? 'mb-8' : 'px-3 mb-6'}>
            {!isCollapsed && (
              <div className={`px-3 pb-3 ${getTextStyle('meta')} text-white/50 uppercase tracking-wider font-medium text-xs`}>
                QUICK ACTIONS
              </div>
            )}
            <nav className={isCollapsed ? 'space-y-4' : 'space-y-2'}>
              {quickActionItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center rounded-lg transition-all duration-200 group ${
                    isCollapsed ? 'justify-center py-4 mx-2' : 'px-3 py-3'
                  } ${
                    pathname === item.href
                      ? 'bg-white/15 text-white backdrop-blur-sm shadow-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div className={`flex items-center justify-center ${
                    isCollapsed ? 'w-12 h-12 mx-auto' : 'w-8 h-8 mr-3'
                  }`}>
                    <img 
                      src={item.icon} 
                      alt={item.name}
                      className={isCollapsed ? 'w-10 h-10 object-contain' : 'w-6 h-6 object-contain'}
                    />
                  </div>
                  {!isCollapsed && (
                    <span className={`${getTextStyle('body')} font-medium text-sm`}>
                      {item.name}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* MODULES Section */}
          <div className={isCollapsed ? 'mb-8' : 'px-3 mb-6'}>
            {!isCollapsed && (
              <div className={`px-3 pb-3 ${getTextStyle('meta')} text-white/50 uppercase tracking-wider font-medium text-xs`}>
                MODULES
              </div>
            )}
            <nav className={isCollapsed ? 'space-y-4' : 'space-y-2'}>
              {moduleItems.map((item) => (
                <div key={item.href}>
                  {/* Main Module Link */}
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-lg transition-all duration-200 group ${
                      isCollapsed ? 'justify-center py-4 mx-2' : 'px-3 py-3'
                    } ${
                      pathname.startsWith(item.href.split('/').slice(0, 2).join('/'))
                        ? 'bg-white/15 text-white backdrop-blur-sm shadow-sm'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <div className={`flex items-center justify-center ${
                      isCollapsed ? 'w-12 h-12 mx-auto' : 'w-8 h-8 mr-3'
                    }`}>
                      <img 
                        src={item.icon} 
                        alt={item.name}
                        className={isCollapsed ? 'w-10 h-10 object-contain' : 'w-6 h-6 object-contain'}
                      />
                    </div>
                    {!isCollapsed && (
                      <span className={`${getTextStyle('body')} font-medium text-sm`}>
                        {item.name}
                      </span>
                    )}
                  </Link>
                  
                  {/* Sub-navigation for Three-Page modules */}
                  {!isCollapsed && item.subItems && pathname.startsWith(item.href.split('/').slice(0, 2).join('/')) && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-xs ${
                            pathname === subItem.href
                              ? 'bg-white/20 text-white font-medium'
                              : 'text-white/60 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {subItem.icon && (
                            <span className="mr-2 text-sm">{subItem.icon}</span>
                          )}
                          <span>{subItem.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

        </div>

        {/* SETTINGS Section (Bottom) */}
        <div className="border-t border-white/10 px-3 py-4">
          {!isCollapsed && (
            <div className={`px-3 pb-3 ${getTextStyle('meta')} text-white/50 uppercase tracking-wider font-medium text-xs`}>
              SETTINGS
            </div>
          )}
          <nav className="space-y-2">
            {settingsItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
                  pathname === item.href
                    ? 'bg-white/15 text-white backdrop-blur-sm shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <div className={`w-8 h-8 flex items-center justify-center ${isCollapsed ? 'mx-auto' : 'mr-3'}`}>
                  <img 
                    src={item.icon} 
                    alt={item.name}
                    className="w-6 h-6 object-contain"
                  />
                </div>
                {!isCollapsed && (
                  <span className={`${getTextStyle('body')} font-medium text-sm`}>
                    {item.name}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4">
          {/* Background Selector & Sign Out Row */}
          <div className={`flex items-center ${isCollapsed ? 'flex-col space-y-2' : 'justify-between mb-3'}`}>
            {/* Background Selector */}
            {onBackgroundSelectorToggle && (
              <button
                onClick={onBackgroundSelectorToggle}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                title="Change Background"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            )}

            {/* Sign Out */}
            {onSignOut && (
              <button
                onClick={onSignOut}
                className={`flex items-center p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 ${
                  isCollapsed ? '' : 'space-x-2'
                }`}
                title={isCollapsed ? 'Sign Out' : undefined}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {!isCollapsed && <span className="text-sm">Sign Out</span>}
              </button>
            )}
          </div>

          {/* User Info */}
          {!isCollapsed && user && (
            <Link 
              href="/admin/profile" 
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 overflow-hidden">
                <span className="text-white text-xs font-medium">
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className={`${getTextStyle('body')} text-white font-medium text-xs truncate`}>
                  {user?.user_metadata?.full_name || user?.email || 'User'}
                </div>
                <div className={`${getTextStyle('meta')} ${DesignTokens.colors.text.onGlassSecondary} text-xs`}>
                  {userClient?.role || (activeSection === 'admin' ? 'Admin' : 'Console')}
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Overlay when sidebar is expanded */}
      {!isCollapsed && (
        <div 
          className={`fixed inset-0 bg-black/20 z-30 transition-opacity duration-300 ${
            isMobile ? 'md:hidden' : 'hidden md:block'
          }`}
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Mobile Expand Button */}
      {isMobile && isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="fixed top-4 left-[160px] z-40 p-2 bg-black/20 backdrop-blur-sm border border-white/30 rounded-lg text-white/60 hover:text-white hover:bg-black/30 transition-all duration-200 md:hidden"
          title="Open Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </>
  )
}