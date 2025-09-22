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

interface OnboardingData {
  userFirstName: string
}

interface ModuleHeaderDarkProps {
  module: ModuleConfig
  currentPage: string
  className?: string
  onboardingData?: OnboardingData
}

export function ModuleHeaderDark({ 
  module, 
  currentPage, 
  className = '',
  onboardingData 
}: ModuleHeaderDarkProps) {
  console.log('🔍 ModuleHeaderDark rendering:', {
    moduleKey: module.key,
    moduleTitle: module.title,
    currentPage,
    pagesCount: module.pages?.length,
    pages: module.pages
  })
  
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
            <h1 className="text-black drop-shadow-md text-4xl font-bold">
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
  )
}