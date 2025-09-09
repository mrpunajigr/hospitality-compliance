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
  // Route to appropriate variant based on module theme
  if (module.theme === 'dark') {
    // Dark theme = dark text for light backgrounds
    return (
      <ModuleHeaderDark 
        module={module}
        currentPage={currentPage}
        className={className}
      />
    )
  }
  
  // Default to light theme = light text for dark backgrounds
  return (
    <ModuleHeaderLight 
      module={module}
      currentPage={currentPage}
      className={className}
    />
  )
}