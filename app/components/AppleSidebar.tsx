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
  currentUploadPage?: 'console' | 'capture' | 'reports'
  onBackgroundSelectorToggle?: () => void
}

const sidebarNavigation: SidebarNavItem[] = [
  // Modules - Following Three-Page One-Word Convention
  { 
    name: 'Upload', 
    href: '/upload/console', 
    icon: '/icons/JiGRcamera.png', 
    section: 'modules', 
    context: 'both',
    subItems: [
      { name: 'Console', href: '/upload/console', icon: '📊' },
      { name: 'Capture', href: '/upload/capture', icon: '📤' },
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
  currentUploadPage,
  onBackgroundSelectorToggle 
}: AppleSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      
      // Always start collapsed on all devices
      setIsCollapsed(true)
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
      <div 
        className={`fixed left-0 top-0 h-full bg-black/10 backdrop-blur-xl transition-all duration-5000 ease-in-out z-40 ${
          isCollapsed ? 'w-[150px] shadow-lg' : 'w-[400px] shadow-[0_0_50px_rgba(0,0,0,0.5)]'
        }`}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
        onTouchStart={() => setIsCollapsed(false)}
      >
        
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
              <span className="text-white font-bold text-2xl">C</span>
            </div>
          </div>
        </div>

        {/* Upload Module Navigation - Only show on upload pages */}
        {activeSection === 'upload' && (
          <div className="border-b border-white/10 py-4">
            {!isCollapsed && (
              <div className={`px-6 pb-3 ${getTextStyle('meta')} text-white/50 uppercase tracking-wider font-medium text-xs text-center`}>
                UPLOAD MODULE
              </div>
            )}
            <nav className={isCollapsed ? 'space-y-1' : 'space-y-1 px-3'}>
              <a 
                href="/upload/console"
                className={`block text-center py-2 px-3 rounded-lg transition-all duration-200 text-sm mx-3 ${
                  currentUploadPage === 'console' 
                    ? 'bg-blue-600/30 text-white font-medium' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {isCollapsed ? 'C' : 'Console'}
              </a>
              <a 
                href="/upload/capture"
                className={`block text-center py-2 px-3 rounded-lg transition-all duration-200 text-sm mx-3 ${
                  currentUploadPage === 'capture' 
                    ? 'bg-green-600/30 text-white font-medium' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {isCollapsed ? 'A' : 'Capture'}
              </a>
              <a 
                href="/upload/reports"
                className={`block text-center py-2 px-3 rounded-lg transition-all duration-200 text-sm mx-3 ${
                  currentUploadPage === 'reports' 
                    ? 'bg-purple-600/30 text-white font-medium' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {isCollapsed ? 'R' : 'Reports'}
              </a>
            </nav>
          </div>
        )}

        {/* Navigation Sections - Three Equal Thirds */}
        <div className="flex-1 flex flex-col">
          
          {/* TOP THIRD: QUICK ACTIONS */}
          <div className="flex-1 flex flex-col justify-center py-2">
            {!isCollapsed && (
              <div className={`px-6 pb-3 ${getTextStyle('meta')} text-white/50 uppercase tracking-wider font-medium text-xs text-center`}>
                QUICK ACTIONS
              </div>
            )}
            <nav className={isCollapsed ? 'space-y-2' : 'space-y-1 px-3'}>
              {/* Camera Icon - Top */}
              <div className="flex justify-center items-center py-2">
                <img 
                  src="/icons/JiGRcamera.png" 
                  alt="Camera" 
                  className={isCollapsed ? 'w-12 h-12 object-contain' : 'w-16 h-16 object-contain'}
                  title="Quick Upload - Capture documents instantly"
                />
              </div>
              
              {/* Sign Out Icon - Bottom */}
              <div className="flex justify-center items-center py-2">
                <img 
                  src="/icons/JiGRsignout.png" 
                  alt="Sign Out" 
                  className={isCollapsed ? 'w-10 h-10 object-contain' : 'w-12 h-12 object-contain'}
                  title="Sign Out - End your session safely"
                />
              </div>
            </nav>
          </div>

          {/* Separator Line */}
          <div className="flex justify-center py-2">
            <div className="w-[60%] h-px bg-white/20"></div>
          </div>

          {/* MIDDLE THIRD: MODULES */}
          <div className="flex-1 flex flex-col justify-center py-2">
            {!isCollapsed && (
              <div className={`px-6 pb-3 ${getTextStyle('meta')} text-white/50 uppercase tracking-wider font-medium text-xs text-center`}>
                MODULES
              </div>
            )}
            <nav className={isCollapsed ? 'space-y-2' : 'space-y-1 px-3'}>
              {isCollapsed ? (
                <>
                  {/* Collapsed: Just the modules icon */}
                  <div className="flex justify-center items-center py-3">
                    <img 
                      src="/icons/JiGRmodules.png" 
                      alt="Modules" 
                      className="w-12 h-12 object-contain brightness-0 invert"
                      title="Modules - Access all application features"
                      onError={(e) => {
                        console.error('Failed to load JiGRmodules.png:', e);
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={() => console.log('JiGRmodules.png loaded successfully')}
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Expanded: Modules icon on left + 2x2 grid */}
                  <div className="flex items-center justify-between py-2 px-2">
                    {/* Modules icon - stays on left */}
                    <div className="flex-shrink-0">
                      <img 
                        src="/icons/JiGRmodules.png" 
                        alt="Modules" 
                        className="w-12 h-12 object-contain brightness-0 invert"
                        title="Modules - Access all application features"
                        onError={(e) => {
                          console.error('Failed to load JiGRmodules.png (expanded):', e);
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => console.log('JiGRmodules.png (expanded) loaded successfully')}
                      />
                    </div>
                    
                    {/* 3x3 Grid of module icons - centered */}
                    <div className="grid grid-cols-3 grid-rows-3 gap-1">
                      <div className="flex justify-center items-center p-1">
                        <img 
                          src="/icons/JiGRuploadWhite.png" 
                          alt="Upload Module" 
                          className="w-10 h-10 object-contain"
                          title="Upload Module - Document scanning and processing"
                        />
                      </div>
                      <div className="flex justify-center items-center p-1">
                        <img 
                          src="/icons/JiGRstockWhite.png" 
                          alt="Stock Module" 
                          className="w-10 h-10 object-contain opacity-30"
                          title="Stock Module - Inventory management and tracking"
                        />
                      </div>
                      <div className="flex justify-center items-center p-1">
                        <img 
                          src="/icons/JiGRtemp.png" 
                          alt="Temperature Module" 
                          className="w-10 h-10 object-contain opacity-30"
                          title="Temperature Module - Fridge and freezer monitoring"
                        />
                      </div>
                      <div className="flex justify-center items-center p-1">
                        <img 
                          src="/icons/JiGRrepairs.png" 
                          alt="Repairs Module" 
                          className="w-10 h-10 object-contain opacity-30"
                          title="Repairs Module - Equipment maintenance and repair tracking"
                        />
                      </div>
                      <div className="flex justify-center items-center p-1">
                        <img 
                          src="/icons/JiGRadmin2.png" 
                          alt="Admin Module" 
                          className="w-10 h-10 object-contain"
                          title="Admin Module - User management and system settings"
                        />
                      </div>
                      <div className="flex justify-center items-center p-1">
                        <img 
                          src="/icons/JiGRmenus.png" 
                          alt="Menus Module" 
                          className="w-10 h-10 object-contain opacity-30"
                          title="Menus Module - Menu management and recipe planning"
                        />
                      </div>
                      <div className="flex justify-center items-center p-1">
                        <img 
                          src="/icons/JiGRdiaryWhite.png" 
                          alt="Diary Module" 
                          className="w-10 h-10 object-contain opacity-30"
                          title="Diary Module - Daily logs and incident reporting"
                        />
                      </div>
                      <div className="flex justify-center items-center p-1">
                        <img 
                          src="/icons/JiGRrecipes.png" 
                          alt="Recipes Module" 
                          className="w-10 h-10 object-contain opacity-30"
                          title="Recipes Module - Recipe management and costing"
                        />
                      </div>
                      <div className="flex justify-center items-center p-1">
                        <img 
                          src="/icons/JiGRstocktake.png" 
                          alt="Stocktake Module" 
                          className="w-10 h-10 object-contain opacity-30"
                          title="Stocktake Module - Periodic inventory audits"
                        />
                      </div>
                    </div>
                    
                    {/* Right spacer for balance */}
                    <div className="flex-shrink-0 w-12"></div>
                  </div>
                </>
              )}
            </nav>
          </div>

          {/* Separator Line */}
          <div className="flex justify-center py-2">
            <div className="w-[60%] h-px bg-white/20"></div>
          </div>

          {/* BOTTOM THIRD: SETTINGS, USER AVATAR, VERSION */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="pb-4">
              <nav className={isCollapsed ? 'space-y-2' : 'space-y-1 px-3'}>
                <div className="flex justify-center items-center py-2">
                  <img 
                    src="/icons/JiGRadmin.png" 
                    alt="Settings" 
                    className="w-12 h-12 object-contain"
                    title="Settings - Configure system preferences"
                  />
                </div>
                
                {/* User Avatar */}
                <div className="flex justify-center items-center py-2">
                  <div 
                    className={`bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 overflow-hidden flex-shrink-0 w-12 h-12 ${
                      isCollapsed ? 'cursor-pointer hover:bg-white/30 transition-all duration-200' : ''
                    }`}
                    onClick={isCollapsed ? () => setIsCollapsed(false) : undefined}
                    title={isCollapsed ? 'Expand Sidebar' : 'User Profile'}
                  >
                    <span className="text-white font-bold text-lg">
                      {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
              </nav>
              
              {/* System Status Icon */}
              <div className={`flex items-center ${isCollapsed ? 'justify-center mb-2 mt-4' : 'justify-center mb-1 mt-8'}`}>
                <div className="flex items-center space-x-2" title="System Status - All services operational">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  {!isCollapsed && (
                    <span className="text-emerald-300 text-xs font-medium">
                      System Online
                    </span>
                  )}
                </div>
              </div>
              
              {/* Version Number */}
              <div className="text-center mb-4">
                <span className="text-white/30 text-xs font-mono" title="Application Version - v1.8.20">v1.8.20</span>
              </div>
            </div>
          </div>
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