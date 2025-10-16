import { Inter } from 'next/font/google'
import { getChefWorkspaceBackground } from '@/lib/image-storage'
import { FeedbackWidget } from './components/testing/FeedbackWidget'
import './globals.css'
import '../styles/ipad-responsive.css'

const inter = Inter({ subsets: ['latin'] })

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
        {/* Safari 12 Compatible Background - Global */}
        <div 
          className="fixed inset-0 -z-10"
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #374151 50%, #1e293b 100%)',
            backgroundAttachment: 'fixed'
          }}
        />
        
        {/* Kitchen workspace overlay for context */}
        <div 
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: `url(${getChefWorkspaceBackground()})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.3
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
        
        {/* Testing Feedback Widget - Only visible with ?testing=true parameter */}
        <FeedbackWidget />
      </body>
    </html>
  )
}