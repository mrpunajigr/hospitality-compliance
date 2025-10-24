import { Inter, Playfair_Display } from 'next/font/google'
import { FeedbackWidget } from './components/testing/FeedbackWidget'
import ConsoleManager from './components/ConsoleManager'
import './globals.css'
import '../styles/ipad-responsive.css'

const inter = Inter({ subsets: ['latin'] })
const playfair = Playfair_Display({ subsets: ['latin'] })

export const metadata = {
  title: 'Hospitality Compliance System',
  description: 'Complete OCR-enhanced document compliance for hospitality industry',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen relative`}>
        {/* Safari 12 Compatible Background - Global fallback only */}
        <div 
          className="fixed inset-0"
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #374151 50%, #1e293b 100%)',
            zIndex: -1000,
            // iOS 12 compatibility - remove backgroundAttachment: 'fixed'
            WebkitTransform: 'translateZ(0)',
            transform: 'translateZ(0)'
          }}
        />
        
        
        {/* Pattern overlay for visual interest */}
        <div 
          className="fixed inset-0 -z-10"
          style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
            opacity: 0.2
          }}
        />
        
        <main className="min-h-screen">
          {children}
        </main>
        
        {/* Console Management - Auto-enable quiet mode */}
        <ConsoleManager />
        
        {/* Testing Feedback Widget - Only visible with ?testing=true parameter */}
        <FeedbackWidget />
      </body>
    </html>
  )
}