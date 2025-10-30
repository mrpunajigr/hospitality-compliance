/**
 * ModuleHeader Light Variant
 * 
 * For use on dark backgrounds (like Upload module)
 * Uses light text and darker visual elements for optimal contrast
 */

'use client'

import Image from 'next/image'
import { getTextStyle } from '@/lib/design-system'
import { ModuleConfig } from '@/lib/module-config'

interface OnboardingData {
  userFirstName: string
}

interface ModuleHeaderLightProps {
  module: ModuleConfig
  currentPage: string
  className?: string
  onboardingData?: OnboardingData
}

export function ModuleHeaderLight({ 
  module, 
  currentPage, 
  className = '',
  onboardingData 
}: ModuleHeaderLightProps) {
  return (
    <div className={`mb-16 ${className}`}>
      {/* Module Icon and Title - Full Width */}
      <div className="flex items-center space-x-4 mb-6">
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
          <h1 className={`${getTextStyle('pageTitle')} text-white drop-shadow-lg text-4xl font-bold`}>
            {module.title}
          </h1>
          <p className="text-white/80 drop-shadow-md italic text-xs">
            {module.description}
          </p>
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
  )
}