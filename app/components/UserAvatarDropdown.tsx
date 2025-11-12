'use client'

import { useEffect, useRef } from 'react'

interface UserAvatarDropdownProps {
  isOpen: boolean
  onClose: () => void
  user?: any
  userClient?: any
  onSignOut?: () => void
}

export function UserAvatarDropdown({ 
  isOpen, 
  onClose, 
  user, 
  userClient, 
  onSignOut 
}: UserAvatarDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close dropdown
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    // Add listeners with a small delay to prevent immediate closing
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscapeKey)
    }, 100)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Get user's first name only
  const getUserFirstName = () => {
    // Try user metadata full name first
    if (user?.user_metadata?.full_name) {
      const firstName = user.user_metadata.full_name.split(' ')[0]
      console.log('✅ Using first name from full_name:', firstName)
      return firstName
    }
    
    // Try user metadata name
    if (user?.user_metadata?.name) {
      const firstName = user.user_metadata.name.split(' ')[0]
      console.log('✅ Using first name from name:', firstName)
      return firstName
    }
    
    // Try userClient owner name  
    if (userClient?.owner_name) {
      const firstName = userClient.owner_name.split(' ')[0]
      console.log('✅ Using first name from owner_name:', firstName)
      return firstName
    }
    
    // Fallback to email username
    if (user?.email) {
      const emailName = user.email.split('@')[0]
      console.log('⚠️ Using email fallback:', emailName)
      return emailName
    }
    
    console.log('❌ No name found, using fallback')
    return 'User'
  }

  const getUserEmail = () => {
    return user?.email || 'No email'
  }

  const getCompanyName = () => {
    return userClient?.name || 'Company'
  }

  const getCompanyAddress = () => {
    return userClient?.address || 'No address specified'
  }

  return (
    <>
      {/* Dropdown Panel - Same positioning approach as HamburgerDropdown */}
      <div className="fixed right-6 z-50" style={{ top: '205px' }}>
        <div 
          ref={dropdownRef}
          className="w-80 bg-[#2d2e4a]/25 backdrop-blur-xl border border-white/30 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* User Header */}
          <div className="px-6 py-5 border-b border-white/10">
            <div className="flex items-center space-x-4">
              {/* User Avatar */}
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20">
                <img 
                  src={
                    user?.user_metadata?.avatar_url || 
                    user?.user_metadata?.picture || 
                    "https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/icons/JiGRlogo.png"
                  }
                  alt="User Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* User Info */}
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg leading-tight">
                  {getUserFirstName()}
                </h3>
                <p className="text-white/70 text-sm">
                  {getUserEmail()}
                </p>
                <p className="text-white/50 text-xs mt-1">
                  {getCompanyName()}
                </p>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="px-6 py-4 border-b border-white/10 bg-[#2d2e4a]/15">
            <h4 className="text-white/80 font-medium text-sm mb-2">Business Information</h4>
            <div className="space-y-1">
              <p className="text-white text-sm font-medium">{getCompanyName()}</p>
              <p className="text-white/60 text-xs leading-relaxed">{getCompanyAddress()}</p>
            </div>
          </div>
          
          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                // TODO: Navigate to profile settings
                console.log('Navigate to profile settings')
                onClose()
              }}
              className="w-full px-6 py-3 text-left text-white hover:bg-white/15 transition-all duration-200 flex items-center space-x-3"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Profile Settings</span>
            </button>
            
            <button
              onClick={() => {
                // TODO: Navigate to account settings
                console.log('Navigate to account settings')
                onClose()
              }}
              className="w-full px-6 py-3 text-left text-white hover:bg-white/15 transition-all duration-200 flex items-center space-x-3"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Account Settings</span>
            </button>

            <div className="mx-6 my-2 h-px bg-white/10"></div>
            
            <button
              onClick={() => {
                if (onSignOut) {
                  onSignOut()
                }
                onClose()
              }}
              className="w-full px-6 py-3 text-left text-red-400 hover:bg-red-400/10 transition-all duration-200 flex items-center space-x-3"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}