// JiGR Email Header Component
// Consistent header with logo and branding for all emails

import React from 'react'

interface EmailHeaderProps {
  title?: string
  subtitle?: string
  variant?: 'default' | 'welcome' | 'alert' | 'success'
}

export function EmailHeader({ 
  title = 'JiGR Hospitality Compliance', 
  subtitle,
  variant = 'default' 
}: EmailHeaderProps) {
  
  const getBackgroundGradient = () => {
    switch (variant) {
      case 'welcome':
        return 'linear-gradient(135deg, rgba(5,150,105,0.5) 0%, rgba(16,185,129,0.5) 50%, rgba(52,211,153,0.5) 100%)'
      case 'alert':
        return 'linear-gradient(135deg, rgba(220,38,38,0.5) 0%, rgba(239,68,68,0.5) 50%, rgba(248,113,113,0.5) 100%)'
      case 'success':
        return 'linear-gradient(135deg, rgba(8,145,178,0.5) 0%, rgba(6,182,212,0.5) 50%, rgba(103,232,249,0.5) 100%)'
      default:
        return 'linear-gradient(135deg, rgba(30,41,59,0.5) 0%, rgba(55,65,81,0.5) 50%, rgba(71,85,105,0.5) 100%)'
    }
  }

  const getBackgroundImage = () => {
    // Subtle geometric pattern as data URI
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fill-rule="evenodd">
          <g fill="rgba(255,255,255,0.1)" fill-opacity="0.4">
            <circle cx="15" cy="15" r="2"/>
            <circle cx="45" cy="15" r="2"/>
            <circle cx="30" cy="30" r="2"/>
            <circle cx="15" cy="45" r="2"/>
            <circle cx="45" cy="45" r="2"/>
          </g>
        </g>
      </svg>
    `)}`
  }

  const headerStyle = {
    background: `${getBackgroundGradient()}, url("https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/CafeGlasses.jpg")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundBlendMode: 'overlay',
    padding: '40px 30px',
    textAlign: 'center' as const,
    color: 'white',
    borderRadius: '12px 12px 0 0'
  }

  const logoContainerStyle = {
    width: '80px',
    height: '80px',
    margin: '0 auto 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  const logoStyle = {
    width: '80px',
    height: '80px'
  }

  const titleStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
  }

  const subtitleStyle = {
    fontSize: '16px',
    margin: '0',
    opacity: '0.9',
    fontWeight: '400'
  }

  return (
    <div style={headerStyle}>
      <div style={logoContainerStyle}>
        <img 
          src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/jgr_logo_fullB.png" 
          alt="JiGR Logo" 
          style={logoStyle}
        />
      </div>
      <h1 style={titleStyle}>{title}</h1>
      {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
    </div>
  )
}

// HTML version for direct use in email templates
export function getEmailHeaderHTML({
  title = 'JiGR Hospitality Compliance',
  subtitle,
  variant = 'default'
}: EmailHeaderProps): string {
  
  const getBackgroundGradient = () => {
    switch (variant) {
      case 'welcome':
        return 'linear-gradient(135deg, rgba(5,150,105,0.5) 0%, rgba(16,185,129,0.5) 50%, rgba(52,211,153,0.5) 100%)'
      case 'alert':
        return 'linear-gradient(135deg, rgba(220,38,38,0.5) 0%, rgba(239,68,68,0.5) 50%, rgba(248,113,113,0.5) 100%)'
      case 'success':
        return 'linear-gradient(135deg, rgba(8,145,178,0.5) 0%, rgba(6,182,212,0.5) 50%, rgba(103,232,249,0.5) 100%)'
      default:
        return 'linear-gradient(135deg, rgba(30,41,59,0.5) 0%, rgba(55,65,81,0.5) 50%, rgba(71,85,105,0.5) 100%)'
    }
  }

  const getBackgroundImage = () => {
    // Subtle geometric pattern as data URI
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fill-rule="evenodd">
          <g fill="rgba(255,255,255,0.1)" fill-opacity="0.4">
            <circle cx="15" cy="15" r="2"/>
            <circle cx="45" cy="15" r="2"/>
            <circle cx="30" cy="30" r="2"/>
            <circle cx="15" cy="45" r="2"/>
            <circle cx="45" cy="45" r="2"/>
          </g>
        </g>
      </svg>
    `)}`
  }

  return `
    <div style="
      background: ${getBackgroundGradient()}, url('https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/module-assets/backgrounds/CafeGlasses.jpg');
      background-size: cover;
      background-position: center;
      background-blend-mode: overlay;
      padding: 40px 30px;
      text-align: center;
      color: white;
      border-radius: 12px 12px 0 0;
    ">
      <div style="
        width: 80px;
        height: 80px;
        margin: 0 auto 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <img 
          src="https://rggdywqnvpuwssluzfud.supabase.co/storage/v1/object/public/branding/jgr_logo_fullB.png" 
          alt="JiGR Logo" 
          style="
            width: 80px;
            height: 80px;
          "
        />
      </div>
      <h1 style="
        font-size: 28px;
        font-weight: bold;
        margin: 0 0 8px 0;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${title}</h1>
      ${subtitle ? `<p style="
        font-size: 16px;
        margin: 0;
        opacity: 0.9;
        font-weight: 400;
      ">${subtitle}</p>` : ''}
    </div>
  `
}