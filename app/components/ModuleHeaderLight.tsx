/**
 * ModuleHeader Light Variant
 * 
 * For use on dark backgrounds (like Upload module)
 * Uses light text and darker visual elements for optimal contrast
 */

'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { getTextStyle } from '@/lib/design-system'
import { ModuleConfig } from '@/lib/module-config'
import { HamburgerDropdown } from './HamburgerDropdown'
import { UserAvatarDropdown } from './UserAvatarDropdown'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/console-utils'

interface OnboardingData {
  userFirstName: string
}

interface ModuleHeaderLightProps {
  module: ModuleConfig
  currentPage: string
  className?: string
  onboardingData?: OnboardingData
  user?: any
  userClient?: any
  onSignOut?: () => void
}

export function ModuleHeaderLight({ 
  module, 
  currentPage, 
  className = '',
  onboardingData,
  user,
  userClient,
  onSignOut
}: ModuleHeaderLightProps) {
  const [showHamburgerDropdown, setShowHamburgerDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)

  // Copy exact avatar loading logic from ModuleHeaderDark
  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (user?.id) {
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('id', user.id)
            .single()
          
          if (profileData?.avatar_url) {
            setUserAvatar(profileData.avatar_url)
            logger.debug('MODULE HEADER LIGHT: User avatar loaded from profiles table:', profileData.avatar_url)
          } else {
            logger.debug('MODULE HEADER LIGHT: No avatar found in profiles table')
          }
        } catch (error) {
          logger.debug('MODULE HEADER LIGHT: Could not fetch user avatar', error)
        }
      }
    }
    
    fetchUserAvatar()

    // Listen for avatar updates (same as sidebar)
    const handleAvatarUpdate = (event: any) => {
      const { avatarUrl } = event.detail
      setUserAvatar(avatarUrl)
      logger.debug('MODULE HEADER LIGHT: Avatar updated via event:', avatarUrl)
    }

    window.addEventListener('userAvatarUpdated', handleAvatarUpdate)
    
    return () => {
      window.removeEventListener('userAvatarUpdated', handleAvatarUpdate)
    }
  }, [user?.id])

  return (
    <>
      <div className={`mb-16 ${className}`}>
      {/* Module Icon, Title, and Navigation Controls */}
      <div className="flex items-center justify-between mb-6">
        {/* Left Side: Icon + Title */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Image 
              src={module.iconUrl} 
              alt={`${module.title} Module`} 
              width={96} 
              height={96}
              className="object-contain"
              unoptimized={module.key === 'admin'}
            />
          </div>
          <div>
            <h1 className={`${getTextStyle('pageTitle')} text-[#2d2e4a] drop-shadow-lg text-4xl font-bold`}>
              {module.title}
            </h1>
            <p className="text-[#2d2e4a]/80 drop-shadow-md italic text-xs">
              {module.description}
            </p>
          </div>
        </div>

        {/* Right Side: Hamburger Menu + User Avatar */}
        <div className="flex items-center space-x-4">
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setShowHamburgerDropdown(!showHamburgerDropdown)}
            className="p-3 hover:bg-white/10 rounded-lg transition-all duration-200 TouchTarget border border-white/20"
            title="Navigation Menu"
          >
            <img 
              src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/hamburger.png"
              alt="Menu" 
              className="w-6 h-6 object-contain"
            />
          </button>

          {/* User Avatar - Clickable with dropdown */}
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="relative"
            title={`User Profile - Edit your profile information${userClient?.champion_enrolled ? ' | Hero User' : ''}`}
          >
            <div className="bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 overflow-hidden flex-shrink-0 w-12 h-12 cursor-pointer hover:bg-white/30 transition-all duration-200">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt="User Avatar" 
                  className="w-full h-full object-cover"
                  onLoad={() => logger.debug('MODULE HEADER LIGHT: User avatar loaded successfully')}
                  onError={() => logger.debug('MODULE HEADER LIGHT: User avatar failed to load, showing initials')}
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            
            {/* Hero Badge - same as sidebar */}
            {userClient?.champion_enrolled && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
                <img 
                  src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/trophy.svg"
                  alt="Hero"
                  className="w-4 h-4 object-contain"
                />
              </div>
            )}
          </button>
        </div>
      </div>
      
      {/* Navigation Pills - Below Title, Left Aligned */}
      <div className="flex justify-start mb-8">
        <div className="flex space-x-0.5 bg-black/20 p-0.5 rounded-full backdrop-blur-md border border-white/20 w-full max-w-md">
          {module.pages.map((page) => {
            const isActive = page.key === currentPage
            
            return (
              <a 
                key={page.key}
                href={page.href} 
                className={`
                  flex-1 text-center px-3 py-2 font-semibold rounded-full transition-all duration-300 text-sm TouchTarget
                  ${isActive 
                    ? 'text-black bg-white shadow-lg' 
                    : 'text-white/90 hover:text-white hover:bg-white/20 font-medium'
                  }
                `}
              >
                {page.label}
              </a>
            )
          })}
        </div>
      </div>
    </div>

    {/* Dropdowns - Both hamburger and user avatar */}
    <HamburgerDropdown 
      isOpen={showHamburgerDropdown}
      onClose={() => setShowHamburgerDropdown(false)}
      currentModule={module.key}
    />
    
    <UserAvatarDropdown
      isOpen={showUserDropdown}
      onClose={() => setShowUserDropdown(false)}
      user={user}
      userClient={userClient}
      onSignOut={onSignOut}
    />
    </>
  )
}