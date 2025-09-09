/**
 * ModuleHeader Dark Variant
 * 
 * For use on light backgrounds (like Admin module)
 * Uses dark text and lighter visual elements for optimal contrast
 */

'use client'

import Image from 'next/image'
import { getTextStyle } from '@/lib/design-system'
import { ModuleConfig } from '@/lib/module-config'

interface ModuleHeaderDarkProps {
  module: ModuleConfig
  currentPage: string
  className?: string
}

export function ModuleHeaderDark({ 
  module, 
  currentPage, 
  className = '' 
}: ModuleHeaderDarkProps) {
  return (
    <div className={`mb-16 ${className}`}>
      <div className="grid grid-cols-4 gap-6 items-center">
        {/* Module Icon and Title - Left Side (2 columns) */}
        <div className="flex items-center space-x-4 col-span-2">
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
            <h1 className={`${getTextStyle('pageTitle')} text-gray-900 drop-shadow-md text-4xl font-bold`}>
              {module.title}
            </h1>
            <p className="text-gray-700/90 drop-shadow-sm italic text-xs">
              {module.description}
            </p>
          </div>
        </div>
        
        {/* Navigation Pills - Center (1 column) */}
        <div className="flex justify-center">
          <div className="flex space-x-0.5 bg-white/30 p-0.5 rounded-full backdrop-blur-md border border-gray-300/40 w-full max-w-xs">
            {module.pages.map((page) => {
              const isActive = page.key === currentPage
              
              return (
                <a 
                  key={page.key}
                  href={page.href} 
                  className={`
                    flex-1 text-center px-2 py-1.5 font-semibold rounded-full transition-all duration-300 text-xs TouchTarget
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
        
        {/* Empty space - Right Side (1 column) */}
        <div></div>
      </div>
    </div>
  )
}