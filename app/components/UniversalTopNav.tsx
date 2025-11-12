'use client'

import { useState } from 'react'
import { HamburgerDropdown } from './HamburgerDropdown'
import { UserAvatarDropdown } from './UserAvatarDropdown'

interface UniversalTopNavProps {
  moduleTitle: string
  moduleName: string // For module switching
  user?: any
  userClient?: any
  onSignOut?: () => void
}

export function UniversalTopNav({ 
  moduleTitle, 
  moduleName, 
  user, 
  userClient, 
  onSignOut 
}: UniversalTopNavProps) {
  const [showHamburgerDropdown, setShowHamburgerDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  // Get user avatar - prioritize user metadata, fallback to default
  const getUserAvatar = () => {
    if (user?.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url
    }
    if (user?.user_metadata?.picture) {
      return user.user_metadata.picture
    }
    // Default avatar
    return "https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRlogo.png"
  }

  return (
    <>
      {/* Fixed Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/20">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Module Title */}
          <h1 className="text-white text-xl font-bold tracking-wide">
            {moduleTitle}
          </h1>

          {/* Right Side: Hamburger + User Avatar */}
          <div className="flex items-center space-x-4">
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setShowHamburgerDropdown(!showHamburgerDropdown)}
              className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 TouchTarget"
              title="Navigation Menu"
            >
              <img 
                src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/hamburger.png"
                alt="Menu" 
                className="w-6 h-6 object-contain brightness-0 invert"
              />
            </button>

            {/* User Avatar */}
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="relative"
              title="User Menu"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/40 transition-all duration-200">
                <img 
                  src={getUserAvatar()}
                  alt="User Avatar" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to default if avatar fails to load
                    e.currentTarget.src = "https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRlogo.png"
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Dropdowns */}
      <HamburgerDropdown 
        isOpen={showHamburgerDropdown}
        onClose={() => setShowHamburgerDropdown(false)}
        currentModule={moduleName}
      />
      
      <UserAvatarDropdown 
        isOpen={showUserDropdown}
        onClose={() => setShowUserDropdown(false)}
        user={user}
        userClient={userClient}
        onSignOut={onSignOut}
      />

      {/* Content Spacer - Push content below fixed nav */}
      <div className="h-20"></div>
    </>
  )
}