// Reusable styled components using the centralized design system
import React from 'react'
import { DesignTokens, getCardStyle, getTextStyle, getFormFieldStyle } from './design-system'

/**
 * Pre-styled card component variants
 */
export const StyledCard = {
  Primary: ({ children, className = '', ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => 
    React.createElement('div', { 
      className: `${getCardStyle('primary')} ${className}`, 
      ...props 
    }, children),
    
  Secondary: ({ children, className = '', ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => 
    React.createElement('div', { 
      className: `${getCardStyle('secondary')} ${className}`, 
      ...props 
    }, children),
    
  Form: ({ children, className = '', ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => 
    React.createElement('div', { 
      className: `${getCardStyle('form')} ${className}`, 
      ...props 
    }, children),
    
  Sidebar: ({ children, className = '', ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => 
    React.createElement('div', { 
      className: `${getCardStyle('sidebar')} ${className}`, 
      ...props 
    }, children)
}

/**
 * Pre-styled text component variants
 */
export const StyledText = {
  PageTitle: ({ children, className = '', ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => 
    React.createElement('h1', { 
      className: `${getTextStyle('pageTitle')} ${className}`, 
      ...props 
    }, children),
    
  SectionTitle: ({ children, className = '', ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => 
    React.createElement('h2', { 
      className: `${getTextStyle('sectionTitle')} ${className}`, 
      ...props 
    }, children),
    
  CardTitle: ({ children, className = '', ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => 
    React.createElement('h3', { 
      className: `${getTextStyle('cardTitle')} ${className}`, 
      ...props 
    }, children),
    
  Body: ({ children, className = '', ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => 
    React.createElement('p', { 
      className: `${getTextStyle('body')} ${className}`, 
      ...props 
    }, children),
    
  BodySecondary: ({ children, className = '', ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => 
    React.createElement('p', { 
      className: `${getTextStyle('bodySecondary')} ${className}`, 
      ...props 
    }, children),
    
  Caption: ({ children, className = '', ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => 
    React.createElement('span', { 
      className: `${getTextStyle('caption')} ${className}`, 
      ...props 
    }, children),
    
  Version: ({ children, className = '', ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => 
    React.createElement('span', { 
      className: `${getTextStyle('version')} ${className}`, 
      ...props 
    }, children),
    
  InputLabel: ({ children, className = '', ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => 
    React.createElement('label', { 
      className: `${getTextStyle('inputLabel')} ${className}`, 
      ...props 
    }, children)
}

/**
 * Pre-styled form component variants
 */
export const StyledForm = {
  Input: ({ className = '', ...props }: { className?: string, [key: string]: any }) => 
    React.createElement('input', { 
      className: `${getFormFieldStyle()} ${className}`, 
      ...props 
    }),
    
  Select: ({ className = '', children, ...props }: { className?: string, children: React.ReactNode, [key: string]: any }) => 
    React.createElement('select', { 
      className: `${getFormFieldStyle()} ${className}`, 
      ...props 
    }, children),
    
  Textarea: ({ className = '', ...props }: { className?: string, [key: string]: any }) => 
    React.createElement('textarea', { 
      className: `${getFormFieldStyle()} ${className}`, 
      ...props 
    })
}

/**
 * Common layout patterns
 */
export const LayoutPatterns = {
  /**
   * Standard page wrapper with proper spacing
   */
  pageWrapper: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8',
  
  /**
   * Grid layouts for different content types
   */
  cardGrid: 'grid gap-6 md:grid-cols-2 lg:grid-cols-3',
  formGrid: 'grid gap-6 md:grid-cols-2',
  
  /**
   * Common spacing patterns
   */
  sectionSpacing: 'mb-8',
  cardSpacing: 'mb-6',
  formSpacing: 'space-y-6',
  
  /**
   * Flex patterns
   */
  centerContent: 'flex items-center justify-center',
  spaceBetween: 'flex items-center justify-between',
  stackVertical: 'flex flex-col space-y-4'
}

/**
 * Color utility classes for text on glass backgrounds
 */
export const TextColorUtils = {
  onGlass: DesignTokens.colors.text.onGlass,           // white
  onGlassSecondary: DesignTokens.colors.text.onGlassSecondary,  // white/90
  onGlassMuted: DesignTokens.colors.text.onGlassMuted,        // white/70
  onSolid: DesignTokens.colors.text.onSolid,           // black
  onSolidSecondary: DesignTokens.colors.text.onSolidSecondary,  // gray-700
  navActive: DesignTokens.colors.text.navActive,        // black
  navInactive: DesignTokens.colors.text.navInactive,     // black/80
  formInput: DesignTokens.colors.text.formInput         // black
}

/**
 * Button style generators
 */
export const ButtonStyles = {
  primary: `bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 ${DesignTokens.layout.rounded} transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]`,
  
  secondary: `${DesignTokens.colors.glass.cardSecondary} hover:bg-white/30 ${DesignTokens.colors.text.onGlass} font-medium py-3 px-6 ${DesignTokens.layout.rounded} transition-all duration-200 ${DesignTokens.colors.glass.borderMedium} border ${DesignTokens.effects.blur}`,
  
  ghost: `${DesignTokens.colors.glass.cardSecondary} hover:bg-white/20 ${DesignTokens.colors.text.onGlass} font-medium py-2 px-4 ${DesignTokens.layout.rounded} transition-all duration-200 ${DesignTokens.colors.glass.borderMedium} border ${DesignTokens.effects.blur}`
}

/**
 * Component composition helpers
 */
export const ComponentHelpers = {
  /**
   * Combines multiple className strings with design system styles
   */
  combineStyles: (...classNames: string[]) => classNames.filter(Boolean).join(' '),
  
  /**
   * Creates a glass card with specific text color
   */
  glassCard: (variant: 'primary' | 'secondary' | 'sidebar' | 'form' = 'primary', textColor: string = TextColorUtils.onGlass) => 
    `${getCardStyle(variant)} ${textColor}`,
  
  /**
   * Creates text with specific style and color
   */
  styledText: (type: Parameters<typeof getTextStyle>[0], color: string = TextColorUtils.onGlass) => 
    `${getTextStyle(type)} ${color}`
}

export default {
  StyledCard,
  StyledText, 
  StyledForm,
  LayoutPatterns,
  TextColorUtils,
  ButtonStyles,
  ComponentHelpers
}