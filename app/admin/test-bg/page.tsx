'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminBackgroundTest() {
  const pathname = usePathname()
  const [backgroundInfo, setBackgroundInfo] = useState<any>({})

  useEffect(() => {
    // Capture what the BackgroundManager would do
    const MODULE_BACKGROUNDS: Record<string, string> = {
      '/admin': 'backgrounds/Home-Chef-Chicago-8.webp',
      '/upload': 'backgrounds/chef-workspace.jpg',
      '/dashboard': 'backgrounds/kitchen-prep.jpg',
      '/login': 'backgrounds/CafeWindow.jpg',
      '/register': 'backgrounds/CafeWindow.jpg',
    }

    const moduleKey = Object.keys(MODULE_BACKGROUNDS).find(key => 
      pathname.startsWith(key)
    )
    
    const backgroundPath = moduleKey 
      ? MODULE_BACKGROUNDS[moduleKey] 
      : 'backgrounds/chef-workspace.jpg'

    setBackgroundInfo({
      pathname,
      moduleKey,
      backgroundPath,
      bodyBackground: document.body.style.backgroundImage,
      timestamp: new Date().toLocaleTimeString()
    })
  }, [pathname])

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-white mb-4">Admin Background Test</h1>
      
      <div className="bg-white/10 p-6 rounded-lg mb-4">
        <p className="text-white">
          This page should show the admin background (Home-Chef-Chicago-8.webp).
        </p>
        <p className="text-white mt-2">
          URL: {typeof window !== 'undefined' ? window.location.href : 'Loading...'}
        </p>
      </div>

      <div className="bg-red-500/20 p-6 rounded-lg">
        <h2 className="text-white font-bold mb-2">Debug Info:</h2>
        <pre className="text-white text-sm">
          {JSON.stringify(backgroundInfo, null, 2)}
        </pre>
      </div>
    </div>
  )
}