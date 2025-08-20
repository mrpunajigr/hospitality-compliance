import type { Metadata, Viewport } from 'next'
import "./globals.css";
import ErrorBoundary from "./components/ErrorBoundary";
import DevVersionHeader from "./components/DevVersionHeader";
import { DesignTokens } from '@/lib/design-system';

export const metadata: Metadata = {
  title: 'Hospitality Compliance SaaS',
  description: 'AI-powered food safety compliance platform for hospitality businesses',
  icons: {
    icon: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Hospitality Compliance',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts - Standardized Typography System */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Lora:wght@400;700&family=Source+Sans+Pro:wght@400;600;700&display=swap" 
          rel="stylesheet" 
        />
        
        {/* Polyfill.io removed due to service unreliability and security concerns */}
        {/* Modern browsers and Next.js 15 provide sufficient ES6+ support */}
      </head>
      <body
        className="font-sans antialiased"
        suppressHydrationWarning={true}
      >
        <DevVersionHeader />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}