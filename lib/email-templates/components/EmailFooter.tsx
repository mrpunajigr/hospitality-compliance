// JiGR Email Footer Component
// Consistent footer with company info and unsubscribe for all emails

import React from 'react'

interface EmailFooterProps {
  includeUnsubscribe?: boolean
  unsubscribeUrl?: string
  additionalInfo?: string
}

export function EmailFooter({ 
  includeUnsubscribe = true,
  unsubscribeUrl,
  additionalInfo 
}: EmailFooterProps) {
  
  const footerStyle = {
    background: '#f8fafc',
    padding: '30px 20px',
    textAlign: 'center' as const,
    color: '#64748b',
    fontSize: '14px',
    lineHeight: '1.6',
    borderRadius: '0 0 12px 12px',
    borderTop: '1px solid #e2e8f0'
  }

  const linkStyle = {
    color: '#3b82f6',
    textDecoration: 'none'
  }

  const dividerStyle = {
    margin: '16px 0',
    border: 'none',
    height: '1px',
    background: '#e2e8f0'
  }

  return (
    <div style={footerStyle}>
      <div style={{ marginBottom: '16px' }}>
        <strong style={{ color: '#374151' }}>JiGR Hospitality Compliance</strong>
        <br />
        New Zealand's leading digital compliance platform for hospitality businesses
      </div>
      
      {additionalInfo && (
        <>
          <div style={{ marginBottom: '16px', fontStyle: 'italic' }}>
            {additionalInfo}
          </div>
        </>
      )}

      <div style={{ marginBottom: '16px' }}>
        <a href="https://jigr.app" style={linkStyle}>Visit Dashboard</a>
        {' • '}
        <a href="mailto:support@jigr.app" style={linkStyle}>Contact Support</a>
        {' • '}
        <a href="https://jigr.app/help" style={linkStyle}>Help Center</a>
      </div>

      <hr style={dividerStyle} />

      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
        <div style={{ marginBottom: '8px' }}>
          © 2025 JiGR Hospitality Compliance. All rights reserved.
        </div>
        
        {includeUnsubscribe && (
          <div>
            Don't want to receive these emails? {' '}
            <a 
              href={unsubscribeUrl || '#'} 
              style={{ ...linkStyle, fontSize: '12px' }}
            >
              Unsubscribe
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

// HTML version for direct use in email templates
export function getEmailFooterHTML({ 
  includeUnsubscribe = true,
  unsubscribeUrl,
  additionalInfo 
}: EmailFooterProps): string {
  return `
    <div style="
      background: #f8fafc;
      padding: 30px 20px;
      text-align: center;
      color: #64748b;
      font-size: 14px;
      line-height: 1.6;
      border-radius: 0 0 12px 12px;
      border-top: 1px solid #e2e8f0;
    ">
      <div style="margin-bottom: 16px;">
        <strong style="color: #374151;">JiGR Hospitality Compliance</strong>
        <br />
        New Zealand's leading digital compliance platform for hospitality businesses
      </div>
      
      ${additionalInfo ? `
        <div style="margin-bottom: 16px; font-style: italic;">
          ${additionalInfo}
        </div>
      ` : ''}

      <div style="margin-bottom: 16px;">
        <a href="https://jigr.app" style="color: #3b82f6; text-decoration: none;">Visit Dashboard</a>
        •
        <a href="mailto:support@jigr.app" style="color: #3b82f6; text-decoration: none;">Contact Support</a>
        •
        <a href="https://jigr.app/help" style="color: #3b82f6; text-decoration: none;">Help Center</a>
      </div>

      <hr style="margin: 16px 0; border: none; height: 1px; background: #e2e8f0;" />

      <div style="font-size: 12px; color: #9ca3af;">
        <div style="margin-bottom: 8px;">
          © 2025 JiGR Hospitality Compliance. All rights reserved.
        </div>
        
        ${includeUnsubscribe ? `
          <div>
            Don't want to receive these emails? 
            <a 
              href="${unsubscribeUrl || '#'}" 
              style="color: #3b82f6; text-decoration: none; font-size: 12px;"
            >
              Unsubscribe
            </a>
          </div>
        ` : ''}
      </div>
    </div>
  `
}