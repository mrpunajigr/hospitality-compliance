'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DesignTokens, getTextStyle } from '@/lib/design-system'
import { getMappedIcon, getUIIcon } from '@/lib/image-storage'
import { 
  UserRole, 
  getVisibleNavigation, 
  getRoleDisplayInfo,
  hasPermission,
  canAccessModule,
  NAVIGATION_CONFIG 
} from '@/lib/navigation-permissions'

interface RoleBasedSidebarProps {
  user?: any
  userClient?: any
  userRole: UserRole
  onSignOut?: () => void
  logoUrl?: string
  activeSection: 'admin' | 'console' | 'upload'
  currentUploadPage?: 'console' | 'capture' | 'reports' | 'training'
  onBackgroundSelectorToggle?: () => void
}

export default function RoleBasedSidebar({ 
  user, 
  userClient, 
  userRole,
  onSignOut, 
  logoUrl, 
  activeSection,
  currentUploadPage,
  onBackgroundSelectorToggle 
}: RoleBasedSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isPortrait, setIsPortrait] = useState(true)
  const [isIPad, setIsIPad] = useState(false)

  // Get role display info
  const roleInfo = getRoleDisplayInfo(userRole)

  useEffect(() => {
    const checkDeviceAndOrientation = () => {
      const mobile = window.innerWidth < 768
      const iPad = window.innerWidth >= 768 && window.innerWidth <= 1024
      const portrait = window.innerHeight > window.innerWidth
      
      setIsMobile(mobile)
      setIsIPad(iPad)
      setIsPortrait(portrait)
      
      // iPad adaptive behavior
      if (iPad) {
        setIsCollapsed(portrait)
      } else {
        setIsCollapsed(true)
      }
    }
    
    checkDeviceAndOrientation()
    window.addEventListener('resize', checkDeviceAndOrientation)
    window.addEventListener('orientationchange', checkDeviceAndOrientation)
    return () => {
      window.removeEventListener('resize', checkDeviceAndOrientation)
      window.removeEventListener('orientationchange', checkDeviceAndOrientation)
    }
  }, [])

  // Get filtered navigation items based on user role
  const quickActionItems = getVisibleNavigation(userRole, 'quickActions', activeSection)
  const moduleItems = getVisibleNavigation(userRole, 'modules', activeSection)
  const settingsItems = getVisibleNavigation(userRole, 'settings', activeSection)

  return (
    <>
      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full bg-black/10 backdrop-blur-xl transition-all duration-300 ease-in-out z-40 TouchTarget ${
          isCollapsed ? 'w-[150px] shadow-lg' : 'w-[400px] shadow-[0_0_50px_rgba(0,0,0,0.5)]'
        } ${isIPad ? 'AppleSidebar' : ''}`}
        onTouchStart={() => isIPad && !isPortrait && setIsCollapsed(false)}
      >
        
        {/* Header Section */}
        <div className="py-4 border-b border-white/10">
          <div className="flex flex-col items-center space-y-3">
            
            {/* Company Logo */}
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 overflow-hidden">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Company Logo" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-xl">
                  {userClient?.name?.charAt(0) || 'C'}
                </span>
              )}
            </div>
            
            {/* Role Badge - Always visible */}
            <div className={`px-3 py-1 rounded-full text-white text-xs font-medium ${roleInfo.color} shadow-lg`}>
              {roleInfo.label}
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 flex flex-col">
          
          {/* TOP SECTION: CAMERA QUICK ACTION */}
          <div className="py-4">
            <nav className={isCollapsed ? 'space-y-2 px-2' : 'space-y-1 px-3'}>
              <button 
                onClick={() => {
                  window.location.href = '/upload/capture'
                  setTimeout(() => {
                    const cameraButton = document.querySelector('[data-camera-trigger]') as HTMLButtonElement
                    if (cameraButton) cameraButton.click()
                  }, 500)
                }}
                className={`flex ${isCollapsed ? 'justify-center' : 'items-center'} py-3 hover:bg-white/10 rounded-lg transition-all duration-200 w-full TouchTarget ${
                  isIPad ? 'min-h-[44px]' : ''
                }`}
                title="Quick Camera - Capture documents instantly"
              >
                <img 
                  src={getMappedIcon('JiGRcamera', isCollapsed ? 40 : 32)} 
                  alt="Camera" 
                  className={isCollapsed ? 'w-10 h-10 object-contain' : 'w-8 h-8 object-contain mr-3'}
                />
                {!isCollapsed && (
                  <span className="text-white text-sm font-medium">Quick Capture</span>
                )}
              </button>
            </nav>
          </div>

          {/* Separator */}
          <div className="flex justify-center py-2">
            <div className="w-[60%] h-px bg-white/20"></div>
          </div>

          {/* MIDDLE SECTION: MODULES - Takes remaining space */}
          <div className="flex-1 flex flex-col justify-center py-4">
            <nav className={isCollapsed ? 'space-y-2 px-2' : 'space-y-1 px-3'}>
              {isCollapsed ? (
                /* Collapsed: Show modules icon */
                <div 
                  className="flex justify-center items-center py-3 cursor-pointer hover:bg-white/10 rounded-lg transition-all duration-200"
                  onClick={() => setIsCollapsed(false)}
                  title={`Modules (${roleInfo.label})`}
                >
                  <img 
                    src={getMappedIcon('JiGRmodules', 40)} 
                    alt="Modules" 
                    className="w-10 h-10 object-contain brightness-0 invert"
                  />
                </div>
              ) : (
                /* Expanded: Show available modules grid */
                <div 
                  className="bg-white/5 rounded-xl p-4"
                  onMouseLeave={() => setIsCollapsed(true)}
                >
                  <div className="flex items-center mb-3">
                    <img 
                      src={getMappedIcon('JiGRmodules', 32)} 
                      alt="Modules" 
                      className="w-8 h-8 object-contain brightness-0 invert mr-3"
                    />
                    <span className="text-white font-medium text-sm">Available Modules</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {/* Upload Module - Always available */}
                    <button
                      onClick={() => window.location.href = '/upload/console'}
                      className="flex flex-col items-center p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
                      title="Upload Module"
                    >
                      <img src={getMappedIcon('JiGRuploadWhite', 32)} alt="Upload" className="w-8 h-8 object-contain" />
                      <span className="text-xs text-white/70 mt-1">Upload</span>
                    </button>

                    {/* Admin Module - Manager+ only */}
                    {hasPermission(userRole, 'canAccessAdmin') && (
                      <button
                        onClick={() => window.location.href = '/admin/console'}
                        className="flex flex-col items-center p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
                        title="Admin Module"
                      >
                        <img src={getMappedIcon('JiGRadmin2', 32)} alt="Admin" className="w-8 h-8 object-contain" />
                        <span className="text-xs text-white/70 mt-1">Admin</span>
                      </button>
                    )}

                    {/* Temperature Module - Supervisor+ */}
                    {canAccessModule(userRole, 'temperature') && (
                      <div className="flex flex-col items-center p-2 opacity-50" title="Temperature Module (Coming Soon)">
                        <img src={getMappedIcon('JiGRtemp', 32)} alt="Temperature" className="w-8 h-8 object-contain" />
                        <span className="text-xs text-white/70 mt-1">Temp</span>
                      </div>
                    )}

                    {/* Stock Module - Manager+ */}
                    {canAccessModule(userRole, 'stock') && (
                      <div className="flex flex-col items-center p-2 opacity-50" title="Stock Module (Coming Soon)">
                        <img src={getMappedIcon('JiGRstockWhite', 32)} alt="Stock" className="w-8 h-8 object-contain" />
                        <span className="text-xs text-white/70 mt-1">Stock</span>
                      </div>
                    )}

                    {/* Repairs Module - Manager+ */}
                    {canAccessModule(userRole, 'repairs') && (
                      <div className="flex flex-col items-center p-2 opacity-50" title="Repairs Module (Coming Soon)">
                        <img src={getMappedIcon('JiGRrepairs', 32)} alt="Repairs" className="w-8 h-8 object-contain" />
                        <span className="text-xs text-white/70 mt-1">Repairs</span>
                      </div>
                    )}

                    {/* Menus Module - Manager+ */}
                    {canAccessModule(userRole, 'menus') && (
                      <div className="flex flex-col items-center p-2 opacity-50" title="Menus Module (Coming Soon)">
                        <img src={getMappedIcon('JiGRmenus', 32)} alt="Menus" className="w-8 h-8 object-contain" />
                        <span className="text-xs text-white/70 mt-1">Menus</span>
                      </div>
                    )}

                    {/* Diary Module - Supervisor+ */}
                    {canAccessModule(userRole, 'diary') && (
                      <div className="flex flex-col items-center p-2 opacity-50" title="Diary Module (Coming Soon)">
                        <img src={getMappedIcon('JiGRdiaryWhite', 32)} alt="Diary" className="w-8 h-8 object-contain" />
                        <span className="text-xs text-white/70 mt-1">Diary</span>
                      </div>
                    )}

                    {/* Recipes Module - Owner only */}
                    {canAccessModule(userRole, 'recipes') && (
                      <div className="flex flex-col items-center p-2 opacity-50" title="Recipes Module (Coming Soon)">
                        <img src={getMappedIcon('JiGRrecipes', 32)} alt="Recipes" className="w-8 h-8 object-contain" />
                        <span className="text-xs text-white/70 mt-1">Recipes</span>
                      </div>
                    )}

                    {/* Stocktake Module - Owner only */}
                    {canAccessModule(userRole, 'stocktake') && (
                      <div className="flex flex-col items-center p-2 opacity-50" title="Stocktake Module (Coming Soon)">
                        <img src={getMappedIcon('JiGRstocktake', 32)} alt="Stocktake" className="w-8 h-8 object-contain" />
                        <span className="text-xs text-white/70 mt-1">Stock</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-white/50 mt-2 text-center">
                    {roleInfo.description}
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>

        {/* BOTTOM SECTION: Anchored to bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="pb-4 pt-4">
            <nav className={isCollapsed ? 'space-y-3 px-2' : 'space-y-2 px-3'}>
              
              {/* Admin Access - Manager+ only */}
              {hasPermission(userRole, 'canAccessAdmin') && (
                <button 
                  onClick={() => window.location.href = '/admin/console'}
                  className={`flex ${isCollapsed ? 'justify-center' : 'items-center'} py-2 hover:bg-white/10 rounded-lg transition-all duration-200 w-full`}
                  title="Admin Console"
                >
                  <img 
                    src={getMappedIcon('JiGRadmin', 40)} 
                    alt="Admin" 
                    className={isCollapsed ? 'w-10 h-10 object-contain' : 'w-8 h-8 object-contain mr-3'}
                  />
                  {!isCollapsed && (
                    <span className="text-white text-sm font-medium">Admin</span>
                  )}
                </button>
              )}
              
              {/* User Profile */}
              <button
                onClick={() => window.location.href = '/admin/profile'}
                className={`flex ${isCollapsed ? 'justify-center' : 'items-center'} py-2 hover:bg-white/10 rounded-lg transition-all duration-200 w-full`}
                title="User Profile"
              >
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <span className="text-white font-bold text-base">
                    {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || userRole.charAt(0)}
                  </span>
                </div>
                {!isCollapsed && (
                  <span className="text-white text-sm font-medium ml-3">Profile</span>
                )}
              </button>
            </nav>
            
            {/* System Status & Version */}
            <div className={`flex items-center ${isCollapsed ? 'justify-center mt-4' : 'justify-center mt-6'}`}>
              <div className="flex items-center space-x-2" title="System Status - All services operational">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                {!isCollapsed && (
                  <span className="text-emerald-300 text-xs font-medium">
                    System Online
                  </span>
                )}
              </div>
            </div>
            
            <div className="text-center mt-2">
              <span className="text-white/30 text-xs font-mono" title="Application Version">v1.9.4.001</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay when sidebar is expanded */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 transition-opacity duration-300"
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