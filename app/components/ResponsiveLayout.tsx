'use client'

import { useDevice } from '@/contexts/DeviceContext'
import { ReactNode } from 'react'

interface ResponsiveLayoutProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

/**
 * Responsive layout wrapper that automatically adjusts content position
 * based on sidebar state and device type
 */
export function ResponsiveLayout({ children, className = '', style = {} }: ResponsiveLayoutProps) {
  const { contentOffset, isMobile, sidebarCollapsed } = useDevice()

  return (
    <div 
      className={`transition-all duration-300 ease-in-out ${className}`}
      style={{
        marginLeft: isMobile ? 0 : contentOffset, // Mobile uses overlay, tablet/desktop shifts content
        minHeight: '100vh',
        ...style // Merge with passed style
      }}
    >
      {children}
    </div>
  )
}

/**
 * Main content area wrapper for admin/upload layouts
 */
export function MainContent({ children, className = '' }: ResponsiveLayoutProps) {
  const { contentOffset, isMobile, isTablet, sidebarCollapsed } = useDevice()

  return (
    <main 
      className={`flex-1 transition-all duration-300 ease-in-out ${className}`}
      style={{
        marginLeft: isMobile ? 0 : contentOffset,
        width: isMobile ? '100%' : `calc(100% - ${contentOffset}px)`,
        paddingLeft: isTablet && !sidebarCollapsed ? '1rem' : '0'
      }}
    >
      {children}
    </main>
  )
}

/**
 * Page container that works with sidebar offset
 */
export function PageContainer({ children, className = '' }: ResponsiveLayoutProps) {
  const { contentOffset, isMobile } = useDevice()

  return (
    <div 
      className={`min-h-screen ${className}`}
      style={{
        marginLeft: isMobile ? 0 : contentOffset,
        transition: 'margin-left 300ms ease-in-out'
      }}
    >
      {children}
    </div>
  )
}