'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getStorageImageUrl, STORAGE_BUCKETS } from './image-storage'

// Module background mapping
const MODULE_BACKGROUNDS: Record<string, string> = {
  '/admin': 'backgrounds/Home-Chef-Chicago-8.webp',
  '/upload': 'backgrounds/chef-workspace.jpg',
  '/dashboard': 'backgrounds/kitchen-prep.jpg',
  // Add more as needed
}

// Default fallback
const DEFAULT_BACKGROUND = 'backgrounds/chef-workspace.jpg'

export function useModuleBackground() {
  const pathname = usePathname()
  
  useEffect(() => {
    // Determine which background to use based on current path
    const moduleKey = Object.keys(MODULE_BACKGROUNDS).find(key => 
      pathname.startsWith(key)
    )
    
    const backgroundPath = moduleKey 
      ? MODULE_BACKGROUNDS[moduleKey] 
      : DEFAULT_BACKGROUND
    
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
    
    // Apply to body element - works reliably on iOS 12
    document.body.style.backgroundImage = `url(${backgroundUrl})`
    document.body.style.backgroundSize = 'cover'
    document.body.style.backgroundPosition = 'center'
    document.body.style.backgroundRepeat = 'no-repeat'
    // DO NOT use backgroundAttachment: 'fixed' - not supported on iOS 12
    
    // Cleanup on unmount
    return () => {
      document.body.style.backgroundImage = ''
    }
  }, [pathname])
}