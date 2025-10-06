// JiGR Primary Button Component for Emails
// Consistent CTA buttons matching JiGR design system

import React from 'react'

interface ButtonPrimaryProps {
  href: string
  text: string
  variant?: 'primary' | 'success' | 'warning' | 'danger'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
}

export function ButtonPrimary({
  href,
  text,
  variant = 'primary',
  size = 'medium',
  fullWidth = false
}: ButtonPrimaryProps) {
  
  const getButtonColors = () => {
    switch (variant) {
      case 'success':
        return {
          background: '#059669',
          backgroundHover: '#047857',
          color: 'white'
        }
      case 'warning':
        return {
          background: '#d97706',
          backgroundHover: '#b45309',
          color: 'white'
        }
      case 'danger':
        return {
          background: '#dc2626',
          backgroundHover: '#b91c1c',
          color: 'white'
        }
      default:
        return {
          background: '#3b82f6',
          backgroundHover: '#2563eb',
          color: 'white'
        }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: '8px 16px',
          fontSize: '14px'
        }
      case 'large':
        return {
          padding: '16px 32px',
          fontSize: '18px'
        }
      default:
        return {
          padding: '12px 24px',
          fontSize: '16px'
        }
    }
  }

  const colors = getButtonColors()
  const sizeStyles = getSizeStyles()

  const buttonStyle = {
    display: fullWidth ? 'block' : 'inline-block',
    background: colors.background,
    color: colors.color,
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    textAlign: 'center' as const,
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer',
    width: fullWidth ? '100%' : 'auto',
    ...sizeStyles
  }

  return (
    <a href={href} style={buttonStyle}>
      {text}
    </a>
  )
}

// HTML version for direct use in email templates
export function getButtonPrimaryHTML({
  href,
  text,
  variant = 'primary',
  size = 'medium',
  fullWidth = false
}: ButtonPrimaryProps): string {
  
  const getButtonColors = () => {
    switch (variant) {
      case 'success':
        return {
          background: '#059669',
          color: 'white'
        }
      case 'warning':
        return {
          background: '#d97706',
          color: 'white'
        }
      case 'danger':
        return {
          background: '#dc2626',
          color: 'white'
        }
      default:
        return {
          background: '#3b82f6',
          color: 'white'
        }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'padding: 8px 16px; font-size: 14px;'
      case 'large':
        return 'padding: 16px 32px; font-size: 18px;'
      default:
        return 'padding: 12px 24px; font-size: 16px;'
    }
  }

  const colors = getButtonColors()
  const sizeStyles = getSizeStyles()

  return `
    <a href="${href}" style="
      display: ${fullWidth ? 'block' : 'inline-block'};
      background: ${colors.background};
      color: ${colors.color};
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      text-align: center;
      ${sizeStyles}
      width: ${fullWidth ? '100%' : 'auto'};
      border: none;
      cursor: pointer;
    ">${text}</a>
  `
}

// Helper function to wrap button in centered container
export function getCenteredButtonHTML(buttonProps: ButtonPrimaryProps): string {
  return `
    <div style="text-align: center; margin: 24px 0;">
      ${getButtonPrimaryHTML(buttonProps)}
    </div>
  `
}