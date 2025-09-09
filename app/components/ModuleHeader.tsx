/**
 * Standardized Module Header Component
 * 
 * Provides consistent header design across all hospitality compliance modules
 * with module icon, title, description, and 3-page navigation pills.
 */

'use client'

import Image from 'next/image'
import { getTextStyle } from '@/lib/design-system'
import { ModuleConfig } from '@/lib/module-config'

interface ModuleHeaderProps {
  module: ModuleConfig
  currentPage: string
  className?: string
}

export function ModuleHeader({ 
  module, 
  currentPage, 
  className = '' 
}: ModuleHeaderProps) {
  return (
    <div className={`mb-16 ${className}`}>
      <div className="grid grid-cols-4 gap-6 items-center">
        {/* Module Icon and Title - Left Side (2 columns) */}
        <div className="flex items-center space-x-4 col-span-2">
          <Image 
            src={module.iconUrl} 
            alt={`${module.title} Module`} 
            width={96} 
            height={96}
            className="object-contain"
            unoptimized={module.key === 'admin'}
            onError={(e) => console.error('Image failed to load:', module.iconUrl, e)}
          />
          <div>
            <h1 className={`${getTextStyle('pageTitle')} text-white drop-shadow-lg text-4xl font-bold`}>
              {module.title}
            </h1>
            <p className="text-white/80 drop-shadow-md italic text-xs">
              {module.description}
            </p>
          </div>
        </div>
        
        {/* Navigation Pills - Center (1 column) */}
        <div className="flex justify-center">
          <div className="flex space-x-0.5 bg-black/20 p-0.5 rounded-full backdrop-blur-md border border-white/20 w-full max-w-xs">
            {module.pages.map((page) => {
              const isActive = page.key === currentPage
              
              return (
                <a 
                  key={page.key}
                  href={page.href} 
                  className={`
                    flex-1 text-center px-2 py-1.5 font-semibold rounded-full transition-all duration-300 text-xs TouchTarget
                    ${isActive 
                      ? 'text-black bg-white' 
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
        
        {/* Empty space - Right Side (1 column) */}
        <div></div>
      </div>
    </div>
  )
}

export default ModuleHeader