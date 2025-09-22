/**
 * Smart ModuleHeader Router Component
 * 
 * Routes to the appropriate header variant based on module theme:
 * - Light backgrounds (Admin) → ModuleHeaderDark (dark text)
 * - Dark backgrounds (Upload) → ModuleHeaderLight (light text)
 */

'use client'

import { ModuleConfig } from '@/lib/module-config'
import { ModuleHeaderDark } from './ModuleHeaderDark'
import { ModuleHeaderLight } from './ModuleHeaderLight'

interface OnboardingData {
  userFirstName: string
}

interface ModuleHeaderProps {
  module: ModuleConfig
  currentPage: string
  className?: string
  onboardingData?: OnboardingData
}

export function ModuleHeader({ 
  module, 
  currentPage, 
  className = '',
  onboardingData 
}: ModuleHeaderProps) {
  // Route to appropriate variant based on module theme
  if (module.theme === 'dark') {
    // Dark theme = dark text for light backgrounds
    return (
      <ModuleHeaderDark 
        module={module}
        currentPage={currentPage}
        className={className}
        onboardingData={onboardingData}
      />
    )
  }
  
  // Default to light theme = light text for dark backgrounds
  return (
    <ModuleHeaderLight 
      module={module}
      currentPage={currentPage}
      className={className}
      onboardingData={onboardingData}
    />
  )
}