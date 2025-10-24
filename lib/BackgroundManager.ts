'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getStorageImageUrl, STORAGE_BUCKETS } from './image-storage'

// Module background mapping - Order matters! More specific paths first
const MODULE_BACKGROUNDS: Record<string, string> = {
  '/admin': 'backgrounds/Home-Chef-Chicago-8.webp',
  '/upload': 'backgrounds/chef-workspace.jpg',
  '/dashboard': 'backgrounds/kitchen-prep.jpg',
  '/login': 'backgrounds/CafeWindow.jpg',
  '/register': 'backgrounds/CafeWindow.jpg',
  // Add more as needed
}

// Exact path matches for public pages
const EXACT_PATH_BACKGROUNDS: Record<string, string> = {
  '/': 'backgrounds/restaurant.jpg', // Landing page only
}

// Default fallback
const DEFAULT_BACKGROUND = 'backgrounds/chef-workspace.jpg'

export function useModuleBackground() {
  const pathname = usePathname()
  
  useEffect(() => {
    // Check exact matches first
    let backgroundPath = EXACT_PATH_BACKGROUNDS[pathname]
    
    // If no exact match, check module prefixes
    if (!backgroundPath) {
      const moduleKey = Object.keys(MODULE_BACKGROUNDS).find(key => 
        pathname.startsWith(key)
      )
      backgroundPath = moduleKey ? MODULE_BACKGROUNDS[moduleKey] : DEFAULT_BACKGROUND
    }
    
    // Debug logging
    console.log('🎨 BackgroundManager:', {
      pathname,
      backgroundPath,
      exact: !!EXACT_PATH_BACKGROUNDS[pathname]
    })
    
    const backgroundUrl = getStorageImageUrl(
      STORAGE_BUCKETS.MODULE_ASSETS,
      backgroundPath,
      {
        format: 'webp',
        quality: 75,
        width: 1920,
        height: 1080
      }
    )
    
    console.log('🎨 Generated background URL:', backgroundUrl)
    
    // Apply to body element - works reliably on iOS 12
    document.body.style.backgroundImage = `url(${backgroundUrl})`
    document.body.style.backgroundSize = 'cover'
    document.body.style.backgroundPosition = 'center'
    document.body.style.backgroundRepeat = 'no-repeat'
    // DO NOT use backgroundAttachment: 'fixed' - not supported on iOS 12
    
    console.log('🎨 Applied background to body:', document.body.style.backgroundImage)
    
    // Cleanup on unmount
    return () => {
      document.body.style.backgroundImage = ''
    }
  }, [pathname])
}