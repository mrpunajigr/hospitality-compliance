// Base Email Layout for JiGR
// Provides consistent structure and styling for all emails

import React from 'react'
import { getEmailHeaderHTML } from '../components/EmailHeader'
import { getEmailFooterHTML } from '../components/EmailFooter'

interface BaseEmailLayoutProps {
  headerTitle?: string
  headerSubtitle?: string
  headerVariant?: 'default' | 'welcome' | 'alert' | 'success'
  children: string
  footerInfo?: string
  includeUnsubscribe?: boolean
  unsubscribeUrl?: string
  preheaderText?: string
}

export function BaseEmailLayout({
  headerTitle,
  headerSubtitle,
  headerVariant = 'default',
  children,
  footerInfo,
  includeUnsubscribe = true,
  unsubscribeUrl,
  preheaderText
}: BaseEmailLayoutProps) {
  
  const containerStyle = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    lineHeight: '1.6',
    color: '#374151',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#f9fafb'
  }

  const cardStyle = {
    background: 'white',
    margin: '20px',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
  }

  const contentStyle = {
    padding: '40px 30px',
    fontSize: '16px',
    lineHeight: '1.7'
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {getEmailHeaderHTML({
          title: headerTitle,
          subtitle: headerSubtitle,
          variant: headerVariant
        })}
        
        <div style={contentStyle}>
          <div dangerouslySetInnerHTML={{ __html: children }} />
        </div>
        
        {getEmailFooterHTML({
          includeUnsubscribe,
          unsubscribeUrl,
          additionalInfo: footerInfo
        })}
      </div>
    </div>
  )
}

// HTML version for direct email generation
export function getBaseEmailLayoutHTML({
  headerTitle,
  headerSubtitle,
  headerVariant = 'default',
  children,
  footerInfo,
  includeUnsubscribe = true,
  unsubscribeUrl,
  preheaderText
}: BaseEmailLayoutProps): string {
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>${headerTitle || 'JiGR | Modular Hospitality Solution'}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Reset styles */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }

        /* JiGR Email Styles */
        .email-body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #f9fafb;
        }
        
        .email-card {
            background: white;
            margin: 20px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .email-content {
            padding: 40px 30px;
            font-size: 16px;
            line-height: 1.7;
        }

        /* Mobile responsiveness */
        @media only screen and (max-width: 600px) {
            .email-card {
                margin: 10px;
                border-radius: 8px;
            }
            .email-content {
                padding: 20px 15px;
                font-size: 14px;
            }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            .email-body {
                background-color: #1f2937 !important;
            }
            .email-card {
                background: #374151 !important;
            }
            .email-content {
                color: #f3f4f6 !important;
            }
        }
    </style>
</head>
<body class="email-body">
    ${preheaderText ? `
    <!-- Preheader text for email clients -->
    <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all;">
        ${preheaderText}
    </div>
    ` : ''}

    <div class="email-container">
        <div class="email-card">
            ${getEmailHeaderHTML({
              title: headerTitle,
              subtitle: headerSubtitle,
              variant: headerVariant
            })}
            
            <div class="email-content">
                ${children}
            </div>
            
            ${getEmailFooterHTML({
              includeUnsubscribe,
              unsubscribeUrl,
              additionalInfo: footerInfo
            })}
        </div>
    </div>
</body>
</html>
  `
}

// Text version for plain text emails
export function getBaseEmailLayoutText({
  headerTitle = 'JiGR | Modular Hospitality Solution',
  children,
  footerInfo
}: Pick<BaseEmailLayoutProps, 'headerTitle' | 'children' | 'footerInfo'>): string {
  return `
${headerTitle.toUpperCase()}
${'='.repeat(headerTitle.length)}

${children}

${footerInfo ? `${footerInfo}\n\n` : ''}---
JiGR | Modular Hospitality Solution

Visit Dashboard: https://jigr.app
Contact Support: support@jigr.app
Help Center: https://jigr.app/help

© 2025 JiGR | Modular Hospitality Solution. All rights reserved.
  `.trim()
}