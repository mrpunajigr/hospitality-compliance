/**
 * ModuleHeader Dark Variant
 * 
 * For use on light backgrounds (like Admin module)
 * Uses dark text and lighter visual elements for optimal contrast
 */

'use client'

import Image from 'next/image'
import { useState, useContext, useEffect } from 'react'
import { getTextStyle } from '@/lib/design-system'
import { ModuleConfig } from '@/lib/module-config'
import { HamburgerDropdown } from './HamburgerDropdown'
import { UserAvatarDropdown } from './UserAvatarDropdown'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/console-utils'

interface OnboardingData {
  userFirstName: string
}

interface ModuleHeaderDarkProps {
  module: ModuleConfig
  currentPage: string
  className?: string
  onboardingData?: OnboardingData
  user?: any
  userClient?: any
  onSignOut?: () => void
}

export function ModuleHeaderDark({ 
  module, 
  currentPage, 
  className = '',
  onboardingData,
  user,
  userClient,
  onSignOut
}: ModuleHeaderDarkProps) {
  const [showHamburgerDropdown, setShowHamburgerDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)

  // Copy exact avatar loading logic from AppleSidebar
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
            logger.debug('MODULE HEADER: User avatar loaded from profiles table:', profileData.avatar_url)
          } else {
            logger.debug('MODULE HEADER: No avatar found in profiles table')
          }
        } catch (error) {
          logger.debug('MODULE HEADER: Could not fetch user avatar', error)
        }
      }
    }
    
    fetchUserAvatar()

    // Listen for avatar updates (same as sidebar)
    const handleAvatarUpdate = (event: any) => {
      const { avatarUrl } = event.detail
      setUserAvatar(avatarUrl)
      logger.debug('MODULE HEADER: Avatar updated via event:', avatarUrl)
    }

    window.addEventListener('userAvatarUpdated', handleAvatarUpdate)
    
    return () => {
      window.removeEventListener('userAvatarUpdated', handleAvatarUpdate)
    }
  }, [user?.id])
  console.log('🔍 ModuleHeaderDark rendering:', {
    moduleKey: module.key,
    moduleTitle: module.title,
    currentPage,
    pagesCount: module.pages?.length,
    pages: module.pages
  })
  
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
            <h1 className="text-black drop-shadow-md text-4xl font-bold">
              {module.title}
            </h1>
            <p className="text-gray-700/90 drop-shadow-sm italic text-xs">
              {module.description}
            </p>
          </div>
        </div>

        {/* Right Side: Hamburger + User Avatar */}
        <div className="flex items-center space-x-4">
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setShowHamburgerDropdown(!showHamburgerDropdown)}
            className="p-3 hover:bg-black/10 rounded-lg transition-all duration-200 TouchTarget border border-gray-300/40"
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
                  onLoad={() => logger.debug('MODULE HEADER: User avatar loaded successfully')}
                  onError={() => logger.debug('MODULE HEADER: User avatar failed to load, showing initials')}
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
        <div className="flex space-x-0.5 bg-white/30 p-0.5 rounded-full backdrop-blur-md border border-gray-300/40 w-full max-w-md">
          {module.pages.map((page) => {
            const isActive = page.key === currentPage
            
            return (
              <a 
                key={page.key}
                href={page.href} 
                className={`
                  flex-1 text-center px-3 py-2 font-semibold rounded-full transition-all duration-300 text-sm TouchTarget
                  ${isActive 
                    ? 'text-white bg-gray-900 shadow-lg' 
                    : 'text-gray-800/90 hover:text-gray-900 hover:bg-gray-200/40 font-medium'
                  }
                `}
              >
                {page.label}
              </a>
            )
          })}
        </div>
      </div>
      
      {/* Onboarding Welcome Section */}
      {onboardingData && (
        <div className="text-center mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
            <span className="text-2xl">👋</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to JiGR, {onboardingData.userFirstName}! 👋
          </h1>
          <p className="text-gray-600 mb-6">
            Let&apos;s personalize your compliance experience!
          </p>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <span className="ml-2 text-sm text-green-600 font-medium">Account Created</span>
            </div>
            <div className="w-12 h-0.5 bg-blue-500"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <span className="ml-2 text-sm text-blue-600 font-medium">Your Profile</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-bold">3</span>
              </div>
              <span className="ml-2 text-sm text-gray-500 font-medium">Company Setup</span>
            </div>
          </div>
        </div>
      )}
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