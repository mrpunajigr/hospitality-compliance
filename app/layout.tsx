import type { Metadata, Viewport } from 'next'
import "./globals.css";
import ErrorBoundary from "./components/ErrorBoundary";

export const metadata: Metadata = {
  title: 'Hospitality Compliance SaaS',
  description: 'AI-powered food safety compliance platform for hospitality businesses',
  icons: {
    icon: '/jgr_logo_full.png',
    apple: '/jgr_logo_full.png',
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
        
        {/* Core-js polyfill for Safari 12 */}
        <script src="https://polyfill.io/v3/polyfill.min.js?features=es6,es2017,es2018,es2019&flags=gated"></script>
      </head>
      <body
        className="font-source antialiased"
        suppressHydrationWarning={true}
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}